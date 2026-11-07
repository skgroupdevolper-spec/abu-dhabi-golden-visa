'use client';

// "1,234 views" on an article; counts this visit once.
import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { u } from '@/lib/ui';

export function ViewCount({ path, locale = 'en' }: { path: string; locale?: string }) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/views/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ path }) })
      .then((r) => r.json()).then((j) => setN(typeof j.views === 'number' ? j.views : null)).catch(() => {});
  }, [path]);
  if (!n) return null;
  return <span className="vcount" title={u('Views', locale)}><Icon name="eye" size={14} /> {n.toLocaleString('en-US')} {u(n === 1 ? 'view' : 'views', locale)}</span>;
}
