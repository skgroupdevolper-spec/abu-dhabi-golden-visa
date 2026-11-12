import 'server-only';
// What a signed-in team member may see. Owners and admins see everything. Staff and viewers
// see only the client files and enquiries assigned to them (like a customer sees only their own),
// plus the sections the owner ticked for them in Admin users.
import { redirect } from 'next/navigation';
import { requireAdmin, type Admin } from './auth';
import type { Note } from './collections';
import { getApplication, listApplications, type Application, type Lead } from './store';

export const isFull = (a: Pick<Admin, 'role'>) => a.role === 'owner' || a.role === 'admin';

const dg = (p: string) => (p || '').replace(/\D/g, '').slice(-9);

export type Scope = {
  me: Admin;
  full: boolean;
  app: (a: Application) => boolean;
  lead: (l: Lead) => boolean;
  /** Customer or booking contact belongs to one of my files. */
  contact: (email?: string, phone?: string) => boolean;
  note: (n: Note) => boolean;
};

export function scopeOf(me: Admin, apps: Application[]): Scope {
  const full = isFull(me);
  const mine = full ? apps : apps.filter((a) => a.assignee === me.email);
  const emails = new Set(mine.map((a) => a.client.email.toLowerCase()).filter(Boolean));
  const phones = new Set(mine.map((a) => dg(a.client.phone)).filter(Boolean));
  return {
    me, full,
    app: (a) => full || a.assignee === me.email,
    lead: (l) => full || l.assignee === me.email || (!!l.applicationId && mine.some((a) => a.id === l.applicationId)),
    contact: (email, phone) => full || (!!email && emails.has(email.toLowerCase())) || (!!dg(phone || '') && phones.has(dg(phone || ''))),
    note: (n) => full || n.to === me.email || mine.some((a) => n.href.includes(a.id)),
  };
}

/** The signed-in team member and what they may see. */
export async function myScope(): Promise<Scope> {
  const me = await requireAdmin();
  return scopeOf(me, await listApplications());
}

/** Opens one client file, or sends staff back to the dashboard when it is not assigned to them. */
export async function scopedApp(id: string): Promise<Application | null> {
  const sc = await myScope();
  const a = await getApplication(id);
  if (a && !sc.app(a)) redirect('/admin/?denied=1');
  return a ?? null;
}
