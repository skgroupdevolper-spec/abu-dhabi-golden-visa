import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/server/auth';
import { listApplications, listLeads } from '@/lib/server/store';
import { list, type Note } from '@/lib/server/collections';
import { applyRuntimeSync } from '@/lib/server/settings';
import { logout } from '../actions';
import { AdminNav } from './nav';

export const dynamic = 'force-dynamic';

export default async function Panel({ children }: { children: ReactNode }) {
  const who = await requireAdmin();
  applyRuntimeSync();
  const [leads, apps, notes] = await Promise.all([listLeads(), listApplications(), list<Note>('notifications')]);
  const counts = {
    leads: leads.filter((l) => l.status === 'new').length,
    apps: apps.filter((a) => !a.archived).length,
    unread: apps.reduce((n, a) => n + a.messages.filter((m) => m.by === 'client' && !m.read).length, 0),
    notes: notes.filter((x) => !x.read).length,
  };
  return (
    <div className="admin">
      <aside className="side">
        <div className="brand"><img src="/brand/logo.webp" alt="Abu Dhabi Golden Visa" /></div>
        <AdminNav counts={counts} role={who.role} />
        <div className="who">
          <span className="muted small">Signed in as</span>
          <div style={{ fontWeight: 700 }}>{who.name}</div><div className="small">{who.email} · {who.role}</div>
          <form action={logout} style={{ marginTop: 10 }}><button className="btn btn-sm" type="submit">Sign out</button></form>
        </div>
      </aside>
      <div>
        <AdminNav counts={counts} role={who.role} mobile />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
