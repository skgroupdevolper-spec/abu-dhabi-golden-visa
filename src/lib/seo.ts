import type { Metadata } from 'next';
import { LOCALES, localizePath, type Locale } from './i18n';
import { SITE } from './site';

/** Title, description, canonical and hreflang alternates for a page in one language. */
export function pageMetadata(path: string, locale: Locale, title: string, description: string, o: { image?: string; noindex?: boolean; canonical?: string; type?: 'website' | 'article'; published?: string } = {}): Metadata {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l.htmlLang] = SITE.url + localizePath(path, l.code);
  languages['x-default'] = SITE.url + path;
  const url = SITE.url + localizePath(path, locale);
  const img = o.image ? (o.image.startsWith('http') ? o.image : SITE.url + o.image) : SITE.url + '/brand/coin.webp';
  return {
    title,
    description,
    alternates: { canonical: o.canonical || url, languages },
    robots: o.noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: { title, description, url, siteName: SITE.name, images: [{ url: img }], type: o.type ?? 'website', ...(o.published ? { publishedTime: o.published } : {}) },
    twitter: { card: 'summary_large_image', title, description, images: [img] },
  };
}
