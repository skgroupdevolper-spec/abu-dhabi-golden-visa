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
            {SITE.features.newsletter && <Newsletter />}
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
              <li><a href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener"><Icon name="wa" size={17} /><span>WhatsApp {SITE.whatsappDisplay}</span></a></li>
              {SITE.phone && SITE.phone !== SITE.whatsappDisplay && <li><a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}><Icon name="phone" size={17} /><span>{SITE.phone}</span></a></li>}
              <li><a href={`mailto:${SITE.email}`}><Icon name="mail" size={17} /><span>{SITE.email}</span></a></li>
              <li>{SITE.mapsUrl ? <a href={SITE.mapsUrl} target="_blank" rel="noopener"><Icon name="pin" size={17} /><span>{SITE.office}</span></a> : <span className="fc-row"><Icon name="pin" size={17} /><span>{SITE.office}</span></span>}</li>
              {SITE.hours && <li><span className="fc-row"><Icon name="clock" size={17} /><span>{SITE.hours}</span></span></li>}
              <li><L locale={locale} href="/apply/"><Icon name="doc" size={17} /><span>{u('Apply online', locale)}</span></L></li>
              <li><L locale={locale} href="/contact/"><Icon name="user" size={17} /><span>{u('Contact us', locale)}</span></L></li>
              <li><L locale={locale} href="/about/"><Icon name="star" size={17} /><span>{u('About us', locale)}</span></L></li>
              {SITE.nav.footerLinks.map((x) => <li key={x.href + x.label}><L locale={locale} href={x.href}><Icon name={iconForText(x.label, 'arrow')} size={17} /><span>{u(x.label, locale)}</span></L></li>)}
            </ul>
          </div>
        </div>
        <div className="legal">
          <span>
            {SITE.nav.copyright || `© ${new Date().getFullYear()} ${SITE.operator}`} ·{' '}
            <L locale={locale} href="/privacy/">{u('Privacy', locale)}</L> · <L locale={locale} href="/terms/">{u('Terms', locale)}</L> ·{' '}
            <L locale={locale} href="/disclaimer/">{u('Disclaimer', locale)}</L>
          </span>
        </div>
      </div>
    </footer>
  );
}
