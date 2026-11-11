'use client';

import { T } from './T';
// "Book a time that suits you": live UAE clock and open/closed countdown, meeting type, month calendar
// with free days, time slots, details, and a confirmation with WhatsApp and calendar (.ics) buttons.
import { useEffect, useMemo, useState } from 'react';
import { BOOKING0, TYPE_LABEL, addDays, openStatus, uaeNow, type BookingCfg, type MeetType } from '@/lib/booking';
import { SITE, waLink } from '@/lib/site';
import { u } from '@/lib/ui';
import { Icon } from './Icon';

type Data = { on: boolean; types: Record<MeetType, boolean>; hours: BookingCfg['hours']; slot: number; closed: string[]; office: string; videoNote: string; title?: string; intro?: string; days: { date: string; times: string[]; open: boolean }[] };
const dayName = (i: number, locale: string, w: 'short' | 'narrow' = 'short') => new Date(Date.UTC(2024, 0, 7 + i)).toLocaleDateString(locale, { weekday: w, timeZone: 'UTC' });
const ICON: Record<MeetType, string> = { office: 'pin', video: 'video', phone: 'phone' };
const pad = (n: number) => String(n).padStart(2, '0');
const nice = (date: string, locale = 'en') => new Date(`${date}T12:00:00Z`).toLocaleDateString(locale === 'en' ? 'en-GB' : locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const TL = (k: MeetType, locale: string) => (k === 'office' ? u('Office visit', locale) : k === 'video' ? u('Video call', locale) : u('Phone call', locale));
const ampm = (t: string) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`; };

function Clock({ cfg, locale }: { cfg: BookingCfg; locale: string }) {
  const [t, setT] = useState<number | null>(null);
  useEffect(() => { setT(Date.now()); const i = setInterval(() => setT(Date.now()), 1000); return () => clearInterval(i); }, []);
  const n = t ? uaeNow(t) : null;
  const st = t ? openStatus(cfg, t) : null;
  const h = st ? Math.floor(st.secs / 3600) : 0, m = st ? Math.floor((st.secs % 3600) / 60) : 0, s = st ? st.secs % 60 : 0;
  return (
    <div className="bk-clock">
      <div className="bc-live"><span className={`bc-dot${st?.open ? ' on' : ''}`} /><small>{u('Live in the UAE', locale)}</small><b>{n ? `${pad(n.h)}:${pad(n.m)}:${pad(n.secs)}` : '--:--:--'}</b><small>{u('UAE time (GMT+4)', locale)}</small></div>
      <div className="bc-cd"><small>{st?.open ? u('Open now · closes in', locale) : u('Opens in', locale)}</small>
        <div className="bc-n">{[[h, u('hours', locale)], [m, u('min', locale)], [s, u('sec', locale)]].map(([v, l]) => <span key={l as string}><b>{st ? pad(v as number) : '--'}</b><i>{l}</i></span>)}</div></div>
      <div className="bc-week">{cfg.hours.map((d, i) => <span key={i} className={`${d.open ? 'o' : ''}${n?.dow === i ? ' now' : ''}`} title={d.open ? `${d.from}–${d.to}` : u('Closed', locale)}>{dayName(i, locale)}</span>)}</div>
    </div>
  );
}

export function Booking({ title, intro, service = '', locale = 'en' }: { title?: string; intro?: string; service?: string; locale?: string }) {
  const [d, setD] = useState<Data | null>(null);
  const [type, setType] = useState<MeetType | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ name: '', phone: '', email: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<{ ref: string } | null>(null);
  const [month, setMonth] = useState(0);

  const load = () => fetch('/api/bookings/', { cache: 'no-store' }).then((r) => r.json()).then((j: Data) => { setD(j); const first = (['office', 'video', 'phone'] as MeetType[]).find((k) => j.types[k]); setType((x) => x ?? first ?? null); }).catch(() => {});
  useEffect(() => { void load(); }, []);

  const cfg: BookingCfg = useMemo(() => ({ ...BOOKING0, ...(d ? { hours: d.hours, closed: d.closed, slot: d.slot } : {}) }), [d]);
  const byDate = useMemo(() => new Map((d?.days ?? []).map((x) => [x.date, x])), [d]);
  const today = uaeNow().date;
  const first = new Date(`${today.slice(0, 7)}-01T00:00:00Z`);
  first.setUTCMonth(first.getUTCMonth() + month);
  const ym = first.toISOString().slice(0, 7);
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const len = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const lastDay = d?.days.length ? d.days[d.days.length - 1].date : addDays(today, 21);
  const times = date ? byDate.get(date)?.times ?? [] : [];
  const parts = (t: string[]) => [t.filter((x) => Number(x.slice(0, 2)) < 12), t.filter((x) => Number(x.slice(0, 2)) >= 12)];

  async function book() {
    setErr('');
    if (!f.name.trim() || f.phone.replace(/\D/g, '').length < 7) { setErr(u('Please add your name and WhatsApp number.', locale)); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/bookings/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, type, date, time, service, lang: document.documentElement.lang }) });
      const j = await r.json();
      if (!j.ok) { setErr(j.error || u('Not booked.', locale)); if (j.taken) { setTime(''); setStep(1); void load(); } return; }
      setDone({ ref: j.ref });
    } catch { setErr(u('Connection problem. Please try again or message us on WhatsApp.', locale)); } finally { setBusy(false); }
  }

  const summary = type && date && time ? `${TYPE_LABEL[type]} · ${nice(date)} · ${ampm(time)} (UAE time)` : '';
  const sumL = type && date && time ? `${TL(type, locale)} · ${nice(date, locale)} · ${ampm(time)} (${u('UAE time', locale)})` : '';
  const ics = () => {
    const [y, mo, da] = date.split('-').map(Number); const [hh, mm] = time.split(':').map(Number);
    const s = new Date(Date.UTC(y, mo - 1, da, hh - 4, mm)), e = new Date(s.getTime() + (d?.slot ?? 30) * 60000);
    const z = (x: Date) => x.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Abu Dhabi Golden Visa//Booking//EN', 'BEGIN:VEVENT', `UID:${done?.ref}@abudhabigoldenvisa.com`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(s)}`, `DTEND:${z(e)}`, `SUMMARY:Golden Visa ${TYPE_LABEL[type!]} (${done?.ref})`, `LOCATION:${type === 'office' ? d?.office ?? '' : TYPE_LABEL[type!]}`, `DESCRIPTION:Your advisor confirms on WhatsApp ${SITE.whatsappDisplay}.`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = `appointment-${done?.ref}.ics`; a.click();
  };

  if (d && !d.on) return null;
  return (
    <div className="booking">
      <div className="bk-side">
        <p className="eyebrow">{u('Appointments', locale)}</p>
        <h3 className="bk-h">{title ? u(title, locale) : d?.title && d.title !== BOOKING0.title ? d.title : u('Book a time that suits you', locale)}</h3>
        <p className="muted">{intro ? u(intro, locale) : d?.intro && d.intro !== BOOKING0.intro ? d.intro : u('Visit our office, or meet your advisor on a video or phone call. Pick a free time and we confirm it on WhatsApp.', locale)}</p>
        <Clock cfg={cfg} locale={locale} />
        <ul className="bk-facts">
          {d?.office && <li><Icon name="pin" size={16} /> {d.office}</li>}
          <li><Icon name="clock" size={16} /> {d ? `${d.slot} ${u('minutes', locale)}` : '…'} · {u('free first consultation', locale)}</li>
          <li><Icon name="wa" size={16} /> {u('Confirmed on WhatsApp', locale)} {SITE.whatsappDisplay}</li>
        </ul>
      </div>

      <div className="bk-main">
        {done ? (
          <div className="bk-done">
            <div className="bk-tick"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg></div>
            <p className="eyebrow">{u('Booked', locale)} · {done.ref}</p>
            <h3>{u('See you on', locale)} {nice(date, locale)}</h3>
            <p className="muted">{sumL}. {u('Your advisor confirms it on WhatsApp', locale)}{type === 'video' && d?.videoNote ? ` · ${d.videoNote}` : ''}.</p>
            <div className="bk-btns">
              <a className="btn btn-gold" href={waLink(`Hello, I booked an appointment ${done.ref}: ${summary}. Name: ${f.name}.`)} target="_blank" rel="noopener"><Icon name="wa" size={18} /> {u('Confirm on WhatsApp', locale)}</a>
              <button type="button" className="btn btn-glass" onClick={ics}><Icon name="calendar" size={18} /> {u('Add to calendar', locale)}</button>
              {type === 'office' && <a className="btn btn-glass" href={SITE.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(d?.office ?? '')}`} target="_blank" rel="noopener"><Icon name="pin" size={18} /> {u('Directions', locale)}</a>}
            </div>
          </div>
        ) : (
          <>
            <div className="bk-types" role="radiogroup" aria-label={u('Meeting type', locale)}>
              {(['office', 'video', 'phone'] as MeetType[]).filter((k) => !d || d.types[k]).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={type === k} className={type === k ? 'on' : ''} onClick={() => setType(k)}><Icon name={ICON[k]} size={20} /><b>{TL(k, locale)}</b></button>
              ))}
            </div>
            {step === 1 ? (
              <div className="bk-pick">
                <div className="bk-cal">
                  <div className="bk-cal-h"><span className="bk-step">1</span><b>{u('Pick a day', locale)}</b>
                    <span className="bk-nav"><button type="button" onClick={() => setMonth((m) => Math.max(0, m - 1))} disabled={month === 0} aria-label={u('Previous month', locale)}>‹</button>
                      <em>{first.toLocaleDateString(locale === 'en' ? 'en-GB' : locale, { month: 'long', year: 'numeric', timeZone: 'UTC' })}</em>
                      <button type="button" onClick={() => setMonth((m) => m + 1)} disabled={`${ym}-31` >= lastDay && ym >= lastDay.slice(0, 7)} aria-label={u('Next month', locale)}>›</button></span></div>
                  <div className="bk-grid">
                    {[1, 2, 3, 4, 5, 6, 0].map((x) => <i key={x}>{dayName(x, locale, 'narrow')}</i>)}
                    {Array.from({ length: lead }, (_, i) => <span key={`e${i}`} />)}
                    {Array.from({ length: len }, (_, i) => {
                      const ds = `${ym}-${pad(i + 1)}`;
                      const info = byDate.get(ds);
                      const free = !!info?.times.length;
                      return <button key={ds} type="button" disabled={!free} className={`${date === ds ? 'on' : ''}${ds === today ? ' today' : ''}${free ? ' free' : ''}`} onClick={() => { setDate(ds); setTime(''); }} aria-label={`${nice(ds, locale)}${free ? ` · ${info!.times.length}` : ''}`}>{i + 1}{free && <small>{info!.times.length}</small>}</button>;
                    })}
                  </div>
                  {!d && <p className="muted small">{u('Loading free times…', locale)}</p>}
                </div>
                <div className="bk-times">
                  <div className="bk-cal-h"><span className="bk-step">2</span><b>{u('Pick a time', locale)}</b></div>
                  {!date ? <p className="muted small bk-empty"><Icon name="calendar" size={22} /> {u('Choose a day to see the free times.', locale)}</p> : (
                    <>
                      <p className="small"><b>{nice(date, locale)}</b></p>
                      {parts(times).map((list, k) => list.length > 0 && (
                        <div key={k}><p className="bk-part">{k ? u('Afternoon', locale) : u('Morning', locale)}</p>
                          <div className="bk-slots">{list.map((t) => <button key={t} type="button" className={time === t ? 'on' : ''} onClick={() => setTime(t)}>{ampm(t)}</button>)}</div></div>
                      ))}
                    </>
                  )}
                  <p className="muted small" style={{ marginTop: 10 }}><T>{"All times are UAE time (GMT+4)."}</T></p>
                  <button type="button" className="btn btn-gold bk-go" disabled={!type || !date || !time} onClick={() => setStep(2)}>{u('Continue', locale)} <Icon name="arrow" size={18} /></button>
                </div>
              </div>
            ) : (
              <div className="bk-form">
                <div className="bk-sum"><Icon name={ICON[type!]} size={18} /> <b>{sumL}</b><button type="button" className="btn btn-sm btn-glass" onClick={() => setStep(1)}>{u('Change', locale)}</button></div>
                <div className="bk-fields">
                  <div className="field"><label htmlFor="bk-name">{u('Full name', locale)}</label><input id="bk-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></div>
                  <div className="field"><label htmlFor="bk-phone">{u('WhatsApp number', locale)}</label><input id="bk-phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="+971…" /></div>
                  <div className="field"><label htmlFor="bk-email">{u('Email (optional)', locale)}</label><input id="bk-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></div>
                  <div className="field full"><label htmlFor="bk-notes">{u('What would you like to discuss? (optional)', locale)}</label><textarea id="bk-notes" rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder={u('Property Golden Visa for me and my family…', locale)} /></div>
                </div>
                {err && <p className="notice err">{err}</p>}
                <button type="button" className="btn btn-gold bk-go" disabled={busy} onClick={book}>{busy ? u('Booking…', locale) : u('Book my appointment', locale)} <Icon name="check" size={18} /></button>
                <p className="muted small">{u('Free and without obligation. We never share your details.', locale)}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
