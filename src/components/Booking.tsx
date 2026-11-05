'use client';

// "Book a time that suits you": live UAE clock and open/closed countdown, meeting type, month calendar
// with free days, time slots, details, and a confirmation with WhatsApp and calendar (.ics) buttons.
import { useEffect, useMemo, useState } from 'react';
import { BOOKING0, TYPE_LABEL, addDays, openStatus, uaeNow, type BookingCfg, type MeetType } from '@/lib/booking';
import { SITE, waLink } from '@/lib/site';
import { Icon } from './Icon';

type Data = { on: boolean; types: Record<MeetType, boolean>; hours: BookingCfg['hours']; slot: number; closed: string[]; office: string; videoNote: string; title?: string; intro?: string; days: { date: string; times: string[]; open: boolean }[] };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ICON: Record<MeetType, string> = { office: 'pin', video: 'video', phone: 'phone' };
const pad = (n: number) => String(n).padStart(2, '0');
const nice = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const ampm = (t: string) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`; };

function Clock({ cfg }: { cfg: BookingCfg }) {
  const [t, setT] = useState<number | null>(null);
  useEffect(() => { setT(Date.now()); const i = setInterval(() => setT(Date.now()), 1000); return () => clearInterval(i); }, []);
  const n = t ? uaeNow(t) : null;
  const st = t ? openStatus(cfg, t) : null;
  const h = st ? Math.floor(st.secs / 3600) : 0, m = st ? Math.floor((st.secs % 3600) / 60) : 0, s = st ? st.secs % 60 : 0;
  return (
    <div className="bk-clock">
      <div className="bc-live"><span className={`bc-dot${st?.open ? ' on' : ''}`} /><small>Live in the UAE</small><b>{n ? `${pad(n.h)}:${pad(n.m)}:${pad(n.secs)}` : '--:--:--'}</b><small>UAE time (GMT+4)</small></div>
      <div className="bc-cd"><small>{st?.open ? 'Open now · closes in' : 'Opens in'}</small>
        <div className="bc-n">{[[h, 'hours'], [m, 'min'], [s, 'sec']].map(([v, l]) => <span key={l as string}><b>{st ? pad(v as number) : '--'}</b><i>{l}</i></span>)}</div></div>
      <div className="bc-week">{cfg.hours.map((d, i) => <span key={i} className={`${d.open ? 'o' : ''}${n?.dow === i ? ' now' : ''}`} title={d.open ? `${d.from}–${d.to}` : 'Closed'}>{DAYS[i]}</span>)}</div>
    </div>
  );
}

export function Booking({ title, intro, service = '' }: { title?: string; intro?: string; service?: string }) {
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
  const parts = (t: string) => [t.filter((x) => Number(x.slice(0, 2)) < 12), t.filter((x) => Number(x.slice(0, 2)) >= 12)];

  async function book() {
    setErr('');
    if (!f.name.trim() || f.phone.replace(/\D/g, '').length < 7) { setErr('Please add your name and WhatsApp number.'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/bookings/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, type, date, time, service, lang: document.documentElement.lang }) });
      const j = await r.json();
      if (!j.ok) { setErr(j.error || 'Not booked.'); if (j.taken) { setTime(''); setStep(1); void load(); } return; }
      setDone({ ref: j.ref });
    } catch { setErr('Connection problem. Please try again or message us on WhatsApp.'); } finally { setBusy(false); }
  }

  const summary = type && date && time ? `${TYPE_LABEL[type]} · ${nice(date)} · ${ampm(time)} (UAE time)` : '';
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
        <p className="eyebrow">Appointments</p>
        <h3 className="bk-h">{title || d?.title || BOOKING0.title}</h3>
        <p className="muted">{intro || d?.intro || BOOKING0.intro}</p>
        <Clock cfg={cfg} />
        <ul className="bk-facts">
          {d?.office && <li><Icon name="pin" size={16} /> {d.office}</li>}
          <li><Icon name="clock" size={16} /> {d ? `${d.slot}-minute meeting` : '…'} · free first consultation</li>
          <li><Icon name="wa" size={16} /> Confirmed on WhatsApp {SITE.whatsappDisplay}</li>
        </ul>
      </div>

      <div className="bk-main">
        {done ? (
          <div className="bk-done">
            <div className="bk-tick"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg></div>
            <p className="eyebrow">Booked · {done.ref}</p>
            <h3>See you {nice(date)}</h3>
            <p className="muted">{summary}. Your advisor confirms it on WhatsApp{type === 'video' && d?.videoNote ? ` · ${d.videoNote}` : ''}.</p>
            <div className="bk-btns">
              <a className="btn btn-gold" href={waLink(`Hello, I booked an appointment ${done.ref}: ${summary}. Name: ${f.name}.`)} target="_blank" rel="noopener"><Icon name="wa" size={18} /> Confirm on WhatsApp</a>
              <button type="button" className="btn btn-glass" onClick={ics}><Icon name="calendar" size={18} /> Add to calendar</button>
              {type === 'office' && <a className="btn btn-glass" href={SITE.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(d?.office ?? '')}`} target="_blank" rel="noopener"><Icon name="pin" size={18} /> Directions</a>}
            </div>
          </div>
        ) : (
          <>
            <div className="bk-types" role="radiogroup" aria-label="Meeting type">
              {(['office', 'video', 'phone'] as MeetType[]).filter((k) => !d || d.types[k]).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={type === k} className={type === k ? 'on' : ''} onClick={() => setType(k)}><Icon name={ICON[k]} size={20} /><b>{TYPE_LABEL[k]}</b></button>
              ))}
            </div>
            {step === 1 ? (
              <div className="bk-pick">
                <div className="bk-cal">
                  <div className="bk-cal-h"><span className="bk-step">1</span><b>Pick a day</b>
                    <span className="bk-nav"><button type="button" onClick={() => setMonth((m) => Math.max(0, m - 1))} disabled={month === 0} aria-label="Previous month">‹</button>
                      <em>{first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</em>
                      <button type="button" onClick={() => setMonth((m) => m + 1)} disabled={`${ym}-31` >= lastDay && ym >= lastDay.slice(0, 7)} aria-label="Next month">›</button></span></div>
                  <div className="bk-grid">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x, i) => <i key={i}>{x}</i>)}
                    {Array.from({ length: lead }, (_, i) => <span key={`e${i}`} />)}
                    {Array.from({ length: len }, (_, i) => {
                      const ds = `${ym}-${pad(i + 1)}`;
                      const info = byDate.get(ds);
                      const free = !!info?.times.length;
                      return <button key={ds} type="button" disabled={!free} className={`${date === ds ? 'on' : ''}${ds === today ? ' today' : ''}${free ? ' free' : ''}`} onClick={() => { setDate(ds); setTime(''); }} aria-label={`${nice(ds)}${free ? `, ${info!.times.length} free times` : ', not available'}`}>{i + 1}{free && <small>{info!.times.length}</small>}</button>;
                    })}
                  </div>
                  {!d && <p className="muted small">Loading free times…</p>}
                </div>
                <div className="bk-times">
                  <div className="bk-cal-h"><span className="bk-step">2</span><b>Pick a time</b></div>
                  {!date ? <p className="muted small bk-empty"><Icon name="calendar" size={22} /> Choose a day to see the free times.</p> : (
                    <>
                      <p className="small"><b>{nice(date)}</b></p>
                      {parts(times).map((list, k) => list.length > 0 && (
                        <div key={k}><p className="bk-part">{k ? 'Afternoon' : 'Morning'}</p>
                          <div className="bk-slots">{list.map((t) => <button key={t} type="button" className={time === t ? 'on' : ''} onClick={() => setTime(t)}>{ampm(t)}</button>)}</div></div>
                      ))}
                    </>
                  )}
                  <p className="muted small" style={{ marginTop: 10 }}>All times are UAE time (GMT+4).</p>
                  <button type="button" className="btn btn-gold bk-go" disabled={!type || !date || !time} onClick={() => setStep(2)}>Continue <Icon name="arrow" size={18} /></button>
                </div>
              </div>
            ) : (
              <div className="bk-form">
                <div className="bk-sum"><Icon name={ICON[type!]} size={18} /> <b>{summary}</b><button type="button" className="btn btn-sm btn-glass" onClick={() => setStep(1)}>Change</button></div>
                <div className="bk-fields">
                  <div className="field"><label htmlFor="bk-name">Full name</label><input id="bk-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></div>
                  <div className="field"><label htmlFor="bk-phone">WhatsApp number</label><input id="bk-phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="+971…" /></div>
                  <div className="field"><label htmlFor="bk-email">Email (optional)</label><input id="bk-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></div>
                  <div className="field full"><label htmlFor="bk-notes">What would you like to discuss? (optional)</label><textarea id="bk-notes" rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Property Golden Visa for me and my family…" /></div>
                </div>
                {err && <p className="notice err">{err}</p>}
                <button type="button" className="btn btn-gold bk-go" disabled={busy} onClick={book}>{busy ? 'Booking…' : 'Book my appointment'} <Icon name="check" size={18} /></button>
                <p className="muted small">Free and without obligation. We never share your details.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
