import type { Metadata } from 'next';
import { LOCALES, localizePath, type Locale } from './i18n';
import { SITE } from './site';

/** Title, description, canonical and hreflang alternates for a page in one language. */
export function pageMetadata(path: string, locale: Locale, title: string, description: string): Metadata {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l.htmlLang] = SITE.url + localizePath(path, l.code);
  languages['x-default'] = SITE.url + path;
  const url = SITE.url + localizePath(path, locale);
  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, siteName: SITE.name, images: [{ url: SITE.url + '/brand/coin.webp' }], type: 'website' },
  };
}
