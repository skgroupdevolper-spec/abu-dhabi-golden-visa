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
  return updateJsonFile<T[]>(`${name}.json`, [], (a) => a.map((x) => (x.id === id ? ((fn({ ...x }) ?? x) as T) : x)));
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
export const ROLE_LABEL: Record<Role, string> = { owner: 'Owner (all access)', admin: 'Admin (all access)', staff: 'Staff (enquiries and applications)', viewer: 'Viewer (read only)' };

/* ---------- customers ---------- */
export type Customer = { id: string; name: string; email: string; phone: string; pass: string; lang: string; active: boolean; createdAt: string; lastLogin?: string; reset?: { code: string; exp: number; tries: number } };

/* ---------- subscribers ---------- */
export type Subscriber = { id: string; email: string; lang: string; at: string };

/* ---------- notifications ---------- */
export type Note = { id: string; at: string; kind: 'lead' | 'message' | 'upload' | 'quote' | 'customer' | 'request' | 'whatsapp' | 'chat'; text: string; href: string; read: boolean };
export function notify(kind: Note['kind'], text: string, href: string) {
  return insert<Note>('notifications', { id: newId(6), at: now(), kind, text: text.slice(0, 200), href, read: false }, 500);
}

/* ---------- WhatsApp log ---------- */
export type WaLog = { id: string; at: string; to: string; event: string; text: string; ok: boolean; error?: string; dir: 'out' | 'in' };
