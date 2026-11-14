import { NextResponse, type NextRequest } from 'next/server';
import { insert, list, notify, type Customer, type WaLog } from '@/lib/server/collections';
import { getSecrets, getSite, saveSecrets } from '@/lib/server/settings';
import { listApplications, listLeads, newId, now, updateApplication, updateJsonFile } from '@/lib/server/store';
import { digits, resendFailed, sendWa, waAdvice, webhookToken } from '@/lib/server/whatsapp';

export const dynamic = 'force-dynamic';

/** Meta verifies the webhook with the verify token set in Admin > WhatsApp. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const w = (await getSecrets()).whatsapp;
  if (q.get('hub.mode') === 'subscribe' && (q.get('hub.verify_token') ?? '').trim() === webhookToken(w)) {
    if (!q.get('hub.challenge')?.startsWith('selftest')) await saveSecrets({ whatsapp: { ...w, verifyToken: webhookToken(w), webhookVerifiedAt: new Date().toISOString() } });
    return new NextResponse(q.get('hub.challenge') ?? '', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

/** Incoming client messages are added to their application thread and the team is notified. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  // Each message remembers which of our numbers received it (the automatic-messages number or the main phone number).
  type InMsg = { from: string; text?: { body?: string }; type?: string; to?: string };
  const msgs: InMsg[] = body?.entry?.flatMap((e: { changes?: { value?: { messages?: InMsg[]; metadata?: { phone_number_id?: string } } }[] }) => e.changes?.flatMap((c) => (c.value?.messages ?? []).map((m) => ({ ...m, to: c.value?.metadata?.phone_number_id }))) ?? []) ?? [];
  // Delivery reports: mark each sent message as delivered / read / failed (with the reason) in the Message log.
  const sts: { id: string; status: string; errors?: { code?: number; title?: string; message?: string; error_data?: { details?: string } }[] }[] = body?.entry?.flatMap((e: { changes?: { value?: { statuses?: unknown[] } }[] }) => e.changes?.flatMap((c) => c.value?.statuses ?? []) ?? []) ?? [];
  if (sts.length) {
    await updateJsonFile<WaLog[]>('whatsapp-log.json', [], (all) => all.map((x) => {
      const u = x.mid && sts.find((z) => z.id === x.mid);
      if (!u) return x;
      const st = u.status as WaLog['st'];
      if (st === 'failed') { const er = u.errors?.[0]; return { ...x, st, ok: false, error: waAdvice(er?.error_data?.details || er?.message || er?.title || 'Not delivered', er?.code) }; }
      return x.st === 'read' ? x : { ...x, st };
    }));
  }
  if (!msgs.length) return NextResponse.json({ ok: true });
  void getSecrets().then((s) => saveSecrets({ whatsapp: { ...s.whatsapp, lastIncomingAt: new Date().toISOString() } })).catch(() => {});
  const apps = await listApplications();
  for (const m of msgs.slice(0, 20)) {
    const from = digits(m.from || '');
    const text = (m.text?.body || `[${m.type || 'message'}]`).slice(0, 3000);
    await insert<WaLog>('whatsapp-log', { id: newId(6), at: now(), to: from, event: 'incoming', text, ok: true, dir: 'in' }, 2000);
    const app = apps.find((a) => !a.archived && digits(a.client.phone).endsWith(from.slice(-9)));
    // A client answered the automatic-messages number: reply once a day with a tap-to-chat link to the main WhatsApp,
    // so the conversation continues on the phone. Messages from our main number and team numbers get no auto-reply.
    const w = (await getSecrets()).whatsapp;
    const main = digits((await getSite()).whatsapp || '');
    const teamNums = (w.teamNumbers || '').split(/[,\n]/).map((x) => digits(x)).filter((x) => x.length >= 8);
    if (m.to && m.to === w.phoneNumberId && main && !main.endsWith(from.slice(-9)) && !teamNums.some((t) => t.endsWith(from.slice(-9))) && m.type !== 'reaction') {
      const recent = (await list<WaLog>('whatsapp-log')).some((x) => x.dir === 'out' && x.event === 'redirect' && digits(x.to).endsWith(from.slice(-9)) && Date.now() - Date.parse(x.at) < 864e5);
      if (!recent) await sendWa(from, 'message', {}, { force: true, text: `Thank you for your message. For chat with your advisor, please message us on our main WhatsApp: +${main}\n\nTap to chat: https://wa.me/${main}`, event: 'redirect' }).catch(() => null);
    }
    // The client wrote, so the free 24-hour window is open: deliver anything that failed to reach them.
    if (m.type !== 'reaction') await resendFailed(from).catch(() => 0);
    if (app) {
      await updateApplication(app.id, (a) => { a.messages.push({ id: newId(6), by: 'client', at: now(), text: `WhatsApp: ${text}` }); });
      await notify('whatsapp', `WhatsApp from ${app.client.name} (${app.ref}): ${text}`, `/admin/applications/${app.id}/#messages`);
    } else {
      // Only people who contacted us through the website (enquiry, chat, booking) or have a client account
      // create a notification. Other WhatsApp chats stay in the Message log only.
      const tail = from.slice(-9);
      const lead = (await listLeads()).find((l) => digits(l.phone).endsWith(tail));
      const cust = lead ? null : (await list<Customer>('customers')).find((c) => digits(c.phone || '').endsWith(tail));
      if (lead) await notify('whatsapp', `WhatsApp from ${lead.name} (website enquiry): ${text}`, '/admin/leads/');
      else if (cust) await notify('whatsapp', `WhatsApp from ${cust.name} (client account): ${text}`, '/admin/customers/');
    }
  }
  return NextResponse.json({ ok: true });
}
