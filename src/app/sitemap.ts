import type { MetadataRoute } from 'next';
import { PAGES } from '@/content/pages';
import { localizePath } from '@/lib/i18n';
import { SITE, liveLocales } from '@/lib/site';
import { getCategories, getCustomPages, getOverrides, getPublishedPosts, getServiceOverrides } from '@/lib/server/content';
import { readiness } from '@/lib/server/translate';

export const revalidate = 600;

const abs = (u?: string) => (u ? (u.startsWith('http') ? u : SITE.url + u) : undefined);

/** Every public page in all 20 languages, with hreflang alternates, images and last-change dates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, over, customs, cats, svc] = await Promise.all([
    getPublishedPosts().catch(() => []), getOverrides().catch(() => ({})), getCustomPages().catch(() => []), getCategories().catch(() => []), getServiceOverrides().catch(() => ({ hidden: [] as string[], prices: {}, notes: {} })),
  ]);
  const o = over as Record<string, { noindex?: boolean; hidden?: boolean; image?: string; at?: string }>;
  const entries: { path: string; image?: string; at?: string; pri: number }[] = [
    { path: '/', pri: 1, image: '/brand/coin.webp' },
    ...PAGES.filter((p) => !o[p.path]?.noindex && !o[p.path]?.hidden && !svc.hidden.includes(p.path) && p.path !== '/apply/').map((p) => ({ path: p.path, image: o[p.path]?.image || p.image, at: o[p.path]?.at, pri: p.path.split('/').length > 3 ? 0.6 : 0.8 })),
    ...customs.filter((c) => !c.noindex && !c.hidden).map((c) => ({ path: c.path, image: c.image, at: c.at, pri: 0.7 })),
    ...cats.map((c) => ({ path: `/blog/category/${c.slug}/`, image: c.image, pri: 0.5 })),
    ...posts.filter((p) => !p.noindex).map((p) => ({ path: `/blog/${p.slug}/`, image: p.cover, at: p.updatedAt, pri: 0.7 })),
  ];
  const now = new Date();
  const { ready, at } = await readiness();
  return entries.flatMap((e) => {
    // Only translated language versions go to Google (untranslated ones are noindex until done).
    const locs = liveLocales().filter((l) => ready(e.path, l.code));
    const languages: Record<string, string> = {};
    for (const l of locs) languages[l.htmlLang] = SITE.url + localizePath(e.path, l.code);
    languages['x-default'] = SITE.url + e.path;
    return locs.map((l) => ({
      url: SITE.url + localizePath(e.path, l.code),
      lastModified: at(e.path, l.code) ? new Date(at(e.path, l.code)!) : e.at ? new Date(e.at) : now,
      changeFrequency: e.path === '/' ? ('daily' as const) : ('weekly' as const),
      priority: e.pri,
      alternates: { languages },
      ...(e.image && !e.image.includes('?') ? { images: [abs(e.image)!] } : {}),
    }));
  });
}
