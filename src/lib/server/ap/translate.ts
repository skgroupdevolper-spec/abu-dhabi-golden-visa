import 'server-only';
// A published article is translated by the website's own translation engine (Languages in the admin),
// the same way as an article saved by hand, so the publisher only saves the English text.
import { list } from '../collections';
import type { Post } from '../content';

export async function onContentSaved(entity: string, id: string) {
  if (entity !== 'post') return;
  const p = (await list<Post>('posts')).find((x) => x.id === id);
  if (p?.status === 'published') await import('../translate').then((m) => m.autoTranslate([`/blog/${p.slug}/`]));
}
export async function translationQueue() { return [] as { slug: string; langs: string[] }[]; }
export async function translateStep(): Promise<string> { return 'articles are translated by the website languages engine'; }
