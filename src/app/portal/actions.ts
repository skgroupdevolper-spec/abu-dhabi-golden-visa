'use server';

import { randomInt } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { dict, PORTAL_LANGS } from '@/lib/portal-i18n';
import { endClientSession, startClientSession } from '@/lib/server/auth';
import { hashPassword, insert, list, notify, patch, verifyPassword, type Customer } from '@/lib/server/collections';
import { saveUpload } from '@/lib/server/files';
import { sendMail } from '@/lib/server/mail';
import { currentCustomer, portalBase, portalLang } from '@/lib/server/portal';
import { addLead, getApplicationByToken, listApplications, newId, now, updateApplication } from '@/lib/server/store';
import { sendTeam, sendWa } from '@/lib/server/whatsapp';

type State = { ok?: string; error?: string } | undefined;
const s = (f: FormData, k: string, max = 500) => String(f.get(k) ?? '').trim().slice(0, max);
const t = async () => dict(await portalLang());

const hits = new Map<string, number[]>();
async function limited(key: string, max = 10) {
  const ip = ((await headers()).get('x-forwarded-for') || 'local').split(',')[0];
  const k = `${key}:${ip}`, n = Date.now();
  const recent = (hits.get(k) || []).filter((x) => n - x < 15 * 60_000);
  hits.set(k, [...recent, n]);
  return recent.length >= max;
}

/* ---------- language ---------- */
export async function setLang(f: FormData) {
  const code = s(f, 'lang', 5);
  if (!PORTAL_LANGS.some((l) => l.code === code)) return;
  (await cookies()).set('adgv_lang', code, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' });
  const me = await currentCustomer();
  if (me) await patch<Customer>('customers', me.id, (c) => { c.lang = code; });
  redirect(s(f, 'back', 300).startsWith('/') ? s(f, 'back', 300) : `${await portalBase()}/`);
}

/* ---------- accounts ---------- */
export async function register(_: State, f: FormData): Promise<State> {
  const d = await t();
  if (await limited('reg', 6)) return { error: d.tooMany };
  const name = s(f, 'name', 100), email = s(f, 'email', 160).toLowerCase(), phone = s(f, 'phone', 40), pass = s(f, 'password', 200);
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || phone.replace(/\D/g, '').length < 8) return { error: d.invalid };
  if (pass.length < 8) return { error: d.weak };
  if ((await list<Customer>('customers')).some((c) => c.email === email)) return { error: d.exists };
  const c: Customer = { id: newId(8), name, email, phone, pass: await hashPassword(pass), lang: await portalLang(), active: true, createdAt: now(), lastLogin: now() };
  await insert<Customer>('customers', c);
  await notify('customer', `New client account: ${name} (${email})`, '/admin/customers/');
  await startClientSession(c.id);
  redirect(`${await portalBase()}/`);
}

export async function login(_: State, f: FormData): Promise<State> {
  const d = await t();
  if (await limited('login', 10)) return { error: d.tooMany };
  const email = s(f, 'email', 160).toLowerCase();
  const c = (await list<Customer>('customers')).find((x) => x.email === email && x.active);
  if (!c || !(await verifyPassword(s(f, 'password', 200), c.pass))) return { error: d.wrongLogin };
  await patch<Customer>('customers', c.id, (x) => { x.lastLogin = now(); });
  (await cookies()).set('adgv_lang', c.lang || 'en', { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' });
  await startClientSession(c.id);
  redirect(`${await portalBase()}/`);
}

export async function logout() {
  await endClientSession();
  redirect(`${await portalBase()}/login/`);
}

export async function sendResetCode(_: State, f: FormData): Promise<State> {
  const d = await t();
  if (await limited('reset', 5)) return { error: d.tooMany };
  const email = s(f, 'email', 160).toLowerCase();
  const c = (await list<Customer>('customers')).find((x) => x.email === email && x.active);
  if (c) {
    const code = String(randomInt(100000, 1000000));
    await patch<Customer>('customers', c.id, (x) => { x.reset = { code, exp: Date.now() + 15 * 60_000, tries: 0 }; });
    await Promise.allSettled([
      sendWa(c.phone, 'reset', { name: c.name.split(' ')[0], code }, { force: true }),
      sendMail(c.email, 'Your Abu Dhabi Golden Visa portal code', `Your code is ${code}. It expires in 15 minutes.`),
    ]);
  }
  return { ok: d.codeSent };
}

export async function resetPassword(_: State, f: FormData): Promise<State> {
  const d = await t();
  const email = s(f, 'email', 160).toLowerCase(), code = s(f, 'code', 10), pass = s(f, 'password', 200);
  if (pass.length < 8) return { error: d.weak };
  const c = (await list<Customer>('customers')).find((x) => x.email === email && x.active);
  if (!c?.reset || c.reset.exp < Date.now() || c.reset.tries >= 5) return { error: d.badCode };
  if (c.reset.code !== code) {
    await patch<Customer>('customers', c.id, (x) => { if (x.reset) x.reset.tries += 1; });
    return { error: d.badCode };
  }
  const h = await hashPassword(pass);
  await patch<Customer>('customers', c.id, (x) => { x.pass = h; x.reset = undefined; });
  return { ok: d.passwordChanged };
}

export async function saveProfile(_: State, f: FormData): Promise<State> {
  const d = await t();
  const me = await currentCustomer();
  if (!me) redirect(`${await portalBase()}/login/`);
  const next = s(f, 'next', 200);
  let h = '';
  if (next) {
    if (next.length < 8) return { error: d.weak };
    if (!(await verifyPassword(s(f, 'current', 200), me.pass))) return { error: d.wrongLogin };
    h = await hashPassword(next);
  }
  await patch<Customer>('customers', me.id, (c) => { c.name = s(f, 'name', 100) || c.name; c.phone = s(f, 'phone', 40) || c.phone; if (h) c.pass = h; });
  return { ok: d.saved };
}

export async function requestService(_: State, f: FormData): Promise<State> {
  const d = await t();
  const me = await currentCustomer();
  if (!me) redirect(`${await portalBase()}/login/`);
  const service = s(f, 'service', 120);
  if (!service) return { error: d.invalid };
  await addLead({ name: me.name, phone: me.phone, email: me.email, service, message: s(f, 'message', 2000), source: 'portal', details: JSON.stringify({ customer: me.id, language: me.lang }) });
  await notify('request', `${me.name} requested: ${service}`, `/admin/leads/?q=${encodeURIComponent(me.email)}`);
  void sendTeam('leadTeam', { name: me.name, phone: me.phone, service, message: s(f, 'message', 300) });
  revalidatePath('/portal/');
  return { ok: d.requestSent };
}

/* ---------- file by reference ---------- */
export async function findFile(_: State, f: FormData): Promise<State> {
  const d = await t();
  if (await limited('find', 10)) return { error: d.tooMany };
  const ref = s(f, 'ref', 20).toUpperCase().replace(/\s/g, '');
  const digits = s(f, 'phone', 40).replace(/\D/g, '');
  if (!ref || digits.length < 6) return { error: d.invalid };
  const a = (await listApplications()).find((x) => !x.archived && x.ref === ref && x.client.phone.replace(/\D/g, '').endsWith(digits.slice(-6)));
  if (!a) return { error: d.invalid };
  redirect(`${await portalBase()}/t/${a.token}/`);
}

/* ---------- inside a file ---------- */
async function withApp(f: FormData) {
  const a = await getApplicationByToken(s(f, 'token', 40));
  if (!a) throw new Error('This link is no longer valid. Please ask your advisor for a new one.');
  return a;
}
const refresh = (token: string) => revalidatePath(`/portal/t/${token}/`);

export async function acceptQuote(f: FormData) {
  const a = await withApp(f);
  if (!a.quote.sentAt || a.quote.acceptedAt) return;
  await updateApplication(a.id, (x) => {
    x.quote.acceptedAt = now();
    x.messages.push({ id: newId(6), by: 'client', at: now(), text: 'I accept the quote.' });
  });
  await notify('quote', `${a.client.name} accepted the quote (${a.ref})`, `/admin/applications/${a.id}/#quote`);
  const total = a.quote.lines.reduce((s, l) => s + l.amount, 0) + a.quote.serviceFee + a.quote.vat;
  const { sendWa } = await import('@/lib/server/whatsapp');
  const { portalUrl } = await import('@/lib/site');
  await sendWa(a.client.phone, 'confirmed', { name: a.client.name, ref: a.ref, route: a.route, total: `AED ${total.toFixed(2)}`, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), link: portalUrl(a.token) }).catch(() => {});
  await updateApplication(a.id, (x) => { x.confirmedAt = now(); });
  refresh(a.token);
}

export async function clientMessage(_: State, f: FormData): Promise<State> {
  try {
    const a = await withApp(f);
    const text = s(f, 'text', 3000);
    if (!text) return { error: (await t()).invalid };
    await updateApplication(a.id, (x) => { x.messages.push({ id: newId(6), by: 'client', at: now(), text }); });
    await notify('message', `Message from ${a.client.name} (${a.ref}): ${text.slice(0, 120)}`, `/admin/applications/${a.id}/#messages`);
    refresh(a.token);
    return { ok: (await t()).saved };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function clientUpload(_: State, f: FormData): Promise<State> {
  try {
    const a = await withApp(f);
    if (a.documents.filter((x) => x.by === 'client').length >= 60) return { error: 'Upload limit reached. Please send the rest to your advisor.' };
    const doc = await saveUpload(a.id, f.get('file') as File, 'client', true, s(f, 'label', 120));
    await updateApplication(a.id, (x) => {
      x.documents.push(doc);
      x.messages.push({ id: newId(6), by: 'client', at: now(), text: `Uploaded: ${doc.name}` });
    });
    if (f.get('proof')) await notify('payment', `${a.client.name} sent a bank transfer slip (${a.ref}). Check it and press “Mark paid”.`, `/admin/applications/${a.id}/#payments`);
    else await notify('upload', `${a.client.name} uploaded ${doc.name} (${a.ref})`, `/admin/applications/${a.id}/#documents`);
    refresh(a.token);
    return { ok: `✓ ${doc.name}` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
