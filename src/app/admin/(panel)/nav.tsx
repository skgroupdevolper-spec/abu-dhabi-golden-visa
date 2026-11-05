'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type Role = 'owner' | 'admin' | 'staff' | 'viewer';
type Item = { href: string; label: string; ic: string; roles?: Role[]; badge?: 'leads' | 'unread' | 'notes' };
const FULL: Role[] = ['owner', 'admin'];

export const ADMIN_MENU: { title: string; items: Item[] }[] = [
  { title: 'Work', items: [
    { href: '/admin/', label: 'Dashboard', ic: '◎' },
    { href: '/admin/notifications/', label: 'Notifications', ic: '◉', badge: 'notes' },
    { href: '/admin/leads/', label: 'Leads & enquiries', ic: '✉', badge: 'leads' },
    { href: '/admin/applications/', label: 'Applications', ic: '▤', badge: 'unread' },
    { href: '/admin/customers/', label: 'Customers', ic: '☺' },
    { href: '/admin/whatsapp/', label: 'WhatsApp', ic: '✆', roles: FULL },
    { href: '/admin/chatbot/', label: 'AI chatbot', ic: '✦' },
  ] },
  { title: 'Content', items: [
    { href: '/admin/posts/', label: 'Blog posts', ic: '✎' },
    { href: '/admin/autopublisher/', label: 'Auto Publisher', ic: '⚡', roles: FULL },
    { href: '/admin/pages/', label: 'Pages', ic: '▦' },
    { href: '/admin/faqs/', label: 'FAQs', ic: '?' },
    { href: '/admin/services/', label: 'Services & prices', ic: '◇' },
    { href: '/admin/fees/', label: 'Cost calculator', ic: '◈', roles: FULL },
    { href: '/admin/testimonials/', label: 'Testimonials', ic: '❝' },
    { href: '/admin/partners/', label: 'Partner logos', ic: '◫' },
    { href: '/admin/offer/', label: 'Offer pop-up', ic: '✷', roles: FULL },
    { href: '/admin/media/', label: 'Media library', ic: '▣' },
    { href: '/admin/subscribers/', label: 'Subscribers', ic: '✉' },
  ] },
  { title: 'Website', items: [
    { href: '/admin/header/', label: 'Header & menu', ic: '☰', roles: FULL },
    { href: '/admin/footer/', label: 'Footer', ic: '▁', roles: FULL },
    { href: '/admin/design/', label: 'Design & colours', ic: '◐', roles: FULL },
    { href: '/admin/languages/', label: 'Languages', ic: '⌘', roles: FULL },
    { href: '/admin/settings/', label: 'Site settings', ic: '⚙', roles: FULL },
  ] },
  { title: 'Account', items: [
    { href: '/admin/users/', label: 'Admin users', ic: '♚', roles: FULL },
    { href: '/admin/profile/', label: 'My profile', ic: '☻' },
    { href: '/admin/backup/', label: 'Backup & move', ic: '⇩', roles: FULL },
  ] },
];

export function AdminNav({ counts, role, mobile }: { counts: { leads: number; apps: number; unread: number; notes?: number }; role: Role; mobile?: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const on = (h: string) => (h === '/admin/' ? path === '/admin' || path === '/admin/' : path.startsWith(h.slice(0, -1)));
  const n = (b?: Item['badge']) => (b === 'leads' ? counts.leads : b === 'unread' ? counts.unread : b === 'notes' ? counts.notes ?? 0 : 0);
  const groups = ADMIN_MENU.map((g) => ({ ...g, items: g.items.filter((i) => !i.roles || i.roles.includes(role)) })).filter((g) => g.items.length);

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
          <p className="eyebrow" style={{ margin: '14px 14px 6px' }}>{g.title}</p>
          {g.items.map((i) => (
            <Link key={i.href} href={i.href} className={on(i.href) ? 'on' : ''}>
              <span aria-hidden="true" className="ai">{i.ic}</span>{i.label}
              {n(i.badge) > 0 && <span className="c">{n(i.badge)}</span>}
            </Link>
          ))}
        </div>
      ))}
      <a href="/" target="_blank" rel="noopener"><span aria-hidden="true" className="ai">↗</span>Open website</a>
    </nav>
  );
}
