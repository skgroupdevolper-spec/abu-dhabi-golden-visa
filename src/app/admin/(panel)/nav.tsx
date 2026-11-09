'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';

import { ADMIN_MENU, allowed, type Item, type Role } from './menu';
import { coinImg, fullLogo } from '@/components/BrandLogo';


export function AdminNav({ counts, role, mobile, perms }: { counts: { leads: number; apps: number; unread: number; notes?: number }; role: Role; mobile?: boolean; perms?: string[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const on = (h: string) => (h === '/admin/' ? path === '/admin' || path === '/admin/' : path.startsWith(h.slice(0, -1)));
  const n = (b?: Item['badge']) => (b === 'leads' ? counts.leads : b === 'unread' ? counts.unread : b === 'notes' ? counts.notes ?? 0 : 0);
  const groups = ADMIN_MENU.map((g) => ({ ...g, items: g.items.filter((i) => allowed(i, role, perms)) })).filter((g) => g.items.length);

  // Sliding highlight ("pill"): on a click it stretches like a drop, the leading edge first, then the
  // trailing edge catches up. Pure CSS transitions on top/bottom; still for people who prefer less motion.
  const navRef = useRef<HTMLElement>(null), pillRef = useRef<HTMLSpanElement>(null), last = useRef<{ t: number; b: number } | null>(null);
  const glide = (a: Element | null) => {
    const nav = navRef.current, pill = pillRef.current;
    if (!nav || !pill || !a) return;
    const nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
    const t = r.top - nr.top + nav.scrollTop, b = nr.height - (r.bottom - nr.top) - nav.scrollTop;
    const prev = last.current, down = prev ? t > prev.t : true, slow = '0.46s cubic-bezier(.65,0,.35,1)', fast = '0.3s cubic-bezier(.33,1,.68,1)';
    pill.style.transition = prev ? (down ? `bottom ${fast}, top ${slow} 0.06s, opacity .2s` : `top ${fast}, bottom ${slow} 0.06s, opacity .2s`) : 'none';
    pill.style.top = `${t}px`; pill.style.bottom = `${b}px`; pill.style.opacity = '1';
    last.current = { t, b };
  };
  const place = () => { if (!mobile) glide(navRef.current?.querySelector('a.on') ?? null); };
  useLayoutEffect(place, [path]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const ro = new ResizeObserver(() => { const p = pillRef.current; if (p) p.style.transition = 'none'; last.current = null; place(); }); if (navRef.current) ro.observe(navRef.current); return () => ro.disconnect(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (mobile)
    return (
      <div className="mtop">
        <img src={fullLogo()} alt="" />
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
    <nav aria-label="Admin" className="anav" ref={navRef} onClickCapture={(e) => { const a = (e.target as HTMLElement).closest('a'); if (a && a.getAttribute('target') !== '_blank') glide(a); }}>
      <span className="anav-pill" ref={pillRef} aria-hidden="true" />
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
