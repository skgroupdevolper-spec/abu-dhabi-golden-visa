import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE = 'adgv_admin';
const DAY = 24 * 60 * 60 * 1000;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === 'production' && !process.env.CI) console.warn('SESSION_SECRET is not set; using a temporary secret.');
  return 'dev-only-secret-change-me-' + (process.env.ADMIN_PASSWORD || '');
}
const sign = (v: string) => createHmac('sha256', secret()).update(v).digest('base64url');

function safeEq(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Admin users come from the environment: ADMIN_EMAIL and ADMIN_PASSWORD (or ADMIN_USERS="a@x.com:pass,b@y.com:pass"). */
function users(): [string, string][] {
  const list: [string, string][] = [];
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) list.push([process.env.ADMIN_EMAIL.toLowerCase(), process.env.ADMIN_PASSWORD]);
  for (const pair of (process.env.ADMIN_USERS || '').split(',')) {
    const i = pair.indexOf(':');
    if (i > 0) list.push([pair.slice(0, i).trim().toLowerCase(), pair.slice(i + 1).trim()]);
  }
  return list;
}
export const adminConfigured = () => users().length > 0;

export function checkLogin(email: string, password: string) {
  const e = email.trim().toLowerCase();
  return users().some(([u, p]) => safeEq(u, e) && safeEq(p, password));
}

export async function startSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ e: email.toLowerCase(), x: Date.now() + 7 * DAY })).toString('base64url');
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' && !process.env.CI, path: '/', maxAge: 7 * 24 * 3600 });
}
export async function endSession() {
  (await cookies()).delete(COOKIE);
}
export async function currentAdmin(): Promise<string | null> {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return null;
  const [payload, sig] = v.split('.');
  if (!payload || !sig || !safeEq(sign(payload), sig)) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof x !== 'number' || x < Date.now()) return null;
    return users().some(([u]) => u === e) ? e : null;
  } catch {
    return null;
  }
}
export async function requireAdmin() {
  const a = await currentAdmin();
  if (!a) redirect('/admin/login/');
  return a;
}
