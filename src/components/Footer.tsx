import { NAV } from '@/content/nav';
import type { Locale } from '@/lib/i18n';
import { SITE, waLink } from '@/lib/site';
import { L } from './L';

export function Footer({ locale }: { locale: Locale }) {
  const groups = NAV.flatMap((n) => n.groups ?? []);
  const pick = (title: string) => groups.find((g) => g.title === title)?.links ?? [];
  const cols = [
    { title: 'Golden Visa', links: pick('Golden Visa') },
    { title: 'Family & Residency', links: pick('Family & Residency') },
    { title: 'Resources', links: pick('Resources') },
  ];
  return (
    <footer className="site">
      <div className="wrap">
        <div className="fgrid">
          <div className="fbrand">
            <img src="/brand/logo.webp" alt={SITE.name} width={200} height={50} />
            <p>
              {SITE.name} is an independent residency consultancy website managed by {SITE.operator}, UAE. Trade Licence No. {SITE.licence}.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4>{c.title}</h4>
              <ul>
                {c.links.map((l) => (
                  <li key={l.href + l.label}>
                    <L locale={locale} href={l.href}>{l.label}</L>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener">WhatsApp {SITE.whatsappDisplay}</a></li>
              <li><span>{SITE.email}</span></li>
              <li><span>{SITE.office}</span></li>
              <li><L locale={locale} href="/contact/">Contact us</L></li>
              <li><L locale={locale} href="/about/">About us</L></li>
            </ul>
          </div>
        </div>
        <div className="legal">
          <strong>{SITE.disclaimer}</strong>
          <span>
            © 2026 {SITE.operator} ·{' '}
            <L locale={locale} href="/privacy/">Privacy</L> · <L locale={locale} href="/terms/">Terms</L> ·{' '}
            <L locale={locale} href="/disclaimer/">Disclaimer</L>
          </span>
        </div>
      </div>
    </footer>
  );
}
