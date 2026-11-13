'use client';

import { T } from './T';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { coinImg, fullLogo } from '@/components/BrandLogo';

type M = { role: 'user' | 'assistant'; content: string };
type Cfg = { enabled: boolean; name: string; greeting: string; position: 'left' | 'right'; handover: string; whatsapp: string };

function linkify(text: string): ReactNode[] {
  return text.split(/(https?:\/\/[^\s)]+|\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/)/gi).map((p, i) =>
    /^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noopener">{p.replace(/^https?:\/\//, '').slice(0, 40)}</a>
      : /^\/[a-z0-9-]/i.test(p) ? <a key={i} href={p}>{p}</a> : <span key={i}>{p}</span>);
}

/** AI assistant for visitors; answers from the site's own content and hands over to WhatsApp. */
export function ChatWidget({ lang }: { lang: string }) {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<M[]>([]);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState('');
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => { fetch(`/api/chat/?lang=${lang}`).then((r) => r.json()).then(setCfg).catch(() => {}); }, [lang]);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' }); }, [msgs, busy]);
  if (!cfg?.enabled) return null;

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('q') as HTMLInputElement;
    const q = input.value.trim();
    if (!q || busy) return;
    input.value = '';
    const next = [...msgs, { role: 'user' as const, content: q }];
    setMsgs(next);
    setBusy(true);
    try {
      const r = await fetch('/api/chat/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next, lang, session, page: location.pathname }) });
      const j = await r.json();
      if (j.session) setSession(j.session);
      setMsgs([...next, { role: 'assistant', content: j.reply || j.error || '…' }]);
    } catch {
      setMsgs([...next, { role: 'assistant', content: `Please message us on WhatsApp: https://wa.me/${cfg!.whatsapp}` }]);
    }
    setBusy(false);
  }

  return (
    <div className={`chatw ${cfg.position}${open ? ' open' : ''}`}>
      {open && (
        <div className="chatbox" role="dialog" aria-label={cfg.name}>
          <div className="ch-head"><img decoding="async" src={coinImg()} alt="" width={34} height={34} /><div><b>{cfg.name}</b><small><T>{"AI assistant · answers may need checking"}</T></small></div><button type="button" onClick={() => setOpen(false)} aria-label="Close chat">✕</button></div>
          <div className="ch-body" ref={box} data-lenis-prevent>
            <div className="ch-msg bot">{cfg.greeting}</div>
            {msgs.map((m, i) => <div key={i} dir="auto" className={`ch-msg ${m.role === 'user' ? 'me' : 'bot'}`}>{m.role === 'assistant' ? linkify(m.content) : m.content}</div>)}
            {busy && <div className="ch-msg bot typing"><i /><i /><i /></div>}
          </div>
          <a className="ch-wa" href={`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Hello, I was chatting on your website and need help with my Golden Visa.')}`} target="_blank" rel="noopener">{cfg.handover} → WhatsApp</a>
          <form className="ch-form" onSubmit={send}><input name="q" placeholder="Type your question" autoComplete="off" maxLength={1500} /><button type="submit" disabled={busy} aria-label="Send">➤</button></form>
        </div>
      )}
      <button type="button" className="ch-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Chat with our assistant">
        {open ? '✕' : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z" /><path d="M8 10h8M8 13h5" /></svg>}
      </button>
    </div>
  );
}
