// Appointment booking: settings, Dubai/Abu Dhabi time and free-slot logic, shared by the website and the admin.
export type MeetType = 'office' | 'video' | 'phone';
export type DayHours = { open: boolean; from: string; to: string };
export type BookingCfg = {
  on: boolean;
  types: Record<MeetType, boolean>;
  /** 0 = Sunday … 6 = Saturday */
  hours: DayHours[];
  slot: number; // minutes
  daysAhead: number;
  notice: number; // hours before a slot can be booked
  perSlot: number; // bookings allowed at the same time
  closed: string[]; // YYYY-MM-DD holidays
  breakFrom: string; breakTo: string; // lunch break, empty = none
  office: string; videoNote: string; title: string; intro: string;
};
export const BOOKING0: BookingCfg = {
  on: true,
  types: { office: true, video: true, phone: true },
  hours: [
    { open: false, from: '09:00', to: '18:00' },
    { open: true, from: '09:00', to: '18:00' }, { open: true, from: '09:00', to: '18:00' }, { open: true, from: '09:00', to: '18:00' },
    { open: true, from: '09:00', to: '18:00' }, { open: true, from: '09:00', to: '18:00' }, { open: true, from: '10:00', to: '17:00' },
  ],
  slot: 30, daysAhead: 21, notice: 2, perSlot: 1, closed: [], breakFrom: '13:00', breakTo: '14:00',
  office: 'Business Bay, Dubai, UAE', videoNote: 'We send a Google Meet or Zoom link on WhatsApp.',
  title: 'Book a time that suits you', intro: 'Visit our office, or meet your advisor on a video or phone call. Pick a free time and we confirm it on WhatsApp.',
};
export type Booking = {
  id: string; ref: string; date: string; time: string; type: MeetType; name: string; phone: string; email: string; notes: string; service: string; lang: string;
  status: 'new' | 'confirmed' | 'done' | 'cancelled' | 'noshow'; createdAt: string; note?: string;
};
export const TYPE_LABEL: Record<MeetType, string> = { office: 'Office visit', video: 'Video call', phone: 'Phone call' };

/** UAE time (GMT+4, no daylight saving) as plain parts. */
export function uaeNow(ms = Date.now()) {
  const d = new Date(ms + 4 * 3600e3);
  return { date: d.toISOString().slice(0, 10), mins: d.getUTCHours() * 60 + d.getUTCMinutes(), secs: d.getUTCSeconds(), dow: d.getUTCDay(), h: d.getUTCHours(), m: d.getUTCMinutes() };
}
export const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return (h || 0) * 60 + (m || 0); };
export const toTime = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
export const dowOf = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();
export const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);

/** All slot start times of a day (ignoring bookings). */
export function daySlots(c: BookingCfg, date: string): string[] {
  const h = c.hours[dowOf(date)];
  if (!h?.open || c.closed.includes(date)) return [];
  const out: string[] = [];
  const bf = c.breakFrom ? toMin(c.breakFrom) : -1, bt = c.breakTo ? toMin(c.breakTo) : -1;
  for (let t = toMin(h.from); t + c.slot <= toMin(h.to); t += c.slot) {
    if (bf >= 0 && bt > bf && t < bt && t + c.slot > bf) continue;
    out.push(toTime(t));
  }
  return out;
}

/** Free slots per day for the next days, given the times already taken. */
export function freeSlots(c: BookingCfg, taken: Record<string, number>, ms = Date.now()) {
  const now = uaeNow(ms);
  const earliest = now.mins + c.notice * 60;
  const days: { date: string; times: string[]; open: boolean }[] = [];
  for (let i = 0; i < c.daysAhead; i++) {
    const date = addDays(now.date, i);
    const all = daySlots(c, date);
    const extraDays = Math.floor(earliest / 1440);
    const times = all.filter((t) => {
      if (i < extraDays) return false;
      if (i === extraDays && toMin(t) < earliest % 1440) return false;
      return (taken[`${date} ${t}`] ?? 0) < c.perSlot;
    });
    days.push({ date, times, open: all.length > 0 });
  }
  return days;
}

/** "Open now" / "Opens in" status for the live clock. */
export function openStatus(c: BookingCfg, ms = Date.now()) {
  const n = uaeNow(ms);
  const today = c.hours[n.dow];
  const nowS = n.mins * 60 + n.secs;
  if (today?.open && !c.closed.includes(n.date) && nowS >= toMin(today.from) * 60 && nowS < toMin(today.to) * 60) return { open: true, secs: toMin(today.to) * 60 - nowS };
  for (let i = 0; i < 8; i++) {
    const date = addDays(n.date, i);
    const h = c.hours[dowOf(date)];
    if (!h?.open || c.closed.includes(date)) continue;
    const start = i * 86400 + toMin(h.from) * 60;
    if (start > nowS) return { open: false, secs: start - nowS };
  }
  return { open: false, secs: 0 };
}

export function cleanCfg(x: Partial<BookingCfg> | undefined): BookingCfg {
  const d = BOOKING0, o = { ...d, ...x };
  const t = (v: unknown, dflt: string) => (typeof v === 'string' && /^\d{2}:\d{2}$/.test(v) ? v : dflt);
  return {
    on: o.on !== false,
    types: { office: o.types?.office !== false, video: o.types?.video !== false, phone: o.types?.phone !== false },
    hours: Array.from({ length: 7 }, (_, i) => ({ open: !!o.hours?.[i]?.open, from: t(o.hours?.[i]?.from, d.hours[i].from), to: t(o.hours?.[i]?.to, d.hours[i].to) })),
    slot: [15, 20, 30, 45, 60, 90].includes(Number(o.slot)) ? Number(o.slot) : 30,
    daysAhead: Math.max(3, Math.min(90, Number(o.daysAhead) || 21)), notice: Math.max(0, Math.min(72, Number(o.notice) || 0)), perSlot: Math.max(1, Math.min(20, Number(o.perSlot) || 1)),
    closed: (Array.isArray(o.closed) ? o.closed : []).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(String(x))).slice(0, 200),
    breakFrom: o.breakFrom ? t(o.breakFrom, '') : '', breakTo: o.breakTo ? t(o.breakTo, '') : '',
    office: String(o.office ?? '').slice(0, 300), videoNote: String(o.videoNote ?? '').slice(0, 300), title: String(o.title || d.title).slice(0, 120), intro: String(o.intro ?? '').slice(0, 400),
  };
}
