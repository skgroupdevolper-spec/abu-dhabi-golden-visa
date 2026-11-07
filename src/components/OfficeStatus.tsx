'use client';

// Top bar: live "Open now · closes 6:00 PM" / "Closed · opens Mon 9:00 AM" in UAE time, from the
// office hours set in Admin › Bookings (shared with the booking calendar and the Contact page timer).
import { useEffect, useState } from 'react';
import { BOOKING0, addDays, dowOf, openStatus, uaeNow, type BookingCfg } from '@/lib/booking';
import { u } from '@/lib/ui';

const ampm = (t: string) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
let cache: Pick<BookingCfg, 'hours' | 'closed'> | null = null;

export function OfficeStatus({ locale = 'en', fallback }: { locale?: string; fallback: string }) {
  const [cfg, setCfg] = useState(cache);
  const [t, setT] = useState<number | null>(null);
  useEffect(() => {
    if (!cache) fetch('/api/bookings/').then((r) => r.json()).then((j) => { if (Array.isArray(j?.hours)) { cache = { hours: j.hours, closed: Array.isArray(j.closed) ? j.closed : [] }; setCfg(cache); } }).catch(() => {});
    setT(Date.now());
    const i = setInterval(() => setT(Date.now()), 30_000);
    return () => clearInterval(i);
  }, []);
  if (!t) return <span className="ostat"><i />{fallback}</span>;
  const full = { ...BOOKING0, ...(cfg ?? {}) } as BookingCfg;
  const st = openStatus(full, t), n = uaeNow(t);
  if (st.open) {
    const d = full.hours[n.dow];
    return <span className="ostat open" title={fallback}><i /><b>{u('Open now', locale)}</b><small>· {u('closes', locale)} {ampm(d.to)}</small></span>;
  }
  let next = '';
  for (let i = 0; i < 8; i++) {
    const date = addDays(n.date, i), d = full.hours[dowOf(date)];
    if (!d?.open || full.closed.includes(date)) continue;
    if (i === 0 && n.mins >= Number(d.from.slice(0, 2)) * 60 + Number(d.from.slice(3))) continue;
    const day = i === 0 ? u('today', locale) : i === 1 ? u('tomorrow', locale) : new Date(`${date}T12:00:00Z`).toLocaleDateString(locale === 'en' ? 'en-GB' : locale, { weekday: 'short', timeZone: 'UTC' });
    next = `${day} ${ampm(d.from)}`;
    break;
  }
  return <span className="ostat closed" title={fallback}><i /><b>{u('Closed', locale)}</b>{next && <small>· {u('opens', locale)} {next}</small>}</span>;
}
