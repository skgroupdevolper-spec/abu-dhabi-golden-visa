import type { MetadataRoute } from 'next';
import { PAGES } from '@/content/pages';
import { LOCALES, localizePath } from '@/lib/i18n';
import { SITE } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', ...PAGES.map((p) => p.path)];
  const now = new Date();
  return paths.flatMap((p) => {
    const languages: Record<string, string> = {};
    for (const l of LOCALES) languages[l.htmlLang] = SITE.url + localizePath(p, l.code);
    return LOCALES.map((l) => ({
      url: SITE.url + localizePath(p, l.code),
      lastModified: now,
      changeFrequency: p === '/' ? ('weekly' as const) : ('monthly' as const),
      priority: p === '/' ? 1 : p.split('/').length > 3 ? 0.6 : 0.8,
      alternates: { languages },
    }));
  });
}
