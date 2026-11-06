'use client';

// Live office status: real UAE time (GMT+4), Open now / Closed with a countdown to closing or opening,
// next opening time and the weekly hours with today marked. Uses the same hours and closed days as the
// booking calendar (Admin › Bookings › Settings), so the two always agree.
import { useEffect, useState } from 'react';
import { BOOKING0, addDays, dowOf, openStatus, uaeNow, type BookingCfg } from '@/lib/booking';
import { Icon } from './Icon';
import { u } from '@/lib/ui';

const pad = (n: number) => String(n).padStart(2, '0');
const ampm = (t: string) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`; };
const dayName = (i: number, locale: string, w: 'long' | 'short' = 'long') => new Date(Date.UTC(2024, 0, 7 + i)).toLocaleDateString(locale === 'en' ? 'en-GB' : locale, { weekday: w, timeZone: 'UTC' });

export function OfficeLive({ locale = 'en', compact = false }: { locale?: string; compact?: boolean }) {
  const [cfg, setCfg] = useState<Pick<BookingCfg, 'hours' | 'closed'>>({ hours: BOOKING0.hours, closed: [] });
  const [t, setT] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/bookings/', { cache: 'no-store' }).then((r) => r.json()).then((j) => { if (Array.isArray(j?.hours)) setCfg({ hours: j.hours, closed: Array.isArray(j.closed) ? j.closed : [] }); }).catch(() => {});
    setT(Date.now());
    const i = setInterval(() => setT(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const full = { ...BOOKING0, ...cfg } as BookingCfg;
  const n = t ? uaeNow(t) : null;
  const st = t ? openStatus(full, t) : null;
  const h = st ? Math.floor(st.secs / 3600) : 0, m = st ? Math.floor((st.secs % 3600) / 60) : 0, s = st ? st.secs % 60 : 0;
  // Next opening (for the closed state): first open day from today on.
  let next = '';
  if (n && st && !st.open) {
    for (let i = 0; i < 8; i++) {
      const date = addDays(n.date, i), d = full.hours[dowOf(date)];
      if (!d?.open || full.closed.includes(date)) continue;
      if (i === 0 && n.mins >= Number(d.from.slice(0, 2)) * 60 + Number(d.from.slice(3))) continue;
      next = `${i === 0 ? u('today', locale) : i === 1 ? u('tomorrow', locale) : dayName(dowOf(date), locale)} ${ampm(d.from)}`;
      break;
    }
  }
  const holiday = n ? full.closed.includes(n.date) : false;
  return (
    <div className={`olive${st?.open ? ' is-open' : ' is-closed'}${compact ? ' compact' : ''}`} aria-live="polite">
      <div className="ol-top">
        <span className="ol-pill"><i />{st ? (st.open ? u('Open now', locale) : holiday ? u('Closed today (holiday)', locale) : u('Closed now', locale)) : u('Checking…', locale)}</span>
        <span className="ol-time"><small>{u('UAE time', locale)}</small><b dir="ltr">{n ? `${pad(n.h)}:${pad(n.m)}:${pad(n.secs)}` : '--:--:--'}</b></span>
      </div>
      <div className="ol-cd">
        <small>{st?.open ? u('Closes in', locale) : u('Opens in', locale)}</small>
        <div className="ol-n" dir="ltr">{[[h, u('hrs', locale)], [m, u('min', locale)], [s, u('sec', locale)]].map(([v, l]) => <span key={l as string}><b>{st ? pad(v as number) : '--'}</b><i>{l}</i></span>)}</div>
        {next && <p className="ol-next"><Icon name="clock" size={14} /> {u('Next opening', locale)}: <b>{next}</b></p>}
      </div>
      {!compact && (
        <ul className="ol-week">
          {[1, 2, 3, 4, 5, 6, 0].map((i) => {
            const d = full.hours[i], today = n?.dow === i;
            return (
              <li key={i} className={`${today ? 'today' : ''}${d?.open ? '' : ' off'}`}>
                <span>{dayName(i, locale)}{today && <em>{u('Today', locale)}</em>}</span>
                <b dir="ltr">{d?.open ? `${ampm(d.from)} – ${ampm(d.to)}` : u('Closed', locale)}</b>
              </li>
            );
          })}
        </ul>
      )}
      <p className="ol-foot"><Icon name="wa" size={14} /> {u('WhatsApp is answered outside office hours too; we reply first thing the next working day.', locale)}</p>
    </div>
  );
}
