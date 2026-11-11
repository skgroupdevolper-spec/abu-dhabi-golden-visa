import { T } from './T';
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
import { OfficeLive } from './OfficeLive';
import { OfficeGlobe } from './OfficeGlobe';
import { WORLD } from '@/lib/world';

/** Well-known cities around the world: the airplane on the About globe hops from one to the next. */

import { u } from '@/lib/ui';

const mapSrc = () => `https://maps.google.com/maps?q=${encodeURIComponent(/crystal tower/i.test(SITE.office) ? 'Crystal Tower Business Bay Dubai' : SITE.office || 'Business Bay, Dubai')}&z=16&output=embed`;
const dirHref = () => SITE.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SITE.office || 'Business Bay, Dubai')}`;

const CONTACT_FAQ = [
  { cat: u('General'), q: u('Is the first consultation free?'), a: u('Yes. Your first review of route, documents and costs is free and without obligation. You receive a written, itemised quote before you pay anything.') },
  { cat: u('General'), q: u('Can I speak to an advisor before I apply?'), a: u('Of course. Message us on WhatsApp, call, or book a time on this page. One advisor follows your file from start to finish.') },
  { cat: u('General'), q: u('Which languages do you speak?'), a: u('The website and your updates are available in 20 languages. Tell us your preferred language and we reply in it where possible.') },
  { cat: u('Online & documents'), q: u('Can everything be done online?'), a: u('Most steps can. You share documents on WhatsApp or upload them in your customer dashboard. You only attend in person for the medical test and biometrics.') },
  { cat: u('Online & documents'), q: u('How do I send my documents safely?'), a: u('Upload them in your private customer dashboard or send them on WhatsApp. We only use them for your application.') },
  { cat: u('Online & documents'), q: u('Do you collect original documents?'), a: u('Where originals are needed, we can arrange collection and return in the UAE. Ask your advisor for the options in your area.') },
  { cat: u('Visiting us'), q: u('Do I need an appointment to visit?'), a: u('Please book a time on this page so an advisor is free for you. Walk-ins are welcome during office hours when a team member is available.') },
  { cat: u('Visiting us'), q: u('What should I bring?'), a: u('Your passport, Emirates ID if you have one, and the documents for your route (for example title deed or salary certificate). Copies on your phone are fine for the first meeting.') },
  { cat: u('Visiting us'), q: u('How quickly do you reply on WhatsApp?'), a: u('Usually within minutes during office hours, and first thing the next working day outside them.') },
  { cat: u('Visiting us'), q: u('Is there parking at the office?'), a: u('Yes. Crystal Tower has free visitor parking for our clients.') },
  { cat: u('Visiting us'), q: u('Can someone visit on my behalf?'), a: u('Usually yes. Send us a WhatsApp message first so we can tell you what they need to bring for your service.') },
  { cat: u('Visiting us'), q: u('Do I have to come to the office at all?'), a: u('No. A visit is optional; most clients finish everything by WhatsApp, phone or video call.') },
];

const SOC: [keyof typeof SITE.social, string, string][] = [['facebook', 'facebook', 'Facebook'], ['instagram', 'instagram', 'Instagram'], ['linkedin', 'linkedin', 'LinkedIn'], ['youtube', 'youtube', 'YouTube'], ['tiktok', 'tiktok', 'TikTok'], ['x', 'x', 'X']];
function Socials() {
  const list = SOC.filter(([k]) => SITE.social?.[k]);
  if (!list.length) return null;
  return <div className="cp-soc">{list.map(([k, , l]) => <a key={k} href={SITE.social[k]} target="_blank" rel="noopener" aria-label={l}>{l}</a>)}</div>;
}

/** "Visit us" block with the live office status: used at the top of Contact and in About. */
function VisitBlock({ locale, title }: { locale: Locale; title: string }) {
  return (
    <section className="block cp-visit" data-reveal>
      <div className="cp-visit-l">
        <p className="eyebrow">{u('Our office', locale)}</p>
        <h2>{u(title, locale)}</h2>
        <dl className="cp-dl">
          <div><dt>{u('Address', locale)}</dt><dd>{SITE.office}</dd></div>
          {SITE.poBox && <div><dt>{u('PO Box', locale)}</dt><dd>{SITE.poBox}</dd></div>}
          <div><dt>{u('Opening hours', locale)}</dt><dd>{SITE.hours}</dd></div>
          <div><dt>{u('Phone & WhatsApp', locale)}</dt><dd dir="ltr" style={{ unicodeBidi: 'plaintext' }}>{SITE.whatsappDisplay}</dd></div>
          <div><dt>{u('Email', locale)}</dt><dd><a href={`mailto:${SITE.email}`}>{SITE.email}</a></dd></div>
        </dl>
        <div className="cta">
          <a className="btn btn-gold" href={dirHref()} target="_blank" rel="noopener"><Icon name="pin" size={18} /> {u('Get directions', locale)}</a>
          <a className="btn btn-glass" href={`tel:${SITE.phone}`}><Icon name="phone" size={18} /> {u('Call', locale)}</a>
          <a className="btn btn-glass" href={waLink('Hello, I would like to visit your office.')} target="_blank" rel="noopener"><Icon name="wa" size={18} /> <T>{"WhatsApp"}</T></a>
        </div>
        <Socials />
      </div>
      <OfficeLive locale={locale} />
    </section>
  );
}

function OfficeMap() {
  return (
    <div className="cp-map">
      <iframe title={`Map: ${SITE.office}`} src={mapSrc()} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
    </div>
  );
}

export function ContactHub({ locale }: { locale: Locale }) {
  const cards = [
    { ic: 'wa', t: u('WhatsApp'), s: u('Fastest reply, usually within minutes in office hours.'), v: SITE.whatsappDisplay, href: waLink('Hello, I would like help with the Abu Dhabi Golden Visa.'), b: u('Chat now'), ext: true },
    { ic: 'phone', t: u('Call us'), s: u('Speak to a Golden Visa specialist.'), v: SITE.whatsappDisplay, href: `tel:${SITE.phone}`, b: u('Call now') },
    { ic: 'mail', t: u('Email'), s: u('For documents and detailed questions.'), v: SITE.email, href: `mailto:${SITE.email}`, b: u('Send email') },
    { ic: 'pin', t: u('Visit the office'), s: SITE.hours, v: SITE.office, href: dirHref(), b: u('Get directions'), ext: true },
  ];
  return (
    <>
      <VisitBlock locale={locale} title={u('Visit us in Business Bay, Dubai')} />
      <section className="block cp-cards" data-reveal>
        <div className="bh"><h2>{u('More ways to reach us', locale)}</h2></div>
        <div className="cp-grid4">
          {cards.map((c) => (
            <a key={c.t} className="cp-card card" href={c.href} {...(c.ext ? { target: '_blank', rel: 'noopener' } : {})}>
              <span className="cp-ic"><Icon name={c.ic} size={22} /></span>
              <b>{u(c.t, locale)}</b><small>{c.s === SITE.hours ? c.s : u(c.s, locale)}</small><em>{c.v}</em>
              <span className="go">{u(c.b, locale)} →</span>
            </a>
          ))}
        </div>
        <p className="cp-note"><Icon name="doc" size={16} /> {u('You can share documents on WhatsApp or in your customer dashboard. Where originals are needed, we can arrange collection.', locale)}</p>
      </section>

      <section className="block cp-enquiry" data-reveal>
        <div className="cp-enq-side">
          <p className="eyebrow">{u('Leave your details', locale)}</p>
          <h2>{u('We reply within one working day', locale)}</h2>
          <ul className="ticks">
            <li>{u('Free first consultation about your route', locale)}</li>
            <li>{u('Itemised quote in writing, no hidden fees', locale)}</li>
            <li>{u('One advisor for your whole file', locale)}</li>
            <li>{u('Updates in your language on WhatsApp', locale)}</li>
          </ul>
          <div className="cp-hot">
            <a href={`tel:${SITE.phone}`}><Icon name="phone" size={18} /> <span><small>{u('Hotline', locale)}</small><b>{SITE.whatsappDisplay}</b></span></a>
            <a href={dirHref()} target="_blank" rel="noopener"><Icon name="pin" size={18} /> <span><small>{u('Office', locale)}</small><b>{SITE.office}</b></span></a>
          </div>
        </div>
        <div className="cp-enq-form"><LeadForm source="contact" /></div>
      </section>

      <section className="block" id="book" data-reveal><Booking locale={locale} /></section>

      <section className="block cp-remote" data-reveal>
        <div className="bh"><h2>{u('No office visit needed', locale)}</h2></div>
        <ol className="cp-steps">
          {[['globe', u('Handled online'), u('Share documents on WhatsApp or upload them in your dashboard. We check, translate and file them.')], ['folder', u('Originals collected'), u('If an original is needed, we arrange collection in the UAE.')], ['check', u('Returned to you'), u('Your documents, visa and Emirates ID come back to you, with an update at every step.')]].map(([ic, t, s], i) => (
            <li key={t}><span className="cp-n">{i + 1}</span><Icon name={ic} size={26} /><b>{u(t, locale)}</b><small>{u(s, locale)}</small></li>
          ))}
        </ol>
      </section>

      <section className="block cp-here" data-reveal>
        <div>
          <p className="eyebrow">{u('Getting here', locale)}</p>
          <h2>{u('Visit our office', locale)}</h2>
          <dl className="cp-dl">
            <div><dt>{u('Address', locale)}</dt><dd>{SITE.office}</dd></div>
            <div><dt>{u('Operator', locale)}</dt><dd>{SITE.operator}</dd></div>
            <div><dt>{u('Opening hours', locale)}</dt><dd>{SITE.hours}</dd></div>
          </dl>
          <ul className="cp-travel">
            <li><Icon name="train" size={18} /> <span><b>{u('By metro', locale)}</b> {u('From Business Bay metro station take bus F14 towards Bay Square, get off near Empire Heights or Bay Square, then walk 2 to 3 minutes.', locale)}</span></li>
            <li><Icon name="car" size={18} /> <span><b>{u('By car', locale)}</b> {u('Free visitor parking at Crystal Tower.', locale)}</span></li>
            <li><Icon name="car" size={18} /> <span><b>{u('Taxi, Uber or Careem', locale)}</b> {u('Set the destination to “Brightlink Management Consultancy, Crystal Tower”.', locale)}</span></li>
          </ul>
          <div className="cta"><a className="btn btn-gold" href={dirHref()} target="_blank" rel="noopener"><Icon name="pin" size={18} /> {u('Get directions', locale)}</a><a className="btn btn-glass" href="#book">{u('Book a visit', locale)}</a></div>
        </div>
        <OfficeMap />
      </section>

      <section className="block" data-reveal>
        <div className="bh"><h2>{u('Questions about contacting us', locale)}</h2></div>
        <FaqTabs items={CONTACT_FAQ.map((f) => ({ cat: u(f.cat, locale), q: u(f.q, locale), a: u(f.a, locale) }))} all={u('All', locale)} />
        <div className="cp-still"><b>{u('Still have a question?', locale)}</b>
          <a className="btn btn-gold" href={waLink('Hello, I have a question.')} target="_blank" rel="noopener"><Icon name="wa" size={18} /> {u('WhatsApp us', locale)}</a>
          <L locale={locale} href="/apply/" className="btn btn-glass">{u('Apply online', locale)}</L></div>
      </section>
    </>
  );
}

export function AboutHub({ locale }: { locale: Locale }) {
  return (
    <>
      <section className="block cp-story" data-reveal>
        <div>
          <p className="eyebrow">{u('Welcome', locale)}</p>
          <h2>{u('A long stay in the UAE starts with a clear plan', locale)}</h2>
          <p className="lead">{u('We help investors, professionals and families secure long-term UAE residency through the Abu Dhabi Golden Visa, and we stay with them for family visas, Emirates ID, renewals and documents.', locale)}</p>
          <ul className="ticks">
            <li>{u('One named advisor for your whole file', locale)}</li>
            <li>{u('Fees agreed in writing before we start', locale)}</li>
            <li>{u('WhatsApp updates at every government step', locale)}</li>
            <li>{u('Most of the work done remotely, in your language', locale)}</li>
          </ul>
          <div className="cta"><L locale={locale} href="/free-consultation/" className="btn btn-gold">{u('Free consultation', locale)} <Icon name="arrow" size={18} /></L><a className="btn btn-glass" href={waLink('Hello, I would like to talk to an advisor.')} target="_blank" rel="noopener"><Icon name="wa" size={18} /> {u('WhatsApp', locale)}</a></div>
        </div>
        <figure className="cp-photo"><img decoding="async" loading="lazy" src="/images/family.webp" alt="Family planning their move to Abu Dhabi" width={900} height={700} /><figcaption><b>20</b> {u('languages for your updates', locale)}</figcaption></figure>
      </section>

      <section className="block cp-values" data-reveal>
        <div className="bh"><h2>{u('What guides our work', locale)}</h2></div>
        <div className="cp-grid3">
          {[['shield', u('Our promise'), u('Honest advice about your route, a written quote with every fee itemised, and no promise we cannot keep. Approval always rests with the authorities.')], ['star', u('Our mission'), u('Make long-term residency in Abu Dhabi simple, transparent and calm for every family, wherever they come from.')], ['globe', u('Our vision'), u('To be the advisor people trust and recommend for their life in the UAE, from the first visa to every renewal.')]].map(([ic, t, s]) => (
            <div key={t} className="card glass cp-val"><span className="ico"><Icon name={ic} /></span><h3>{u(t, locale)}</h3><p>{u(s, locale)}</p></div>
          ))}
        </div>
      </section>

      <section className="block cp-handle" data-reveal>
        <div className="bh"><h2>{u('What we handle for you', locale)}</h2></div>
        <div className="cp-chips">
          {[[u('Golden Visa applications'), '/golden-visa/'], [u('Property investor visas'), '/golden-visa/property-investment/'], [u('Family & parents'), '/family-golden-visa/'], [u('Renewals'), '/services/golden-visa-renewal/'], [u('Emirates ID'), '/services/emirates-id/'], [u('Medical & biometrics'), '/services/medical-biometrics/'], [u('Attestation & translation'), '/document-services/mofa-attestation/'], [u('Valuation certificate'), '/document-services/valuation-certificate/'], [u('Entry permits & status change'), '/services/entry-permit-status-change/'], [u('Retirement & remote work'), '/retirement-visa/']].map(([t, h]) => (
            <L key={h} locale={locale} href={h} className="cp-chip"><Icon name="check" size={15} /> {u(t, locale)}</L>
          ))}
        </div>
      </section>

      {SITE.founder?.name && (
        <section className="block cp-founder" data-reveal>
          <div className="cp-f-badge" aria-hidden="true">{SITE.founder.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
          <div>
            <p className="eyebrow">{u('Meet the founder', locale)}</p>
            <h2>{SITE.founder.name}</h2>
            <p className="muted" style={{ marginTop: 4 }}>{SITE.founder.title}</p>
            {SITE.founder.quote && <blockquote>“{SITE.founder.quote}”</blockquote>}
            {SITE.founder.linkedin && <a className="btn btn-glass" href={SITE.founder.linkedin} target="_blank" rel="noopener"><T>{"LinkedIn"}</T></a>}
          </div>
        </section>
      )}

      <section className="block cp-licence" data-reveal>
        <div>
          <p className="eyebrow">{u('Licensed operator', locale)}</p>
          <h2>{u('A registered UAE company', locale)}</h2>
          <p className="lead">{SITE.name} is an independent residency consultancy website managed by {SITE.operator}.</p>
          {SITE.registered && (
            <div className="cp-bigstat">
              <b>{Math.max(0, Math.floor((Date.now() - Date.parse(`${SITE.registered}T00:00:00+04:00`)) / 864e5)).toLocaleString('en-US')}</b>
              <span>{u('days licensed and active', locale)}<small>{u('since', locale)} {new Date(`${SITE.registered}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</small></span>
            </div>
          )}
          <ul className="cp-trust">
            <li><Icon name="check" size={16} /> {u('Trade licence issued by the Dubai Department of Economy and Tourism', locale)}</li>
            <li><Icon name="check" size={16} /> {u('Office you can visit in Business Bay, Dubai', locale)}</li>
            <li><Icon name="check" size={16} /> {u('Fees confirmed in writing before you pay', locale)}</li>
          </ul>
        </div>
        <div className="cp-lic">
          <div className="cp-lic-h"><b>{u('Company details', locale)}</b><span className="pill ok">{u('Active', locale)}</span></div>
          <dl className="cp-dl">
            <div><dt>{u('Operator', locale)}</dt><dd>{SITE.operator}</dd></div>
            <div><dt>{u('Trade licence no.', locale)}</dt><dd>{SITE.licence}</dd></div>
            {SITE.licenceIssuer && <div><dt>{u('Issued by', locale)}</dt><dd>{SITE.licenceIssuer}</dd></div>}
            {SITE.registered && <div><dt>{u('Registered on', locale)}</dt><dd>{new Date(`${SITE.registered}T00:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}</dd></div>}
            {SITE.legalType && <div><dt>{u('Legal type', locale)}</dt><dd>{SITE.legalType}</dd></div>}
            <div><dt>{u('Office', locale)}</dt><dd>{SITE.office}</dd></div>
            <div><dt>{u('Brand', locale)}</dt><dd>{SITE.name}</dd></div>
          </dl>
          {SITE.activities && <><p className="small" style={{ margin: '10px 0 6px', fontWeight: 700 }}>{u('Approved activities', locale)}</p><ul className="ticks small">{SITE.activities.split('\n').filter(Boolean).map((a) => <li key={a}>{u(a.trim(), locale)}</li>)}</ul></>}
          <p className="small muted">{u('Visa issuance and eligibility are decided by the competent UAE authorities.', locale)}</p>
        </div>
      </section>

      <section className="block cp-globe" data-reveal>
        <div className="bh"><p className="eyebrow">{u('Clients worldwide', locale)}</p><h2>{u('From anywhere in the world to Abu Dhabi', locale)}</h2><p>{u('We prepare Golden Visa files for people living all over the world. Follow the flight between the cities our clients come from.', locale)}</p></div>
        <OfficeGlobe offices={SITE.world?.length ? SITE.world : WORLD} locale={locale} label="world" />
      </section>


      <section className="block" data-reveal>
        <div className="bh"><h2>{u('We speak your language', locale)}</h2></div>
        <div className="cp-langs">{LOCALES.map((l) => <span key={l.code} lang={l.htmlLang}>{l.native}</span>)}</div>
      </section>

      <VisitBlock locale={locale} title={u('Our office in Business Bay')} />
      <section className="block" data-reveal><OfficeMap /></section>

      <section className="block cp-enquiry" data-reveal>
        <div className="cp-enq-side">
          <p className="eyebrow">{u('Start your UAE journey', locale)}</p>
          <h2>{u('Ask for a call back', locale)}</h2>
          <ul className="ticks"><li>{u('Free first consultation', locale)}</li><li>{u('Written eligibility view', locale)}</li><li>{u('Reply within one working day', locale)}</li></ul>
          <div className="cp-hot"><a href={`tel:${SITE.phone}`}><Icon name="phone" size={18} /> <span><small>{u('Call', locale)}</small><b>{SITE.whatsappDisplay}</b></span></a></div>
        </div>
        <div className="cp-enq-form"><LeadForm source="about" /></div>
      </section>
    </>
  );
}
