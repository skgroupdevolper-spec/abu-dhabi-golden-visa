import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { list, patch, verifyPassword, type Role, type TeamUser } from './collections';
import { now } from './store';
import { isPlaceholder, sessionSecret } from './secrets';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/** Read a value straight from the site's .env file. Hosting panels often save passwords without quotes;
 *  the standard .env loader then treats everything after a "#" as a comment and cuts the password. Here
 *  the whole rest of the line is used (surrounding quotes removed), so such passwords still work. */
function rawEnv(name: string): string | undefined {
  const loaded = process.env[name];
  for (const f of ['.env.production.local', '.env.local', '.env.production', '.env']) {
    let txt = '';
    try { txt = readFileSync(path.join(process.cwd(), f), 'utf8'); } catch { continue; }
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(new RegExp(`^\\s*(?:export\\s+)?${name}\\s*=\\s*(.*)$`));
      if (!m) continue;
      let v = m[1].trim();
      if (v.length >= 2 && (v[0] === '"' || v[0] === "'") && v.endsWith(v[0])) v = v.slice(1, -1);
      // only trust the raw line when it extends what the loader saw (the cut-at-# case)
      if (!loaded || (v.length > loaded.length && v.startsWith(loaded))) return v;
      return loaded;
    }
  }
  return loaded;
}

const COOKIE = 'adgv_admin';
const CLIENT_COOKIE = 'adgv_client';
const DAY = 24 * 60 * 60 * 1000;

const secret = () => sessionSecret();
const sign = (v: string) => createHmac('sha256', secret()).update(v).digest('base64url');
function safeEq(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Owner accounts from the server environment: ADMIN_EMAIL / ADMIN_PASSWORD (or ADMIN_USERS="a@x.com:pass,b@y.com:pass"). */
function envUsers(): [string, string][] {
  const out: [string, string][] = [];
  const pw = rawEnv('ADMIN_PASSWORD');
  if (process.env.ADMIN_EMAIL && pw && !isPlaceholder(pw)) out.push([process.env.ADMIN_EMAIL.toLowerCase(), pw]);
  for (const pair of (process.env.ADMIN_USERS || '').split(',')) {
    const i = pair.indexOf(':');
    if (i > 0 && !isPlaceholder(pair.slice(i + 1).trim())) out.push([pair.slice(0, i).trim().toLowerCase(), pair.slice(i + 1).trim()]);
  }
  return out;
}
export const adminConfigured = () => envUsers().length > 0;

export type Admin = { email: string; name: string; role: Role; env: boolean; perms?: string[] };

export async function checkLogin(email: string, password: string): Promise<Admin | null> {
  const e = email.trim().toLowerCase();
  if (envUsers().some(([u, p]) => safeEq(u, e) && safeEq(p, password))) return { email: e, name: 'Owner', role: 'owner', env: true };
  const u = (await list<TeamUser>('team')).find((x) => x.email === e && x.active);
  if (u && (await verifyPassword(password, u.pass))) {
    await patch<TeamUser>('team', u.id, (x) => { x.lastLogin = now(); x.logins = (x.logins ?? 0) + 1; });
    return { email: u.email, name: u.name, role: u.role, env: false, perms: u.perms };
  }
  return null;
}

/** Shared parent domain (".abudhabigoldenvisa.com") so a client signed in on the portal is also recognised on the main site. */
function sharedDomain(): string | undefined {
  if (process.env.CI || process.env.NODE_ENV !== 'production') return undefined;
  const portal = (process.env.PORTAL_HOST || 'app.abudhabigoldenvisa.com').toLowerCase();
  const parts = portal.split('.');
  return parts.length >= 3 && !/localhost|\d+$/.test(portal) ? '.' + parts.slice(1).join('.') : undefined;
}
async function setSigned(name: string, data: object, days: number, shared = false) {
  const payload = Buffer.from(JSON.stringify({ ...data, x: Date.now() + days * DAY })).toString('base64url');
  const domain = shared ? sharedDomain() : undefined;
  (await cookies()).set(name, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' && !process.env.CI, path: '/', maxAge: days * 24 * 3600, ...(domain ? { domain } : {}) });
}
async function readSigned<T>(name: string): Promise<T | null> {
  const v = (await cookies()).get(name)?.value;
  if (!v) return null;
  const [payload, sig] = v.split('.');
  if (!payload || !sig || !safeEq(sign(payload), sig)) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof d.x === 'number' && d.x > Date.now() ? (d as T) : null;
  } catch {
    return null;
  }
}

export async function startSession(a: Admin) { await setSigned(COOKIE, { e: a.email }, 7); }
export async function endSession() { (await cookies()).delete(COOKIE); }

export async function currentAdmin(): Promise<Admin | null> {
  const d = await readSigned<{ e: string }>(COOKIE);
  if (!d) return null;
  if (envUsers().some(([u]) => u === d.e)) return { email: d.e, name: 'Owner', role: 'owner', env: true };
  const u = (await list<TeamUser>('team')).find((x) => x.email === d.e && x.active);
  return u ? { email: u.email, name: u.name, role: u.role, env: false, perms: u.perms } : null;
}

/** Signed-in team member; optionally limited to certain roles. */
export async function requireAdmin(roles?: Role[]) {
  const a = await currentAdmin();
  if (!a) redirect('/admin/login/');
  // Owners and admins: the role decides. Everyone else: only the ticked sections (and their actions);
  // staff and viewers with nothing ticked get their assigned applications and enquiries only.
  const secs = a.perms?.length ? a.perms : a.role === 'owner' || a.role === 'admin' ? null : ['/admin/applications/', '/admin/leads/'];
  if (secs) {
    const p = (await headers()).get('x-admin-path') || '';
    const sec = p.match(/^\/admin\/[^/]+\//)?.[0] ?? '/admin/';
    const free = ['/admin/', '/admin/profile/', '/admin/notifications/', '/admin/login/'];
    if (p && !free.includes(sec) && !secs.includes(sec)) redirect('/admin/?denied=1');
    // A ticked section opens its own actions; outside it (dashboard, profile, unknown path) the role still decides.
    if (roles && !roles.includes(a.role) && (!p || free.includes(sec))) redirect('/admin/?denied=1');
    return a;
  }
  if (roles && !roles.includes(a.role)) redirect('/admin/?denied=1');
  return a;
}
export const FULL: Role[] = ['owner', 'admin'];
export const EDIT: Role[] = ['owner', 'admin', 'staff'];

/* ---------- client accounts ---------- */
export async function startClientSession(id: string) { await setSigned(CLIENT_COOKIE, { c: id }, 30, true); }
export async function endClientSession() {
  const jar = await cookies();
  jar.delete(CLIENT_COOKIE);
  const domain = sharedDomain();
  if (domain) jar.set(CLIENT_COOKIE, '', { path: '/', maxAge: 0, domain });
}
export async function currentClientId() { return (await readSigned<{ c: string }>(CLIENT_COOKIE))?.c ?? null; }
