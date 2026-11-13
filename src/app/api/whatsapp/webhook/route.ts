import { NextResponse, type NextRequest } from 'next/server';
import { insert, list, notify, type Customer, type WaLog } from '@/lib/server/collections';
import { getSecrets, saveSecrets } from '@/lib/server/settings';
import { listApplications, listLeads, newId, now, updateApplication } from '@/lib/server/store';
import { digits, webhookToken } from '@/lib/server/whatsapp';

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
  const msgs: { from: string; text?: { body?: string }; type?: string }[] = body?.entry?.flatMap((e: { changes?: { value?: { messages?: unknown[] } }[] }) => e.changes?.flatMap((c) => c.value?.messages ?? []) ?? []) ?? [];
  if (!msgs.length) return NextResponse.json({ ok: true });
  void getSecrets().then((s) => saveSecrets({ whatsapp: { ...s.whatsapp, lastIncomingAt: new Date().toISOString() } })).catch(() => {});
  const apps = await listApplications();
  for (const m of msgs.slice(0, 20)) {
    const from = digits(m.from || '');
    const text = (m.text?.body || `[${m.type || 'message'}]`).slice(0, 3000);
    await insert<WaLog>('whatsapp-log', { id: newId(6), at: now(), to: from, event: 'incoming', text, ok: true, dir: 'in' }, 2000);
    const app = apps.find((a) => !a.archived && digits(a.client.phone).endsWith(from.slice(-9)));
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
