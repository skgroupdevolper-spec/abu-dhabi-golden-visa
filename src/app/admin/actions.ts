'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { FEE_SCHEDULE } from '@/lib/fees';
import { EDIT, FULL, checkLogin, endSession, requireAdmin as requireAny, startSession } from '@/lib/server/auth';

/** Editing needs staff or above; settings and fees need admin. */
const requireAdmin = () => requireAny(EDIT);
const requireFull = () => requireAny(FULL);
import { saveUpload } from '@/lib/server/files';
import { createApplication, getApplication, getFees, newId, now, saveFees, updateApplication, type Fees, updateLead, listLeads, type Application, type LeadStatus } from '@/lib/server/store';
import { STAGES, governmentLines, money } from '@/lib/stages';
import { SITE, portalUrl } from '@/lib/site';
import { sendWa } from '@/lib/server/whatsapp';

const V = (a: Application, extra: Record<string, string | number | undefined> = {}) => ({ name: a.client.name.split(' ')[0], ref: a.ref, link: portalUrl(a.token), ...extra });

const s = (f: FormData, k: string, max = 500) => String(f.get(k) ?? '').trim().slice(0, max);
const n = (f: FormData, k: string) => {
  const v = Number(String(f.get(k) ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0;
};

export type FormState = { ok?: string; error?: string } | undefined;

/* ---------- sign in ---------- */
const tries = new Map<string, number[]>();
export async function login(_: FormState, f: FormData): Promise<FormState & { need2fa?: boolean }> {
  const email = s(f, 'email', 160);
  const t = Date.now();
  const recent = (tries.get(email) || []).filter((x) => t - x < 15 * 60_000);
  if (recent.length >= 8) return { error: 'Too many attempts. Try again in 15 minutes.' };
  const who = await checkLogin(email, s(f, 'password', 200));
  if (!who) {
    tries.set(email, [...recent, t]);
    return { error: 'Email or password is not correct.' };
  }
  const { checkSecondStep, getTotp } = await import('@/lib/server/totp');
  if ((await getTotp(who.email))?.enabled) {
    const code = s(f, 'code', 20);
    if (!code) return { need2fa: true, error: 'Two-step login is on for this account: enter the 6-digit code from your authenticator app (or a backup code).' };
    if (!(await checkSecondStep(who.email, code))) { tries.set(email, [...recent, t]); return { need2fa: true, error: 'The code is not correct or has expired.' }; }
  }
  tries.delete(email);
  await startSession(who);
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
  await sendWa(app.client.phone, 'welcome', V(app));
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
  const a = await updateApplication(id, fn);
  revalidatePath(`/admin/applications/${id}/`);
  revalidatePath('/admin/', 'layout');
  return a;
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

/** Email copy of a client update (only when the client has an email and SMTP is set up). */
async function mailClient(a: Application, subject: string, body: string, withLink = true) {
  if (!a.client.email) return;
  const { sendMail } = await import('@/lib/server/mail');
  await sendMail(a.client.email, `${subject} · Abu Dhabi Golden Visa`, `Hello ${a.client.name.split(' ')[0]},\n\n${body}${withLink ? `\n\nFollow your application, pay and download documents here:\n${portalUrl(a.token)}` : ''}\n\nKind regards,\nAbu Dhabi Golden Visa\n${SITE.whatsappDisplay} · ${SITE.email}`).catch(() => {});
}

export async function setStage(_: FormState, f: FormData): Promise<FormState> {
  const stage = Math.max(0, Math.min(STAGES.length - 1, n(f, 'stage')));
  const app = await edit(f, (a) => {
    a.stage = stage;
    a.stageDates[String(stage)] = a.stageDates[String(stage)] || now();
    a.nextStep = s(f, 'nextStep', 400);
    a.expected = s(f, 'expected', 60);
    if (f.get('notify')) a.messages.push({ id: newId(6), by: 'team', at: now(), text: `Status update: ${STAGES[stage]}.${a.nextStep ? `\nNext: ${a.nextStep}` : ''}` });
  });
  if (app && f.get('notify')) {
    const r = await sendWa(app.client.phone, 'status', V(app, { status: STAGES[stage], next: app.nextStep }));
    void mailClient(app, `Status update ${app.ref}: ${STAGES[stage]}`, `Your application ${app.ref} moved to: ${STAGES[stage]}.${app.nextStep ? `\nNext step: ${app.nextStep}` : ''}${app.expected ? `\nExpected: ${app.expected}` : ''}`);
    return { ok: `Status updated.${r.ok ? ' WhatsApp sent.' : ''}` };
  }
  return { ok: 'Status updated.' };
}

export async function fillQuote(f: FormData) {
  const fees = await getFees();
  await edit(f, (a) => {
    a.quote.lines = governmentLines(fees, { route: a.route, location: a.location, adults: a.adults, kids: a.kids, vip: !!f.get('vip'), newFile: !!f.get('newFile') });
  });
}

export async function saveQuote(_: FormState, f: FormData): Promise<FormState> {
  const num = (x: FormDataEntryValue) => Number(String(x).replace(/[^\d.-]/g, ''));
  const labels = f.getAll('label').map(String), units = f.getAll('amount').map(num), qtys = f.getAll('qty').map(num);
  const app = await edit(f, (a) => {
    a.quote.lines = labels.map((label, i) => {
      const qty = Math.max(1, Math.round(qtys[i] || 1)), unit = Math.round((units[i] || 0) * 100) / 100;
      return { label: label.trim().slice(0, 140), qty, unit, amount: Math.round(qty * unit * 100) / 100 };
    }).filter((l) => l.label && l.amount);
    a.quote.serviceFee = n(f, 'serviceFee');
    a.quote.vat = Math.round(a.quote.serviceFee * FEE_SCHEDULE.vatRate * 100) / 100;
    a.quote.insurance = s(f, 'insurance', 140) || 'Quoted separately';
    if (f.get('send')) {
      a.quote.sentAt = now();
      a.quote.acceptedAt = undefined;
      a.messages.push({ id: newId(6), by: 'team', at: now(), text: 'Your quote is ready. Please review and accept it in your portal.' });
    }
  });
  if (app && f.get('send')) {
    const total = app.quote.lines.reduce((x, l) => x + l.amount, 0) + app.quote.serviceFee + app.quote.vat;
    const r = await sendWa(app.client.phone, 'quote', V(app, { total: money(total) }));
    void mailClient(app, `Your quote ${app.ref}: ${money(total)}`, `Your written quote for ${app.route} is ready: ${money(total)}.\nYou can review, accept and download it as a PDF from your secure link.`);
    return { ok: `Quote saved and sent to the client portal.${r.ok ? ' WhatsApp sent.' : ''}` };
  }
  return { ok: 'Quote saved.' };
}

export async function addPayment(_: FormState, f: FormData): Promise<FormState> {
  const amount = n(f, 'amount');
  if (!s(f, 'label') || amount <= 0) return { error: 'Add a description and an amount.' };
  const pid = newId(6);
  const app = await edit(f, (a) => {
    a.payments.push({ id: pid, label: s(f, 'label', 140), amount, status: 'due', link: s(f, 'link', 600), createdAt: now() });
    a.messages.push({ id: newId(6), by: 'team', at: now(), text: `💳 Payment request: ${s(f, 'label', 140)} (AED ${amount.toFixed(2)}). Press “Pay now” to pay securely by card.` });
  });
  const { getPayCfg, online } = await import('@/lib/server/payments');
  const live = online(await getPayCfg());
  if (app) {
    const payLink = live || s(f, 'link', 600) ? `${portalUrl(app.token)}pay/${pid}/` : portalUrl(app.token);
    await sendWa(app.client.phone, 'payment', V(app, { item: s(f, 'label', 140), amount: money(amount), link: payLink }));
    void mailClient(app, `Payment request ${app.ref}: ${money(amount)}`, `Payment request for ${app.ref}\n${s(f, 'label', 140)}: ${money(amount)}\n\nPay securely by card:\n${payLink}`, false);
  }
  return { ok: 'Payment request added.' };
}

export async function markPaid(f: FormData) {
  await requireAdmin();
  const { settle } = await import('@/lib/server/payments');
  await settle(s(f, 'app', 40), s(f, 'pid', 40), s(f, 'method', 40) || 'Card', s(f, 'txn', 80));
  revalidatePath(`/admin/applications/${s(f, 'app', 40)}/`);
}
export async function removePayment(f: FormData) {
  await edit(f, (a) => { a.payments = a.payments.filter((x) => x.id !== s(f, 'pid', 40) || x.status === 'paid'); });
}

export async function uploadTeamDoc(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = s(f, 'app', 40);
  try {
    const doc = await saveUpload(id, f.get('file') as File, 'team', !!f.get('shared'), s(f, 'label', 120));
    const app = await edit(f, (a) => {
      a.documents.push(doc);
      if (doc.shared) a.messages.push({ id: newId(6), by: 'team', at: now(), text: `New document for you: ${doc.name}.` });
    });
    if (app && doc.shared) { await sendWa(app.client.phone, 'document', V(app, { document: doc.name })); void mailClient(app, `New document for ${app.ref}`, `We shared a document with you: ${doc.name}.`); }
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
  const app = await edit(f, (a) => {
    a.messages.forEach((m) => { if (m.by === 'client') m.read = true; });
    a.messages.push({ id: newId(6), by: 'team', at: now(), text });
  });
  const r = app ? await sendWa(app.client.phone, 'message', V(app, { text: text.slice(0, 300) })) : { ok: false };
  return { ok: `Sent to the client portal.${r.ok ? ' WhatsApp sent.' : ''}` };
}

export async function archiveApplication(f: FormData) {
  await edit(f, (a) => { a.archived = !a.archived; });
}
export async function newPortalLink(f: FormData) {
  await edit(f, (a) => { a.token = newId(16); });
}

/* ---------- fees ---------- */
export async function saveFeeSchedule(_: FormState, f: FormData): Promise<FormState> {
  await requireFull();
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

/** Saves the whole cost calculator from the editor (fees, routes, packages, add-ons, extra fees, wording, options, rates). */
export async function saveFeesJson(_: FormState, f: FormData): Promise<FormState> {
  await requireFull();
  let x: Record<string, any>;
  try { x = JSON.parse(String(f.get('json') ?? '')); } catch { return { error: 'Could not read the form. Refresh and try again.' }; }
  const d = FEE_SCHEDULE;
  const m = (v: unknown, dflt: number) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : dflt; };
  const t = (v: unknown, max = 300, dflt = '') => (typeof v === 'string' ? v.trim().slice(0, max) : dflt) || dflt;
  const item = (v: any, dd: { label: string; aed: number }) => ({ label: t(v?.label, 120, dd.label), aed: m(v?.aed, dd.aed) });
  const PER = ['once', 'person', 'adult', 'child', 'main'];
  const pkg = (v: any, dd: typeof d.packages.normal) => ({ ...item(v, dd), title: t(v?.title, 80, dd.title), sub: t(v?.sub, 300), hidden: !!v?.hidden });
  const fees = {
    ...d,
    date: t(x.date, 40, d.date),
    perPerson: { visa: item(x.perPerson?.visa, d.perPerson.visa), emiratesId: item(x.perPerson?.emiratesId, d.perPerson.emiratesId), changeOfStatus: item(x.perPerson?.changeOfStatus, d.perPerson.changeOfStatus) },
    medical: { normal: item(x.medical?.normal, d.medical.normal), vip: item(x.medical?.vip, d.medical.vip) },
    sponsorFile: item(x.sponsorFile, d.sponsorFile), propertyValuation: item(x.propertyValuation, d.propertyValuation),
    packages: { normal: pkg(x.packages?.normal, d.packages.normal), vip: pkg(x.packages?.vip, d.packages.vip) },
    vatRate: Math.min(0.5, m(x.vatRate, d.vatRate)),
    assumptions: (Array.isArray(x.assumptions) ? x.assumptions : d.assumptions).map((a: unknown) => t(a, 400)).filter(Boolean).slice(0, 20),
    routes: (Array.isArray(x.routes) ? x.routes : d.routes).slice(0, 30).map((r: any, i: number) => ({ id: t(r?.id, 40, `route-${i}`).toLowerCase().replace(/[^a-z0-9-]/g, '') || `route-${i}`, label: t(r?.label, 120, 'Route'), note: t(r?.note, 200), valuation: !!r?.valuation, icon: t(r?.icon, 30), hidden: !!r?.hidden, checklist: Array.isArray(r?.checklist) ? r.checklist.map((c: unknown) => t(c, 300)).filter(Boolean).slice(0, 30) : [] })),
    addons: (Array.isArray(x.addons) ? x.addons : []).slice(0, 20).map((a: any, i: number) => ({ id: t(a?.id, 20, `a${i}`), label: t(a?.label, 120, 'Add-on'), note: t(a?.note, 200), aed: m(a?.aed, 0), per: PER.includes(a?.per) && a.per !== 'main' ? a.per : 'once', on: !!a?.on })),
    extraFees: (Array.isArray(x.extraFees) ? x.extraFees : []).slice(0, 30).map((a: any, i: number) => ({ id: t(a?.id, 20, `e${i}`), label: t(a?.label, 120, 'Fee'), aed: m(a?.aed, 0), per: PER.includes(a?.per) ? a.per : 'person', routes: Array.isArray(a?.routes) ? a.routes.map((r: unknown) => t(r, 40)).filter(Boolean) : [] })),
    texts: Object.fromEntries(Object.entries(x.texts && typeof x.texts === 'object' ? x.texts : {}).filter(([k]) => /^[a-zA-Z]{2,12}$/.test(k)).map(([k, v]) => [k, t(v, 400)]).filter(([, v]) => v)),
    options: Object.fromEntries(Object.keys(d.options).map((k) => [k, k === 'maxPeople' ? Math.max(1, Math.min(30, Number(x.options?.maxPeople) || 10)) : x.options?.[k] === undefined ? (d.options as Record<string, unknown>)[k] : !!x.options[k]])) as typeof d.options,
    fxManual: !!x.fxManual,
    rates: Object.fromEntries(Object.entries(x.rates && typeof x.rates === 'object' ? x.rates : {}).filter(([k]) => /^[A-Z]{3}$/.test(k)).slice(0, 40).map(([k, v]: [string, any]) => [k, { rate: Number(v?.rate) > 0 ? Number(v.rate) : 1, symbol: t(v?.symbol, 6, k + ' '), name: t(v?.name, 40, k) }])),
  };
  await saveFees(fees as Fees);
  revalidatePath('/', 'layout');
  return { ok: 'Saved. The calculator, apply form and new quotes use these settings now.' };
}

export async function getAppOrNull(id: string) {
  await requireAdmin();
  return getApplication(id);
}

/* ---------- two-step login ---------- */
export async function totpStart(): Promise<FormState & { secret?: string; uri?: string }> {
  const me = await requireAny();
  const { newSecret, setTotp, getTotp, uri } = await import('@/lib/server/totp');
  if ((await getTotp(me.email))?.enabled) return { error: 'Two-step login is already on.' };
  const secret = newSecret();
  await setTotp(me.email, { secret, enabled: false, backup: [] });
  return { ok: 'start', secret, uri: uri(secret, me.email) };
}
export async function totpEnable(_: FormState, f: FormData): Promise<FormState & { codes?: string[] }> {
  const me = await requireAny();
  const { getTotp, setTotp, verify, backupCodes, hashCodes } = await import('@/lib/server/totp');
  const e = await getTotp(me.email);
  if (!e) return { error: 'Start the set-up first.' };
  if (!verify(e.secret, s(f, 'code', 10))) return { error: 'The code is not correct. Check the time on your phone and try again.' };
  const codes = backupCodes();
  await setTotp(me.email, { ...e, enabled: true, backup: hashCodes(codes) });
  return { ok: 'Two-step login is on. Save these backup codes somewhere safe; each works once.', codes };
}
export async function totpDisable(_: FormState, f: FormData): Promise<FormState> {
  const me = await requireAny();
  const { checkSecondStep, setTotp } = await import('@/lib/server/totp');
  if (!(await checkSecondStep(me.email, s(f, 'code', 20)))) return { error: 'Enter a current code to turn two-step login off.' };
  await setTotp(me.email, null);
  revalidatePath('/admin/profile/');
  return { ok: 'Two-step login is off.' };
}
