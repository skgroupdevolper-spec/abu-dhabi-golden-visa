import { NAV } from '@/content/nav';
import { FooterScene } from './FooterScene';
import { u } from '@/lib/ui';
import { BrandLogo } from './BrandLogo';
import type { Locale } from '@/lib/i18n';
import { SITE, waLink } from '@/lib/site';
import { L } from './L';
import { Icon } from './Icon';
import { iconForText } from '@/lib/icon-match';
import { Newsletter } from './Newsletter';

export function Footer({ locale }: { locale: Locale }) {
  const groups = (SITE.nav.menu?.length ? SITE.nav.menu : NAV).flatMap((n) => n.groups ?? []);
  const pick = (title: string) => groups.find((g) => g.title === title)?.links ?? [];
  const cols = SITE.nav.footerCols?.length ? SITE.nav.footerCols : [
    { title: 'Golden Visa', links: pick('Golden Visa') },
    { title: 'Family & Residency', links: pick('Family & Residency') },
    { title: 'Resources', links: pick('Resources') },
  ];
  return (
    <footer className="site has-scene">
      <FooterScene />
      <div className="wrap">
        <div className="fgrid">
          <div className="fbrand">
            <BrandLogo alt={SITE.name} size={50} />
            <p>
              {u(SITE.footerAbout || `${SITE.name} is an independent residency consultancy website managed by ${SITE.operator}, UAE. Trade Licence No. ${SITE.licence}.`, locale)}
            </p>
            <div className="social">
              {Object.entries(SITE.social).filter(([, v]) => v).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noopener" aria-label={k}>{k === 'x' ? 'X' : k[0].toUpperCase() + k.slice(1)}</a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={u(c.title, locale)}>
              <h4>{u(c.title, locale)}</h4>
              <ul>
                {c.links.map((l) => (
                  <li key={l.href + l.label}>
                    <L locale={locale} href={l.href}>{u(l.label, locale)}</L>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4>{u('Contact', locale)}</h4>
            <ul className="fcontact">
              <li><a href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener"><Icon name="wa" size={17} /><span><small className="fc-l">{u('WhatsApp', locale)}</small><b className="fc-nw" dir="ltr">{SITE.whatsappDisplay}</b></span></a></li>
              {/* Same number as WhatsApp: shown once (call it from the WhatsApp line's number). */}
              {SITE.phone && SITE.phone.replace(/\D/g, '') !== SITE.whatsappDisplay.replace(/\D/g, '') && <li><a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}><Icon name="phone" size={17} /><span><small className="fc-l">{u('Call', locale)}</small><b className="fc-nw" dir="ltr">{SITE.phone}</b></span></a></li>}
              {SITE.phone && SITE.phone.replace(/\D/g, '') === SITE.whatsappDisplay.replace(/\D/g, '') && <li><a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}><Icon name="phone" size={17} /><span><small className="fc-l">{u('Call us', locale)}</small><b className="fc-nw" dir="ltr">{SITE.whatsappDisplay}</b></span></a></li>}
              <li><a href={`mailto:${SITE.email}`}><Icon name="mail" size={17} /><span><small className="fc-l">{u('Email', locale)}</small><b className="fc-mail" dir="ltr">{SITE.email.split('@')[0]}@<wbr />{SITE.email.split('@')[1]}</b></span></a></li>
              <li>{SITE.mapsUrl ? <a href={SITE.mapsUrl} target="_blank" rel="noopener"><Icon name="pin" size={17} /><span><small className="fc-l">{u('Office', locale)}</small>{SITE.office}</span></a> : <span className="fc-row"><Icon name="pin" size={17} /><span><small className="fc-l">{u('Office', locale)}</small>{SITE.office}</span></span>}</li>
              {SITE.hours && <li><span className="fc-row"><Icon name="clock" size={17} /><span><small className="fc-l">{u('Opening hours', locale)}</small>{SITE.hours.split(/\s*·\s*/).map((h) => <span key={h} className="fc-line">{h}</span>)}</span></span></li>}
            </ul>
          </div>
        </div>
        {/* Quick links + email updates, in one bar above the legal line */}
        <div className="fbar">
          <nav className="fbar-links" aria-label={u('Quick links', locale)}>
            {[['/apply/', 'Apply online', 'doc'], ['/visa-check/', 'Visa status check', 'passport'], ['/eligibility-check/', 'Eligibility check', 'check'], ['/contact/', 'Contact us', 'user'], ['/about/', 'About us', 'star']].map(([href, label, ic]) => (
              <L key={href} locale={locale} href={href}><Icon name={ic} size={15} /> {u(label, locale)}</L>
            ))}
            {SITE.nav.footerLinks.map((x) => <L key={x.href + x.label} locale={locale} href={x.href}><Icon name={iconForText(x.label, 'arrow')} size={15} /> {u(x.label, locale)}</L>)}
          </nav>
          {SITE.features.newsletter && <div className="fbar-nl"><Newsletter inline /></div>}
        </div>
        {/* Who we are and what we do (official wording), then the general disclaimer */}
        <div className="fdisc">
          <p>
            {u('Brightlink Management Consultancy L.L.C is an independent private consultancy and third-party professional services provider, licensed by Dubai’s Department of Economy and Tourism (DET) under Licence No. 1053387. With the customer’s authorisation, we assist with business setup, visa typing, document preparation, application completion, and submission through the relevant official channels, including GDRFA Dubai, ICP, DET, MOFA, and MOHRE. Government fees are determined by the relevant authorities and paid directly to them, while Brightlink’s professional service fees are charged separately and clearly disclosed before the customer confirms the service.', locale)}{' '}
            {u('Applicants may also submit applications directly through the official government portals, including', locale)}{' '}
            <a href="https://icp.gov.ae/" target="_blank" rel="noopener">ICP</a>, <a href="https://www.gdrfad.gov.ae/" target="_blank" rel="noopener">GDRFA Dubai</a>, <a href="https://www.mohre.gov.ae/" target="_blank" rel="noopener">MOHRE</a>{u(', and the', locale)} <a href="https://u.ae/" target="_blank" rel="noopener">{u('UAE Government Portal', locale)}</a>.
          </p>
          <p><b>{u('Disclaimer', locale)}:</b> {u('Any prices, timelines, or eligibility information provided on this website are estimates for general guidance only and do not constitute legal advice or guarantee approval by any government authority.', locale)}</p>
          <p className="fdisc-date">{u('Content last reviewed: 27 September 2026.', locale)}</p>
        </div>
        <div className="legal">
          <span>
            {SITE.nav.copyright || `© ${new Date().getFullYear()} ${SITE.operator}`}
            <span className="legal-links">
              <L locale={locale} href="/privacy/">{u('Privacy', locale)}</L>
              <L locale={locale} href="/terms/">{u('Terms', locale)}</L>
              <L locale={locale} href="/disclaimer/">{u('Disclaimer', locale)}</L>
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
