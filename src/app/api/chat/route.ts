import { NextResponse, type NextRequest } from 'next/server';
import { aiReady, complete } from '@/lib/server/ai';
import { CB0, chatSystemPrompt, type ChatbotCfg } from '@/lib/server/chatbot';
import { notify } from '@/lib/server/collections';
import { applyRuntimeSync, getBlock } from '@/lib/server/settings';
import { newId, now, updateJsonFile } from '@/lib/server/store';
import type { Chat } from '@/lib/server/content';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


const hits = new Map<string, number[]>();

/** Widget start-up: is the chatbot on, its name and greeting. */
export async function GET(req: NextRequest) {
  const site = applyRuntimeSync();
  const cfg = await getBlock<ChatbotCfg>('chatbot', CB0);
  const lang = req.nextUrl.searchParams.get('lang') || 'en';
  const enabled = site.features.chatbot && (await aiReady());
  return NextResponse.json({ enabled, name: cfg.name, greeting: cfg.greeting[lang] || cfg.greeting.en || CB0.greeting.en, position: cfg.position, handover: cfg.handover, whatsapp: site.whatsapp });
}

export async function POST(req: NextRequest) {
  const site = applyRuntimeSync();
  if (!site.features.chatbot || !(await aiReady())) return NextResponse.json({ error: 'Chat is not available.' }, { status: 503 });
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const t = Date.now(), recent = (hits.get(ip) || []).filter((x) => t - x < 10 * 60_000);
  if (recent.length >= 30) return NextResponse.json({ error: 'Please wait a moment, or message us on WhatsApp.' }, { status: 429 });
  hits.set(ip, [...recent, t]);
  const b = await req.json().catch(() => ({}));
  const lang = String(b.lang || 'en').slice(0, 5);
  const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-12).map((m: { role: string; content: string }) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 1500) })) as { role: 'user' | 'assistant'; content: string }[];
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return NextResponse.json({ error: 'Empty message' }, { status: 400 });
  let reply = '';
  try {
    reply = await complete(await chatSystemPrompt(lang), msgs, { maxTokens: 500, kind: 'chat' });
  } catch {
    return NextResponse.json({ reply: `Sorry, I can’t answer right now. Please message us on WhatsApp: https://wa.me/${site.whatsapp}` });
  }
  const id = /^[a-f0-9]{12}$/.test(String(b.session)) ? String(b.session) : newId(6);
  let first = false;
  await updateJsonFile<Chat[]>('chats.json', [], (all) => {
    const i = all.findIndex((c) => c.id === id);
    const stamp = now();
    const messages = [...msgs.slice(-1).map((m) => ({ ...m, at: stamp })), { role: 'assistant' as const, content: reply, at: stamp }];
    if (i < 0) { first = true; all.unshift({ id, at: stamp, updated: stamp, lang, page: String(b.page || '').slice(0, 200), messages }); }
    else { all[i].messages.push(...messages); all[i].messages = all[i].messages.slice(-80); all[i].updated = stamp; }
    return all.slice(0, 2000);
  });
  if (first) await notify('chat', `New chatbot conversation: “${msgs[msgs.length - 1].content.slice(0, 90)}”`, `/admin/chatbot/?tab=chats&chat=${id}`);
  return NextResponse.json({ reply, session: id });
}
