'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  ['/admin/', 'Overview', '◎'],
  ['/admin/leads/', 'Enquiries', '✉'],
  ['/admin/applications/', 'Applications', '▤'],
  ['/admin/fees/', 'Government fees', '◈'],
] as const;

export function AdminNav({ counts, mobile }: { counts: { leads: number; apps: number; unread: number }; mobile?: boolean }) {
  const path = usePathname();
  const on = (h: string) => (h === '/admin/' ? path === '/admin' || path === '/admin/' : path.startsWith(h.slice(0, -1)));
  const badge = (h: string) => (h === '/admin/leads/' ? counts.leads : h === '/admin/applications/' ? counts.unread : 0);
  if (mobile)
    return (
      <nav className="mtop" aria-label="Admin">
        <img src="/brand/logo.webp" alt="" />
        {LINKS.map(([h, t]) => <Link key={h} href={h} className={on(h) ? 'on' : ''}>{t}{badge(h) ? ` (${badge(h)})` : ''}</Link>)}
        <a href="/" style={{ marginInlineStart: 'auto' }}>Website ↗</a>
      </nav>
    );
  return (
    <nav aria-label="Admin">
      {LINKS.map(([h, t, ic]) => (
        <Link key={h} href={h} className={on(h) ? 'on' : ''}>
          <span aria-hidden="true" style={{ width: 18, textAlign: 'center', color: 'var(--gold-deep)' }}>{ic}</span>{t}
          {badge(h) > 0 && <span className="c">{badge(h)}</span>}
        </Link>
      ))}
      <a href="/" target="_blank" rel="noopener"><span aria-hidden="true" style={{ width: 18, textAlign: 'center', color: 'var(--gold-deep)' }}>↗</span>Open website</a>
    </nav>
  );
}
