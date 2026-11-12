import { HScroll } from '@/components/HScroll';
import { SubmitterFix } from '@/components/dash/SubmitterFix';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/server/auth';
import { listApplications, listLeads } from '@/lib/server/store';
import { list, type Note } from '@/lib/server/collections';
import { applyRuntimeSync } from '@/lib/server/settings';
import { Icon } from '@/components/Icon';
import { logout } from '../actions';
import { AdminNav, AdminSearch } from './nav';
import { AdminBell } from '@/components/dash/AdminBell';
import { scopeOf } from '@/lib/server/scope';
import { coinImg, fullLogo } from '@/components/BrandLogo';

export const dynamic = 'force-dynamic';

export default async function Panel({ children }: { children: ReactNode }) {
  const who = await requireAdmin();
  applyRuntimeSync();
  const [allLeads, allApps, allNotes] = await Promise.all([listLeads(), listApplications(), list<Note>('notifications')]);
  // Counters show only what this team member may see.
  const sc = scopeOf(who, allApps);
  const leads = allLeads.filter(sc.lead), apps = allApps.filter(sc.app), notes = allNotes.filter(sc.note);
  const counts = {
    leads: leads.filter((l) => l.status === 'new').length,
    apps: apps.filter((a) => !a.archived).length,
    unread: apps.reduce((n, a) => n + a.messages.filter((m) => m.by === 'client' && !m.read).length, 0),
    notes: notes.filter((x) => !x.read).length,
  };
  const initials = who.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="admin">
      <SubmitterFix />
      <HScroll />
      <aside className="side">
        <Link href="/admin/" className="brand"><img src={fullLogo()} alt="Abu Dhabi Golden Visa" /></Link>
        <AdminNav counts={counts} role={who.role} perms={who.perms} />
      </aside>
      <div className="admin-body">
        <AdminNav counts={counts} role={who.role} perms={who.perms} mobile />
        <header className="appbar">
          <AdminSearch role={who.role} perms={who.perms} />
          <div className="appbar-r">
            <a className="ab-btn" href="/" target="_blank" rel="noopener" title="Open website"><Icon name="ext" size={18} /><span>Website</span></a>
            <a className="ab-btn" href="/portal/" target="_blank" rel="noopener" title="Customer dashboard"><Icon name="user" size={18} /><span>Customer dashboard</span></a>
            <AdminBell initial={counts.notes} />
            <details className="ab-user">
              <summary><span className="av">{initials}</span><span className="un"><b>{who.name}</b><small>{who.role}</small></span><Icon name="chev" size={14} /></summary>
              <div className="ab-menu">
                <p className="small muted" style={{ padding: '4px 10px' }}>{who.email}</p>
                <Link href="/admin/profile/"><Icon name="user" size={16} /> My profile</Link>
                {sc.full && <Link href="/admin/settings/"><Icon name="settings" size={16} /> Site settings</Link>}
                <form action={logout}><button type="submit"><Icon name="close" size={16} /> Sign out</button></form>
              </div>
            </details>
          </div>
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
