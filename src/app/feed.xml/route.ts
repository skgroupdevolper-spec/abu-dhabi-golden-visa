import { SITE } from '@/lib/site';
import { getOverrides, getPublishedPosts } from '@/lib/server/content';
import { BLOG } from '@/content/blog';

export const revalidate = 600;

const x = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Latest 50 blog articles as RSS (/feed.xml). */
export async function GET() {
  const posts = (await getPublishedPosts().catch(() => [])).filter((p) => !p.noindex).slice(0, 50);
  const gone = Object.entries(await getOverrides().catch(() => ({}))).filter(([, o]) => (o as { hidden?: boolean; noindex?: boolean })?.hidden || (o as { noindex?: boolean })?.noindex).map(([k]) => k);
  // Written guides that ship with the website, after the articles added in the admin.
  const guides = BLOG.filter((b) => !gone.includes(b.path) && !posts.some((p) => `/blog/${p.slug}/` === b.path))
    .map((b) => ({ slug: b.path.replace(/^\/blog\/|\/$/g, ''), title: b.h1, meta: b.meta, summary: '', publishedAt: b.article?.reviewed, cover: b.image }));
  const items = [...posts, ...guides].slice(0, 80).map((p) => {
    const url = `${SITE.url}/blog/${p.slug}/`;
    const img = p.cover ? (p.cover.startsWith('http') ? p.cover : SITE.url + p.cover) : '';
    return `<item><title>${x(p.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${x(p.meta || p.summary || '')}</description>${p.publishedAt && !Number.isNaN(Date.parse(p.publishedAt)) ? `<pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>` : ''}${img ? `<enclosure url="${x(img)}" type="image/${/\.png$/i.test(img) ? 'png' : /\.jpe?g$/i.test(img) ? 'jpeg' : 'webp'}"/>` : ''}</item>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${x(SITE.name)}</title><link>${SITE.url}/blog/</link><description>${x(SITE.name)} blog</description><language>en</language><atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
}
