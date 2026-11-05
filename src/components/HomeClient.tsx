'use client';

import { useEffect, useRef, useState } from 'react';
import { localizePath, type Locale } from '@/lib/i18n';
import { Icon } from './Icon';

/* ---------------- hero route finder ---------------- */
const FINDER = [
  { label: 'I own property', route: 'Property investor', note: 'Abu Dhabi property worth AED 2M+', href: '/golden-visa/property-investment/' },
  { label: 'I invest', route: 'Company owner or investor', note: 'AED 2M deposit or company stake', href: '/golden-visa/business-investors/' },
  { label: 'I run a business', route: 'Entrepreneur', note: 'Approved idea or AED 1M+ revenue', href: '/golden-visa/entrepreneurs/' },
  { label: 'I earn AED 30K+', route: 'Skilled professional', note: 'Degree, work permit, AED 30,000 salary', href: '/golden-visa/skilled-professionals/' },
  { label: 'I just graduated', route: 'Outstanding graduate', note: 'GPA 3.5+ in the last 2 years', href: '/golden-visa/students-graduates/' },
];

export function RouteFinder({ locale }: { locale: Locale }) {
  const [i, setI] = useState(0);
  const f = FINDER[i];
  return (
    <div className="finder glass">
      <p className="eyebrow">Find your route</p>
      <div className="chips" role="group" aria-label="Which describes you?">
        {FINDER.map((x, k) => (
          <button key={x.label} type="button" aria-pressed={k === i} onClick={(e) => { setI(k); const r = e.currentTarget.getBoundingClientRect(); window.__adgvDrop?.(r.left + r.width / 2, r.top + r.height / 2, 0.04, -0.7); }}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="res" aria-live="polite">
        <div key={i} className="wstep">
          <small>Your route</small>
          <b>{f.route}</b>
          <small>{f.note}</small>
        </div>
        <a className="go-btn" href={localizePath(f.href, locale)} aria-label={`See the ${f.route} route`}><Icon name="arrow" size={18} /></a>
      </div>
    </div>
  );
}

/* ---------------- services with load more ---------------- */
export type Svc = { title: string; text: string; href: string; icon: string };

export function ServicesGrid({ items, locale }: { items: Svc[]; locale: Locale }) {
  const [n, setN] = useState(6);
  const left = items.length - n;
  return (
    <>
      <div className="grid three">
        {items.slice(0, n).map((s, k) => (
          <a key={s.title} href={localizePath(s.href, locale)} className="card glass wstep" style={{ animationDelay: `${(k % 6) * 40}ms` }}>
            <span className="ico"><Icon name={s.icon} /></span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <span className="go">Learn more →</span>
          </a>
        ))}
      </div>
      <div className="loadmore">
        {left > 0 ? (
          <button type="button" className="btn btn-glass" onClick={(e) => { setN((x) => x + 6); const r = e.currentTarget.getBoundingClientRect(); window.__adgvDrop?.(r.left + r.width / 2, r.top + r.height / 2, 0.06, -0.9); }}>
            Load more services
          </button>
        ) : (
          <a className="btn btn-glass" href={localizePath('/services/', locale)}>See every service</a>
        )}
        <small className="muted">Showing {Math.min(n, items.length)} of {items.length}</small>
      </div>
    </>
  );
}

/* ---------------- phone chat that types like a person ---------------- */
type Msg = { who: 'them' | 'me'; html: string; t: string; wait: number };
const CHAT: Msg[] = [
  { who: 'them', wait: 1300, t: '10:02', html: '<b>Quote ready</b>Golden Visa for 1 applicant + 2 family members.<span class="pay"><span>Government fees</span><span>AED 12,138.36</span></span>' },
  { who: 'me', wait: 900, t: '10:06', html: 'Paid by card' },
  { who: 'them', wait: 1500, t: '10:07', html: '<b>Payment received</b>Your receipt is attached. We have started your file.' },
  { who: 'them', wait: 1700, t: 'Day 3', html: '<b>Valuation certificate issued</b>Next: nomination with the authority.' },
  { who: 'them', wait: 1400, t: 'Next', html: '<b>Application submitted</b>We will message you when the status changes.' },
];

export function PhoneChat() {
  const box = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Your advisor · online');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stop = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    const add = (m: Msg) => {
      const d = document.createElement('div');
      d.className = 'msg pop' + (m.who === 'me' ? ' me' : '');
      d.innerHTML = m.html + `<span class="meta">${m.t}${m.who === 'me' ? '<span class="tick">✓✓</span>' : ''}</span>`;
      el.appendChild(d);
      return d;
    };
    const play = () => {
      if (reduce) return;
      stop();
      el.innerHTML = '';
      let at = 500;
      CHAT.forEach((m) => {
        if (m.who === 'them') {
          later(() => {
            setStatus('typing…');
            const ty = document.createElement('div');
            ty.className = 'msg typing pop';
            ty.innerHTML = '<i></i><i></i><i></i>';
            ty.dataset.typing = '1';
            el.appendChild(ty);
          }, at);
          at += m.wait;
          later(() => { el.querySelector('[data-typing]')?.remove(); setStatus('Your advisor · online'); add(m); }, at);
          at += 900;
        } else {
          at += m.wait;
          later(() => { const d = add(m); later(() => d.querySelector('.tick')?.classList.add('seen'), 1300); }, at);
          at += 1500;
        }
      });
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? play() : stop())), { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); stop(); };
  }, []);

  return (
    <div className="phone">
      <span className="sample">Sample</span>
      <div className="screen">
        <div className="sh">
          <small>Application ADGV-0000</small>
          <b>Golden Visa · Property investor</b>
          <div className="st"><i /> <span>{status}</span></div>
          <div className="pbar"><i /></div>
        </div>
        <div className="msgs" ref={box}>
          {CHAT.map((m) => (
            <div key={m.t + m.html.slice(0, 12)} className={`msg${m.who === 'me' ? ' me' : ''}`}>
              <span dangerouslySetInnerHTML={{ __html: m.html }} />
              <span className="meta">{m.t}{m.who === 'me' && <span className="tick seen">✓✓</span>}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- scroll effects for the homepage ---------------- */
export function HomeEffects() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.manifesto .w').forEach((w) => w.classList.add('lit'));
      return;
    }
    let ctx: { revert: () => void } | null = null;
    let dead = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (dead) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const words = gsap.utils.toArray<HTMLElement>('.manifesto .w');
        if (words.length)
          ScrollTrigger.create({
            trigger: '.manifesto p.big',
            start: 'top 80%',
            end: 'bottom 45%',
            scrub: true,
            onUpdate: (self) => {
              const k = Math.round(self.progress * words.length);
              words.forEach((w, i) => w.classList.toggle('lit', i < k));
            },
          });
        gsap.fromTo('.band-row', { xPercent: 0 }, { xPercent: -36, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.to('.jfill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.jsteps', start: 'top 70%', end: 'bottom 55%', scrub: true } });
        gsap.utils.toArray<HTMLElement>('.jstep').forEach((s) =>
          ScrollTrigger.create({ trigger: s, start: 'top 62%', onEnter: () => s.classList.add('on'), onLeaveBack: () => s.classList.remove('on') }),
        );
        gsap.fromTo('.promo.p1', { y: 50 }, { y: -30, ease: 'none', scrollTrigger: { trigger: '.promos', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.fromTo('.promo.p2', { y: 120, rotate: 3 }, { y: -60, rotate: -2, ease: 'none', scrollTrigger: { trigger: '.promos', start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    })();
    return () => { dead = true; ctx?.revert(); };
  }, []);
  return null;
}
