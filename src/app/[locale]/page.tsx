import type React from 'react';
import type { Metadata } from 'next';
import '../home.css';
import { FEE_SCHEDULE as F, aed } from '@/lib/fees';
import { isLocale, localizePath, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { SITE, waLink } from '@/lib/site';
import { Eligibility } from '@/components/Eligibility';
import { Icon } from '@/components/Icon';
import { TranslationNotice } from '@/components/TranslationNotice';
import { FaqList, HeroFinder, HomeEffects, HomeLeadForm, PhoneChat, ServicesGrid } from '@/components/HomeClient';
import { getFaqs, getOverrides, getPartners, getTestimonials, getTranslations } from '@/lib/server/content';
import { BlockView } from '@/components/BlockView';
import { Booking } from '@/components/Booking';
import { FlightPath } from '@/components/FlightPath';
import type { Block } from '@/lib/blocks';
import { getBlock, getSecrets } from '@/lib/server/settings';
import { mergeHero, type HomeHero } from '@/lib/home-hero';
import { coinImg } from '@/components/BrandLogo';
import { u } from '@/lib/ui';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const seo = (await getSecrets()).seo;
  const ho = (await getOverrides())['/'] ?? {};
  return pageMetadata(
    '/',
    (isLocale(locale) ? locale : 'en') as Locale,
    ho.seoTitle || seo.homeTitle || 'Abu Dhabi Golden Visa | 10-Year UAE Residency Consultants',
    ho.meta || seo.homeMeta || 'Explore long-term UAE residency through property, business, professional and talent routes. Free eligibility check, cost calculator, family applications and VIP assistance.',
  );
}

const CAP: Record<string, string> = {
  home: '<path d="M4 21V9l8-6 8 6v12M9 21v-6h6v6"/>',
  bag: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  rocket: '<path d="M12 3c3 2 5 5 5 9l-2 4H9l-2-4c0-4 2-7 5-9z"/><circle cx="12" cy="10" r="1.8"/><path d="M9 16l-2 4M15 16l2 4"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/><path d="M22 9v6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  music: '<path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  fam: '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14 20c0-2.6 1.6-4.5 3.5-4.5S21 17.4 21 20"/>',
};

const ROUTES = [
  { tag: 'Property', title: 'Real-estate investors', text: 'Own property in Abu Dhabi worth AED 2 million or more. Ready, off-plan and mortgaged homes can count, as long as your own share is at least AED 2 million.', more: 'See my cost →', calc: 0, icon: 'home', href: '/golden-visa/property-investment/', img: '/images/property.webp' },
  { tag: 'Investment', title: 'Investors', text: 'Keep AED 2 million in a deposit or invest it in a UAE company, or show AED 250,000 or more in tax paid each year for the last two years.', more: 'See my cost →', calc: 1, icon: 'bag', href: '/golden-visa/business-investors/', img: '/images/investor.webp' },
  { tag: 'Business', title: 'Entrepreneurs', text: 'Your idea is approved by a UAE incubator or authority, your company earns AED 1 million a year, or you have sold a business worth AED 7 million or more.', more: 'See my cost →', calc: 2, icon: 'rocket', href: '/golden-visa/entrepreneurs/', gold: true },
  { tag: 'Study', title: 'University graduates', text: "GPA 3.5 or higher from a top UAE university (3.8 for B-class), or 3.5 from one of the world's top 100. Graduated in the last two years.", more: 'See my cost →', calc: 4, icon: 'cap', href: '/golden-visa/students-graduates/', img: '/images/skyline-2.webp' },
  { tag: 'Career', title: 'Skilled professionals', text: "A bachelor's degree, a valid UAE work permit and a monthly salary of AED 30,000 or more. Doctors and scientists have their own tracks.", more: 'See my cost →', calc: 3, icon: 'user', href: '/golden-visa/skilled-professionals/', gold: true },
  { tag: 'Talent', title: 'Creatives & talents', text: 'Artists, writers, musicians, athletes and inventors with recognised work. The Ministry of Culture recommendation for creatives is free.', more: 'Check my case →', icon: 'music', href: '/golden-visa/exceptional-talents/' },
  { tag: 'Humanitarian', title: 'Humanitarian pioneers', text: 'Five years or more with a humanitarian or non-profit organisation, or AED 2 million given to humanitarian work. A university degree is required.', more: 'Check my case →', icon: 'heart', href: '/golden-visa/humanitarian-other/', gold: true },
  { tag: 'Family', title: 'Bring your family', text: 'Sponsor your spouse and children of any age, and your parents with health insurance. Their residency stays valid even if the sponsor passes away.', more: 'Add family to my cost →', calc: 5, icon: 'fam', href: '/family-golden-visa/', img: '/images/family.webp' },
];

const FAQ = [
  { q: 'Who can apply for the Abu Dhabi Golden Visa?', a: 'Property owners and investors with AED 2 million or more, entrepreneurs, outstanding graduates, skilled professionals earning AED 30,000 a month, scientists, doctors, creatives, athletes and humanitarian pioneers. Use the route finder at the top, then we check your documents against the official rules.' },
  { q: 'Can my family join me?', a: 'Yes. You can sponsor your spouse and children of any age, and your parents if you show health insurance. Each person pays their own government fees; children under 18 do not need a medical test.' },
  { q: 'How long is the visa valid?', a: 'Ten years, and it renews as long as you still meet the conditions. You do not need a sponsor, and you can stay outside the UAE for more than six months without losing it.' },
  { q: 'What does it cost?', a: `For a property investor applying inside the UAE, government fees start at ${aed(4728.15)} for the main applicant. Each extra adult adds ${aed(3678.15)} and each child ${aed(3378.15)}. Health insurance and our service fee are quoted separately. Try the calculator for your exact case.` },
  { q: 'Do I need a property valuation certificate?', a: 'Property investors show the value with a registered purchase agreement or a Real Estate Unit Value Certificate from the Department of Municipalities and Transport. If you need one, we request it for you through TAMM.' },
  { q: 'How long does it take?', a: 'It depends on your route, your documents and the authorities. We give you a realistic timeline after checking your file. Nobody can promise a fixed approval time.' },
  { q: 'Is this an official government website?', a: 'No. We are a private consultancy operated by Brightlink Management Consultancy LLC. Visa issuance and eligibility are decided by the competent UAE authorities.' },
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'en') as Locale;
  const lp = (p: string) => localizePath(p, locale);
  const manifesto = 'From the first question to the day your residency is issued, we handle the forms, the fees and the follow-ups. You get one clear price, one advisor, and every update in your own language.';
  const gold = new Set(['clear', 'price,', 'advisor,', 'language.']);
  const manifestoT = u(manifesto, locale);
  const [storedFaqs, reviews, partners, over, tr, heroSaved] = await Promise.all([getFaqs(), getTestimonials(), getPartners(), getOverrides(), getTranslations(), getBlock<Partial<HomeHero>>('home-hero', {})]);
  const H = mergeHero(heroSaved);
  const ho = over['/'] ?? {};
  const hb: Block[] = (locale !== 'en' && tr[locale]?.['/']?.blocks?.length ? tr[locale]['/'].blocks! : ho.blocks) ?? [];
  const show = (k: string) => !(ho.homeHide ?? []).includes(k);
  const at = (k: string) => { const list = hb.filter((b) => (b.style?.place || 'contact') === k); return list.length ? <div className="home-blocks"><BlockView blocks={list} locale={locale} reviews={reviews} /></div> : null; };
  const faqItems = (storedFaqs.length ? storedFaqs.map((f) => ({ q: f.q, a: f.a })) : FAQ).map((f) => ({ q: u(f.q, locale), a: u(f.a, locale) }));
  const example = F.perPerson.visa.aed + F.medical.normal.aed + F.perPerson.emiratesId.aed + F.perPerson.changeOfStatus.aed + F.propertyValuation.aed;

  return (
    <div className="home">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2d27a" /><stop offset=".5" stopColor="#c9961a" /><stop offset="1" stopColor="#7a5200" /></linearGradient></defs>
      </svg>
      <div className="progress" id="progress" aria-hidden="true" />
      <HomeEffects />

      {at('top')}
      {show('hero') && (<>
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="badge glass in-hero"><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" aria-hidden="true"><path d="M5 12l5 5L19 7" /></svg></i>{u(H.badge, locale)}</div>
            <h1>
              <span className="line"><span>{u(H.line1, locale)}</span></span>
              <span className="line"><span>{u(H.line2, locale)}</span></span>
              <span className="line"><span><em className="goldtext">{u(H.gold, locale)}</em></span></span>
            </h1>
            <p className="lead in-hero">{u(H.lead, locale)}</p>
            <div className="cta in-hero">
              <a className="btn btn-gold mag" href={/^https?:/.test(H.btn1Link) ? H.btn1Link : lp(H.btn1Link)}>{u(H.btn1, locale)} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
              <a className="btn btn-glass mag" href={/^https?:/.test(H.btn2Link) ? H.btn2Link : lp(H.btn2Link)} {...(H.btn2Link === '/golden-visa-cost/' ? { 'data-open-calc': '' } : {})}>{u(H.btn2, locale)}</a>
            </div>
            <div className="trust in-hero">{H.trust.map((t) => <span key={t}>{u(t, locale)}</span>)}</div>
            <div className="in-hero"><TranslationNotice locale={locale} /></div>
          </div>
          <div className="hero-art" id="heroArt">
            <div className="orb">
              <span className="ring" /><span className="ring r2" /><span className="ring r3" />
              <div className="orbit" aria-hidden="true">
                {['home', 'briefcase', 'plane', 'family', 'cap', 'shield'].map((ic, k) => (
                  <span key={ic} className="ob" style={{ ['--k' as string]: k } as React.CSSProperties}><span className="ob-in"><Icon name={ic} size={20} /></span></span>
                ))}
              </div>
              <div className="lens" />
              <div className="coin-stage" id="coinStage" style={{ position: 'absolute', inset: '13%', width: 'auto', aspectRatio: 'auto', placeSelf: 'stretch' }}>
                <div className="coin-shadow" />
                <div className="coin-scroll" id="coinScroll">
                  <div className="coin-tilt" id="coinTilt">
                    <div className="coin" id="coin">
                      <div className="edge-stack">
                        {Array.from({ length: 14 }, (_, i) => <div key={i} className="edge" style={{ transform: `translateZ(${(-12 + (i * 24) / 13).toFixed(2)}px)` }} />)}
                      </div>
                      <div className="face front"><img decoding="async" src={coinImg()} alt="Abu Dhabi Golden Visa coin" width={420} height={420} fetchPriority="high" /></div>
                      <div className="face back"><img decoding="async" src={coinImg()} alt="" width={420} height={420} /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="float-card glass wa in-hero"><div className="k"><span className="live" />{u("Quote on WhatsApp", locale)}</div><div className="v">{u("Free written quote from our team", locale)}</div></div>
            <HeroFinder locale={locale} />
          </div>
        </div>
      </section>
      </>)}
      {at('hero')}

      {show('band') && (<>
      {/* GIANT BAND */}
      <div className="band" aria-hidden="true">
        <div className="band-row" id="band"><span>{u("Abu Dhabi", locale)}</span><span className="f">✦</span><span>{u("Golden Visa", locale)}</span><span className="f">✦</span><span>{u("Abu Dhabi", locale)}</span><span className="f">✦</span><span>{u("Golden Visa", locale)}</span><span className="f">✦</span><span>{u("Abu Dhabi", locale)}</span></div>
      </div>
      </>)}
      {at('band')}

      {show('manifesto') && (<>
      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="wrap mgrid">
          <div>
            <div className="eyebrow" style={{ marginBottom: 22 }}>{u("Why we exist", locale)}</div>
            <p id="manifesto">{manifestoT.split(' ').map((w, i) => <span key={i}><span className={`w${gold.has(w) ? ' gold goldtext' : ''}`}>{w}</span>{' '}</span>)}</p>
            <div className="sig"><img decoding="async" src={coinImg()} alt="" width={52} height={52} />{u("Brightlink Management Consultancy · Abu Dhabi Golden Visa", locale)}</div>
          </div>
          <div className="promos">
            <a className="promo p1" href="#contact-form" data-view=""><div className="im" /><div className="pb"><small>{u("Free eligibility check", locale)}</small><b>{u("Know your route today", locale)}</b><span>{u("Send your details and get a written answer on your eligibility.", locale)}</span><em>{u("Start my free check →", locale)}</em></div></a>
            <a className="promo p2" href={lp('/family-golden-visa/')} data-view=""><div className="im" /><div className="pb"><small>{u("Family", locale)}</small><b>{u("Bring your family with you", locale)}</b></div></a>
          </div>
        </div>
      </section>
      </>)}
      {at('manifesto')}

      {show('routes') && (<>
      {/* ROUTES */}
      <section className="routes" id="routes">
        <div className="wrap routes-head">
          <div><div className="eyebrow">{u("Which route is yours?", locale)}</div><h2 style={{ marginTop: 14 }}>{u("One visa.", locale)}<br /><span className="goldtext">{u("Several ways in.", locale)}</span></h2></div>
          <p>{u("All routes give a 10-year residency that renews while you still qualify, with no sponsor needed. Pick the one closest to you and we check the rest.", locale)}</p>
        </div>
        <div className="wrap">
          <div className="track" id="track">
            {ROUTES.map((r) => (
              <article key={u(r.title, locale)} className={`rcard${r.gold ? ' gold-card' : ''}`} data-view="">
                {'img' in r && r.img
                  ? <div className="ph" style={{ backgroundImage: `url(${r.img})` }} role="img" aria-label={u(r.title, locale)} />
                  : <div className="cap"><svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: CAP[r.icon] }} /></div>}
                <div className="spot" /><span className="tag">{u(r.tag, locale)}</span>
                <div className="body">
                  <h3><a href={lp(r.href)} style={{ color: 'inherit', textDecoration: 'none' }}>{u(r.title, locale)}</a></h3>
                  <p>{u(r.text, locale)}</p>
                  {r.calc !== undefined
                    ? <a className="more" href={lp('/golden-visa-cost/')} data-open-calc="" data-route={r.calc}>{u(r.more, locale)}</a>
                    : <a className="more" href="#contact-form">{u(r.more, locale)}</a>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      </>)}
      {at('routes')}

      {show('eligibility') && (<>
      {/* ELIGIBILITY CHECKER (spec) */}
      <section className="elig" id="eligibility">
        <div className="wrap">
          <div className="routes-head">
            <div><div className="eyebrow">{u("Eligibility checker", locale)}</div><h2 style={{ marginTop: 14 }}>{u("See if you may qualify,", locale)} <em className="goldtext">{u("in a minute.", locale)}</em></h2></div>
            <p>{u("A first screening only. The competent authorities make the final decision.", locale)}</p>
          </div>
          <div style={{ marginTop: 36 }}><Eligibility /></div>
        </div>
      </section>
      </>)}
      {at('eligibility')}

      {show('services') && (<>
      {/* SERVICES */}
      <section className="services" id="services">
        <div className="wrap">
          <div className="routes-head">
            <div><div className="eyebrow">{u("Our services", locale)}</div><h2 style={{ marginTop: 14 }}>{u("Every visa your", locale)} <em className="goldtext">{u("family needs.", locale)}</em></h2></div>
            <p>{u("Visas, attestation, employment, property and more. Hover any card for the details.", locale)}</p>
          </div>
          <ServicesGrid locale={locale} />
        </div>
      </section>
      </>)}
      {at('services')}

      {show('journey') && (<>
      {/* JOURNEY */}
      <section className="journey" id="journey">
        <div className="wrap jgrid">
          <div className="jsticky">
            <div className="eyebrow">{u("How it works", locale)}</div>
            <h2 style={{ marginTop: 14 }}>{u("Five stages.", locale)}<br /><span className="goldtext">{u("Zero guesswork.", locale)}</span></h2>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '38ch', marginTop: 18 }}>{u("The gold line fills as you scroll. Your real file moves the same way in your client portal, with a WhatsApp message at every step.", locale)}</p>
            <figure className="simg" style={{ marginInline: 0 }}><div className="im par woman" /><figcaption>{u("From your first question to your residency", locale)}</figcaption></figure>
          </div>
          <div className="jsteps" id="jsteps">
            <div className="jrail"><div className="jfill" id="jfill" /></div>
            <div className="jstep glass"><span className="n">1</span><h3>{u("Free eligibility check", locale)}</h3><p>{u("We confirm your route and send a written quote with government fees and our fee listed separately.", locale)}</p></div>
            <div className="jstep glass"><span className="n">2</span><h3>{u("Documents and attestation", locale)}</h3><p>{u("Certificates attested, translated and checked before anything is filed. Upload from your phone.", locale)}</p></div>
            <div className="jstep glass"><span className="n">3</span><h3>{u("Nomination", locale)}</h3><p>{u("Your Golden Visa file is submitted through the Abu Dhabi channel for your route.", locale)}</p></div>
            <div className="jstep glass"><span className="n">4</span><h3>{u("Entry permit or change of status", locale)}</h3><p>{u("From abroad you receive an entry permit; inside the UAE we change your status.", locale)}</p></div>
            <div className="jstep glass"><span className="n">5</span><h3>{u("Medical, Emirates ID and residence", locale)}</h3><p>{u("We book both appointments and follow your file until your residency is issued, with live updates in your portal.", locale)}</p></div>
            <a className="btn btn-glass mag" href={lp('/how-to-apply/')} style={{ alignSelf: 'flex-start' }}>{u("See the full 10-step process", locale)}</a>
          </div>
        </div>
      </section>
      </>)}
      {at('journey')}

      {show('flight') && (<section className="home-flight"><div className="wrap"><FlightPath locale={locale} /></div></section>)}
      {at('flight')}

      {show('portal') && (<>
      {/* PORTAL */}
      <section className="portal" id="portal">
        <div className="wrap pgrid">
          <div>
            <div className="eyebrow">{u("Client portal", locale)}</div>
            <h2 style={{ marginTop: 14 }}>{u("Your whole file,", locale)}<br /><em className="goldtext">{u("live in your pocket.", locale)}</em></h2>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '44ch', marginTop: 18 }}>{u("Quotes, payments, documents and every status change in one place. We send a secure link on WhatsApp, so you can check your file without a password.", locale)}</p>
            <div className="pfeat">
              <div className="glass"><b>{u("Quotes", locale)}</b>{u("Accept and pay by card in one tap.", locale)}</div>
              <div className="glass"><b>{u("Documents", locale)}</b>{u("Upload from your phone, download when ready.", locale)}</div>
              <div className="glass"><b>{u("Live status", locale)}</b>{u("See each step and its expected date.", locale)}</div>
              <div className="glass"><b>{u("Receipts", locale)}</b>{u("Every payment receipt sent to you.", locale)}</div>
            </div>
            <a className="btn btn-gold mag" href={`https://${process.env.PORTAL_HOST || 'app.abudhabigoldenvisa.com'}/`} style={{ marginTop: 28 }}>{u("Open my portal", locale)}</a>
          </div>
          <PhoneChat />
        </div>
      </section>
      </>)}
      {at('portal')}

      {show('calculator') && (<>
      {/* CALCULATOR */}
      <section className="calc" id="calculator">
        <div className="wrap">
          <div className="cbox glass">
            <div>
              <div className="eyebrow">{u("Cost calculator · official government fees", locale)}</div>
              <h2 style={{ marginTop: 14, fontSize: 'clamp(30px,3.6vw,50px)' }}>{u("Know the full cost", locale)} <em className="goldtext">{u("before you start.", locale)}</em></h2>
              <p style={{ color: 'var(--ink-soft)', margin: '14px 0 0', maxWidth: '44ch' }}>{u("Answer a few quick questions and see every government fee for you and your family, person by person. Send it to WhatsApp in one tap.", locale)}</p>
              <div className="calc-launch">
                {[[0, CAP.home, 'Property investor', 'AED 2M+ in Abu Dhabi'], [1, CAP.bag, 'Investor', 'Deposit or company'], [5, CAP.fam, 'Family member', 'Joining a holder']].map(([r, path, t, d]) => (
                  <button key={t} className="wopt" type="button" data-open-calc="" data-route={r}>
                    <span className="wi"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" dangerouslySetInnerHTML={{ __html: String(path) }} /></span>
                    <span><b>{u(t, locale)}</b><small>{u(d, locale)}</small></span>
                  </button>
                ))}
              </div>
              <button className="btn btn-gold mag" type="button" data-open-calc="" style={{ marginTop: 16 }}>{u("Open the full calculator", locale)}</button>
            </div>
            <div className="receipt">
              <div className="eyebrow">{u("Example · property investor inside the UAE", locale)}</div>
              <div className="from"><b className="goldtext">{aed(example)}</b><span style={{ color: 'var(--ink-soft)' }}>{u("main applicant", locale)}</span></div>
              <div className="rows">
                <div><span>{u("Immigration & visa", locale)}</span><b>{F.perPerson.visa.aed.toFixed(2)}</b></div>
                <div><span>{u("Medical test (normal)", locale)}</span><b>{F.medical.normal.aed.toFixed(2)}</b></div>
                <div><span>{u("Emirates ID, 10 years", locale)}</span><b>{F.perPerson.emiratesId.aed.toFixed(2)}</b></div>
                <div><span>{u("Change of status (inside the UAE)", locale)}</span><b>{F.perPerson.changeOfStatus.aed.toFixed(2)}</b></div>
                <div><span>{u("Property value certificate", locale)}</span><b>{F.propertyValuation.aed.toFixed(2)}</b></div>
              </div>
              <p className="small">Government fees in AED, schedule dated {F.date}. Health insurance and our service fee are quoted separately. Fees can change; we confirm the final amount before you pay.</p>
            </div>
          </div>
        </div>
      </section>
      </>)}
      {at('calculator')}

      {show('family') && (<>
      {/* FAMILY (spec) */}
      <section className="famband">
        <div className="wrap">
          <div className="fb">
            <div>
              <div className="eyebrow">{u("Golden Visa for your family", locale)}</div>
              <h2 style={{ marginTop: 14 }}>{u("Bring the people", locale)} <em className="goldtext">{u("who matter most.", locale)}</em></h2>
              <p style={{ color: 'var(--ink-soft)', marginTop: 16, maxWidth: '44ch' }}>{u("We handle relationship documents, attestation, medical and Emirates ID for your whole family in one file.", locale)}</p>
              <div className="cta">
                <a className="btn btn-gold mag" href={lp('/family-golden-visa/')}>{u("Family Golden Visa", locale)}</a>
                <button className="btn btn-glass mag" type="button" data-open-calc="" data-route="5">{u("Add family to my cost", locale)}</button>
              </div>
            </div>
            <div className="fb-r">
            <figure className="fb-photo"><img decoding="async" loading="lazy" src="/images/family-2.webp" alt="Family together in Abu Dhabi" width={900} height={864} /><figcaption>{u("One sponsor file for the whole family", locale)}</figcaption></figure>
            <ul>
              <li>{u("Spouse and children of any age, including sons over 25 and married daughters", locale)}</li>
              <li>{u("Parents with health insurance and proof of relationship", locale)}</li>
              <li>{u("No medical test for children under 18", locale)}</li>
              <li>{u("One sponsor file for the whole family", locale)}</li>
              <li>{u("Family residency stays valid for its term if the holder passes away", locale)}</li>
            </ul>
            </div>
          </div>
        </div>
      </section>
      </>)}
      {at('family')}

      {show('why') && (<>
      {/* WHY */}
      <section className="why">
        <div className="wrap">
          <div className="eyebrow">{u("Why clients choose us", locale)}</div>
          <h2 style={{ marginTop: 14 }}>{u("Clear. Fast.", locale)} <em className="goldtext">{u("In your language.", locale)}</em></h2>
          <div className="wgrid">
            <div className="wcard glass tilt"><span className="num">20</span><div><h3>{u("Languages", locale)}</h3><p>{u("From Arabic and Urdu to Chinese and Portuguese, the whole site and your updates.", locale)}</p></div></div>
            <div className="wcard glass tilt"><span className="num">10</span><div><h3>{u("Currencies", locale)}</h3><p>{u("Every estimate shown in your currency. Government fees are paid in AED.", locale)}</p></div></div>
            <div className="wcard glass tilt"><span className="num">1</span><div><h3>{u("Price, up front", locale)}</h3><p>{u("Government fees and our fee listed separately, before you pay anything.", locale)}</p></div></div>
            <div className="wcard glass tilt"><span className="num">24/7</span><div><h3>{u("File tracking", locale)}</h3><p>{u("Check your status any time in the portal, with WhatsApp updates at each step.", locale)}</p></div></div>
          </div>
        </div>
      </section>
      </>)}
      {at('why')}

      {show('partners') && (<>
      {partners.length > 0 && (
        <section className="partners">
          <div className="wrap">
            <div className="eyebrow" style={{ textAlign: 'center' }}>{u("Trusted partners", locale)}</div>
            <div className="plogos">{partners.map((p) => (p.link ? <a key={p.id} href={p.link} target="_blank" rel="noopener"><img decoding="async" src={p.logo} alt={p.name} loading="lazy" /></a> : <img decoding="async" key={p.id} src={p.logo} alt={p.name} loading="lazy" />))}</div>
          </div>
        </section>
      )}
      </>)}
      {at('partners')}

      {show('benefits') && (<>
      {/* BENEFITS (spec) */}
      <section className="benefits">
        <div className="wrap">
          <div className="eyebrow">{u("Golden Visa benefits", locale)}</div>
          <h2 style={{ marginTop: 14 }}>{u("Long-term security,", locale)} <em className="goldtext">{u("real freedom.", locale)}</em></h2>
          <div className="wgrid">
            {[
              ['calendar', 'Up to 10 years', 'Renewable while you still meet the conditions.'],
              ['user', 'No sponsor needed', 'Change jobs or start a business freely.'],
              ['plane', 'No six-month rule', 'Stay outside the UAE for long periods without losing residency.'],
              ['family', 'Family sponsorship', 'Spouse, children of any age and parents.'],
              ['users', 'Domestic workers', 'Sponsor household staff, subject to UAE rules.'],
              ['heart', 'Family continuity', 'Family residency stays valid if the holder passes away.'],
            ].map(([ic, t, d]) => (
              <div className="wcard glass tilt" key={t}><span className="bi"><Icon name={ic} /></span><div><h3>{u(t, locale)}</h3><p>{u(d, locale)}</p></div></div>
            ))}
          </div>
        </div>
      </section>
      </>)}
      {at('benefits')}

      {show('faq') && (<>
      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="wrap fqgrid">
          <div>
            <div className="eyebrow">{u("Questions", locale)}</div>
            <h2 style={{ marginTop: 14 }}>{u("Asked", locale)} <em className="goldtext">{u("every day.", locale)}</em></h2>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '36ch', marginTop: 16 }}>{u("Can't find your answer? Send it to us on WhatsApp and an advisor replies in your language.", locale)}</p>
            <a className="seeall" href={lp('/faqs/')}>{u("See all questions →", locale)}</a>
            <figure className="simg white" style={{ marginInline: 0 }}><div className="im par coin" /><figcaption>{u("Advisors who speak your language", locale)}</figcaption></figure>
          </div>
          <FaqList items={faqItems} />
        </div>
      </section>
      </>)}
      {at('faq')}

      {show('guides') && (<>
      {/* GUIDES (spec) */}
      <section className="guides">
        <div className="wrap">
          <div className="routes-head">
            <div><div className="eyebrow">{u("Guides and insights", locale)}</div><h2 style={{ marginTop: 14 }}>{u("Start", locale)} <em className="goldtext">{u("here.", locale)}</em></h2></div>
            <a className="btn btn-glass mag" href={lp('/blog/')}>{u("All guides", locale)}</a>
          </div>
          <div className="wgrid">
            {[
              ['How to apply, step by step', 'The 10 steps from eligibility to Emirates ID.', '/how-to-apply/'],
              ['Abu Dhabi Golden Visa cost', 'Government fees for you and your family.', '/golden-visa-cost/'],
              ['Golden Visa through property', 'AED 2 million, off-plan and mortgages explained.', '/golden-visa/property-investment/'],
              ['Requirements & documents', 'What to prepare for each route.', '/requirements-documents/'],
            ].map(([t, d, h]) => (
              <a key={h} className="gcard glass tilt" href={lp(h)}><div className="eyebrow">{u("Guide", locale)}</div><h3>{u(t, locale)}</h3><p>{u(d, locale)}</p><span className="go">{u("Read →", locale)}</span></a>
            ))}
          </div>
        </div>
      </section>
      </>)}
      {at('guides')}

      {show('reviews') && (<>
      {reviews.length > 0 && (
        <section className="reviews">
          <div className="wrap">
            <div className="eyebrow">{u("Client stories", locale)}</div>
            <h2 style={{ marginTop: 14 }}>{u("In their", locale)} <em className="goldtext">{u("own words.", locale)}</em></h2>
            <div className="wgrid">
              {reviews.slice(0, 6).map((r) => (
                <figure key={r.id} className="wcard glass tilt" style={{ margin: 0 }}>
                  <span aria-label={`${r.rating} out of 5`} style={{ color: 'var(--gold)', letterSpacing: 2 }}>{'★'.repeat(Math.max(1, Math.min(5, r.rating)))}</span>
                  <blockquote style={{ margin: 0, fontSize: 15.5 }}>“{u(r.text, locale)}”</blockquote>
                  <figcaption><b>{r.name}</b>{r.country && <span className="small" style={{ color: 'var(--ink-soft)' }}> · {r.country}</span>}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
      </>)}
      {at('reviews')}

      {show('contact') && (<>
      {/* CONTACT */}
      <section className="contact" id="contact-form">
        <div className="wrap">
          <div className="cgrid glass">
            <div>
              <div className="eyebrow">{u("Free quote", locale)}</div>
              <h2 style={{ marginTop: 14, fontSize: 'clamp(34px,4vw,58px)' }}>{u("Tell us about you.", locale)} <em className="goldtext">{u("We do the rest.", locale)}</em></h2>
              <HomeLeadForm />
            </div>
            <div className="office">
              <figure className="simg white" style={{ margin: '0 0 6px', maxWidth: 'none', aspectRatio: '16/9' }}><div className="im par logo" /><figcaption>{u("Abu Dhabi Golden Visa advisors", locale)}</figcaption></figure>
              <div className="row"><i><Icon name="wa" /></i><div><b>{u("WhatsApp and phone", locale)}</b><span><a href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener">{SITE.whatsappDisplay}</a></span></div></div>
              <div className="row"><i><Icon name="mail" /></i><div><b>{u("Email", locale)}</b><span><a href={`mailto:${SITE.email}`}>{SITE.email}</a></span></div></div>
              <div className="row"><i><Icon name="pin" /></i><div><b>{u("Office", locale)}</b><span>{SITE.office}</span></div></div>
              <div className="row"><i><Icon name="shield" /></i><div><b>{u("Licensed operator", locale)}</b><span>{SITE.operator}, Trade Licence {SITE.licence}</span></div></div>
            </div>
          </div>
        </div>
      </section>
      </>)}
      {at('contact')}

      {show('booking') && (<section className="home-booking" id="book"><div className="wrap"><Booking locale={locale} /></div></section>)}
      {at('booking')}

      {show('finale') && (<>
      {/* FINALE */}
      <section className="finale" id="contact">
        <div className="wrap">
          <div className="fbox">
            <div className="ph" id="fph" />
            <div className="fglass">
              <h2 style={{ fontSize: 'clamp(30px,4.2vw,58px)' }}>{u("Ready when you are.", locale)}<br /><span className="goldtext">{u("Golden for years to come.", locale)}</span></h2>
              <p>{u("Talk to an advisor in your language, on WhatsApp, by phone, or at our office.", locale)}</p>
              <div className="cta">
                <a className="btn btn-gold mag" href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener">{u("Chat on WhatsApp", locale)}</a>
                <a className="btn btn-glass mag" href={lp('/free-consultation/')}>{u("Book a call", locale)}</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      </>)}
      {at('finale')}

      {ho.css && <style dangerouslySetInnerHTML={{ __html: ho.css.replace(/<\/?style/gi, '') }} />}
    </div>
  );
}
