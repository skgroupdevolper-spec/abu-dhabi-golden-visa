import type { Metadata } from 'next';
import { FAQS } from '@/content/faqs';
import { FEE_SCHEDULE as F, aed } from '@/lib/fees';
import { isLocale, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { SITE, waLink } from '@/lib/site';
import { Eligibility } from '@/components/Eligibility';
import { LeadForm } from '@/components/LeadForm';
import { Icon } from '@/components/Icon';
import { L } from '@/components/L';
import { TranslationNotice } from '@/components/TranslationNotice';
import { HomeEffects, PhoneChat, RouteFinder, ServicesGrid, type Svc } from '@/components/HomeClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(
    '/',
    (isLocale(locale) ? locale : 'en') as Locale,
    'Abu Dhabi Golden Visa | 10-Year UAE Residency Consultants',
    'Explore long-term UAE residency through property, business, professional and talent routes. Free eligibility check, cost calculator and family applications.',
  );
}

const PATHWAYS = [
  { title: 'Property investors', text: 'Own Abu Dhabi property worth AED 2 million or more. Ready, off-plan and mortgaged homes can count when your own share is AED 2 million.', href: '/golden-visa/property-investment/', icon: 'home', tag: 'Property', gold: false },
  { title: 'Business owners & investors', text: 'An AED 2 million deposit or company stake, or AED 250,000 in tax paid each year for two years.', href: '/golden-visa/business-investors/', icon: 'briefcase', tag: 'Investment', gold: true },
  { title: 'Skilled professionals', text: 'A bachelor’s degree, a valid UAE work permit and a monthly salary of AED 30,000 or more.', href: '/golden-visa/skilled-professionals/', icon: 'user', tag: 'Career', gold: false },
  { title: 'Exceptional talents', text: 'Artists, writers, musicians, athletes, inventors and scientists with recognised work and a recommendation.', href: '/golden-visa/exceptional-talents/', icon: 'star', tag: 'Talent', gold: true },
  { title: 'Outstanding students', text: 'GPA 3.5 or higher from a top UAE university (3.8 for B-class) or a world top-100 university, graduated in the last two years.', href: '/golden-visa/students-graduates/', icon: 'cap', tag: 'Study', gold: false },
  { title: 'Your family', text: 'Sponsor your spouse and children of any age, and your parents with health insurance, on the same long-term terms.', href: '/family-golden-visa/', icon: 'family', tag: 'Family', gold: true },
];

const SERVICES: Svc[] = [
  { title: 'Golden Visa application', text: 'Eligibility review, nomination, entry permit or status change, medical, Emirates ID and residence.', href: '/golden-visa/', icon: 'star' },
  { title: 'Valuation certificate', text: 'Official value of your Abu Dhabi property from the Department of Municipalities and Transport, in about 3 working days.', href: '/document-services/valuation-certificate/', icon: 'home' },
  { title: 'Family Golden Visa', text: 'Spouse, children of any age, parents and newborns added to your residency.', href: '/family-golden-visa/', icon: 'family' },
  { title: 'Golden Visa renewal', text: 'Renew on time, together with your family’s residency.', href: '/services/golden-visa-renewal/', icon: 'shield' },
  { title: 'Emirates ID services', text: 'New, renewal, replacement, biometrics and delivery.', href: '/services/emirates-id/', icon: 'user' },
  { title: 'Medical & biometrics', text: 'Normal and VIP medical bookings and Emirates ID biometrics.', href: '/services/medical-biometrics/', icon: 'stetho' },
  { title: 'Entry permit & status change', text: 'From abroad or inside the UAE, without leaving the country.', href: '/services/entry-permit-status-change/', icon: 'plane' },
  { title: 'Health insurance', text: 'Required cover for you and every family member.', href: '/services/health-insurance/', icon: 'heart' },
  { title: 'Visa cancellation', text: 'Golden Visa and dependant cancellations, done properly.', href: '/services/visa-cancellation/', icon: 'close' },
  { title: 'MOFA attestation', text: 'Personal, educational and commercial documents for UAE use.', href: '/document-services/mofa-attestation/', icon: 'doc' },
  { title: 'Legal translation', text: 'Certified Arabic translation of immigration documents.', href: '/document-services/legal-translation/', icon: 'globe' },
  { title: 'Degree attestation', text: 'Attestation and Ministry of Education equivalency.', href: '/document-services/degree-attestation/', icon: 'cap' },
  { title: 'Marriage & birth certificates', text: 'Attested proof of relationship for family sponsorship.', href: '/document-services/marriage-certificate/', icon: 'heart' },
  { title: 'Property documentation', text: 'Title deed, developer NOC and bank NOC for the property route.', href: '/document-services/property-documentation/', icon: 'folder' },
  { title: 'Document legalisation', text: 'Consulate and MOFA legalisation.', href: '/document-services/document-legalisation/', icon: 'doc' },
  { title: 'Retirement visa', text: 'A renewable 5-year visa for eligible retirees.', href: '/retirement-visa/', icon: 'clock' },
  { title: 'Remote work visa', text: 'Live in the UAE while working for a company abroad.', href: '/remote-work-visa/', icon: 'globe' },
];

const STEPS = [
  { title: 'Free eligibility check', text: 'We review your route and documents, then send a written quote.' },
  { title: 'Documents and attestation', text: 'Certificates attested, translated and checked before anything is filed.' },
  { title: 'Nomination', text: 'Your Golden Visa nomination is filed through the Abu Dhabi channel for your route.' },
  { title: 'Entry permit or status change', text: 'From abroad you receive an entry permit; inside the UAE we change your status.' },
  { title: 'Medical, Emirates ID and residence', text: 'We book the medical and biometrics and follow your file until your residency is issued.' },
];

const MANIFESTO = 'From the first question to the day your residency is issued, we handle the forms, the fees and the follow-ups. You get one clear price, one advisor, and every update in your own language.';
const GOLD_WORDS = new Set(['clear', 'price,', 'advisor,', 'language.']);

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'en') as Locale;
  const example = F.perPerson.visa.aed + F.medical.normal.aed + F.perPerson.emiratesId.aed + F.perPerson.changeOfStatus.aed + F.propertyValuation.aed;

  return (
    <>
      <HomeEffects />

      {/* 1. Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="badge glass"><i><Icon name="check" size={13} /></i>Abu Dhabi Golden Visa · Long-term UAE residency</span>
            <h1>Your Future in Abu Dhabi <em className="gold">Starts With a Golden Visa</em></h1>
            <p className="lead">Explore long-term UAE residency through property investment, business ownership, professional achievements and exceptional talent. From eligibility assessment to Emirates ID issuance, our specialists guide you through every stage.</p>
            <div className="cta">
              <L locale={locale} href="/visa-check/" className="btn btn-red">Check My Eligibility <Icon name="arrow" size={18} className="arrow" /></L>
              <L locale={locale} href="/golden-visa-cost/" className="btn btn-glass">Calculate Visa Cost</L>
            </div>
            <div className="trust"><span>Free Initial Consultation</span><span>Family Applications</span><span>VIP Assistance</span></div>
            <TranslationNotice locale={locale} />
          </div>
          <div className="hero-art with-finder">
            <div className="hero-stage">
              <span className="ring" /><span className="ring r2" /><span className="ring r3" />
              <div className="orb" />
              <img className="woman" src="/images/hero-woman.webp" alt="A client holding her UAE Golden Visa" width={400} height={464} fetchPriority="high" />
              <div className="coin-wrap" aria-hidden="true">
                <div className="coin">
                  {Array.from({ length: 10 }, (_, i) => <div key={i} className="edge" style={{ transform: `translateZ(${-8 + (i * 16) / 9}px)` }} />)}
                  <div className="face front"><img src="/brand/coin.webp" alt="" /></div>
                  <div className="face back"><img src="/brand/coin.webp" alt="" /></div>
                </div>
              </div>
              <div className="float-card glass fc-a"><div className="k"><span className="live" />Quote on WhatsApp</div><div className="v">Free written quote from our team</div></div>
            </div>
            <RouteFinder locale={locale} />
          </div>
        </div>
      </section>

      <div className="band" aria-hidden="true">
        <div className="band-row"><span>Abu Dhabi</span><span className="f">✦</span><span>Golden Visa</span><span className="f">✦</span><span>Abu Dhabi</span><span className="f">✦</span><span>Golden Visa</span></div>
      </div>

      {/* Story + promotions */}
      <section className="section manifesto">
        <div className="wrap mgrid">
          <div>
            <p className="eyebrow" style={{ marginBottom: 20 }}>Why we exist</p>
            <p className="big">{MANIFESTO.split(' ').map((w, i) => <span key={i} className={`w${GOLD_WORDS.has(w) ? ' g' : ''}`}>{w} </span>)}</p>
            <div className="sig"><img src="/brand/coin.webp" alt="" width={48} height={48} />{SITE.operator} · {SITE.name}</div>
          </div>
          <div className="promos">
            <L locale={locale} href="/visa-check/" className="promo p1">
              <img src="/images/hero-woman.webp" alt="" width={360} height={418} loading="lazy" />
              <span className="pb"><small>Free eligibility check</small><b>Know your route today</b><span>Get a written answer on your eligibility.</span><em>Start my free check →</em></span>
            </L>
            <L locale={locale} href="/family-golden-visa/" className="promo p2">
              <img src="/brand/coin.webp" alt="" width={170} height={170} loading="lazy" />
              <span className="pb"><small>Family</small><b>Bring your family with you</b></span>
            </L>
          </div>
        </div>
      </section>

      {/* 2. Pathway cards */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head" data-reveal>
            <div><p className="eyebrow">Golden Visa pathways</p><h2 style={{ marginTop: 12 }}>One visa. <em className="gold">Six ways in.</em></h2></div>
            <p>Every route gives up to 10 years of residency that renews while you qualify, with no sponsor needed.</p>
          </div>
          <div className="grid three">
            {PATHWAYS.map((p) => (
              <L key={p.href} locale={locale} href={p.href} className={`route${p.gold ? ' gold' : ''}`}>
                <span className="tag">{p.tag}</span>
                <span className="big-ico"><Icon name={p.icon} size={120} /></span>
                <span className="body"><h3>{p.title}</h3><p>{p.text}</p><span className="more">See requirements →</span></span>
              </L>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why choose us */}
      <section className="section">
        <div className="wrap">
          <div className="head" data-reveal><div><p className="eyebrow">Why choose our consultancy</p><h2 style={{ marginTop: 12 }}>Clear. Complete. <em className="gold">In your language.</em></h2></div></div>
          <div className="grid">
            {[
              ['20', 'Languages', 'From Arabic and Urdu to Chinese and Portuguese, the site and your updates.'],
              ['10', 'Currencies', 'Estimates in your currency. Government fees are paid in AED.'],
              ['1', 'Written price', 'Government fees and our fee listed separately, before you pay.'],
              ['0', 'Guesswork', 'Documents checked before filing, and every step followed on WhatsApp.'],
            ].map(([n, t, d]) => (
              <div className="card glass" key={t} data-reveal><span className="num">{n}</span><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Eligibility checker */}
      <section className="section" id="eligibility">
        <div className="wrap">
          <div className="head" data-reveal><div><p className="eyebrow">Eligibility checker</p><h2 style={{ marginTop: 12 }}>See if you may qualify, <em className="gold">in a minute.</em></h2></div><p>A first screening only. The competent authorities make the final decision.</p></div>
          <Eligibility />
        </div>
      </section>

      {/* 5. Five-stage process */}
      <section className="section">
        <div className="wrap journey">
          <div className="jsticky" data-reveal>
            <p className="eyebrow">Application process</p>
            <h2 style={{ marginTop: 12 }}>Five stages. <em className="gold">Zero guesswork.</em></h2>
            <p className="lead" style={{ marginTop: 16 }}>The order changes with your route and whether you are already in the UAE.</p>
            <L locale={locale} href="/how-to-apply/" className="btn btn-glass" style={{ marginTop: 22 }}>See all 10 steps</L>
          </div>
          <div className="jsteps">
            <div className="jrail"><div className="jfill" /></div>
            {STEPS.map((s, i) => (
              <div className="jstep glass" key={s.title}><span className="n">{i + 1}</span><h3>{s.title}</h3><p>{s.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Cost calculator preview */}
      <section className="section">
        <div className="wrap">
          <div className="calc-teaser glass" data-reveal>
            <div>
              <p className="eyebrow">Cost calculator · official government fees</p>
              <h2 style={{ marginTop: 12, fontSize: 'clamp(30px,3.6vw,50px)' }}>Know the full cost <em className="gold">before you start.</em></h2>
              <p className="lead" style={{ marginTop: 14 }}>Every government fee for you and your family, person by person. Send it to WhatsApp in one tap.</p>
              <div className="opts two" style={{ marginTop: 22 }}>
                {[['home', 'Property investor', 'AED 2M+ in Abu Dhabi'], ['briefcase', 'Investor', 'Deposit or company'], ['user', 'Professional', 'AED 30,000+ salary'], ['family', 'Family member', 'Joining a holder']].map(([ic, t, d]) => (
                  <L key={t} locale={locale} href="/golden-visa-cost/" className="opt" style={{ textDecoration: 'none' }}>
                    <span className="oi"><Icon name={ic} /></span><span><b>{t}</b><small>{d}</small></span>
                  </L>
                ))}
              </div>
              <L locale={locale} href="/golden-visa-cost/" className="btn btn-gold" style={{ marginTop: 18 }}>Open the full calculator</L>
            </div>
            <div className="receipt">
              <p className="eyebrow">Example · property investor inside the UAE</p>
              <div className="from"><b className="goldtext">{aed(example)}</b><span className="muted">main applicant</span></div>
              <div className="rows">
                <div><span>{F.perPerson.visa.label}</span><b>{F.perPerson.visa.aed.toFixed(2)}</b></div>
                <div><span>{F.medical.normal.label}</span><b>{F.medical.normal.aed.toFixed(2)}</b></div>
                <div><span>{F.perPerson.emiratesId.label}</span><b>{F.perPerson.emiratesId.aed.toFixed(2)}</b></div>
                <div><span>{F.perPerson.changeOfStatus.label}</span><b>{F.perPerson.changeOfStatus.aed.toFixed(2)}</b></div>
                <div><span>{F.propertyValuation.label}</span><b>{F.propertyValuation.aed.toFixed(2)}</b></div>
              </div>
              <p className="note">Government fees in AED, schedule dated {F.date}. Health insurance and our consultancy fee are quoted separately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Golden Visa for your family */}
      <section className="section">
        <div className="wrap">
          <div className="family" data-reveal>
            <div>
              <p className="eyebrow">Golden Visa for your family</p>
              <h2 style={{ marginTop: 12 }}>Bring the people <em className="gold">who matter most.</em></h2>
              <p style={{ marginTop: 14, opacity: 0.85 }}>We handle relationship documents, attestation, medical and Emirates ID for your whole family in one file.</p>
              <div className="cta"><L locale={locale} href="/family-golden-visa/" className="btn btn-gold">Family Golden Visa</L><L locale={locale} href="/golden-visa-cost/" className="btn btn-glass">Add family to my cost</L></div>
            </div>
            <ul className="ticks">
              <li>Spouse and children of any age, including sons over 25 and married daughters</li>
              <li>Parents with health insurance and proof of relationship</li>
              <li>No medical test for children under 18</li>
              <li>One sponsor file for the whole family</li>
              <li>Family residency stays valid for its term if the holder passes away</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Benefits */}
      <section className="section">
        <div className="wrap">
          <div className="head" data-reveal><div><p className="eyebrow">Golden Visa benefits</p><h2 style={{ marginTop: 12 }}>Long-term security, <em className="gold">real freedom.</em></h2></div></div>
          <div className="grid">
            {[
              ['clock', 'Up to 10 years', 'Renewable while you still meet the conditions.'],
              ['shield', 'No sponsor needed', 'Change jobs or start a business freely.'],
              ['plane', 'No six-month rule', 'Stay outside the UAE for long periods without losing residency.'],
              ['family', 'Family sponsorship', 'Spouse, children of any age and parents.'],
              ['home', 'Domestic workers', 'Sponsor household staff, subject to UAE rules.'],
              ['heart', 'Family continuity', 'Family residency stays valid if the holder passes away.'],
            ].map(([ic, t, d]) => (
              <div className="card glass" key={t} data-reveal><span className="ico"><Icon name={ic} /></span><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Services with load more */}
      <section className="section" id="services">
        <div className="wrap">
          <div className="head" data-reveal><div><p className="eyebrow">Our services</p><h2 style={{ marginTop: 12 }}>Every visa your <em className="gold">family needs.</em></h2></div><p>Visas, documents, property and more. Hover any card for the details.</p></div>
          <ServicesGrid items={SERVICES} locale={locale} />
        </div>
      </section>

      {/* Client portal */}
      <section className="section">
        <div className="wrap portal">
          <div data-reveal>
            <p className="eyebrow">Client portal</p>
            <h2 style={{ marginTop: 12 }}>Your whole file, <em className="gold">live in your pocket.</em></h2>
            <p className="lead" style={{ marginTop: 16 }}>Quotes, payments, documents and every status change in one place, with a WhatsApp message at each step.</p>
            <div className="pfeat">
              <div className="glass"><b>Quotes</b>Accept and pay in one tap.</div>
              <div className="glass"><b>Documents</b>Upload from your phone.</div>
              <div className="glass"><b>Live status</b>Each step and its expected date.</div>
              <div className="glass"><b>Receipts</b>Every payment receipt sent to you.</div>
            </div>
          </div>
          <PhoneChat />
        </div>
      </section>

      {/* 9. FAQs */}
      <section className="section">
        <div className="wrap" style={{ maxWidth: 1000 }}>
          <div className="head" data-reveal><div><p className="eyebrow">FAQs</p><h2 style={{ marginTop: 12 }}>Asked <em className="gold">every day.</em></h2></div></div>
          <div className="faq">
            {FAQS.map((f, k) => (
              <details key={f.q} open={k === 0}><summary>{f.q}<i aria-hidden="true">+</i></summary><p>{f.a}</p></details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Latest guides */}
      <section className="section">
        <div className="wrap">
          <div className="head" data-reveal><div><p className="eyebrow">Guides and insights</p><h2 style={{ marginTop: 12 }}>Start <em className="gold">here.</em></h2></div><L locale={locale} href="/blog/" className="btn btn-glass">All guides</L></div>
          <div className="grid">
            {[
              ['How to apply, step by step', 'The 10 steps from eligibility to Emirates ID.', '/how-to-apply/'],
              ['Abu Dhabi Golden Visa cost', 'Government fees for you and your family.', '/golden-visa-cost/'],
              ['Golden Visa through property', 'AED 2 million, off-plan and mortgages explained.', '/golden-visa/property-investment/'],
              ['Requirements & documents', 'What to prepare for each route.', '/requirements-documents/'],
            ].map(([t, d, h]) => (
              <L key={h} locale={locale} href={h} className="card glass" data-reveal><p className="eyebrow">Guide</p><h3>{t}</h3><p>{d}</p><span className="go">Read →</span></L>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Contact / WhatsApp / consultation */}
      <section className="section" id="contact">
        <div className="wrap">
          <div className="contact-grid glass" data-reveal>
            <div>
              <p className="eyebrow">Free consultation</p>
              <h2 style={{ marginTop: 12, fontSize: 'clamp(30px,3.8vw,54px)' }}>Tell us about you. <em className="gold">We do the rest.</em></h2>
              <div style={{ marginTop: 22 }}><LeadForm source="home" /></div>
            </div>
            <div className="office">
              <div className="row"><Icon name="wa" /><div><b>WhatsApp</b><span><a href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener">{SITE.whatsappDisplay}</a></span></div></div>
              <div className="row"><Icon name="mail" /><div><b>Email</b><span>{SITE.email}</span></div></div>
              <div className="row"><Icon name="pin" /><div><b>Office</b><span>{SITE.office}</span></div></div>
              <div className="row"><Icon name="shield" /><div><b>Licensed operator</b><span>{SITE.operator}, Trade Licence {SITE.licence}</span></div></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
