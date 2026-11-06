import { NextResponse, type NextRequest } from 'next/server';
import { clientIp } from '@/lib/server/ratelimit';
import { BOOKING0, TYPE_LABEL, cleanCfg, freeSlots, type Booking, type BookingCfg, type MeetType } from '@/lib/booking';
import { insert, list, notify } from '@/lib/server/collections';
import { getBlock } from '@/lib/server/settings';
import { newId, now, withLock } from '@/lib/server/store';
import { sendTeam } from '@/lib/server/whatsapp';
import { mailTeam } from '@/lib/server/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clean = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const hits = new Map<string, number[]>();
const taken = (all: Booking[]) => all.filter((b) => b.status !== 'cancelled').reduce<Record<string, number>>((m, b) => { const k = `${b.date} ${b.time}`; m[k] = (m[k] ?? 0) + 1; return m; }, {});

/** Free times for the booking calendar. */
export async function GET() {
  const cfg = cleanCfg(await getBlock<Partial<BookingCfg>>('booking', BOOKING0));
  const days = cfg.on ? freeSlots(cfg, taken(await list<Booking>('bookings'))) : [];
  return NextResponse.json({ ok: true, on: cfg.on, types: cfg.types, hours: cfg.hours, slot: cfg.slot, closed: cfg.closed, office: cfg.office, videoNote: cfg.videoNote, title: cfg.title, intro: cfg.intro, days }, { headers: { 'Cache-Control': 'no-store' } });
}

/** Books a slot (checked again on the server so two visitors cannot take the same time). */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const recent = (hits.get(ip) || []).filter((t) => Date.now() - t < 10 * 60_000);
  recent.push(Date.now()); hits.set(ip, recent);
  if (recent.length > 6) return NextResponse.json({ ok: false, error: 'Too many requests. Please message us on WhatsApp.' }, { status: 429 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  const cfg = cleanCfg(await getBlock<Partial<BookingCfg>>('booking', BOOKING0));
  const type = (['office', 'video', 'phone'].includes(String(body.type)) ? body.type : 'office') as MeetType;
  const b = { date: clean(body.date, 10), time: clean(body.time, 5), name: clean(body.name, 120), phone: clean(body.phone, 40), email: clean(body.email, 160), notes: clean(body.notes, 1500), service: clean(body.service, 120), lang: clean(body.lang, 5) || 'en' };
  if (!cfg.on || !cfg.types[type]) return NextResponse.json({ ok: false, error: 'Online booking is closed right now. Please message us on WhatsApp.' }, { status: 400 });
  if (!b.name || b.phone.replace(/\D/g, '').length < 7) return NextResponse.json({ ok: false, error: 'Please add your name and WhatsApp number.' }, { status: 400 });
  try {
    const saved = await withLock('booking-slot', async () => {
      const all = await list<Booking>('bookings');
      const day = freeSlots(cfg, taken(all)).find((d) => d.date === b.date);
      if (!day?.times.includes(b.time)) return null;
      const n = all.length + 1;
      const bk: Booking = { id: newId(8), ref: `APT-${b.date.slice(2, 4)}${b.date.slice(5, 7)}-${String(n).padStart(4, '0')}`, ...b, type, status: 'new', createdAt: now() };
      await insert<Booking>('bookings', bk, 5000);
      return bk;
    });
    if (!saved) return NextResponse.json({ ok: false, error: 'This time was just taken. Please choose another time.', taken: true }, { status: 409 });
    const when = `${saved.date} at ${saved.time} (UAE time)`;
    await notify('booking', `New appointment: ${saved.name}, ${TYPE_LABEL[type]}, ${when}`, `/admin/bookings/?b=${saved.id}`);
    void Promise.allSettled([
      sendTeam('leadTeam', { name: saved.name, phone: saved.phone, service: `Appointment: ${TYPE_LABEL[type]} ${when}`, message: saved.notes.slice(0, 300) }),
      mailTeam(`New appointment ${saved.ref}: ${saved.name}`, `${TYPE_LABEL[type]}\n${when}\n\nName: ${saved.name}\nPhone: ${saved.phone}\nEmail: ${saved.email}\nService: ${saved.service}\n\n${saved.notes}`),
    ]);
    return NextResponse.json({ ok: true, ref: saved.ref, date: saved.date, time: saved.time, type });
  } catch (e) {
    console.error('Booking not saved', e);
    return NextResponse.json({ ok: false, error: 'We could not save your booking. Please message us on WhatsApp.' }, { status: 500 });
  }
}
