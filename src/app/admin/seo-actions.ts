'use server';

import { FULL, requireAdmin } from '@/lib/server/auth';
import { PAGES } from '@/content/pages';
import { getCategories, getCustomPages, getPublishedPosts } from '@/lib/server/content';
import { pingIndexNow } from '@/lib/server/indexnow';
import { getSecrets, saveSecrets } from '@/lib/server/settings';
import { revalidatePath } from 'next/cache';

type St = { ok?: string; error?: string } | undefined;

/** Sends every public page in all languages to IndexNow search engines. */
export async function submitAll(): Promise<St> {
  await requireAdmin(FULL);
  const [posts, customs, cats] = await Promise.all([getPublishedPosts(), getCustomPages(), getCategories()]);
  const paths = ['/', ...PAGES.map((p) => p.path), ...customs.filter((c) => !c.noindex && !c.hidden).map((c) => c.path), ...cats.map((c) => `/blog/category/${c.slug}/`), ...posts.map((p) => `/blog/${p.slug}/`)];
  try {
    const r = await pingIndexNow(paths);
    if (!r.count) return { error: 'Instant indexing works on the live domain (https://www.abudhabigoldenvisa.com), not on the preview.' };
    return r.ok ? { ok: `Sent ${r.count} addresses (all languages) to Bing, Yandex, Seznam and Naver. Google reads your sitemap.` } : { error: `The search engines answered ${r.status}. Try again later.` };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function saveSeoSettings(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const g = (k: string, n = 300) => String(f.get(k) ?? '').trim().slice(0, n);
  const cur = (await getSecrets()).seo;
  await saveSecrets({ seo: { ...cur, homeTitle: g('homeTitle', 160), homeMeta: g('homeMeta', 320), googleVerify: g('googleVerify', 200).replace(/.*content="([^"]+)".*/, '$1'), bingVerify: g('bingVerify', 200).replace(/.*content="([^"]+)".*/, '$1') } });
  revalidatePath('/', 'layout');
  return { ok: 'Saved.' };
}
