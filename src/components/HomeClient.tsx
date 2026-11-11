'use client';

import { T } from './T';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { localizePath, type Locale } from '@/lib/i18n';
import { waLink } from '@/lib/site';

const drop = (el: Element | null, r = 0.04, s = -0.7) => {
  if (!el || !window.__adgvDrop) return;
  const b = el.getBoundingClientRect();
  window.__adgvDrop(b.left + b.width / 2, b.top + b.height / 2, r, s);
};

/* ---------------- hero route finder ---------------- */
const FINDER = [
  { label: 'I own property', route: 'Real-estate investor', note: 'Abu Dhabi property worth AED 2M+', href: '/golden-visa/property-investment/' },
  { label: 'I invest', route: 'Investor', note: 'AED 2M deposit or company stake', href: '/golden-visa/business-investors/' },
  { label: 'I run a business', route: 'Entrepreneur', note: 'Approved idea or AED 1M+ revenue', href: '/golden-visa/entrepreneurs/' },
  { label: 'I just graduated', route: 'University graduate', note: 'GPA 3.5+, graduated in the last 2 years', href: '/golden-visa/students-graduates/' },
];

export function HeroFinder({ locale }: { locale: Locale }) {
  const [i, setI] = useState(0);
  const f = FINDER[i];
  return (
    <div className="finder glass in-hero" id="finder">
      <div className="q"><T>{"Find your route"}</T></div>
      <div className="chips" role="group" aria-label="Which describes you?">
        {FINDER.map((x, k) => (
          <button key={x.label} type="button" aria-pressed={k === i} onClick={(e) => { setI(k); drop(e.currentTarget); }}>{x.label}</button>
        ))}
      </div>
      <div className="res">
        <div key={i} className="fres" aria-live="polite"><small><T>{"Your route"}</T></small><b>{f.route}</b><small>{f.note}</small></div>
        <a href={localizePath(f.href, locale)} aria-label={`See the ${f.route} route`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
      </div>
    </div>
  );
}

/* ---------------- services with load more ---------------- */
const IC: Record<string, string> = {
  key: '<circle class="draw" pathLength="1" cx="15" cy="9" r="4.5"/><path class="draw" pathLength="1" d="M11.8 12.2L3 21M6 18l2.5 2.5M8.5 15.5L11 18"/>', sun: '<circle class="draw" pathLength="1" cx="17" cy="7" r="3"/><path class="draw" pathLength="1" d="M3 20c2-4 5-6 9-6s6 1.5 8 4M3 14c2-1 4-1 6 0"/>', fam: '<circle class="draw" pathLength="1" cx="8" cy="7" r="3"/><circle class="draw" pathLength="1" cx="17" cy="9" r="2.5"/><path class="draw" pathLength="1" d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14 20c0-2.6 1.6-4.5 3.5-4.5S21 17.4 21 20"/>', bag: '<rect class="draw" pathLength="1" x="3" y="7" width="18" height="13" rx="2.5"/><path class="draw" pathLength="1" d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>', baby: '<circle class="draw" pathLength="1" cx="12" cy="9" r="5"/><path class="draw" pathLength="1" d="M10 11c1.2 1 2.8 1 4 0M7 21c1-3 3-4.5 5-4.5s4 1.5 5 4.5"/>', plane: '<path class="draw" pathLength="1" d="M2.5 13.5l19-7.5-4.5 13-5.5-4.5-4 3v-5z"/><path class="draw" pathLength="1" d="M11.5 14.5L21.5 6"/>', home: '<path class="draw" pathLength="1" d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5"/>', lap: '<rect class="draw" pathLength="1" x="4" y="5" width="16" height="11" rx="2"/><path class="draw" pathLength="1" d="M2 19h20M10 9l-2 2 2 2M14 9l2 2-2 2"/>', doc: '<path class="draw" pathLength="1" d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path class="draw" pathLength="1" d="M14 3v5h5M9 13h6M9 17h4"/>', stamp: '<path class="draw" pathLength="1" d="M9 3h6l-1 7h3a2 2 0 0 1 2 2v3H5v-3a2 2 0 0 1 2-2h3zM4 21h16"/>', globe: '<circle class="draw" pathLength="1" cx="12" cy="12" r="9"/><path class="draw" pathLength="1" d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>', id: '<rect class="draw" pathLength="1" x="3" y="5" width="18" height="14" rx="2.5"/><circle class="draw" pathLength="1" cx="9" cy="11" r="2.2"/><path class="draw" pathLength="1" d="M5.5 16c.6-1.8 2-2.6 3.5-2.6s2.9.8 3.5 2.6M15 10h3M15 13h3"/>', heart: '<path class="draw" pathLength="1" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path class="draw" pathLength="1" d="M8 12h2l1-2 2 4 1-2h2"/>', shield: '<path class="draw" pathLength="1" d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path class="draw" pathLength="1" d="M9 12l2 2 4-4"/>', bank: '<path class="draw" pathLength="1" d="M3 9l9-5 9 5M5 9v9M10 9v9M14 9v9M19 9v9M3 20h18"/>', car: '<path class="draw" pathLength="1" d="M5 16l1.5-5a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 16M4 16h16v3H4z"/><circle class="draw" pathLength="1" cx="7.5" cy="19" r="1.5"/><circle class="draw" pathLength="1" cx="16.5" cy="19" r="1.5"/>', pen: '<path class="draw" pathLength="1" d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',
};
const SERVICES: [string, string, string, string][] = [
  ['Valuation Certificate', 'Official value certificate for your Abu Dhabi property from the Department of Municipalities and Transport, ready in about 3 working days. Fee from AED 900.', 'home', '/document-services/valuation-certificate/'],
  ['Golden Visa', 'Long-term UAE residency for eligible investors, property owners, entrepreneurs and professionals. We check your route, prepare every document and follow your file to issue.', 'key', '/golden-visa/'],
  ['Retirement Visa', 'A renewable 5-year visa for eligible foreign nationals who want to retire in the UAE, with the documents and steps explained.', 'sun', '/retirement-visa/'],
  ['Family Visa', 'Sponsor your spouse, children or parents: eligibility, document preparation, attestation, entry permit or status change, medical, Emirates ID and residence.', 'fam', '/family-golden-visa/'],
  ['Investor Visa', 'Residence support for company owners, partners and investors who are setting up or running a business in the UAE.', 'bag', '/services/investor-visa/'],
  ['Newborn Visa', 'Residence formalities for babies born in the UAE, with clear document and timeline guidance.', 'baby', '/family-golden-visa/newborn/'],
  ['Tourist Visa', 'Visit and tourist visa options for travel to the UAE, for you or for family members visiting.', 'plane', '/services/tourist-visa/'],
  ['Maid Visa', 'Domestic worker sponsorship, visa processing and Emirates ID support for eligible households.', 'home', '/services/maid-visa/'],
  ['Virtual Work Visa', 'Live in the UAE while you work for a company abroad, for eligible remote employees and self-employed professionals.', 'lap', '/remote-work-visa/'],
  ['MOFA / Embassy Attestation', 'Attestation for educational, personal and commercial documents through the embassy and MOFA stages.', 'stamp', '/document-services/mofa-attestation/'],
  ['Power of Attorney', 'Notary and power-of-attorney support for property sale, purchase and management.', 'pen', '/services/notary-power-of-attorney/'],
  ['Legal Translation', 'Certified translation for personal, family, educational, business, legal and immigration documents.', 'globe', '/document-services/legal-translation/'],
  ['Employment Visa', 'New-hire residence processing, from offer letter and work permit to medical, Emirates ID and stamping.', 'doc', '/services/employment-visa/'],
  ['Freelancer Visa', 'Self-sponsored and freelance residency options for eligible professionals.', 'lap', '/services/freelancer-visa/'],
  ['Work Permit', 'MOHRE work-permit support for eligible UAE residents and employers.', 'doc', '/services/work-permit/'],
  ['Visa Cancellation', 'Labour and immigration cancellation support for employees and visa holders.', 'doc', '/services/visa-cancellation/'],
  ['ILOE Insurance', 'Involuntary Loss of Employment insurance assistance and status checking.', 'shield', '/services/iloe-insurance/'],
  ['Emirates ID', 'New applications, renewals, replacement and biometrics appointments.', 'id', '/services/emirates-id/'],
  ['Medical Fitness', 'Normal, VIP and domestic-worker medical fitness processing.', 'heart', '/services/medical-biometrics/'],
  ['Document Clearing', 'Government documentation, filing and PRO coordination for individuals and businesses.', 'doc', '/services/document-clearing/'],
  ['Tasheel Services', 'Labour and employment service support through Tasheel channels.', 'doc', '/services/tasheel/'],
  ['Tawjeeh Services', 'Worker guidance and orientation support through Tawjeeh services.', 'globe', '/services/tawjeeh/'],
  ['Driving Licence', 'Guidance and support for UAE driving-licence processes.', 'car', '/services/driving-licence/'],
  ['Bank Account Opening', 'Practical banking support for personal and business clients.', 'bank', '/services/bank-account-opening/'],
  ['Wills & Estate Planning', 'Protect your family and your assets in the UAE.', 'shield', '/services/difc-wills/'],
];

export function ServicesGrid({ locale }: { locale: Locale }) {
  const [n, setN] = useState(6);
  const grid = useRef<HTMLDivElement>(null);
  const prev = useRef(6);
  useEffect(() => {
    if (n === prev.current || !grid.current) return;
    const fresh = Array.from(grid.current.children).slice(prev.current) as HTMLElement[];
    prev.current = n;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    import('gsap').then(({ gsap }) => {
      gsap.from(fresh, { y: 60, opacity: 0, rotateX: -14, duration: 1, ease: 'expo.out', stagger: 0.07 });
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => setTimeout(() => ScrollTrigger.refresh(), 60));
    });
  }, [n]);
  const all = n >= SERVICES.length;
  return (
    <>
      <div className="sgrid2" id="sgrid" ref={grid}>
        {SERVICES.slice(0, n).map(([t, d, ic, href]) => (
          <a key={t} className="sc glass tilt" href={href.startsWith('#') ? href : localizePath(href, locale)}>
            <div className="bd">
              <div className="ico"><span className="orb" /><svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: IC[ic] }} /></div>
              <h3>{t}</h3>
              <p>{d}</p>
              <span className="go"><T>{"Learn more"}</T> <i>→</i></span>
            </div>
          </a>
        ))}
      </div>
      <div className="loadmore">
        <button
          className="btn btn-glass mag"
          type="button"
          onClick={(e) => {
            drop(e.currentTarget, 0.06, -0.9);
            if (all) document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
            else setN((x) => Math.min(SERVICES.length, x + 6));
          }}
        >
          {all ? 'Talk to us about any other service' : 'Load more services'}
        </button>
        <small>{all ? `All ${SERVICES.length} services shown` : `Showing ${n} of ${SERVICES.length}`}</small>
      </div>
    </>
  );
}

/* ---------------- phone chat that types like a person ---------------- */
type Msg = { who: 'them' | 'me'; html: string; t: string; wait: number };
const CHAT: Msg[] = [
  { who: 'them', wait: 1300, t: '10:02', html: '<b>✅ Quote ready · ADGV-0001</b>Golden Visa for 1 applicant + 2 family members.<span class="pay"><span>Government fees</span><span>AED 12,138.36</span></span><span class="btnl">💳 Pay securely</span>' },
  { who: 'me', wait: 900, t: '10:06', html: 'Paid by card 🙏' },
  { who: 'them', wait: 1500, t: '10:07', html: '<b>✅ Payment received, thank you!</b><span class="doc"><i>PDF</i><span><b>Receipt RCPT-2611-0042.pdf</b><small>PDF · 130 kB</small></span></span>We have started your file.' },
  { who: 'them', wait: 1700, t: 'Day 3', html: '<b>🏠 Valuation certificate issued</b>Next: application with the authority.' },
  { who: 'them', wait: 1400, t: 'Day 5', html: '<b>📨 Application submitted</b>We will message you when the status changes.' },
];
const AV = '<span class="av" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="15" r="7"/><path d="M7 36c1.5-7 6.6-11 13-11s11.5 4 13 11"/></svg></span>';

export function PhoneChat() {
  const box = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('online');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const el = box.current;
    if (!el || !phone.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const stop = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    const add = (m: Msg) => {
      const d = document.createElement('div');
      d.className = 'msg pop' + (m.who === 'me' ? ' me' : '');
      d.innerHTML = (m.who === 'them' ? AV : '') + `<span class="tx">${m.html}</span>` + `<span class="meta">${m.t}${m.who === 'me' ? '<span class="tick">✓✓</span>' : ''}</span>`;
      el.appendChild(d);
      return d;
    };
    const play = () => {
      stop();
      el.innerHTML = '';
      let at = 500;
      CHAT.forEach((m) => {
        if (m.who === 'them') {
          later(() => {
            setStatus('typing…');
            const ty = document.createElement('div');
            ty.className = 'msg typing pop';
            ty.dataset.typing = '1';
            ty.innerHTML = AV + '<i></i><i></i><i></i>';
            el.appendChild(ty);
          }, at);
          at += m.wait;
          later(() => {
            el.querySelector('[data-typing]')?.remove();
            setStatus('online');
            add(m);
            const p = phone.current?.getBoundingClientRect();
            if (p && window.__adgvDrop) window.__adgvDrop(p.left + p.width / 2, p.top + p.height * 0.7, 0.03, -0.35);
          }, at);
          at += 900;
        } else {
          at += m.wait;
          later(() => { const d = add(m); later(() => d.querySelector('.tick')?.classList.add('seen'), 1300); }, at);
          at += 1500;
        }
      });
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? play() : stop())), { threshold: 0.3 });
    io.observe(phone.current);
    return () => { io.disconnect(); stop(); };
  }, []);

  return (
    <div className="phone" id="phone" ref={phone}>
      <span className="sample"><T>{"Sample"}</T></span>
      <div className="screen wa">
        <div className="wa-bar"><span>9:41</span><span className="wa-sig" aria-hidden="true"><i /><i /><i /><i /></span></div>
        <div className="head">
          <span className="wa-back" aria-hidden="true">‹</span>
          <span className="wa-avatar" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="15" r="7" /><path d="M7 36c1.5-7 6.6-11 13-11s11.5 4 13 11" /></svg><i /></span>
          <span className="wa-who"><b><T>{"Sara · Your advisor"}</T></b><small className={status === 'online' ? '' : 'typing'}>{status}</small></span>
          <span className="wa-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 6h13v12H3zM16 10l5-3v10l-5-3" /></svg><svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg></span>
        </div>
        <div className="wa-day"><span><T>{"Application ADGV-0001 · Golden Visa"}</T></span></div>
        <div className="msgs" ref={box}>
          {CHAT.map((m) => (
            <div key={m.t + m.html.slice(0, 14)} className={`msg${m.who === 'me' ? ' me' : ''}`}>
              {m.who === 'them' && <span className="av" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="15" r="7" /><path d="M7 36c1.5-7 6.6-11 13-11s11.5 4 13 11" /></svg></span>}
              <span className="tx" dangerouslySetInnerHTML={{ __html: m.html }} />
              <span className="meta">{m.t}{m.who === 'me' && <span className="tick seen">✓✓</span>}</span>
            </div>
          ))}
        </div>
        <div className="wa-input" aria-hidden="true"><span className="wa-field">☺ <em><T>{"Message"}</T></em> <i>📎</i></span><span className="wa-mic"><svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4" /></svg></span></div>
      </div>
    </div>
  );
}

/* ---------------- FAQ accordion ---------------- */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div id="faqList">
      {items.map((f, i) => (
        <div className="qa glass" key={f.q} data-open={open === i ? 'true' : 'false'}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>{f.q}<i aria-hidden="true">+</i></button>
          <div className="ans"><div><p>{f.a}</p></div></div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- free quote form ---------------- */
export function HomeLeadForm() {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'err'>('idle');
  const [msg, setMsg] = useState('');
  const [summary, setSummary] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = Object.fromEntries(f.entries()) as Record<string, string>;
    if (!data.name?.trim() || !data.phone?.trim()) { setState('err'); setMsg('Please add your name and WhatsApp number.'); return; }
    setState('busy');
    drop(e.currentTarget.querySelector('button[type=submit]'), 0.08, -1.1);
    try {
      const r = await fetch('/api/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, phone: data.phone, service: data.route, message: data.msg, source: 'home', details: { language: data.lang } }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'We could not send your request.');
      setSummary(`Hello, I am ${data.name}. Route: ${data.route}. Language: ${data.lang}.${data.msg ? ' ' + data.msg : ''}`);
      setState('done');
    } catch (err) {
      setState('err');
      setMsg((err as Error).message + ' Please message us on WhatsApp.');
    }
  }
  return (
    <form className="form" id="leadForm" style={{ marginTop: 26 }} noValidate onSubmit={submit}>
      <div><label htmlFor="fName"><T>{"Full name"}</T></label><input id="fName" name="name" autoComplete="name" required /></div>
      <div><label htmlFor="fPhone"><T>{"WhatsApp number"}</T></label><input id="fPhone" name="phone" type="tel" autoComplete="tel" placeholder="+971" required /></div>
      <div><label htmlFor="fRoute"><T>{"Route"}</T></label><select id="fRoute" name="route"><option>Real-estate investor</option><option>Non-real-estate investor</option><option>Entrepreneur</option><option>Skilled professional</option><option>University graduate</option><option>Family visa</option><option>Valuation certificate</option><option>Not sure yet</option></select></div>
      <div><label htmlFor="fLang"><T>{"Preferred language"}</T></label><select id="fLang" name="lang"><option>English</option><option>العربية</option><option>Русский</option><option>Türkçe</option><option>中文</option><option>Français</option><option>Deutsch</option><option>Español</option><option>हिन्दी</option><option>اردو</option><option>Other</option></select></div>
      <div className="full"><label htmlFor="fMsg"><T>{"Anything we should know?"}</T></label><textarea id="fMsg" name="msg" /></div>
      <div className="full"><button className="btn btn-gold mag" type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Get my free quote'}</button></div>
      {state === 'done' && (
        <div className="sent full" role="status">
          ✓ Thank you. An advisor will contact you on WhatsApp.{' '}
          <a href={waLink(summary)} target="_blank" rel="noopener"><T>{"Message us now →"}</T></a>
        </div>
      )}
      {state === 'err' && <p className="err full" role="alert">{msg}</p>}
    </form>
  );
}

/* ---------------- all homepage motion (same as the demo) ---------------- */
export function HomeEffects() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const words = Array.from(document.querySelectorAll<HTMLElement>('#manifesto .w'));
    if (reduce) { words.forEach((w) => w.classList.add('lit')); return; }
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const desk = window.matchMedia('(min-width: 901px)').matches;
    let ctx: { revert: () => void } | null = null;
    const off: (() => void)[] = [];
    let dead = false;
    const splash = window.setTimeout(() => drop(document.getElementById('coinStage'), 0.1, -1.6), 500);
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (dead) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from('.home .hero h1 .line>span', { yPercent: 110, rotate: 4, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.15 });
        gsap.from('.home .in-hero', { y: 30, opacity: 0.35, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.3 });
        gsap.from('#coin', { scale: 0.5, rotateX: 60, duration: 1.8, ease: 'expo.out', delay: 0.1 });
        gsap.from('.home .lens', { scale: 0.7, duration: 1.6, ease: 'expo.out', delay: 0.05 });
        gsap.to('#coinScroll', { rotationY: 720, rotationX: 20, ease: 'none', scrollTrigger: { trigger: '.home', start: 'top top', end: 'bottom bottom', scrub: 1 } });
        gsap.to('#coinStage', { yPercent: 30, scale: 0.85, ease: 'none', scrollTrigger: { trigger: '.home .hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.fromTo('#band', { xPercent: 0 }, { xPercent: -38, ease: 'none', scrollTrigger: { trigger: '.home .band', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

        gsap.utils.toArray<HTMLElement>('.home .rcard').forEach((c, i) => {
          gsap.from(c, { y: 90, rotateX: -16, opacity: 0.3, duration: 1.2, ease: 'expo.out', delay: (i % 4) * 0.07, scrollTrigger: { trigger: c, start: 'top 95%' } });
          gsap.fromTo(c, { clipPath: 'inset(18% 10% 18% 10% round 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 32px)', ease: 'none', scrollTrigger: { trigger: c, start: 'top 98%', end: 'top 55%', scrub: true } });
        });
        gsap.utils.toArray<HTMLElement>('.home .sc').forEach((c, i) => gsap.from(c, { y: 70, rotateX: -14, opacity: 0.3, duration: 1.1, ease: 'expo.out', delay: (i % 3) * 0.08, scrollTrigger: { trigger: c, start: 'top 94%' } }));
        gsap.utils.toArray<HTMLElement>('.home h2').forEach((h) => { if (!h.closest('.hero')) gsap.from(h, { y: 40, opacity: 0.3, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } }); });
        gsap.from('.home .cbox', { y: 80, scale: 0.96, opacity: 0.4, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.home .cbox', start: 'top 85%' } });

        if (words.length)
          ScrollTrigger.create({
            trigger: '#manifesto', start: 'top 80%', end: 'bottom 45%', scrub: true,
            onUpdate: (self) => { const k = Math.round(self.progress * words.length); words.forEach((w, i) => w.classList.toggle('lit', i < k)); },
          });

        if (desk) {
          gsap.fromTo('.home .promo.p1', { y: 60 }, { y: -40, ease: 'none', scrollTrigger: { trigger: '.home .promos', start: 'top bottom', end: 'bottom top', scrub: true } });
          gsap.fromTo('.home .promo.p2', { y: 140, rotate: 4 }, { y: -80, rotate: -2, ease: 'none', scrollTrigger: { trigger: '.home .promos', start: 'top bottom', end: 'bottom top', scrub: true } });
          gsap.fromTo('#phone', { y: 120, rotate: -6 }, { y: -40, rotate: 3, ease: 'none', scrollTrigger: { trigger: '.home .portal', start: 'top bottom', end: 'bottom top', scrub: true } });
        }
        gsap.utils.toArray<HTMLElement>('.home .im.par').forEach((im) => gsap.fromTo(im, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
        gsap.utils.toArray<HTMLElement>('.home .simg').forEach((f) => gsap.fromTo(f, { clipPath: 'inset(12% 8% 12% 8% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { trigger: f, start: 'top 98%', end: 'top 60%', scrub: true } }));
        gsap.from('#pbar', { width: '5%', duration: 2.2, ease: 'expo.out', scrollTrigger: { trigger: '#phone', start: 'top 70%' } });
        gsap.utils.toArray<HTMLElement>('.home .pfeat div, .home .wcard, .home .gcard').forEach((c, i) => gsap.from(c, { y: 50, opacity: 0.3, rotateX: -12, duration: 1, ease: 'expo.out', delay: (i % 4) * 0.07, scrollTrigger: { trigger: c, start: 'top 92%' } }));
        gsap.utils.toArray<HTMLElement>('.home .qa').forEach((q, i) => gsap.from(q, { x: 50, opacity: 0.3, duration: 0.9, ease: 'expo.out', delay: i * 0.05, scrollTrigger: { trigger: q, start: 'top 94%' } }));
        gsap.from('.home .cgrid', { y: 80, opacity: 0.4, scale: 0.97, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.home .cgrid', start: 'top 88%' } });
        gsap.from('.home .office .row', { x: 40, opacity: 0.3, duration: 0.9, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.home .office', start: 'top 88%' } });
        gsap.from('.home .famband .fb', { y: 80, opacity: 0.4, scale: 0.97, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.home .famband', start: 'top 85%' } });

        gsap.to('#jfill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#jsteps', start: 'top 70%', end: 'bottom 55%', scrub: true } });
        gsap.utils.toArray<HTMLElement>('.home .jstep').forEach((s) => {
          ScrollTrigger.create({ trigger: s, start: 'top 62%', onEnter: () => { s.classList.add('on'); drop(s.querySelector('.n'), 0.03, -0.5); }, onLeaveBack: () => s.classList.remove('on') });
          gsap.from(s, { x: 60, opacity: 0.3, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 90%' } });
        });
        gsap.fromTo('#fph', { yPercent: -10, scale: 1.12 }, { yPercent: 10, scale: 1, ease: 'none', scrollTrigger: { trigger: '.home .fbox', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from('.home .fglass', { y: 90, scale: 0.92, opacity: 0.4, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.home .fbox', start: 'top 75%' } });
      });

      if (!fine) {
        // phones: no mouse, so the coin sways by itself and the promo cards float gently
        gsap.to('#coinTilt', { rotationY: 22, rotationX: -10, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        if (!desk) gsap.utils.toArray<HTMLElement>('.home .promo').forEach((p, i) => gsap.to(p, { y: -10, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      }
      if (fine) {
        const tX = gsap.quickTo('#coinTilt', 'rotationY', { duration: 1, ease: 'power3' });
        const tY = gsap.quickTo('#coinTilt', 'rotationX', { duration: 1, ease: 'power3' });
        const mv = (e: PointerEvent) => { tX((e.clientX / window.innerWidth - 0.5) * 40); tY(-(e.clientY / window.innerHeight - 0.5) * 30); };
        window.addEventListener('pointermove', mv, { passive: true });
        off.push(() => window.removeEventListener('pointermove', mv));

        const bind = (root: ParentNode) => {
          root.querySelectorAll<HTMLElement>('.home .mag:not([data-b])').forEach((b) => {
            b.dataset.b = '1';
            const mx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'elastic.out(1,0.4)' }), my = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'elastic.out(1,0.4)' });
            b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.3); my((e.clientY - r.top - r.height / 2) * 0.4); });
            b.addEventListener('pointerleave', () => { mx(0); my(0); });
          });
          root.querySelectorAll<HTMLElement>('.home .tilt:not([data-b]), .home .rcard:not([data-b])').forEach((c) => {
            c.dataset.b = '1';
            const rX = gsap.quickTo(c, 'rotationX', { duration: 0.6, ease: 'power3' }), rY = gsap.quickTo(c, 'rotationY', { duration: 0.6, ease: 'power3' });
            gsap.set(c, { transformPerspective: 900 });
            c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; c.style.setProperty('--mx', px * 100 + '%'); c.style.setProperty('--my', py * 100 + '%'); rY((px - 0.5) * 10); rX((0.5 - py) * 8); });
            c.addEventListener('pointerleave', () => { rX(0); rY(0); });
          });
        };
        bind(document);
        const mo = new MutationObserver(() => bind(document));
        const g = document.getElementById('sgrid');
        if (g) mo.observe(g, { childList: true });
        off.push(() => mo.disconnect());
      }
    })();
    return () => { dead = true; window.clearTimeout(splash); ctx?.revert(); off.forEach((f) => f()); };
  }, []);
  return null;
}
