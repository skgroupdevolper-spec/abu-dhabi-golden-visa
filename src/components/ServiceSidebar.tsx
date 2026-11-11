'use client';

import { u } from '@/lib/ui';
import { useMemo, useState } from 'react';
import { catalog } from '@/content/services-catalog';
import { localizePath, type Locale } from '@/lib/i18n';
import { Icon } from './Icon';

/** Left-side menu on every service page: search and jump from one service to another. */
export function ServiceSidebar({ current, locale, hidden = [] }: { current: string; locale: Locale; hidden?: string[] }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const groups = useMemo(() => {
    const n = q.trim().toLowerCase();
    return catalog().map((g) => ({ ...g, items: g.items.filter((i) => !hidden.includes(i.href) && (!n || `${i.label} ${i.note ?? ''} ${g.title}`.toLowerCase().includes(n))) })).filter((g) => g.items.length);
  }, [q, hidden]);
  const count = groups.reduce((s, g) => s + g.items.length, 0);
  const here = catalog().flatMap((g) => g.items).find((i) => i.href === current);

  return (
    <aside className={`svc-side${open ? ' open' : ''}`} aria-label="All services">
      <button type="button" className="svc-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span><small>{u('Our services', locale)}</small><b>{here?.label ? u(here.label, locale) : u('Browse all services', locale)}</b></span>
        <Icon name="chev" size={18} />
      </button>
      <div className="svc-panel">
        <div className="svc-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={u('Filter services', locale)} aria-label={u('Filter services', locale)} />
          {q && <button type="button" onClick={() => setQ('')} aria-label="Clear filter">✕</button>}
        </div>
        <p className="svc-count" aria-live="polite">{count} {u(count === 1 ? 'service' : 'services', locale)}</p>
        <nav className="svc-groups" data-lenis-prevent>
          {groups.map((g) => (
            <div key={g.title} className="svc-group">
              <h4><Icon name={g.icon} size={15} />{u(g.title, locale)}</h4>
              {g.items.map((i) => (
                <a key={i.href + i.label} href={localizePath(i.href, locale)} className={i.href === current ? 'on' : ''} aria-current={i.href === current ? 'page' : undefined}>
                  <span>{u(i.label, locale)}</span>
                  {i.href === current ? <i aria-hidden="true">●</i> : <em aria-hidden="true">→</em>}
                </a>
              ))}
            </div>
          ))}
          {count === 0 && <p className="muted" style={{ padding: '6px 10px' }}>No service matches “{q}”. <a href={localizePath('/contact/', locale)}>Ask us</a>.</p>}
        </nav>
      </div>
    </aside>
  );
}
