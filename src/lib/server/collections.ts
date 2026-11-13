import 'server-only';
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { newId, now, readJsonFile, updateJsonFile } from './store';

const scrypt = promisify(_scrypt) as (p: string, s: Buffer, n: number) => Promise<Buffer>;
export async function hashPassword(p: string) {
  const salt = randomBytes(16);
  return `s1$${salt.toString('hex')}$${(await scrypt(p, salt, 32)).toString('hex')}`;
}
export async function verifyPassword(p: string, stored: string) {
  const [v, salt, hash] = stored.split('$');
  if (v !== 's1' || !salt || !hash) return false;
  const a = await scrypt(p, Buffer.from(salt, 'hex'), 32), b = Buffer.from(hash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ---------- generic list collections ---------- */
export function list<T>(name: string) { return readJsonFile<T[]>(`${name}.json`, []); }
export function insert<T extends { id: string }>(name: string, item: T, max = 5000) {
  return updateJsonFile<T[]>(`${name}.json`, [], (a) => [item, ...a].slice(0, max));
}
export function patch<T extends { id: string }>(name: string, id: string, fn: (x: T) => T | void) {
  // fn may change the copy in place (returns nothing) or return a new object; both are saved
  return updateJsonFile<T[]>(`${name}.json`, [], (a) => a.map((x) => { if (x.id !== id) return x; const c = { ...x }; return (fn(c) ?? c) as T; }));
}
export function remove<T extends { id: string }>(name: string, id: string) {
  return updateJsonFile<T[]>(`${name}.json`, [], (a) => a.filter((x) => x.id !== id));
}
export function replaceAll<T>(name: string, items: T[]) {
  return updateJsonFile<T[]>(`${name}.json`, [], () => items);
}

/* ---------- team users ---------- */
export type Role = 'owner' | 'admin' | 'staff' | 'viewer';
export type TeamUser = { id: string; email: string; name: string; role: Role; pass: string; active: boolean; createdAt: string; lastLogin?: string; perms?: string[]; phone?: string; title?: string; note?: string; logins?: number };
export const ROLE_LABEL: Record<Role, string> = { owner: 'Owner (all access)', admin: 'Admin (all access)', staff: 'Staff (only files assigned to them)', viewer: 'Viewer (read only, assigned files)' };

/* ---------- customers ---------- */
export type Customer = { id: string; name: string; email: string; phone: string; pass: string; lang: string; active: boolean; createdAt: string; lastLogin?: string; updatesClearedAt?: string; reset?: { code: string; exp: number; tries: number } };

/* ---------- subscribers ---------- */
export type Subscriber = { id: string; email: string; lang: string; at: string };

/* ---------- notifications ---------- */
export type Note = { id: string; at: string; kind: 'lead' | 'message' | 'upload' | 'quote' | 'customer' | 'request' | 'whatsapp' | 'chat' | 'booking' | 'payment'; text: string; href: string; read: boolean; to?: string };
export async function notify(kind: Note['kind'], text: string, href: string, to?: string) {
  const r = await insert<Note>('notifications', { id: newId(6), at: now(), kind, text: text.slice(0, 200), href, read: false, ...(to ? { to } : {}) }, 500);
  void emailNote(kind, text, href, to);
  return r;
}

const NOTE_LABEL: Record<Note['kind'], string> = { lead: 'New enquiry', message: 'New message', upload: 'New document', quote: 'Quote', customer: 'New client', request: 'Client request', whatsapp: 'WhatsApp message', chat: 'Website chat', booking: 'New booking', payment: 'Payment' };
/** Email copy of each notification: to the staff member it is for, otherwise to the team notification address. */
async function emailNote(kind: Note['kind'], text: string, href: string, to?: string) {
  try {
    const [{ getBlock, getSecrets }, { sendMail }, { SITE }] = await Promise.all([import('./settings'), import('./mail'), import('@/lib/site')]);
    const cfg = await getBlock<{ on?: boolean; kinds?: Partial<Record<Note['kind'], boolean>> }>('note-mail', {});
    if (cfg.on === false || cfg.kinds?.[kind] === false) return;
    if (kind === 'lead' || kind === 'booking') return; // these already send a detailed team email
    const addr = to || (await getSecrets()).smtp.notify;
    if (!addr) return;
    const url = `${(SITE.url || '').replace(/\/$/, '')}${href.startsWith('/') ? href : `/${href}`}`;
    await sendMail(addr, `${NOTE_LABEL[kind]}: ${text}`.slice(0, 150), `${text}\n\nOpen it in the admin:\n${url}`, { title: 'Team notice', badge: NOTE_LABEL[kind] });
  } catch {}
}

/* ---------- WhatsApp log ---------- */
export type WaLog = { id: string; at: string; to: string; event: string; text: string; ok: boolean; error?: string; dir: 'out' | 'in' };
