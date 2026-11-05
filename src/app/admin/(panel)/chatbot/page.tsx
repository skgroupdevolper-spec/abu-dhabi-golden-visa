import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Tabs, Toggle } from '@/components/dash/Fields';
import { requireAdmin } from '@/lib/server/auth';
import { aiReady } from '@/lib/server/ai';
import { CB0, type ChatbotCfg } from '@/lib/server/chatbot';
import { list } from '@/lib/server/collections';
import { getBlock, getSite } from '@/lib/server/settings';
import { LOCALES } from '@/lib/i18n';
import { when } from '@/lib/stages';
import type { Chat } from '@/lib/server/content';
import { saveChatbot, testAi } from '../../ai-actions';

export const metadata: Metadata = { title: 'AI chatbot' };

export default async function Chatbot({ searchParams }: { searchParams: Promise<{ tab?: string; chat?: string; q?: string }> }) {
  const me = await requireAdmin();
  const { tab = 'chats', chat, q = '' } = await searchParams;
  const [cfg, site, ready, chats] = await Promise.all([getBlock<ChatbotCfg>('chatbot', CB0), getSite(), aiReady(), list<Chat>('chats')]);
  const full = me.role === 'owner' || me.role === 'admin';
  const n = q.toLowerCase();
  const rows = chats.filter((c) => !n || c.messages.some((m) => m.content.toLowerCase().includes(n)));
  const open = chats.find((c) => c.id === chat);
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">AI chatbot</p><h1>Answers visitors <span className="gold">from your own content.</span></h1></div>
        <span className={`pill ${site.features.chatbot && ready ? 'ok' : 'due'}`}>{!ready ? 'No AI key' : site.features.chatbot ? 'Live on the website' : 'Off'}</span></div>
      <Tabs base="/admin/chatbot/" tabs={full ? [['chats', `Chats (${chats.length})`], ['settings', 'Look & hand-over'], ['greetings', 'Greeting per language']] : [['chats', `Chats (${chats.length})`]]} cur={tab} />
      {tab === 'chats' && (
        <div className="cols">
          <div className="panel">
            <form className="row" action="/admin/chatbot/"><input type="hidden" name="tab" value="chats" /><input name="q" defaultValue={q} placeholder="Search text, name, phone" style={{ flex: 1 }} /><button className="btn" type="submit">Search</button></form>
            {rows.length === 0 ? <p className="empty" style={{ marginTop: 12 }}>No conversations yet.</p> : (
              <div className="files" style={{ marginTop: 12 }}>{rows.slice(0, 200).map((c) => (
                <Link key={c.id} href={`/admin/chatbot/?tab=chats&chat=${c.id}`} className="file" style={{ textDecoration: 'none', color: 'inherit', background: c.id === chat ? '#fffaf0' : '#fff' }}>
                  <span className="fi">{c.lang.toUpperCase()}</span><span className="fn"><b>{c.messages.find((m) => m.role === 'user')?.content.slice(0, 80)}</b><small>{when(c.updated)} · {c.messages.length} messages · {c.page}</small></span>
                </Link>
              ))}</div>
            )}
          </div>
          <div className="panel">
            {!open ? <p className="muted">Choose a conversation to read it.</p> : (
              <><h2>Conversation</h2><p className="small muted">{when(open.at)} · {open.lang} · {open.page}</p>
                <div className="thread" style={{ marginTop: 10 }}>{open.messages.map((m, i) => <div key={i} className={`msg${m.role === 'user' ? '' : ' mine'}`}>{m.content}<span className="meta">{m.role === 'user' ? 'Visitor' : 'Assistant'} · {when(m.at)}</span></div>)}</div></>
            )}
          </div>
        </div>
      )}
      {tab === 'settings' && full && (
        <div className="panel" style={{ maxWidth: 860 }}>
          <ActionForm action={saveChatbot} className="form">
            <div className="full"><Toggle name="on" label="Show the chatbot on the website" help={ready ? 'Uses your AI key from Site settings.' : 'Add an AI key in Site settings > AI keys first.'} on={site.features.chatbot} /></div>
            <F name="name" label="Assistant name" value={cfg.name} />
            <div className="field"><label htmlFor="position">Position</label><select id="position" name="position" defaultValue={cfg.position}><option value="left">Bottom left</option><option value="right">Bottom right</option></select></div>
            <F name="handover" label="Hand-over text (shown with the WhatsApp button)" value={cfg.handover} full />
            <F name="knowledge" label="Extra company knowledge (prices, offers, hours, policies)" value={cfg.knowledge} type="textarea" rows={8} full help="The bot already knows your services, government fees, FAQs and contact details. Add anything else here." />
            <div className="full"><Toggle name="askContact" label="Invite visitors to share their WhatsApp number" on={cfg.askContact} /></div>
            {LOCALES.map((l) => <input key={l.code} type="hidden" name={`g_${l.code}`} value={cfg.greeting[l.code] ?? ''} />)}
            <div className="full"><Submit>Save</Submit></div>
          </ActionForm>
          <ActionForm action={testAi} className="row" ><Submit className="btn">Test the AI connection</Submit></ActionForm>
        </div>
      )}
      {tab === 'greetings' && full && (
        <div className="panel">
          <ActionForm action={saveChatbot} className="form">
            <input type="hidden" name="on" value={site.features.chatbot ? 'on' : ''} /><input type="hidden" name="name" value={cfg.name} /><input type="hidden" name="position" value={cfg.position} /><input type="hidden" name="handover" value={cfg.handover} /><input type="hidden" name="knowledge" value={cfg.knowledge} />{cfg.askContact && <input type="hidden" name="askContact" value="on" />}
            {LOCALES.map((l) => <F key={l.code} name={`g_${l.code}`} label={`${l.native} (${l.code})`} value={cfg.greeting[l.code] ?? ''} placeholder={l.code === 'en' ? CB0.greeting.en : 'Leave empty to use English'} />)}
            <div className="full"><Submit>Save greetings</Submit></div>
          </ActionForm>
        </div>
      )}
    </>
  );
}
