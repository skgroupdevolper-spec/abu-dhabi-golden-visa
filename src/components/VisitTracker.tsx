'use client';

// Counts each page view once (the server ignores bots and repeat views within 30 minutes).
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LOCALE_CODES } from '@/lib/i18n';

export function VisitTracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path) return;
    const first = path.split('/')[1];
    const clean = (first && first !== 'en' && LOCALE_CODES.includes(first as never) ? path.slice(first.length + 1) : path.replace(/^\/en(?=\/|$)/, '')) || '/';
    const t = setTimeout(() => {
      fetch('/api/visit/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ path: clean, ref: document.referrer }), keepalive: true }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [path]);
  return null;
}
