import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Instrument_Serif, Manrope, Noto_Naskh_Arabic } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Water } from '@/components/Water';
import { Motion } from '@/components/Motion';
import { LOCALE_CODES, isLocale, localeInfo } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import '../globals.css';

const display = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Manrope({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-body', display: 'swap' });
const arabic = Noto_Naskh_Arabic({ subsets: ['arabic'], variable: '--font-arabic', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | ${SITE.tagline}`, template: '%s' },
  description: 'Long-term UAE residency through property, business, professional and talent routes, with family sponsorship and full application support.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f8f7f5' };

export function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const info = localeInfo(locale);
  return (
    <html lang={info.htmlLang} dir={info.dir} className={`${display.variable} ${body.variable} ${arabic.variable}`}>
      <body>
        <a href="#main" className="btn btn-navy" style={{ position: 'absolute', left: -9999, top: 8, zIndex: 300 }}>Skip to content</a>
        <Water />
        <Header locale={locale} />
        <main id="main" className="page">{children}</main>
        <Footer locale={locale} />
        <Motion />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              name: SITE.name,
              url: SITE.url,
              logo: SITE.url + '/brand/coin.webp',
              email: SITE.email,
              telephone: SITE.phone,
              address: { '@type': 'PostalAddress', addressLocality: 'Business Bay, Dubai', addressCountry: 'AE' },
              parentOrganization: { '@type': 'Organization', name: SITE.operator },
            }),
          }}
        />
      </body>
    </html>
  );
}
