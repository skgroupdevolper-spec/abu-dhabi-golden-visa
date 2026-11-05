'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { FEE_SCHEDULE } from '@/lib/fees';
import { checkLogin, endSession, requireAdmin, startSession } from '@/lib/server/auth';
import { saveUpload } from '@/lib/server/files';
import { createApplication, getApplication, getFees, newId, now, saveFees, updateApplication, updateLead, listLeads, type Application, type LeadStatus } from '@/lib/server/store';
import { STAGES, governmentLines } from '@/lib/stages';

const s = (f: FormData, k: string, max = 500) => String(f.get(k) ?? '').trim().slice(0, max);
const n = (f: FormData, k: string) => {
  const v = Number(String(f.get(k) ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0;
};

export type FormState = { ok?: string; error?: string } | undefined;

/* ---------- sign in ---------- */
const tries = new Map<string, number[]>();
export async function login(_: FormState, f: FormData): Promise<FormState> {
  const email = s(f, 'email', 160);
  const t = Date.now();
  const recent = (tries.get(email) || []).filter((x) => t - x < 15 * 60_000);
  if (recent.length >= 8) return { error: 'Too many attempts. Try again in 15 minutes.' };
  if (!checkLogin(email, s(f, 'password', 200))) {
    tries.set(email, [...recent, t]);
    return { error: 'Email or password is not correct.' };
  }
  tries.delete(email);
  await startSession(email);
  redirect('/admin/');
}
export async function logout() {
  await endSession();
  redirect('/admin/login/');
}

/* ---------- enquiries ---------- */
export async function setLeadStatus(f: FormData) {
  await requireAdmin();
  await updateLead(s(f, 'id', 40), { status: s(f, 'status', 20) as LeadStatus, note: s(f, 'note', 1000) });
  revalidatePath('/admin/', 'layout');
}
export async function convertLead(f: FormData) {
  await requireAdmin();
  const lead = (await listLeads()).find((l) => l.id === s(f, 'id', 40));
  if (!lead) return;
  if (lead.applicationId) redirect(`/admin/applications/${lead.applicationId}/`);
  let language = 'English';
  try { language = JSON.parse(lead.details || '{}').language || language; } catch {}
  const app = await createApplication({
    client: { name: lead.name, phone: lead.phone, email: lead.email, nationality: '', language },
    route: 'Property investor', location: 'in', adults: 0, kids: 0, leadId: lead.id,
    notes: [lead.service && `Service: ${lead.service}`, lead.message].filter(Boolean).join('\n'),
  });
  await updateLead(lead.id, { status: 'converted', applicationId: app.id });
  redirect(`/admin/applications/${app.id}/`);
}

/* ---------- applications ---------- */
export async function newApplication(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const name = s(f, 'name', 120), phone = s(f, 'phone', 40);
  if (!name || phone.replace(/\D/g, '').length < 7) return { error: 'Add the client name and a WhatsApp number.' };
  const app = await createApplication({
    client: { name, phone, email: s(f, 'email', 160), nationality: s(f, 'nationality', 80), language: s(f, 'language', 40) || 'English' },
    route: s(f, 'route', 80), location: s(f, 'location') === 'out' ? 'out' : 'in',
    adults: Math.max(0, Math.min(10, n(f, 'adults'))), kids: Math.max(0, Math.min(10, n(f, 'kids'))), notes: s(f, 'notes', 2000),
  });
  redirect(`/admin/applications/${app.id}/`);
}

async function edit(f: FormData, fn: (a: Application) => void) {
  await requireAdmin();
  const id = s(f, 'app', 40);
  await updateApplication(id, fn);
  revalidatePath(`/admin/applications/${id}/`);
  revalidatePath('/admin/', 'layout');
}

export async function saveClient(_: FormState, f: FormData): Promise<FormState> {
  await edit(f, (a) => {
    a.client = { name: s(f, 'name', 120), phone: s(f, 'phone', 40), email: s(f, 'email', 160), nationality: s(f, 'nationality', 80), language: s(f, 'language', 40) };
    a.route = s(f, 'route', 80);
    a.location = s(f, 'location') === 'out' ? 'out' : 'in';
    a.adults = Math.max(0, Math.min(10, n(f, 'adults')));
    a.kids = Math.max(0, Math.min(10, n(f, 'kids')));
    a.notes = s(f, 'notes', 4000);
  });
  return { ok: 'Saved.' };
}

export async function setStage(_: FormState, f: FormData): Promise<FormState> {
  const stage = Math.max(0, Math.min(STAGES.length - 1, n(f, 'stage')));
  await edit(f, (a) => {
    a.stage = stage;
    a.stageDates[String(stage)] = a.stageDates[String(stage)] || now();
    a.nextStep = s(f, 'nextStep', 400);
    a.expected = s(f, 'expected', 60);
    if (f.get('notify')) a.messages.push({ id: newId(6), by: 'team', at: now(), text: `Status update: ${STAGES[stage]}.${a.nextStep ? `\nNext: ${a.nextStep}` : ''}` });
  });
  return { ok: 'Status updated.' };
}

export async function fillQuote(f: FormData) {
  const fees = await getFees();
  await edit(f, (a) => {
    a.quote.lines = governmentLines(fees, { route: a.route, location: a.location, adults: a.adults, kids: a.kids, vip: !!f.get('vip'), newFile: !!f.get('newFile') });
  });
}

export async function saveQuote(_: FormState, f: FormData): Promise<FormState> {
  const labels = f.getAll('label').map(String), amounts = f.getAll('amount').map((x) => Number(String(x).replace(/[^\d.-]/g, '')));
  await edit(f, (a) => {
    a.quote.lines = labels.map((label, i) => ({ label: label.trim().slice(0, 140), amount: Math.round((amounts[i] || 0) * 100) / 100 })).filter((l) => l.label && l.amount);
    a.quote.serviceFee = n(f, 'serviceFee');
    a.quote.vat = Math.round(a.quote.serviceFee * FEE_SCHEDULE.vatRate * 100) / 100;
    a.quote.insurance = s(f, 'insurance', 140) || 'Quoted separately';
    if (f.get('send')) {
      a.quote.sentAt = now();
      a.quote.acceptedAt = undefined;
      a.messages.push({ id: newId(6), by: 'team', at: now(), text: 'Your quote is ready. Please review and accept it in your portal.' });
    }
  });
  return { ok: f.get('send') ? 'Quote saved and sent to the client portal.' : 'Quote saved.' };
}

export async function addPayment(_: FormState, f: FormData): Promise<FormState> {
  const amount = n(f, 'amount');
  if (!s(f, 'label') || amount <= 0) return { error: 'Add a description and an amount.' };
  await edit(f, (a) => {
    a.payments.push({ id: newId(6), label: s(f, 'label', 140), amount, status: 'due', link: s(f, 'link', 600), createdAt: now() });
    a.messages.push({ id: newId(6), by: 'team', at: now(), text: `Payment request: ${s(f, 'label', 140)} (AED ${amount.toFixed(2)}). You can pay from your portal.` });
  });
  return { ok: 'Payment request added.' };
}

export async function markPaid(f: FormData) {
  await edit(f, (a) => {
    const p = a.payments.find((x) => x.id === s(f, 'pid', 40));
    if (!p) return;
    const count = a.payments.filter((x) => x.receiptNo).length + 1;
    p.status = 'paid';
    p.paidAt = now();
    p.method = s(f, 'method', 40) || 'Card';
    p.receiptNo = `${a.ref}-R${count}`;
    a.messages.push({ id: newId(6), by: 'team', at: now(), text: `Payment received: ${p.label}. Your receipt ${p.receiptNo} is in your portal.` });
  });
}
export async function removePayment(f: FormData) {
  await edit(f, (a) => { a.payments = a.payments.filter((x) => x.id !== s(f, 'pid', 40) || x.status === 'paid'); });
}

export async function uploadTeamDoc(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = s(f, 'app', 40);
  try {
    const doc = await saveUpload(id, f.get('file') as File, 'team', !!f.get('shared'), s(f, 'label', 120));
    await edit(f, (a) => {
      a.documents.push(doc);
      if (doc.shared) a.messages.push({ id: newId(6), by: 'team', at: now(), text: `New document for you: ${doc.name}.` });
    });
    return { ok: 'Uploaded.' };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
export async function toggleShare(f: FormData) {
  await edit(f, (a) => { const d = a.documents.find((x) => x.id === s(f, 'doc', 40)); if (d) d.shared = !d.shared; });
}
export async function setRequests(_: FormState, f: FormData): Promise<FormState> {
  await edit(f, (a) => {
    a.requests = s(f, 'requests', 3000).split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 30);
    if (f.get('notify') && a.requests.length) a.messages.push({ id: newId(6), by: 'team', at: now(), text: `Please upload these documents in your portal:\n• ${a.requests.join('\n• ')}` });
  });
  return { ok: 'Document list saved.' };
}

export async function teamMessage(_: FormState, f: FormData): Promise<FormState> {
  const text = s(f, 'text', 3000);
  if (!text) return { error: 'Write a message first.' };
  await edit(f, (a) => {
    a.messages.forEach((m) => { if (m.by === 'client') m.read = true; });
    a.messages.push({ id: newId(6), by: 'team', at: now(), text });
  });
  return { ok: 'Sent to the client portal.' };
}

export async function archiveApplication(f: FormData) {
  await edit(f, (a) => { a.archived = !a.archived; });
}
export async function newPortalLink(f: FormData) {
  await edit(f, (a) => { a.token = newId(16); });
}

/* ---------- fees ---------- */
export async function saveFeeSchedule(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const cur = await getFees();
  const v = (k: string, d: number) => { const x = n(f, k); return x > 0 ? x : d; };
  await saveFees({
    ...cur,
    date: s(f, 'date', 40) || cur.date,
    perPerson: {
      visa: { ...cur.perPerson.visa, aed: v('visa', cur.perPerson.visa.aed) },
      emiratesId: { ...cur.perPerson.emiratesId, aed: v('emiratesId', cur.perPerson.emiratesId.aed) },
      changeOfStatus: { ...cur.perPerson.changeOfStatus, aed: v('changeOfStatus', cur.perPerson.changeOfStatus.aed) },
    },
    medical: { normal: { ...cur.medical.normal, aed: v('medNormal', cur.medical.normal.aed) }, vip: { ...cur.medical.vip, aed: v('medVip', cur.medical.vip.aed) } },
    sponsorFile: { ...cur.sponsorFile, aed: v('sponsorFile', cur.sponsorFile.aed) },
    propertyValuation: { ...cur.propertyValuation, aed: v('propertyValuation', cur.propertyValuation.aed) },
    packages: {
      normal: { ...(cur.packages?.normal ?? FEE_SCHEDULE.packages.normal), aed: Math.max(0, n(f, 'pkgNormal')) },
      vip: { ...(cur.packages?.vip ?? FEE_SCHEDULE.packages.vip), aed: Math.max(0, n(f, 'pkgVip')) },
    },
  });
  revalidatePath('/', 'layout');
  return { ok: 'Fees saved. The calculator uses them straight away.' };
}

export async function getAppOrNull(id: string) {
  await requireAdmin();
  return getApplication(id);
}
