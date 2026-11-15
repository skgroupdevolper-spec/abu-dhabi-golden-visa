import { NextResponse, type NextRequest } from 'next/server';
import { insert, list, notify, type Customer, type WaLog } from '@/lib/server/collections';
import { getSecrets, getSite, saveSecrets } from '@/lib/server/settings';
import { listApplications, listLeads, newId, now, updateApplication, updateJsonFile } from '@/lib/server/store';
import { digits, resendFailed, sendWa, waAdvice, webhookToken } from '@/lib/server/whatsapp';
import { aiReady, complete } from '@/lib/server/ai';
import { chatSystemPrompt } from '@/lib/server/chatbot';
import { stepsFor } from '@/lib/server/stages';

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
    await insert<WaLog>('whatsapp-log', { id: newId(6), at: now(), to: from, event: 'incoming', text, ok: true, dir: 'in', ...(m.to ? { biz: m.to } : {}) }, 2000);
    const app = apps.find((a) => !a.archived && digits(a.client.phone).endsWith(from.slice(-9)));
    // A client wrote to the automatic-messages number. The AI assistant answers their question right here
    // (with their file status when we know them). Anything it cannot answer, or a request for a person,
    // is sent on to the main WhatsApp with a tap-to-chat link. Our own main and team numbers get no reply.
    const w = (await getSecrets()).whatsapp;
    const main = digits((await getSite()).whatsapp || '');
    const teamNums = (w.teamNumbers || '').split(/[,\n]/).map((x) => digits(x)).filter((x) => x.length >= 8);
    if (m.to && m.to === w.phoneNumberId && main && !main.endsWith(from.slice(-9)) && !teamNums.some((t) => t.endsWith(from.slice(-9))) && m.type !== 'reaction') {
      await autoReply(from, m.type === 'text' ? text : '', main, app).catch(() => null);
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

/** Answers a client on the automatic number with the website AI assistant, or hands over to the main WhatsApp. */
async function autoReply(from: string, question: string, main: string, app?: { ref: string; client: { name: string }; stage: number; nextStep?: string; route?: string }) {
  const tail = from.slice(-9);
  const log = await list<WaLog>('whatsapp-log');
  const mine = log.filter((x) => digits(x.to).endsWith(tail) && Date.now() - Date.parse(x.at) < 864e5);
  const handover = `For anything else, chat with your advisor on our main WhatsApp: +${main}\nTap to chat: https://wa.me/${main}`;
  const redirect = async () => {
    if (mine.some((x) => x.dir === 'out' && x.event === 'redirect')) return; // once a day
    await sendWa(from, 'message', {}, { force: true, text: `Thank you for your message. ${handover}`, event: 'redirect' });
  };
  const aiToday = mine.filter((x) => x.dir === 'out' && x.event === 'ai-reply').length;
  if (!question.trim() || question.length < 2 || aiToday >= 15 || !(await aiReady('chat'))) return redirect();
  // Short history of this WhatsApp chat (oldest first) so follow-up questions make sense.
  const hist = mine.filter((x) => x.event === 'incoming' || x.event === 'ai-reply').sort((a, b) => a.at.localeCompare(b.at)).slice(-8)
    .map((x) => ({ role: x.dir === 'in' ? 'user' as const : 'assistant' as const, content: stripFooter(x.full || x.text).slice(0, 800) }));
  if (!hist.length || hist[hist.length - 1].content !== question.slice(0, 800)) hist.push({ role: 'user', content: question.slice(0, 800) });
  while (hist.length && hist[0].role !== 'user') hist.shift();
  const steps = app ? await stepsFor(app as Parameters<typeof stepsFor>[0]) : [];
  const file = app ? `\nThis client has file ${app.ref} (${app.client.name})${app.route ? `, service ${app.route}` : ''}. Current step: ${steps[app.stage]?.name ?? '-'}. Next: ${app.nextStep || steps[app.stage]?.next || '-'}.` : '';
  const system = `${await chatSystemPrompt('en')}

You are answering on WhatsApp for the company, from its automatic-updates number. Reply in the client's language, short (under 700 characters), plain text, no markdown. Do not add contact numbers, links or a sign-off: the main WhatsApp line is added automatically. We already have this client's WhatsApp number${app ? ' and file' : ''}: never ask for their name, phone or email, and do not ask them to fill in forms. For small talk (greetings, thanks) reply in one short friendly sentence and ask how you can help with their Golden Visa. Answer general questions (requirements, documents, fees, steps, timelines) from the information above.${file}
If the client asks for a person, wants to pay or change something, has a complaint, asks about a decision on their own case that you cannot see, or you are not sure, reply with exactly: HANDOVER`;
  let reply = '';
  try { reply = (await complete(system, hist, { maxTokens: 600, kind: 'chat', use: 'chat' })).trim(); } catch { return redirect(); }
  reply = stripFooter(reply);
  if (!reply || /HANDOVER/i.test(reply)) {
    await sendWa(from, 'message', {}, { force: true, text: `Thank you. An advisor will help you with this. Please message us on our main WhatsApp: +${main}\nTap to chat: https://wa.me/${main}`, event: 'redirect' });
    return;
  }
  await sendWa(from, 'message', {}, { force: true, text: `${reply.slice(0, 1200)}\n\n${handover}`, event: 'ai-reply' });
}

/** Removes the "chat with your advisor on our main WhatsApp" lines, so they are never repeated. */
function stripFooter(t: string) {
  return t.replace(/(For anything else, )?chat with your advisor on our main WhatsApp:[^\n]*\n?/gi, '').replace(/Tap to chat:[^\n]*\n?/gi, '').replace(/https?:\/\/wa\.me\/\d+/gi, '').replace(/\n{3,}/g, '\n\n').trim();
}
