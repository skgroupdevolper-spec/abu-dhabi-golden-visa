import 'server-only';
import { BLOG } from '@/content/blog';
import { PAGES } from '@/content/pages';
import { slugify } from '@/lib/markdown';
import { complete, parseJson, underDailyLimit } from './ai';
import { insert, list, notify } from './collections';
import type { Post } from './content';
import { getBlock, saveBlock } from './settings';
import { newId, now } from './store';
import type { AiLog } from './translate';

export type AutoPub = { on: boolean; perWeek: number; review: boolean; keywords: string; used: string[]; tone: string; words: number; knowledge: string; lastRun?: string };
export const AP0: AutoPub = { on: false, perWeek: 2, review: true, keywords: 'Abu Dhabi Golden Visa for property investors 2026\nGolden Visa for doctors in Abu Dhabi\nHow to add parents to a Golden Visa', used: [], tone: 'clear, friendly, expert, plain English', words: 900, knowledge: '', lastRun: undefined };

const grams = (t: string) => { const w = t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean); const g = new Set<string>(); for (let i = 0; i + 2 < w.length; i++) g.add(`${w[i]} ${w[i + 1]} ${w[i + 2]}`); return g; };
function similarity(a: string, b: string) {
  const x = grams(a), y = grams(b);
  if (!x.size || !y.size) return 0;
  let n = 0; for (const g of x) if (y.has(g)) n++;
  return n / Math.min(x.size, y.size);
}

/** Writes one original article for the next keyword and puts it in the review queue (or publishes it). */
export async function generateDraft(force = false): Promise<{ ok: boolean; message: string; id?: string }> {
  const cfg = await getBlock<AutoPub>('autopub', AP0);
  const kws = cfg.keywords.split('\n').map((k) => k.trim()).filter(Boolean);
  const keyword = kws.find((k) => !cfg.used.includes(k));
  if (!keyword) return { ok: false, message: 'All keywords are used. Add new keywords.' };
  if (!force && !(await underDailyLimit('auto'))) return { ok: false, message: 'Daily AI limit reached.' };
  const posts = await list<Post>('posts');
  const titles = [...BLOG.map((b) => b.h1), ...posts.map((p) => p.title)].slice(0, 80);
  const links = PAGES.filter((p) => !p.path.startsWith('/blog/')).slice(0, 60).map((p) => `${p.path} = ${p.h1}`).join('\n');
  const system = `You write original, accurate articles for an Abu Dhabi Golden Visa consultancy website (operator: Brightlink Management Consultancy LLC). Tone: ${cfg.tone}. Rules: write in your own words, never copy other websites; never promise guaranteed approval or fixed processing times; say fees and rules can change and must be confirmed; no invented statistics, quotes or reviews. Use Markdown with ## headings and short paragraphs. Add 3 to 6 internal links using only these paths:\n${links}\n${cfg.knowledge ? `Company knowledge:\n${cfg.knowledge}\n` : ''}Return JSON: {"title","slug","meta" (max 155 chars),"summary" (2 sentences),"body" (Markdown, about ${cfg.words} words),"faq":[{"q","a"}] (3-5 items)}.`;
  try {
    const out = await complete(system, [{ role: 'user', content: `Keyword: ${keyword}\nAvoid repeating these existing titles: ${titles.join(' | ')}` }], { json: true, maxTokens: 6000, kind: 'auto' });
    const a = parseJson<{ title: string; slug: string; meta: string; summary: string; body: string; faq: { q: string; a: string }[] }>(out);
    if (!a.title || !a.body) throw new Error('The AI reply was incomplete.');
    const sim = Math.max(0, ...posts.map((p) => similarity(a.body, p.body)));
    let slug = slugify(a.slug || a.title);
    if (posts.some((p) => p.slug === slug) || PAGES.some((p) => p.path === `/blog/${slug}/`)) slug = `${slug}-${newId(2)}`;
    const publish = !cfg.review && sim < 0.35;
    const post: Post = { id: newId(6), slug, title: a.title.slice(0, 200), meta: (a.meta || a.summary).slice(0, 320), summary: (a.summary || '').slice(0, 600), body: a.body.slice(0, 60000), faq: (a.faq || []).slice(0, 8), status: publish ? 'published' : 'review', source: 'auto', author: 'Abu Dhabi Golden Visa editorial team', reviewer: publish ? 'Auto Publisher' : '', keyword, similarity: Math.round(sim * 100) / 100, createdAt: now(), updatedAt: now(), publishedAt: publish ? now() : undefined };
    await insert<Post>('posts', post);
    await saveBlock('autopub', { ...cfg, used: [...cfg.used, keyword], lastRun: now() });
    await insert<AiLog>('ai-log', { id: newId(6), at: now(), kind: 'autopub', text: `${publish ? 'Published' : 'Drafted for review'}: ${post.title} (similarity ${Math.round(sim * 100)}%)`, ok: true }, 1000);
    await notify('request', `Auto Publisher: "${post.title}" ${publish ? 'published' : 'is waiting for your review'}`, `/admin/posts/${post.id}/`);
    return { ok: true, message: publish ? 'Article published.' : 'Article drafted and waiting in the review queue.', id: post.id };
  } catch (e) {
    await insert<AiLog>('ai-log', { id: newId(6), at: now(), kind: 'autopub', text: `${keyword}: ${(e as Error).message}`.slice(0, 300), ok: false }, 1000);
    return { ok: false, message: (e as Error).message };
  }
}

/** Called by the daily scheduled job: keeps to the weekly number of articles. */
export async function autoRun() {
  const cfg = await getBlock<AutoPub>('autopub', AP0);
  if (!cfg.on) return { ok: false, message: 'Auto Publisher is off.' };
  const week = Date.now() - 7 * 864e5;
  const recent = (await list<Post>('posts')).filter((p) => p.source === 'auto' && new Date(p.createdAt).getTime() > week).length;
  if (recent >= cfg.perWeek) return { ok: true, message: 'Weekly number reached.' };
  return generateDraft();
}
