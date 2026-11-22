'use client';

import { T } from './T';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { u } from '@/lib/ui';
import type { Locale } from '@/lib/i18n';

type M = { role: 'user' | 'assistant'; content: string };
type Cfg = { enabled: boolean; name: string; greeting: string; position: 'left' | 'right'; handover: string; whatsapp: string };

function linkify(text: string): ReactNode[] {
  return text.split(/(https?:\/\/[^\s)]+|\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/)/gi).map((p, i) =>
    /^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noopener">{p.replace(/^https?:\/\//, '').slice(0, 40)}</a>
      : /^\/[a-z0-9-]/i.test(p) ? <a key={i} href={p}>{p}</a> : <span key={i}>{p}</span>);
}

/** The advisor's face: a friendly man in a suit (drawn here, no photo). */
export function AdvisorAvatar({ size = 40 }: { size?: number }) {
  return (
    <svg className="adv-av" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="advbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e3a1" /><stop offset="1" stopColor="#c9a13a" /></linearGradient>
        <clipPath id="advclip"><circle cx="32" cy="32" r="32" /></clipPath>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#advbg)" />
      <g clipPath="url(#advclip)">
        <path d="M8 64c2-13 11-19 24-19s22 6 24 19z" fill="#16233f" />
        <path d="M26 45l6 9 6-9-2-2h-8z" fill="#fff" />
        <path d="M30.6 47h2.8l1.2 10-2.6 4-2.6-4z" fill="#b8901f" />
        <rect x="27.5" y="36" width="9" height="9" rx="3" fill="#e9b98f" />
        <ellipse cx="32" cy="27" rx="11" ry="12.5" fill="#f1c7a0" />
        <path d="M20.6 25.5c-.6-9 5-14 11.6-14 7.4 0 12.2 5 11.2 13.6-1.6-4.6-4.6-6.6-9-7-3.4-.3-8.8.2-13.8 7.4z" fill="#2b1d14" />
        <circle cx="27.8" cy="28" r="1.3" fill="#2b1d14" /><circle cx="36.2" cy="28" r="1.3" fill="#2b1d14" />
        <path d="M28.2 33.6c2.2 2 5.4 2 7.6 0" stroke="#a5603b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** A first message that fits the page the visitor is reading. */
function smartGreeting(path: string, fallback: string, loc: string) {
  const p = path.replace(/^\/[a-z]{2}(?=\/)/, '');
  const pick = (s: string) => u(s, loc as Locale);
  if (/property|real-estate|mortgag/.test(p)) return pick('Hello! Looking at the property route? Tell me your property value and I will check if it qualifies for the 10-year Golden Visa.');
  if (/cost|fee|price/.test(p)) return pick('Hello! Want to know your exact cost? Tell me your route and how many family members join you.');
  if (/family|spouse|child|parent/.test(p)) return pick('Hello! Adding your family? Tell me who you want to sponsor and I will explain the steps and costs.');
  if (/blog|guide/.test(p)) return pick('Hello! Any question about this article? Ask me and I will answer in a few seconds.');
  if (/golden-visa|eligib|visa-check/.test(p)) return pick('Hello! I can check in one minute if you qualify for the Abu Dhabi Golden Visa. What do you do: invest, own a company, or work as a professional?');
  return fallback;
}

const CHIPS = ['Am I eligible?', 'How much does it cost?', 'Which documents do I need?', 'How long does it take?'];

/** AI advisor for visitors; answers from the site's own content and hands over to WhatsApp.
 *  Any element with data-open-chat opens it (the "Ask our advisor" button in the side bar). */
export function ChatWidget({ lang }: { lang: string }) {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<M[]>([]);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState('');
  const [hello, setHello] = useState('');
  const [teaser, setTeaser] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch(`/api/chat/?lang=${lang}`).then((r) => r.json()).then(setCfg).catch(() => {}); }, [lang]);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' }); }, [msgs, busy, open]);

  // buttons elsewhere on the page open the advisor
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.('[data-open-chat]');
      if (!t) return;
      e.preventDefault();
      setOpen(true);
      setTeaser(false);
    };
    document.addEventListener('click', on);
    return () => document.removeEventListener('click', on);
  }, []);

  // a short hello next to the advisor button, once per visit
  useEffect(() => {
    if (!cfg?.enabled) return;
    let shown = false;
    try { shown = sessionStorage.getItem('adv-teaser') === '1'; } catch {}
    if (shown) return;
    const t = setTimeout(() => { setTeaser(true); try { sessionStorage.setItem('adv-teaser', '1'); } catch {} }, 9000);
    return () => clearTimeout(t);
  }, [cfg?.enabled]);

  useEffect(() => {
    if (open && cfg) { setHello(smartGreeting(location.pathname, cfg.greeting, lang)); setTimeout(() => input.current?.focus(), 150); }
  }, [open, cfg, lang]);

  if (!cfg?.enabled) return null;

  async function ask(q: string) {
    q = q.trim();
    if (!q || busy) return;
    const next = [...msgs, { role: 'user' as const, content: q }];
    setMsgs(next);
    setBusy(true);
    try {
      const r = await fetch('/api/chat/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'assistant', content: hello }, ...next].slice(-20), lang, session, page: location.pathname }) });
      const j = await r.json();
      if (j.session) setSession(j.session);
      setMsgs([...next, { role: 'assistant', content: j.reply || j.error || '…' }]);
    } catch {
      setMsgs([...next, { role: 'assistant', content: `Please message us on WhatsApp: https://wa.me/${cfg!.whatsapp}` }]);
    }
    setBusy(false);
  }
  function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget.elements.namedItem('q') as HTMLInputElement;
    const q = el.value;
    el.value = '';
    void ask(q);
  }

  return (
    <div className={`chatw ${cfg.position}${open ? ' open' : ''}`}>
      {open && (
        <div className="chatbox" role="dialog" aria-label={cfg.name}>
          <div className="ch-head">
            <span className="ch-av"><AdvisorAvatar size={42} /><i className="ch-on" aria-hidden="true" /></span>
            <div><b>{cfg.name}</b><small><T>{"Online now · AI advisor, a person follows up on WhatsApp"}</T></small></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </div>
          <div className="ch-body" ref={box} data-lenis-prevent>
            <div className="ch-row"><AdvisorAvatar size={26} /><div className="ch-msg bot">{hello || cfg.greeting}</div></div>
            {!msgs.length && (
              <div className="ch-chips">
                {CHIPS.map((c) => <button key={c} type="button" onClick={() => ask(u(c, lang as Locale))}><T>{c}</T></button>)}
              </div>
            )}
            {msgs.map((m, i) => m.role === 'user'
              ? <div key={i} dir="auto" className="ch-msg me">{m.content}</div>
              : <div key={i} className="ch-row"><AdvisorAvatar size={26} /><div dir="auto" className="ch-msg bot">{linkify(m.content)}</div></div>)}
            {busy && <div className="ch-row"><AdvisorAvatar size={26} /><div className="ch-msg bot typing"><i /><i /><i /></div></div>}
          </div>
          <a className="ch-wa" href={`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Hello, I was chatting on your website and need help with my Golden Visa.')}`} target="_blank" rel="noopener">{cfg.handover} → WhatsApp</a>
          <form className="ch-form" onSubmit={send}><input ref={input} name="q" placeholder={u('Type your question', lang as Locale)} autoComplete="off" maxLength={1500} /><button type="submit" disabled={busy} aria-label="Send">➤</button></form>
        </div>
      )}
      {teaser && !open && (
        <button type="button" className="ch-teaser" onClick={() => { setOpen(true); setTeaser(false); }}>
          <AdvisorAvatar size={34} />
          <span><b><T>{"Hi, I'm your Golden Visa advisor"}</T></b><T>{"Ask me if you qualify, the cost or the documents."}</T></span>
          <i role="button" aria-label="Close" onClick={(e) => { e.stopPropagation(); setTeaser(false); }}>✕</i>
        </button>
      )}
      <button type="button" className="ch-btn" onClick={() => { setOpen((o) => !o); setTeaser(false); }} aria-expanded={open} aria-label="Chat with our advisor">
        {open ? '✕' : <AdvisorAvatar size={52} />}
      </button>
    </div>
  );
}
