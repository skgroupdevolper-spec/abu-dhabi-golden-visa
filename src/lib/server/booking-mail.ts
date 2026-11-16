import 'server-only';
// Emails to the client about their appointment: booked, confirmed, moved, cancelled.
// Text is edited in Admin > Emails & PDFs.
import { BOOKING0, TYPE_LABEL, cleanCfg, type Booking, type BookingCfg } from '@/lib/booking';
import { getBlock } from '@/lib/server/settings';
import { mailEvent } from '@/lib/server/mail';

const day = (d: string) => {
  const t = Date.parse(`${d}T00:00:00Z`);
  return Number.isNaN(t) ? d : new Date(t).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

export async function bookingMail(b: Booking, event: 'bookingNew' | 'bookingConfirmed' | 'bookingMoved' | 'bookingCancelled', old?: { date: string; time: string }) {
  if (!b.email) return { ok: false, error: 'No email' };
  const cfg = cleanCfg(await getBlock<Partial<BookingCfg>>('booking', BOOKING0));
  const place = b.type === 'office' ? cfg.office : b.type === 'video' ? cfg.videoNote : `We will call you on ${b.phone}.`;
  return mailEvent(b.email, event, {
    name: b.name.split(' ')[0], ref: b.ref, date: day(b.date), time: b.time, type: TYPE_LABEL[b.type], place, service: b.service,
    old: old ? `${day(old.date)} at ${old.time}` : '',
  });
}
