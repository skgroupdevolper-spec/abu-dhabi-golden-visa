'use client';

// Admin bell: checks for new enquiries, applications, messages and chats every 15 seconds,
// plays a soft chime, shows a pop-up and (if allowed) a desktop notification.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';

type Item = { id: string; kind: string; text: string; href: string; at: string };
type Pulse = { notes: number; leads: number; messages: number; latest: Item[] };
const KEY = 'adgv-bell-sound';

function chime(ctx: AudioContext) {
  const now = ctx.currentTime;
  [[880, 0], [1318.5, 0.14], [1760, 0.28]].forEach(([f, t]) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, now + t);
    g.gain.exponentialRampToValueAtTime(0.22, now + t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.55);
    o.connect(g).connect(ctx.destination);
    o.start(now + t); o.stop(now + t + 0.6);
  });
}
const ago = (iso: string) => { const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000); return m < 1 ? 'now' : m < 60 ? `${m} min` : m < 1440 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} d`; };

export function AdminBell({ initial }: { initial: number }) {
  const router = useRouter();
  const [p, setP] = useState<Pulse>({ notes: initial, leads: 0, messages: 0, latest: [] });
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(true);
  const [toast, setToast] = useState<Item | null>(null);
  const last = useRef<number | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const ctx = useRef<AudioContext | null>(null);

  useEffect(() => {
    try { setSound(localStorage.getItem(KEY) !== 'off'); } catch {}
    // Browsers allow sound only after the first click on the page.
    const unlock = () => { try { ctx.current = ctx.current ?? new AudioContext(); void ctx.current.resume(); } catch {} };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  const check = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/pulse/', { cache: 'no-store' });
      if (!r.ok) return;
      const j = (await r.json()) as Pulse & { ok: boolean };
      const fresh = j.latest.filter((x) => !seen.current.has(x.id));
      j.latest.forEach((x) => seen.current.add(x.id));
      if (last.current !== null && j.notes > last.current && fresh.length) {
        const top = fresh[0];
        setToast(top);
        setTimeout(() => setToast((t) => (t?.id === top.id ? null : t)), 8000);
        let on = true; try { on = localStorage.getItem(KEY) !== 'off'; } catch {}
        if (on) { try { ctx.current = ctx.current ?? new AudioContext(); chime(ctx.current); } catch {} }
        if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
          const n = new Notification('Abu Dhabi Golden Visa', { body: top.text, icon: '/brand/coin.webp', tag: top.id });
          n.onclick = () => { window.focus(); router.push(top.href); };
        }
        document.title = `(${j.notes}) ${document.title.replace(/^\(\d+\)\s*/, '')}`;
        router.refresh();
      }
      last.current = j.notes;
      setP(j);
    } catch {}
  }, [router]);

  useEffect(() => {
    void check();
    const t = setInterval(() => { if (!document.hidden || 'Notification' in window) void check(); }, 15000);
    const vis = () => { if (!document.hidden) { void check(); document.title = document.title.replace(/^\(\d+\)\s*/, ''); } };
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', vis); };
  }, [check]);

  const toggleSound = () => {
    const v = !sound; setSound(v);
    try { localStorage.setItem(KEY, v ? 'on' : 'off'); } catch {}
    if (v) { try { ctx.current = ctx.current ?? new AudioContext(); chime(ctx.current); } catch {} }
    if (v && 'Notification' in window && Notification.permission === 'default') void Notification.requestPermission();
  };

  return (
    <div className="bell">
      <button type="button" className={`ab-btn ab-icon${p.notes ? ' ring' : ''}`} onClick={() => setOpen((o) => !o)} aria-label={`Notifications (${p.notes} new)`} aria-expanded={open}>
        <Icon name="bell" size={18} />{p.notes > 0 && <i className="dot">{p.notes > 99 ? '99+' : p.notes}</i>}
      </button>
      {open && (
        <div className="bell-pop" role="dialog" aria-label="Notifications">
          <div className="bell-h"><b>Notifications</b>
            <button type="button" className="btn btn-sm" onClick={toggleSound} title="Sound for new notifications">{sound ? '🔔 Sound on' : '🔕 Sound off'}</button></div>
          <div className="bell-k"><span><b>{p.leads}</b> new enquiries</span><span><b>{p.messages}</b> unread messages</span></div>
          {p.latest.length ? p.latest.map((n) => (
            <Link key={n.id} href={n.href} className="bell-i" onClick={() => setOpen(false)}><span className={`bk-${n.kind}`}>●</span><span>{n.text}<small>{ago(n.at)}</small></span></Link>
          )) : <p className="muted small" style={{ padding: 12 }}>You are all caught up.</p>}
          <Link href="/admin/notifications/" className="bell-all" onClick={() => setOpen(false)}>See all notifications →</Link>
        </div>
      )}
      {toast && (
        <Link href={toast.href} className="bell-toast" onClick={() => setToast(null)}>
          <span className="bt-ic"><Icon name="bell" size={18} /></span><span><b>New</b><br />{toast.text}</span>
        </Link>
      )}
    </div>
  );
}
