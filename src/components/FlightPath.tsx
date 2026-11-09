'use client';

// "Your journey to Abu Dhabi": a gold airplane flies along a curved route as the visitor scrolls
// (GSAP MotionPathPlugin + ScrollTrigger). The trail draws behind it, each milestone lights up as
// the plane passes, and the step cards follow. Loop mode flies on its own (for heroes and banners).
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { u } from '@/lib/ui';
import { SITE } from '@/lib/site';

// Kept inside a short 1200x300 box so every stop, including step 1, is on screen together.
const D = 'M70 235 C 210 235, 260 100, 420 120 S 640 255, 790 195 S 990 55, 1140 90';
const FROM_DEFAULT = ['Mumbai', 'London', 'Moscow', 'Karachi', 'Manila', 'Cairo', 'Beijing', 'Lagos', 'Istanbul', 'Berlin', 'New York', 'Almaty'];
export const FLIGHT_STEPS = [
  { t: u('Free eligibility check'), s: u('We confirm your route and costs in writing.'), at: 0.06 },
  { t: u('Documents & attestation'), s: u('Checked, translated and attested where needed.'), at: 0.3 },
  { t: u('Nomination & entry permit'), s: u('Filed with the Abu Dhabi authorities.'), at: 0.52 },
  { t: u('Medical & Emirates ID'), s: u('Booked for you, VIP where offered.'), at: 0.74 },
  { t: u('Golden Visa issued'), s: u('Ten years, renewable, family included.'), at: 0.97 },
];

const fromList = () => (SITE.flightFrom?.length ? SITE.flightFrom : FROM_DEFAULT);

export function FlightPath({ title = u('Your journey to Abu Dhabi'), intro = u('Scroll and follow your flight: every stop is a step we handle for you.'), mode = 'scroll', steps = FLIGHT_STEPS, locale = 'en' }: { title?: string; intro?: string; mode?: 'scroll' | 'loop'; steps?: { t: string; s: string; at?: number }[]; locale?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const [from, setFrom] = useState(0);
  const pts = steps.map((x, i) => ({ ...x, at: x.at ?? (i + 0.5) / steps.length }));

  // Origin city flips every few seconds.
  useEffect(() => { const i = setInterval(() => setFrom((f) => (f + 1) % fromList().length), 2600); return () => clearInterval(i); }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let kill = () => {};
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }, { MotionPathPlugin }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/MotionPathPlugin')]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
      const path = el.querySelector<SVGPathElement>('.fp-route');
      const trail = el.querySelector<SVGPathElement>('.fp-trail');
      const plane = el.querySelector<SVGGElement>('.fp-plane');
      if (!path || !trail || !plane) return;
      const len = path.getTotalLength();
      // Place milestone dots on the route.
      el.querySelectorAll<SVGGElement>('.fp-stop').forEach((g, i) => {
        const p = path.getPointAtLength(len * pts[i].at);
        g.setAttribute('transform', `translate(${p.x} ${p.y})`);
      });
      trail.style.strokeDasharray = `${len}`;
      const update = (pr: number) => {
        trail.style.strokeDashoffset = `${len * (1 - pr)}`;
        let a = -1; pts.forEach((s, i) => { if (pr >= s.at - 0.02) a = i; });
        setActive(a);
      };
      if (reduce) { gsap.set(plane, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true, end: 1 } }); update(1); return; }
      const ctx = gsap.context(() => {
        const mp = { path, align: path, alignOrigin: [0.5, 0.5] as [number, number], autoRotate: true };
        if (mode === 'loop') {
          gsap.to(plane, { motionPath: mp, duration: 9, ease: 'power1.inOut', repeat: -1, repeatDelay: 0.6, onUpdate() { update(this.progress()); } });
        } else {
          gsap.to(plane, { motionPath: mp, ease: 'none', scrollTrigger: { trigger: el.querySelector('.fp-sky'), start: 'top 85%', end: 'bottom 80%', scrub: 0.8, onUpdate: (s) => update(s.progress) } });
        }
        // Clouds drift with scroll for depth.
        el.querySelectorAll<HTMLElement>('.fp-cloud').forEach((c, i) => gsap.to(c, { xPercent: i % 2 ? -40 : 40, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
      }, el);
      kill = () => ctx.revert();
    })();
    return () => { cancelled = true; kill(); };
  }, [mode, pts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`flight ${mode}`} ref={root}>
      <div className="fp-head">
        <p className="eyebrow"><Icon name="plane" size={14} /> {u('Flight plan', locale)}</p>
        <h2>{u(title, locale)}</h2>
        {intro && <p className="lead">{u(intro, locale)}</p>}
      </div>
      <div className="fp-sky">
        <span className="fp-cloud c1" aria-hidden="true" /><span className="fp-cloud c2" aria-hidden="true" /><span className="fp-cloud c3" aria-hidden="true" />
        <div className="fp-from"><small>{u('Departing', locale)}</small><b key={from}>{fromList()[from % fromList().length]}</b></div>
        <div className="fp-to"><small>{u('Arriving', locale)}</small><b>{u('Abu Dhabi', locale)}</b></div>
        <svg viewBox="0 0 1200 300" className="fp-svg" role="img" aria-label={`Flight route with ${pts.length} steps to an Abu Dhabi Golden Visa`}>
          <defs>
            <linearGradient id="fpg" x1="0" x2="1"><stop offset="0" stopColor="#7a5200" /><stop offset=".5" stopColor="#d4af37" /><stop offset="1" stopColor="#f2d27a" /></linearGradient>
            <filter id="fpglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <path d={D} className="fp-route" fill="none" />
          <path d={D} className="fp-trail" fill="none" stroke="url(#fpg)" filter="url(#fpglow)" />
          <g className="fp-skyline" transform="translate(1178 72) scale(.8)" aria-hidden="true">
            <path d="M-34 0v-22h8v22M-22 0v-40l5-8 5 8v40M-8 0v-30h9v30M5 0v-52l3-14 3 14v52M16 0v-26h10v26" />
          </g>
          {pts.map((s, i) => (
            <g key={i} className={`fp-stop${active >= i ? ' on' : ''}`}>
              <circle r="15" className="fp-halo" /><circle r="7" className="fp-dot" />
              <text y="-24" textAnchor="middle">{i + 1}</text>
            </g>
          ))}
          <g className="fp-plane">
            <g transform="translate(-24 -24)">
              <circle cx="24" cy="24" r="22" className="fp-plane-bg" />
              <path d="M38 23.2 28.6 21V13c0-1.3-1-3-2.6-3s-2.6 1.7-2.6 3v8L14 23.2v3l9.4-1.6v6l-3.2 2.4V35l5.8-1.2 5.8 1.2v-2.2l-3.2-2.4v-6l9.4 1.6z" transform="rotate(90 24 24) translate(-2 0)" className="fp-plane-ic" />
            </g>
          </g>
        </svg>
      </div>
      <ol className="fp-steps">
        {pts.map((s, i) => (
          <li key={i} className={`fp-step${active >= i ? ' on' : ''}${active === i ? ' now' : ''}`}>
            <span className="fp-n">{active > i ? <Icon name="check" size={16} /> : i + 1}</span>
            <b>{u(s.t, locale)}</b><small>{u(s.s, locale)}</small>
          </li>
        ))}
      </ol>
    </div>
  );
}
