// About and Contact page sections: contact cards, enquiry with benefits, remote process, getting here
// with map, filtered FAQ, story, promise/mission/vision, licence card, languages and office.
// Only verified facts are shown (operator, licence, contacts, hours); no invented ratings or client counts.
import type { Locale } from '@/lib/i18n';
import { LOCALES } from '@/lib/i18n';
import { SITE, waLink } from '@/lib/site';
import { Booking } from './Booking';
import { FaqTabs } from './FaqTabs';
import { Icon } from './Icon';
import { L } from './L';
import { LeadForm } from './LeadForm';

const mapSrc = () => `https://maps.google.com/maps?q=${encodeURIComponent(SITE.office || 'Business Bay, Dubai')}&z=15&output=embed`;
const dirHref = () => SITE.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SITE.office || 'Business Bay, Dubai')}`;

const CONTACT_FAQ = [
  { cat: 'General', q: 'Is the first consultation free?', a: 'Yes. Your first review of route, documents and costs is free and without obligation. You receive a written, itemised quote before you pay anything.' },
  { cat: 'General', q: 'Can I speak to an advisor before I apply?', a: 'Of course. Message us on WhatsApp, call, or book a time on this page. One advisor follows your file from start to finish.' },
  { cat: 'General', q: 'Which languages do you speak?', a: 'The website and your updates are available in 20 languages. Tell us your preferred language and we reply in it where possible.' },
  { cat: 'Online & documents', q: 'Can everything be done online?', a: 'Most steps can. You share documents on WhatsApp or upload them in your customer dashboard. You only attend in person for the medical test and biometrics.' },
  { cat: 'Online & documents', q: 'How do I send my documents safely?', a: 'Upload them in your private customer dashboard or send them on WhatsApp. We only use them for your application.' },
  { cat: 'Online & documents', q: 'Do you collect original documents?', a: 'Where originals are needed, we can arrange collection and return in the UAE. Ask your advisor for the options in your area.' },
  { cat: 'Visiting us', q: 'Do I need an appointment to visit?', a: 'Please book a time on this page so an advisor is free for you. Walk-ins are welcome during office hours when a team member is available.' },
  { cat: 'Visiting us', q: 'What should I bring?', a: 'Your passport, Emirates ID if you have one, and the documents for your route (for example title deed or salary certificate). Copies on your phone are fine for the first meeting.' },
  { cat: 'Visiting us', q: 'How quickly do you reply on WhatsApp?', a: 'Usually within minutes during office hours, and first thing the next working day outside them.' },
];

function OfficeMap() {
  return (
    <div className="cp-map">
      <iframe title={`Map: ${SITE.office}`} src={mapSrc()} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
    </div>
  );
}

export function ContactHub({ locale }: { locale: Locale }) {
  const cards = [
    { ic: 'wa', t: 'WhatsApp', s: 'Fastest reply, usually within minutes in office hours.', v: SITE.whatsappDisplay, href: waLink('Hello, I would like help with the Abu Dhabi Golden Visa.'), b: 'Chat now', ext: true },
    { ic: 'phone', t: 'Call us', s: 'Speak to a Golden Visa specialist.', v: SITE.whatsappDisplay, href: `tel:${SITE.phone}`, b: 'Call now' },
    { ic: 'mail', t: 'Email', s: 'For documents and detailed questions.', v: SITE.email, href: `mailto:${SITE.email}`, b: 'Send email' },
    { ic: 'pin', t: 'Visit the office', s: SITE.hours, v: SITE.office, href: dirHref(), b: 'Get directions', ext: true },
  ];
  return (
    <>
      <section className="block cp-cards" data-reveal>
        <div className="bh"><h2>More ways to reach us</h2></div>
        <div className="cp-grid4">
          {cards.map((c) => (
            <a key={c.t} className="cp-card card" href={c.href} {...(c.ext ? { target: '_blank', rel: 'noopener' } : {})}>
              <span className="cp-ic"><Icon name={c.ic} size={22} /></span>
              <b>{c.t}</b><small>{c.s}</small><em>{c.v}</em>
              <span className="go">{c.b} →</span>
            </a>
          ))}
        </div>
        <p className="cp-note"><Icon name="doc" size={16} /> You can share documents on WhatsApp or in your customer dashboard. Where originals are needed, we can arrange collection.</p>
      </section>

      <section className="block cp-enquiry" data-reveal>
        <div className="cp-enq-side">
          <p className="eyebrow">Leave your details</p>
          <h2>We reply within one working day</h2>
          <ul className="ticks">
            <li>Free first consultation about your route</li>
            <li>Itemised quote in writing, no hidden fees</li>
            <li>One advisor for your whole file</li>
            <li>Updates in your language on WhatsApp</li>
          </ul>
          <div className="cp-hot">
            <a href={`tel:${SITE.phone}`}><Icon name="phone" size={18} /> <span><small>Hotline</small><b>{SITE.whatsappDisplay}</b></span></a>
            <a href={dirHref()} target="_blank" rel="noopener"><Icon name="pin" size={18} /> <span><small>Office</small><b>{SITE.office}</b></span></a>
          </div>
        </div>
        <div className="cp-enq-form"><LeadForm source="contact" /></div>
      </section>

      <section className="block" id="book" data-reveal><Booking /></section>

      <section className="block cp-remote" data-reveal>
        <div className="bh"><h2>No office visit needed</h2></div>
        <ol className="cp-steps">
          {[['globe', 'Handled online', 'Share documents on WhatsApp or upload them in your dashboard. We check, translate and file them.'], ['folder', 'Originals collected', 'If an original is needed, we arrange collection in the UAE.'], ['check', 'Returned to you', 'Your documents, visa and Emirates ID come back to you, with an update at every step.']].map(([ic, t, s], i) => (
            <li key={t}><span className="cp-n">{i + 1}</span><Icon name={ic} size={26} /><b>{t}</b><small>{s}</small></li>
          ))}
        </ol>
      </section>

      <section className="block cp-here" data-reveal>
        <div>
          <p className="eyebrow">Getting here</p>
          <h2>Visit our office</h2>
          <dl className="cp-dl">
            <div><dt>Address</dt><dd>{SITE.office}</dd></div>
            <div><dt>Operator</dt><dd>{SITE.operator}</dd></div>
            <div><dt>Opening hours</dt><dd>{SITE.hours}</dd></div>
          </dl>
          <ul className="cp-travel">
            <li><Icon name="plane" size={18} /> <span><b>By metro</b> Business Bay station, then a short taxi or walk.</span></li>
            <li><Icon name="home" size={18} /> <span><b>By car</b> Visitor parking in and around the building.</span></li>
            <li><Icon name="pin" size={18} /> <span><b>Taxi or ride-hailing</b> Drop-off at the building entrance.</span></li>
          </ul>
          <div className="cta"><a className="btn btn-gold" href={dirHref()} target="_blank" rel="noopener"><Icon name="pin" size={18} /> Get directions</a><a className="btn btn-glass" href="#book">Book a visit</a></div>
        </div>
        <OfficeMap />
      </section>

      <section className="block" data-reveal>
        <div className="bh"><h2>Questions about contacting us</h2></div>
        <FaqTabs items={CONTACT_FAQ} />
        <div className="cp-still"><b>Still have a question?</b>
          <a className="btn btn-gold" href={waLink('Hello, I have a question.')} target="_blank" rel="noopener"><Icon name="wa" size={18} /> WhatsApp us</a>
          <L locale={locale} href="/apply/" className="btn btn-glass">Apply online</L></div>
      </section>
    </>
  );
}

export function AboutHub({ locale }: { locale: Locale }) {
  return (
    <>
      <section className="block cp-story" data-reveal>
        <div>
          <p className="eyebrow">Welcome</p>
          <h2>A long stay in the UAE starts with a clear plan</h2>
          <p className="lead">We help investors, professionals and families secure long-term UAE residency through the Abu Dhabi Golden Visa, and we stay with them for family visas, Emirates ID, renewals and documents.</p>
          <ul className="ticks">
            <li>One named advisor for your whole file</li>
            <li>Fees agreed in writing before we start</li>
            <li>WhatsApp updates at every government step</li>
            <li>Most of the work done remotely, in your language</li>
          </ul>
          <div className="cta"><L locale={locale} href="/free-consultation/" className="btn btn-gold">Free consultation <Icon name="arrow" size={18} /></L><a className="btn btn-glass" href={waLink('Hello, I would like to talk to an advisor.')} target="_blank" rel="noopener"><Icon name="wa" size={18} /> WhatsApp</a></div>
        </div>
        <figure className="cp-photo"><img decoding="async" loading="lazy" src="/images/family.webp" alt="Family planning their move to Abu Dhabi" width={900} height={700} /><figcaption><b>20</b> languages for your updates</figcaption></figure>
      </section>

      <section className="block cp-values" data-reveal>
        <div className="bh"><h2>What guides our work</h2></div>
        <div className="cp-grid3">
          {[['shield', 'Our promise', 'Honest advice about your route, a written quote with every fee itemised, and no promise we cannot keep. Approval always rests with the authorities.'], ['star', 'Our mission', 'Make long-term residency in Abu Dhabi simple, transparent and calm for every family, wherever they come from.'], ['globe', 'Our vision', 'To be the advisor people trust and recommend for their life in the UAE, from the first visa to every renewal.']].map(([ic, t, s]) => (
            <div key={t} className="card glass cp-val"><span className="ico"><Icon name={ic} /></span><h3>{t}</h3><p>{s}</p></div>
          ))}
        </div>
      </section>

      <section className="block cp-handle" data-reveal>
        <div className="bh"><h2>What we handle for you</h2></div>
        <div className="cp-chips">
          {[['Golden Visa applications', '/golden-visa/'], ['Property investor visas', '/golden-visa/property-investment/'], ['Family & parents', '/family-golden-visa/'], ['Renewals', '/services/golden-visa-renewal/'], ['Emirates ID', '/services/emirates-id/'], ['Medical & biometrics', '/services/medical-biometrics/'], ['Attestation & translation', '/document-services/mofa-attestation/'], ['Valuation certificate', '/document-services/valuation-certificate/'], ['Entry permits & status change', '/services/entry-permit-status-change/'], ['Retirement & remote work', '/retirement-visa/']].map(([t, h]) => (
            <L key={h} locale={locale} href={h} className="cp-chip"><Icon name="check" size={15} /> {t}</L>
          ))}
        </div>
      </section>

      <section className="block cp-licence" data-reveal>
        <div>
          <p className="eyebrow">Licensed operator</p>
          <h2>A registered UAE company</h2>
          <p className="lead">{SITE.name} is an independent residency consultancy website managed by {SITE.operator}. We are a private company, not a government authority.</p>
        </div>
        <div className="cp-lic">
          <div className="cp-lic-h"><b>Company details</b><span className="pill ok">Active</span></div>
          <dl className="cp-dl">
            <div><dt>Operator</dt><dd>{SITE.operator}</dd></div>
            <div><dt>Trade licence no.</dt><dd>{SITE.licence}</dd></div>
            <div><dt>Office</dt><dd>{SITE.office}</dd></div>
            <div><dt>Brand</dt><dd>{SITE.name}</dd></div>
          </dl>
          <p className="small muted">Visa issuance and eligibility are decided by the competent UAE authorities.</p>
        </div>
      </section>

      <section className="block" data-reveal>
        <div className="bh"><h2>We speak your language</h2></div>
        <div className="cp-langs">{LOCALES.map((l) => <span key={l.code} lang={l.htmlLang}>{l.native}</span>)}</div>
      </section>

      <section className="block cp-here" data-reveal>
        <div>
          <p className="eyebrow">Where to find us</p>
          <h2>Our office</h2>
          <dl className="cp-dl">
            <div><dt>Address</dt><dd>{SITE.office}</dd></div>
            <div><dt>Opening hours</dt><dd>{SITE.hours}</dd></div>
            <div><dt>Phone & WhatsApp</dt><dd>{SITE.whatsappDisplay}</dd></div>
            <div><dt>Email</dt><dd>{SITE.email}</dd></div>
          </dl>
          <div className="cta"><a className="btn btn-gold" href={dirHref()} target="_blank" rel="noopener"><Icon name="pin" size={18} /> Get directions</a><L locale={locale} href="/contact/#book" className="btn btn-glass">Book a visit</L></div>
        </div>
        <OfficeMap />
      </section>

      <section className="block cp-enquiry" data-reveal>
        <div className="cp-enq-side">
          <p className="eyebrow">Start your UAE journey</p>
          <h2>Ask for a call back</h2>
          <ul className="ticks"><li>Free first consultation</li><li>Written eligibility view</li><li>Reply within one working day</li></ul>
          <div className="cp-hot"><a href={`tel:${SITE.phone}`}><Icon name="phone" size={18} /> <span><small>Call</small><b>{SITE.whatsappDisplay}</b></span></a></div>
        </div>
        <div className="cp-enq-form"><LeadForm source="about" /></div>
      </section>
    </>
  );
}
