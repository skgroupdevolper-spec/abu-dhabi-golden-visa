'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/Icon';

import { ADMIN_MENU, allowed, type Item, type Role } from './menu';


export function AdminNav({ counts, role, mobile, perms }: { counts: { leads: number; apps: number; unread: number; notes?: number }; role: Role; mobile?: boolean; perms?: string[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const on = (h: string) => (h === '/admin/' ? path === '/admin' || path === '/admin/' : path.startsWith(h.slice(0, -1)));
  const n = (b?: Item['badge']) => (b === 'leads' ? counts.leads : b === 'unread' ? counts.unread : b === 'notes' ? counts.notes ?? 0 : 0);
  const groups = ADMIN_MENU.map((g) => ({ ...g, items: g.items.filter((i) => allowed(i, role, perms)) })).filter((g) => g.items.length);

  if (mobile)
    return (
      <div className="mtop">
        <img src="/brand/logo.webp" alt="" />
        <button type="button" className="btn btn-sm" style={{ marginInlineStart: 'auto' }} onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Close' : 'Menu'}{counts.notes ? ` (${counts.notes})` : ''}</button>
        {open && (
          <nav className="mmenu" aria-label="Admin" onClick={() => setOpen(false)}>
            {groups.map((g) => (
              <div key={g.title}><p className="eyebrow">{g.title}</p>{g.items.map((i) => <Link key={i.href} href={i.href} className={on(i.href) ? 'on' : ''}>{i.label}{n(i.badge) ? ` (${n(i.badge)})` : ''}</Link>)}</div>
            ))}
            <a href="/">Open website ↗</a>
          </nav>
        )}
      </div>
    );
  return (
    <nav aria-label="Admin" className="anav">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="anav-h">{g.title}</p>
          {g.items.map((i) => (
            <Link key={i.href} href={i.href} className={on(i.href) ? 'on' : ''}>
              <span aria-hidden="true" className="ai"><Icon name={i.ic} size={18} /></span><span className="al">{i.label}</span>
              {n(i.badge) > 0 && <span className="c">{n(i.badge)}</span>}
            </Link>
          ))}
        </div>
      ))}
      <a href="/" target="_blank" rel="noopener"><span aria-hidden="true" className="ai"><Icon name="ext" size={18} /></span><span className="al">Open website</span></a>
    </nav>
  );
}

/** Quick search across the admin menu (Ctrl+K). */
export function AdminSearch({ role, perms }: { role: Role; perms?: string[] }) {
  const [q, setQ] = useState('');
  const items = ADMIN_MENU.flatMap((g) => g.items.filter((i) => allowed(i, role, perms)).map((i) => ({ ...i, g: g.title })));
  const hits = q.trim() ? items.filter((i) => `${i.label} ${i.g}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8) : [];
  return (
    <div className="ab-search">
      <Icon name="search" size={17} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the dashboard…" aria-label="Search the dashboard" onKeyDown={(e) => { if (e.key === 'Enter' && hits[0]) window.location.href = hits[0].href; if (e.key === 'Escape') setQ(''); }} />
      {hits.length > 0 && (
        <div className="ab-hits">{hits.map((h) => <Link key={h.href} href={h.href} onClick={() => setQ('')}><Icon name={h.ic} size={16} /> {h.label}<small>{h.g}</small></Link>)}</div>
      )}
    </div>
  );
}
