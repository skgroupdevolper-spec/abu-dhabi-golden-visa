import 'server-only';
import { LOCALES, localizePath } from '@/lib/i18n';
import { SITE, liveLocales } from '@/lib/site';
import { getBlock, saveBlock } from './settings';
import { newId } from './store';

/** IndexNow key (created once). Served at /indexnow-key.txt for search engines to verify. */
export async function indexNowKey() {
  let k = await getBlock<string>('indexnowKey', '');
  if (!k) { k = newId(16); await saveBlock('indexnowKey', k); }
  return k;
}

/**
 * Tells Bing, Yandex, Seznam, Naver and other IndexNow engines that pages changed, in every language.
 * Google discovers changes through the sitemap and Search Console.
 */
export async function pingIndexNow(paths: string[]) {
  if (!/^https:\/\//.test(SITE.url) || SITE.url.includes('localhost')) return { ok: false, count: 0 };
  const key = await indexNowKey();
  const on = liveLocales().map((l) => l.code);
  // Every language that is switched on on the website.
  const urlList = [...new Set(paths.flatMap((p) => LOCALES.filter((l) => on.includes(l.code)).map((l) => SITE.url + localizePath(p, l.code))))].slice(0, 10000);
  const host = new URL(SITE.url).host;
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: `${SITE.url}/indexnow-key.txt`, urlList }),
  });
  return { ok: r.ok || r.status === 202, count: urlList.length, status: r.status };
}
