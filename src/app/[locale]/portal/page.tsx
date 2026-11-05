import type { Metadata } from 'next';
import { SITE, waLink } from '@/lib/site';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = {
  title: `Client portal | ${SITE.name}`,
  description: 'Track your Golden Visa application, quotes, payments and documents.',
  robots: { index: false, follow: false },
};

const FEATURES = [
  ['doc', 'Quotes', 'Review and accept your written quote.'],
  ['coins', 'Payments', 'Pay securely and download every receipt.'],
  ['folder', 'Documents', 'Upload passports, deeds and certificates from your phone.'],
  ['clock', 'Live status', 'See each step of your application and its expected date.'],
];

/** Customer dashboard served on the portal subdomain. Sign-in and live data arrive in Phase 3. */
export default function Portal() {
  return (
    <section className="phero">
      <div className="wrap" style={{ maxWidth: 980 }}>
        <p className="eyebrow">Client portal</p>
        <h1>Your Golden Visa file, <em className="gold">in one place.</em></h1>
        <p className="lead">Sign-in for clients is opening soon. Until then, your advisor sends every quote, receipt and update on WhatsApp.</p>
        <div className="cta" style={{ marginTop: 24 }}>
          <a className="btn btn-red" href={waLink('Hello, I would like an update on my Golden Visa application.')} target="_blank" rel="noopener">
            <Icon name="wa" size={18} /> Message my advisor
          </a>
          <a className="btn btn-glass" href={SITE.url}>Back to website</a>
        </div>
        <div className="grid" style={{ marginTop: 40 }}>
          {FEATURES.map(([ic, t, d]) => (
            <div className="card glass" key={t}><span className="ico"><Icon name={ic} /></span><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}
