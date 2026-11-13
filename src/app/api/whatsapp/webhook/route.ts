import { NextResponse, type NextRequest } from 'next/server';
import { insert, notify, type WaLog } from '@/lib/server/collections';
import { getSecrets } from '@/lib/server/settings';
import { listApplications, newId, now, updateApplication } from '@/lib/server/store';
import { digits, webhookToken } from '@/lib/server/whatsapp';

export const dynamic = 'force-dynamic';

/** Meta verifies the webhook with the verify token set in Admin > WhatsApp. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const w = (await getSecrets()).whatsapp;
  if (q.get('hub.mode') === 'subscribe' && (q.get('hub.verify_token') ?? '').trim() === webhookToken(w)) return new NextResponse(q.get('hub.challenge') ?? '', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  return new NextResponse('Forbidden', { status: 403 });
}

/** Incoming client messages are added to their application thread and the team is notified. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const msgs: { from: string; text?: { body?: string }; type?: string }[] = body?.entry?.flatMap((e: { changes?: { value?: { messages?: unknown[] } }[] }) => e.changes?.flatMap((c) => c.value?.messages ?? []) ?? []) ?? [];
  if (!msgs.length) return NextResponse.json({ ok: true });
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
      await notify('whatsapp', `WhatsApp from +${from}: ${text}`, '/admin/whatsapp/');
    }
  }
  return NextResponse.json({ ok: true });
}
