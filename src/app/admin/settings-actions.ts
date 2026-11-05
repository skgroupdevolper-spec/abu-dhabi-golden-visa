'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { hashPassword, insert, list, patch, remove, verifyPassword, type Customer, type Note, type Role, type TeamUser } from '@/lib/server/collections';
import { sendMail } from '@/lib/server/mail';
import { getSecrets, getSite, saveBlock, saveSecrets, saveSite } from '@/lib/server/settings';
import { newId, now, readJsonFile, updateJsonFile, writeJsonFile } from '@/lib/server/store';
import { sendWa } from '@/lib/server/whatsapp';
import { WA_EVENTS, type PublicSite, type WaEvent } from '@/lib/settings-schema';

type St = { ok?: string; error?: string } | undefined;
const s = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? '').trim().slice(0, max);
const b = (f: FormData, k: string) => f.get(k) === 'on' || f.get(k) === '1';
const done = (msg = 'Saved. The live website uses it now.') => { revalidatePath('/', 'layout'); return { ok: msg }; };

/* ---------- site settings ---------- */
export async function saveGeneral(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const wa = s(f, 'whatsapp', 30).replace(/\D/g, '');
  await saveSite({
    name: s(f, 'name', 120), tagline: s(f, 'tagline', 160), operator: s(f, 'operator', 160), licence: s(f, 'licence', 60),
    whatsapp: wa, whatsappDisplay: s(f, 'whatsappDisplay', 40), phone: s(f, 'phone', 40), email: s(f, 'email', 160),
    office: s(f, 'office', 240), hours: s(f, 'hours', 200), mapsUrl: s(f, 'mapsUrl', 600), disclaimer: s(f, 'disclaimer', 400), footerAbout: s(f, 'footerAbout', 800),
  });
  return done();
}
export async function saveSocial(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const keys = ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'x'] as const;
  const social = Object.fromEntries(keys.map((k) => [k, s(f, k, 300)])) as PublicSite['social'];
  await saveSite({ social });
  return done();
}
export async function saveFeatures(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const cur = await getSite();
  const features = { ...cur.features };
  for (const k of Object.keys(features) as (keyof PublicSite['features'])[]) {
    if (k === 'topBarText') features.topBarText = s(f, 'topBarText', 200);
    else (features as Record<string, unknown>)[k] = b(f, k);
  }
  await saveSite({ features });
  return done();
}
export async function saveOffer(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const cur = await getSite();
  await saveSite({ offer: { title: s(f, 'title', 120), text: s(f, 'text', 400), button: s(f, 'button', 60), link: s(f, 'link', 300), delaySeconds: Math.max(0, Math.min(120, Number(s(f, 'delay', 4)) || 0)) }, features: { ...cur.features, offer: b(f, 'on') } });
  return done();
}
export async function saveColors(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const hex = (v: string, d: string) => (/^#[0-9a-f]{6}$/i.test(v) ? v : d);
  const cur = await getSite();
  await saveSite({ colors: { gold: hex(s(f, 'gold'), cur.colors.gold), goldDeep: hex(s(f, 'goldDeep'), cur.colors.goldDeep), ink: hex(s(f, 'ink'), cur.colors.ink), paper: hex(s(f, 'paper'), cur.colors.paper) } });
  return done();
}
export async function saveSeo(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  await saveSecrets({ seo: { homeTitle: s(f, 'homeTitle', 160), homeMeta: s(f, 'homeMeta', 320), googleVerify: s(f, 'googleVerify', 120), bingVerify: s(f, 'bingVerify', 120), headCode: s(f, 'headCode', 20000), bodyCode: s(f, 'bodyCode', 20000) } });
  return done();
}
export async function saveSmtp(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const cur = (await getSecrets()).smtp;
  await saveSecrets({ smtp: { host: s(f, 'host', 200), port: Number(s(f, 'port', 6)) || 465, secure: b(f, 'secure'), user: s(f, 'user', 200), pass: s(f, 'pass', 300) || cur.pass, from: s(f, 'from', 200), notify: s(f, 'notify', 300) } });
  if (f.get('test')) {
    const r = await sendMail(s(f, 'notify', 300) || s(f, 'user', 200), 'Test email from your website', 'Your email settings work.');
    return r.ok ? { ok: 'Saved and test email sent.' } : { error: `Saved, but the test failed: ${r.error}` };
  }
  return { ok: 'Saved.' };
}
export async function saveAi(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const cur = (await getSecrets()).ai;
  const keep = (k: 'openaiKey' | 'geminiKey' | 'anthropicKey') => (f.get(`clear_${k}`) ? '' : s(f, k, 400) || cur[k]);
  await saveSecrets({ ai: { provider: s(f, 'provider', 20) as 'openai' | 'gemini' | 'anthropic' | '', openaiKey: keep('openaiKey'), geminiKey: keep('geminiKey'), anthropicKey: keep('anthropicKey'), model: s(f, 'model', 80), dailyBudget: Math.max(0, Number(s(f, 'dailyBudget', 8)) || 0), routes: cur.routes, images: cur.images } });
  return { ok: 'Saved.' };
}

/* ---------- WhatsApp ---------- */
export async function saveWhatsApp(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const cur = (await getSecrets()).whatsapp;
  const autos = { ...cur.autos }, templates = { ...cur.templates }, templateNames: Partial<Record<WaEvent, string>> = {};
  for (const e of WA_EVENTS) {
    autos[e.key] = b(f, `auto_${e.key}`);
    templates[e.key] = s(f, `tpl_${e.key}`, 1000) || cur.templates[e.key];
    const n = s(f, `name_${e.key}`, 80);
    if (n) templateNames[e.key] = n;
  }
  await saveSecrets({ whatsapp: { ...cur, mode: s(f, 'mode') === 'cloud' ? 'cloud' : 'link', phoneNumberId: s(f, 'phoneNumberId', 60), accessToken: s(f, 'accessToken', 800) || cur.accessToken, businessId: s(f, 'businessId', 60), verifyToken: s(f, 'verifyToken', 120), teamNumbers: s(f, 'teamNumbers', 400), templateLang: s(f, 'templateLang', 10) || 'en', autos, templates, templateNames } });
  return { ok: 'WhatsApp settings saved.' };
}
export async function testWhatsApp(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const to = s(f, 'to', 30);
  const r = await sendWa(to, 'message', {}, { force: true, text: s(f, 'text', 500) || 'Test message from your Abu Dhabi Golden Visa website.' });
  return r.ok ? { ok: `Sent to ${to}.` } : { error: `Not sent: ${r.error}` };
}

/* ---------- team users ---------- */
const ROLES = ['admin', 'staff', 'viewer'];
const permsOf = (f: FormData) => (f.get('custom') === 'on' ? f.getAll('perm').map(String).filter((h) => /^\/admin\/[\w-]*\/?$/.test(h)) : []);
export async function addUser(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const email = s(f, 'email', 160).toLowerCase(), pass = s(f, 'password', 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Enter a valid email.' };
  if (pass.length < 10) return { error: 'Use a password of at least 10 characters.' };
  if ((await list<TeamUser>('team')).some((u) => u.email === email)) return { error: 'This email already has an account.' };
  const role = (ROLES.includes(s(f, 'role')) ? s(f, 'role') : 'staff') as Role;
  await insert<TeamUser>('team', { id: newId(6), email, name: s(f, 'name', 80) || email, role, pass: await hashPassword(pass), active: true, createdAt: now(), phone: s(f, 'phone', 30), title: s(f, 'title', 80), perms: permsOf(f) });
  revalidatePath('/admin/users/');
  return { ok: 'User added. Share the password with them privately.' };
}
export async function saveUser(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const id = s(f, 'id', 40), pass = s(f, 'password', 200);
  const users = await list<TeamUser>('team');
  const email = s(f, 'email', 160).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Enter a valid email.' };
  if (users.some((u) => u.email === email && u.id !== id)) return { error: 'Another user has this email.' };
  if (pass && pass.length < 10) return { error: 'Use a password of at least 10 characters.' };
  const hashed = pass ? await hashPassword(pass) : '';
  await patch<TeamUser>('team', id, (u) => {
    u.name = s(f, 'name', 80) || u.name; u.email = email; u.phone = s(f, 'phone', 30); u.title = s(f, 'title', 80); u.note = s(f, 'note', 600);
    u.role = (ROLES.includes(s(f, 'role')) ? s(f, 'role') : u.role) as Role;
    u.active = b(f, 'active'); u.perms = permsOf(f);
    if (hashed) u.pass = hashed;
  });
  revalidatePath('/admin/users/');
  return { ok: hashed ? 'Saved. The new password works from now on.' : 'Saved.' };
}
export async function updateUser(f: FormData) {
  await requireAdmin(FULL);
  const id = s(f, 'id', 40), op = s(f, 'op', 12);
  if (op === 'delete' || f.get('delete')) await remove<TeamUser>('team', id);
  else if (op === 'toggle') await patch<TeamUser>('team', id, (u) => { u.active = !u.active; });
  revalidatePath('/admin/users/');
}
export async function changeMyPassword(_: St, f: FormData): Promise<St> {
  const me = await requireAdmin();
  if (me.env) return { error: 'The owner account is set on the server (ADMIN_PASSWORD). Change it there and restart.' };
  const u = (await list<TeamUser>('team')).find((x) => x.email === me.email);
  if (!u || !(await verifyPassword(s(f, 'current', 200), u.pass))) return { error: 'Current password is not correct.' };
  const next = s(f, 'next', 200);
  if (next.length < 10) return { error: 'Use at least 10 characters.' };
  const h = await hashPassword(next);
  await patch<TeamUser>('team', u.id, (x) => { x.pass = h; x.name = s(f, 'name', 80) || x.name; });
  return { ok: 'Password changed.' };
}

/* ---------- customers ---------- */
export async function updateCustomer(f: FormData) {
  await requireAdmin(FULL);
  const id = s(f, 'id', 40), pass = s(f, 'password', 200);
  const hashed = pass.length >= 8 ? await hashPassword(pass) : '';
  await patch<Customer>('customers', id, (c) => { c.active = b(f, 'active'); if (hashed) c.pass = hashed; });
  revalidatePath('/admin/customers/');
}
export async function addCustomer(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const email = s(f, 'email', 160).toLowerCase(), pass = s(f, 'password', 200), name = s(f, 'name', 100);
  if (!name) return { error: 'Add the client name.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Enter a valid email.' };
  if (pass.length < 8) return { error: 'Use a password of at least 8 characters.' };
  if ((await list<Customer>('customers')).some((c) => c.email === email)) return { error: 'This email already has a client account.' };
  await insert<Customer>('customers', { id: newId(8), name, email, phone: s(f, 'phone', 30), pass: await hashPassword(pass), lang: s(f, 'lang', 5) || 'en', active: true, createdAt: now() });
  revalidatePath('/admin/customers/');
  return { ok: 'Client account created. Share the login details privately, for example on WhatsApp.' };
}
export async function saveCustomer(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const id = s(f, 'id', 40), pass = s(f, 'password', 200), email = s(f, 'email', 160).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Enter a valid email.' };
  if ((await list<Customer>('customers')).some((c) => c.email === email && c.id !== id)) return { error: 'Another client has this email.' };
  if (pass && pass.length < 8) return { error: 'Use a password of at least 8 characters.' };
  const hashed = pass ? await hashPassword(pass) : '';
  await patch<Customer>('customers', id, (c) => { c.name = s(f, 'name', 100) || c.name; c.email = email; c.phone = s(f, 'phone', 30); c.lang = s(f, 'lang', 5) || c.lang; c.active = b(f, 'active'); if (hashed) c.pass = hashed; });
  revalidatePath('/admin/customers/');
  return { ok: hashed ? 'Saved with the new password.' : 'Saved.' };
}
export async function customerAction(f: FormData) {
  await requireAdmin(FULL);
  const id = s(f, 'id', 40), op = s(f, 'op', 10);
  if (op === 'delete') await remove<Customer>('customers', id);
  else if (op === 'toggle') await patch<Customer>('customers', id, (c) => { c.active = !c.active; });
  else if (op === 'open') {
    const { startClientSession } = await import('@/lib/server/auth');
    await startClientSession(id);
    const { redirect } = await import('next/navigation');
    redirect('/portal/');
  }
  revalidatePath('/admin/customers/');
}

/* ---------- notifications ---------- */
export async function readAllNotes() {
  await requireAdmin();
  await updateJsonFile<Note[]>('notifications.json', [], (a) => a.map((n) => ({ ...n, read: true })));
  revalidatePath('/admin/', 'layout');
}
export async function openNote(f: FormData) {
  await requireAdmin();
  const id = s(f, 'id', 40);
  const n = (await list<Note>('notifications')).find((x) => x.id === id);
  await patch<Note>('notifications', id, (x) => { x.read = true; });
  redirect(n?.href || '/admin/');
}

/* ---------- backup ---------- */
const FILES = ['settings.json', 'leads.json', 'applications.json', 'customers.json', 'team.json', 'subscribers.json', 'notifications.json', 'whatsapp-log.json', 'posts.json', 'content.json', 'faqs.json', 'testimonials.json', 'partners.json', 'media.json', 'chats.json', 'translations.json', 'autopub.json'];
export async function restoreBackup(_: St, f: FormData): Promise<St> {
  await requireAdmin(['owner']);
  const file = f.get('file') as File | null;
  if (!file || !file.size) return { error: 'Choose a backup file.' };
  let data: Record<string, unknown>;
  try { data = JSON.parse(await file.text()); } catch { return { error: 'This is not a backup file.' }; }
  if (data.kind !== 'adgv-backup' || typeof data.files !== 'object') return { error: 'This is not a backup from this website.' };
  let n = 0;
  for (const [name, v] of Object.entries(data.files as Record<string, unknown>)) if (FILES.includes(name)) { await writeJsonFile(name, v); n++; }
  revalidatePath('/', 'layout');
  return { ok: `Restored ${n} data files. Uploaded documents are not part of the backup file; copy the uploads folder separately.` };
}
export async function noop() {}

/* ---------- design system ---------- */
export async function saveDesign(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const { cleanDesign } = await import('@/lib/design');
  const g = (k: string) => String(f.get(k) ?? '');
  const d = cleanDesign({
    headingFont: g('headingFont'), bodyFont: g('bodyFont'), baseSize: Number(g('baseSize')), h1Size: Number(g('h1Size')), h2Size: Number(g('h2Size')), h3Size: Number(g('h3Size')),
    headingWeight: Number(g('headingWeight')), lineHeight: Number(g('lineHeight')), letterSpacing: Number(g('letterSpacing')), radius: Number(g('radius')),
    buttonShape: g('buttonShape') as 'pill', buttonSize: g('buttonSize') as 'm', shadow: g('shadow') as 'soft', container: Number(g('container')), sectionSpace: Number(g('sectionSpace')),
    uppercaseEyebrow: f.get('uppercaseEyebrow') === 'on', customCss: g('customCss'),
    motion: g('motion') as 'full', textFx: g('textFx') as 'words', cursor: f.get('cursor') === 'on', smooth: f.get('smooth') === 'on',
  });
  await saveBlock('design', d);
  const hex = (v: string, dflt: string) => (/^#[0-9a-f]{6}$/i.test(v) ? v : dflt);
  const cur = await getSite();
  if (f.get('gold')) await saveSite({ colors: { gold: hex(g('gold'), cur.colors.gold), goldDeep: hex(g('goldDeep'), cur.colors.goldDeep), ink: hex(g('ink'), cur.colors.ink), paper: hex(g('paper'), cur.colors.paper) } });
  revalidatePath('/', 'layout');
  return { ok: 'Design saved. The website uses it now.' };
}

/** Keys plus the provider and model for one feature (chatbot, translation, writer, editor, pictures). */
export async function saveAiRoute(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const cur = (await getSecrets()).ai;
  const keep = (k: 'openaiKey' | 'geminiKey' | 'anthropicKey') => (f.get(`clear_${k}`) ? '' : s(f, k, 400) || cur[k]);
  const routes = { ...(cur.routes ?? {}) };
  for (const use of ['chat', 'translate', 'writer', 'editor'] as const) {
    if (f.has(`p_${use}`)) routes[use] = { provider: s(f, `p_${use}`, 20) as 'openai' | 'gemini' | 'anthropic' | '', model: s(f, `m_${use}`, 80) };
  }
  const images = f.has('p_images') ? { provider: (['openai', 'gemini'].includes(s(f, 'p_images')) ? s(f, 'p_images') : 'none') as 'none' | 'openai' | 'gemini', model: s(f, 'm_images', 80) } : cur.images;
  const provider = f.has('provider') ? (s(f, 'provider', 20) as 'openai' | 'gemini' | 'anthropic' | '') : cur.provider;
  await saveSecrets({ ai: { ...cur, provider, openaiKey: keep('openaiKey'), geminiKey: keep('geminiKey'), anthropicKey: keep('anthropicKey'), routes, images, dailyBudget: f.has('dailyBudget') ? Math.max(0, Number(s(f, 'dailyBudget', 8)) || 0) : cur.dailyBudget } });
  revalidatePath('/admin/', 'layout');
  return { ok: 'AI settings saved.' };
}
