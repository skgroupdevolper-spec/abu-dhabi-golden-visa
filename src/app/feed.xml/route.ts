import { SITE } from '@/lib/site';
import { getPublishedPosts } from '@/lib/server/content';

export const revalidate = 600;

const x = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Latest 50 blog articles as RSS (/feed.xml). */
export async function GET() {
  const posts = (await getPublishedPosts().catch(() => [])).filter((p) => !p.noindex).slice(0, 50);
  const items = posts.map((p) => {
    const url = `${SITE.url}/blog/${p.slug}/`;
    const img = p.cover ? (p.cover.startsWith('http') ? p.cover : SITE.url + p.cover) : '';
    return `<item><title>${x(p.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${x(p.meta || p.summary || '')}</description>${p.publishedAt ? `<pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>` : ''}${img ? `<enclosure url="${x(img)}" type="image/${/\.png$/i.test(img) ? 'png' : /\.jpe?g$/i.test(img) ? 'jpeg' : 'webp'}"/>` : ''}</item>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${x(SITE.name)}</title><link>${SITE.url}/blog/</link><description>${x(SITE.name)} blog</description><language>en</language><atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
}
