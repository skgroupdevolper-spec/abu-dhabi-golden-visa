import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Tabs, Toggle } from '@/components/dash/Fields';
import { BOOKING0, TYPE_LABEL, cleanCfg, uaeNow, type Booking, type BookingCfg } from '@/lib/booking';
import { requireAdmin } from '@/lib/server/auth';
import { list } from '@/lib/server/collections';
import { getBlock } from '@/lib/server/settings';
import { waTo } from '@/lib/site';
import { when } from '@/lib/stages';
import { bookingAction, saveBookingCfg } from '../../settings-actions';

export const metadata: Metadata = { title: 'Appointments' };
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const nice = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const PILL: Record<Booking['status'], string> = { new: 'due', confirmed: 'ok', done: 'ok', cancelled: 'closed', noshow: 'closed' };
const LABEL: Record<Booking['status'], string> = { new: 'New', confirmed: 'Confirmed', done: 'Done', cancelled: 'Cancelled', noshow: 'No-show' };

export default async function Bookings({ searchParams }: { searchParams: Promise<{ tab?: string; b?: string }> }) {
  const me = await requireAdmin();
  const { tab = 'upcoming', b } = await searchParams;
  const [all, raw] = await Promise.all([list<Booking>('bookings'), getBlock<Partial<BookingCfg>>('booking', BOOKING0)]);
  const cfg = cleanCfg(raw);
  const today = uaeNow().date;
  const sorted = [...all].sort((x, y) => `${x.date} ${x.time}`.localeCompare(`${y.date} ${y.time}`));
  const upcoming = sorted.filter((x) => x.date >= today && x.status !== 'cancelled' && x.status !== 'done');
  const rows = tab === 'upcoming' ? upcoming : tab === 'past' ? sorted.filter((x) => x.date < today || x.status === 'done').reverse() : [...all];
  const full = me.role === 'owner' || me.role === 'admin' || !!me.perms?.includes('/admin/bookings/');
  const groups = rows.reduce<Record<string, Booking[]>>((m, x) => { (m[x.date] ??= []).push(x); return m; }, {});
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Appointments</p><h1>Bookings <span className="gold">calendar</span></h1>
        <p className="muted small" style={{ marginTop: 6 }}>Office visits, video and phone calls booked on the website (Contact, Free consultation, homepage). New bookings ring the bell.</p></div>
        <div className="row"><a className="btn" href="/contact/#book" target="_blank" rel="noopener">Open booking on the website ↗</a><span className={`pill ${cfg.on ? 'ok' : 'due'}`}>{cfg.on ? 'Booking open' : 'Booking closed'}</span></div></div>
      <div className="grid4" style={{ marginBottom: 16 }}>
        <div className="kpi"><small>Today</small><b>{all.filter((x) => x.date === today && x.status !== 'cancelled').length}</b></div>
        <div className="kpi"><small>Upcoming</small><b>{upcoming.length}</b></div>
        <div className="kpi"><small>Waiting to confirm</small><b>{all.filter((x) => x.status === 'new').length}</b></div>
        <div className="kpi goldbg"><small>This month</small><b>{all.filter((x) => x.date.slice(0, 7) === today.slice(0, 7) && x.status !== 'cancelled').length}</b></div>
      </div>
      <Tabs base="/admin/bookings/" tabs={[['upcoming', `Upcoming (${upcoming.length})`], ['past', 'Past'], ['all', `All (${all.length})`], ...(full ? [['settings', 'Hours & settings'] as [string, string]] : [])]} cur={tab} />
      {tab !== 'settings' && (
        !rows.length ? <p className="empty">No appointments here yet.</p> : (
          <div className="stack">
            {Object.entries(groups).map(([d, list]) => (
              <div key={d} className="panel">
                <h2 style={{ marginBottom: 10 }}>{d === today ? 'Today · ' : ''}{nice(d)}</h2>
                <div className="files">
                  {list.map((x) => (
                    <div key={x.id} className="file" style={{ flexWrap: 'wrap', background: x.id === b ? '#fffaf0' : undefined }}>
                      <span className="fi" style={{ width: 64 }}><b>{x.time}</b></span>
                      <span className="fn"><b>{x.name} · {TYPE_LABEL[x.type]}</b>
                        <small>{x.ref} · <a href={waTo(x.phone, `Hello ${x.name.split(' ')[0]}, your ${TYPE_LABEL[x.type].toLowerCase()} with Abu Dhabi Golden Visa is confirmed for ${nice(x.date)} at ${x.time} (UAE time). Reference ${x.ref}.`)} target="_blank" rel="noopener">{x.phone}</a>{x.email ? ` · ${x.email}` : ''} · booked {when(x.createdAt)}</small>
                        {x.notes && <small>“{x.notes}”</small>}{x.note && <small>Note: {x.note}</small>}</span>
                      <span className={`pill ${PILL[x.status]}`}>{LABEL[x.status]}</span>
                      <div className="row" style={{ flexWrap: 'wrap' }}>
                        {(['confirmed', 'done', 'noshow', 'cancelled'] as const).filter((s) => s !== x.status).map((s) => (
                          <form key={s} action={bookingAction}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="op" value={s} /><button className={`btn btn-sm${s === 'confirmed' ? ' btn-gold' : ''}`}>{s === 'confirmed' ? 'Confirm' : LABEL[s]}</button></form>))}
                        <details className="bk-move"><summary className="btn btn-sm">Move</summary>
                          <form action={bookingAction} className="row"><input type="hidden" name="id" value={x.id} /><input type="hidden" name="op" value="move" /><input type="date" name="date" defaultValue={x.date} /><input type="time" name="time" defaultValue={x.time} step={300} /><button className="btn btn-sm">Save</button></form></details>
                        {full && <form action={bookingAction}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="op" value="delete" /><button className="btn btn-sm btn-ghost btn-danger">Delete</button></form>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {tab === 'settings' && full && (
        <div className="panel" style={{ maxWidth: 960 }}>
          <ActionForm action={saveBookingCfg} className="form">
            <div className="full"><Toggle name="on" label="Online booking open" help="Off hides the booking calendar on the website." on={cfg.on} /></div>
            <div className="full row" style={{ gap: 18, flexWrap: 'wrap' }}>
              {(['office', 'video', 'phone'] as const).map((k) => <label key={k} className="row small"><input type="checkbox" name={`t_${k}`} defaultChecked={cfg.types[k]} /> {TYPE_LABEL[k]}</label>)}
            </div>
            <div className="full"><span className="lbl">Opening hours (UAE time)</span>
              <div className="bk-hours">{cfg.hours.map((h, i) => (
                <div key={i} className="row"><label className="row small" style={{ width: 130 }}><input type="checkbox" name={`d${i}`} defaultChecked={h.open} /> {DAYS[i]}</label>
                  <input type="time" name={`f${i}`} defaultValue={h.from} step={900} /> – <input type="time" name={`t${i}`} defaultValue={h.to} step={900} /></div>))}</div></div>
            <div className="field"><label htmlFor="slot">Meeting length</label><select id="slot" name="slot" defaultValue={cfg.slot}>{[15, 20, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} minutes</option>)}</select></div>
            <F name="perSlot" label="Bookings allowed at the same time" value={cfg.perSlot} type="number" />
            <F name="daysAhead" label="Days ahead visitors can book" value={cfg.daysAhead} type="number" />
            <F name="notice" label="Minimum notice (hours)" value={cfg.notice} type="number" />
            <F name="breakFrom" label="Break from (empty = no break)" value={cfg.breakFrom} type="time" />
            <F name="breakTo" label="Break until" value={cfg.breakTo} type="time" />
            <F name="closed" label="Closed dates / holidays (YYYY-MM-DD, one per line)" value={cfg.closed.join('\n')} type="textarea" rows={3} full />
            <F name="office" label="Office address (shown for office visits)" value={cfg.office} full />
            <F name="videoNote" label="Note for video calls" value={cfg.videoNote} full />
            <F name="title" label="Heading on the website" value={cfg.title} full />
            <F name="intro" label="Introduction" value={cfg.intro} type="textarea" rows={2} full />
            <div className="full"><Submit>Save settings</Submit> <Link className="btn" href="/admin/bookings/">Back to bookings</Link></div>
          </ActionForm>
        </div>
      )}
    </>
  );
}
