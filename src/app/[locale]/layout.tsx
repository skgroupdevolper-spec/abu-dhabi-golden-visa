import { headers } from 'next/headers';
import { readJsonFile } from '@/lib/server/store';
import type { Metadata, Viewport } from 'next';
import { mergeCatalog } from '@/content/services-catalog';
import { getServiceOverrides } from '@/lib/server/content';
import type { ReactNode } from 'react';
import { notFound, redirect } from 'next/navigation';
import { Instrument_Serif, Manrope, Noto_Naskh_Arabic } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Water } from '@/components/Water';
import { Motion } from '@/components/Motion';
import { CalcModal } from '@/components/CalcModal';
import { OfferPopup } from '@/components/OfferPopup';
import { ChatWidget } from '@/components/ChatWidget';
import { LOCALE_CODES, isLocale, localeInfo } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import { applyRuntimeSync, getBlock, getSecrets } from '@/lib/server/settings';
import { DEFAULT_DESIGN, cleanDesign, designCss, fontHref, type Design } from '@/lib/design';
import { TrackingCode } from '@/components/SiteRuntime';
import { PriceFx } from '@/components/PriceFx';
import { siteRates } from '@/lib/server/fx';
import '../globals.css';

const display = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Manrope({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-body', display: 'swap' });
const arabic = Noto_Naskh_Arabic({ subsets: ['arabic'], variable: '--font-arabic', display: 'swap' });

// Pages are static for speed and refresh themselves at most every 60 seconds (and at once when the admin saves).
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = applyRuntimeSync();
  const seo = (await getSecrets()).seo;
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} | ${site.tagline}`, template: '%s' },
    description: 'Long-term UAE residency through property, business, professional and talent routes, with family sponsorship and full application support.',
    verification: { google: seo.googleVerify || undefined, other: seo.bingVerify ? { 'msvalidate.01': seo.bingVerify } : undefined },
    ...(site.brand?.favicon ? { icons: { icon: site.brand.favicon, apple: site.brand.favicon } } : {}),
  };
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f8f7f5' };

export function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const info = localeInfo(locale);
  const site = applyRuntimeSync();
  // A language switched off in Admin > Languages sends visitors to the English page.
  if (locale !== 'en' && site.languages?.length && !site.languages.includes(locale)) {
    const p = (await headers()).get('x-path') || '';
    redirect(p.replace(new RegExp(`^/${locale}(?=/|$)`), '') || '/');
  }
  const uiAll = await readJsonFile<Record<string, Record<string, string>>>('ui-translations.json', {});
  globalThis.__ADGV_UI = uiAll;
  const svcCat = mergeCatalog(await getServiceOverrides());
  const fx = await siteRates();
  (globalThis as { __ADGV_FX?: typeof fx }).__ADGV_FX = fx;
  globalThis.__ADGV_SVC = svcCat;
  const seo = (await getSecrets()).seo;
  const c = site.colors;
  const design = cleanDesign(await getBlock<Partial<Design>>('design', DEFAULT_DESIGN));
  const fonts = fontHref(design);
  const dcss = designCss(design);
  return (
    <html lang={info.htmlLang} dir={info.dir} className={`${display.variable} ${body.variable} ${arabic.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `window.__ADGV_SITE=${JSON.stringify(site).replace(/</g, '\\u003c')};window.__ADGV_SVC=${JSON.stringify(svcCat).replace(/</g, '\\u003c')};window.__ADGV_FX=${JSON.stringify(fx).replace(/</g, '\\u003c')};window.__ADGV_UI=${JSON.stringify({ [locale]: uiAll[locale] ?? {} }).replace(/</g, '\\u003c')}` }} />
        <style dangerouslySetInnerHTML={{ __html: `:root{--gold:${c.gold};--gold-deep:${c.goldDeep};--navy:${c.ink};--paper:${c.paper}}`.replace(/[<>]/g, '') }} />
        {fonts && <><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link rel="stylesheet" href={fonts} /></>}
        {dcss.trim() && <style id="site-design" dangerouslySetInnerHTML={{ __html: dcss }} />}
      </head>
      <body>
        <TrackingCode head={seo.headCode} body={seo.bodyCode} />
        <a href="#main" className="skip btn btn-navy">Skip to content</a>
        <Water />
        <Header locale={locale} />
        <main id="main" className="page">{children}</main>
        <Footer locale={locale} />
        <PriceFx />
        <Motion level={design.motion} textFx={design.textFx} cursor={design.cursor} smooth={design.smooth} />
        <CalcModal />
        <OfferPopup />
        <ChatWidget lang={locale} />
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
