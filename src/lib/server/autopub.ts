import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BLOG } from '@/content/blog';
import { PAGES } from '@/content/pages';
import { slugify } from '@/lib/markdown';
import { complete, parseJson, underDailyLimit } from './ai';
import { insert, list, notify, patch } from './collections';
import { getCategories, type MediaItem, type Post } from './content';
import { getBlock, getSecrets, saveBlock } from './settings';
import { DATA_DIR, newId, now } from './store';
import type { AiLog } from './translate';

// Auto Publisher: missions (topics with their own schedule), a keyword queue, a writer and an editor AI,
// quality gates (length, similarity, blocked phrases, FAQs), covers and a review queue.

export type AutoPub = {
  on: boolean; perWeek: number; review: boolean; keywords: string; used: string[]; tone: string; words: number; knowledge: string; lastRun?: string;
  category?: string; covers?: string; audience?: string; faqCount?: number; minWords?: number; maxSimilarity?: number; banned?: string; requireFaq?: boolean;
  aiCovers?: boolean; coverStyle?: 'designed' | 'photos' | 'ai'; editorPass?: boolean; internalLinks?: number; references?: string; paused?: boolean; maxWords?: number; photoStyle?: string;
};
export const AP0: AutoPub = {
  on: false, perWeek: 2, review: true, keywords: 'Abu Dhabi Golden Visa for property investors 2026\nGolden Visa for doctors in Abu Dhabi\nHow to add parents to a Golden Visa', used: [],
  tone: 'clear, friendly, expert, plain English', words: 900, knowledge: '', coverStyle: 'designed', editorPass: false, internalLinks: 4, requireFaq: true, minWords: 600, maxSimilarity: 35,
};

export type Mission = {
  id: string; name: string; active: boolean; focus: string; seeds: string; titles: string; countries: string; perWeek: number; after: 'publish' | 'draft';
  minWords: number; maxWords: number; category: string; end: 'never' | 'date' | 'count' | 'titles'; endDate?: string; endCount?: number;
  done: number; used: string[]; createdAt: string; lastRun?: string;
};
export type Job = { id: string; at: string; missionId?: string; mission?: string; topic: string; status: 'writing' | 'done' | 'held' | 'failed'; postId?: string; title?: string; note?: string };

const grams = (t: string) => { const w = t.toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean); const g = new Set<string>(); for (let i = 0; i + 2 < w.length; i++) g.add(`${w[i]} ${w[i + 1]} ${w[i + 2]}`); return g; };
export function similarity(a: string, b: string) {
  const x = grams(a), y = grams(b);
  if (!x.size || !y.size) return 0;
  let n = 0; for (const g of x) if (y.has(g)) n++;
  return n / Math.min(x.size, y.size);
}
const log = (text: string, ok = true) => insert<AiLog>('ai-log', { id: newId(6), at: now(), kind: 'autopub', text: text.slice(0, 300), ok }, 1000);

/** Original cover picture with OpenAI or Gemini images (needs a key). Returns the media link. */
export async function aiCover(title: string, style = ''): Promise<string | undefined> {
  const a = (await getSecrets()).ai;
  const prov = a.images?.provider ?? (a.openaiKey ? 'openai' : 'none');
  const prompt = `Editorial photograph for an article titled "${title}". Modern Abu Dhabi skyline or premium residential setting, warm golden light, white and gold palette${style ? `, ${style}` : ''}. Realistic, sharp. No text, no letters, no logos, no flags, no government emblems, no readable documents.`;
  let b64: string | undefined;
  if (prov === 'openai' && a.openaiKey) {
    const r = await fetch('https://api.openai.com/v1/images/generations', { method: 'POST', headers: { Authorization: `Bearer ${a.openaiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: a.images?.model || 'gpt-image-1', prompt, size: '1536x1024', quality: 'medium', n: 1 }), signal: AbortSignal.timeout(150000) });
    if (!r.ok) throw new Error(`Cover image (OpenAI): ${r.status}`);
    b64 = (await r.json())?.data?.[0]?.b64_json;
  } else if (prov === 'gemini' && a.geminiKey) {
    const model = a.images?.model || 'gemini-2.5-flash-image';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', headers: { 'x-goog-api-key': a.geminiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }), signal: AbortSignal.timeout(150000) });
    if (!r.ok) throw new Error(`Cover image (Gemini): ${r.status}`);
    const j = await r.json();
    b64 = j?.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data: string } }) => p.inlineData)?.inlineData?.data;
  } else return undefined;
  if (!b64) return undefined;
  const name = `${newId(4)}-cover.png`;
  await mkdir(path.join(DATA_DIR, 'media'), { recursive: true });
  await writeFile(path.join(DATA_DIR, 'media', name), Buffer.from(b64, 'base64'));
  await insert<MediaItem>('media', { id: newId(6), file: name, name: `Cover: ${title}`.slice(0, 100), type: 'image/png', size: Math.round(b64.length * 0.75), alt: title.slice(0, 200), at: now() });
  return `/media/${name}`;
}

/** New keyword ideas people search for, not covered yet (optionally for one mission focus and countries). */
export async function suggestKeywords(n = 10, focus = '', countries = ''): Promise<string[]> {
  const cfg = await getBlock<AutoPub>('autopub', AP0);
  const posts = await list<Post>('posts');
  const have = [...BLOG.map((b) => b.h1), ...posts.map((p) => p.title), ...cfg.keywords.split('\n')].slice(0, 150);
  const out = await complete('You plan SEO content for an Abu Dhabi Golden Visa and UAE residency consultancy. Suggest long-tail search phrases real people type into Google in 2026. Return JSON {"keywords": string[]}.',
    [{ role: 'user', content: `${focus ? `Focus: ${focus}\n` : ''}${countries ? `Readers from: ${countries}\n` : ''}Give ${n} new keywords not covered by: ${have.join(' | ')}` }], { json: true, maxTokens: 1200, kind: 'auto', use: 'writer' });
  return (parseJson<{ keywords: string[] }>(out).keywords || []).map((k) => String(k).trim()).filter((k) => k.split(' ').length >= 2).slice(0, n);
}

type Brief = { topic: string; title?: string; focus?: string; countries?: string; minWords?: number; maxWords?: number; category?: string; cover?: string; publishAt?: string; after?: 'publish' | 'draft'; mission?: Mission };

/** Writes one article (writer AI, optional editor AI), checks quality, adds a cover and saves it. */
export async function writeArticle(b: Brief): Promise<{ ok: boolean; message: string; id?: string }> {
  const cfg = await getBlock<AutoPub>('autopub', AP0);
  const job: Job = { id: newId(6), at: now(), missionId: b.mission?.id, mission: b.mission?.name, topic: b.title || b.topic, status: 'writing' };
  await insert<Job>('ap-jobs', job, 300);
  const posts = await list<Post>('posts');
  const cats = await getCategories();
  const titles = [...BLOG.map((x) => x.h1), ...posts.map((p) => p.title)].slice(0, 90);
  const links = PAGES.filter((p) => !p.path.startsWith('/blog/')).slice(0, 70).map((p) => `${p.path} = ${p.h1}`).join('\n');
  const minW = b.minWords || cfg.minWords || 600, maxW = b.maxWords || cfg.maxWords || Math.max(minW + 400, cfg.words || 1100);
  const system = `You write original, accurate articles for an Abu Dhabi Golden Visa consultancy website (operator: Brightlink Management Consultancy LLC). Tone: ${cfg.tone}.
Rules: write in your own words, never copy other websites; never promise guaranteed approval or fixed processing times; say fees and rules can change and must be confirmed; no invented statistics, quotes or reviews.
Length: ${minW}-${maxW} words. Use Markdown with ## and ### headings, short paragraphs, lists, a short conclusion with a call to action. Put the keyword naturally in the title, first paragraph and one heading.
Add ${cfg.internalLinks ?? 4} internal links using only these paths:\n${links}
${cfg.audience ? `Audience: ${cfg.audience}.\n` : ''}${b.focus ? `Mission focus: ${b.focus}\n` : ''}${b.countries ? `Readers mainly from: ${b.countries}. Add country-specific notes on documents and attestation where useful.\n` : ''}${cfg.knowledge ? `Company knowledge:\n${cfg.knowledge}\n` : ''}${cfg.references ? `Trusted references to base facts on (do not copy wording):\n${cfg.references}\n` : ''}
Return JSON: {"title" (max 65 chars),"seoTitle" (max 60),"slug","keyword","meta" (130-155 chars),"summary" (2 sentences),"category" (one of: ${cats.map((c) => c.slug).join(', ')}),"tags" (3-6),"body","faq":[{"q","a"}] (${cfg.faqCount || 4} items)}.`;
  try {
    const out = await complete(system, [{ role: 'user', content: `${b.title ? `Title to write: ${b.title}\n` : ''}Keyword: ${b.topic}\nAvoid repeating these existing titles: ${titles.join(' | ')}` }], { json: true, maxTokens: 7000, kind: 'auto', use: 'writer' });
    const a = parseJson<{ title: string; seoTitle?: string; slug: string; keyword?: string; meta: string; summary: string; category?: string; tags?: string[]; body: string; faq: { q: string; a: string }[] }>(out);
    if (!a.title || !a.body) throw new Error('The AI reply was incomplete.');
    if (b.title) a.title = b.title;
    if (cfg.editorPass) {
      const ed = await complete(`You are a senior editor. Improve clarity, accuracy and flow of this Markdown article for an Abu Dhabi Golden Visa consultancy. Keep facts, links, headings and length; remove any promise of guaranteed approval${cfg.banned ? ` and these phrases: ${cfg.banned.split('\n').join(', ')}` : ''}. Return the article only, in Markdown.`, [{ role: 'user', content: a.body }], { maxTokens: 7000, kind: 'auto', use: 'editor' }).catch(() => '');
      if (ed && ed.length > a.body.length * 0.6) a.body = ed.replace(/^```(markdown)?|```$/g, '').trim();
    }
    const sim = Math.max(0, ...posts.map((p) => similarity(a.body, p.body)));
    const words = a.body.split(/\s+/).filter(Boolean).length;
    const banned = (cfg.banned ?? 'guaranteed approval\n100% approval\nguarantee').split('\n').map((x) => x.trim().toLowerCase()).filter(Boolean);
    const gates = [
      words < minW * 0.85 && `only ${words} words`,
      sim > (cfg.maxSimilarity ?? 35) / 100 && `similarity ${Math.round(sim * 100)}%`,
      banned.find((x) => a.body.toLowerCase().includes(x)) && 'contains a blocked phrase',
      (cfg.requireFaq ?? true) && !(a.faq || []).length && 'no FAQs',
    ].filter(Boolean) as string[];
    const wantPublish = (b.after ?? (cfg.review ? 'draft' : 'publish')) === 'publish';
    const publish = wantPublish && !gates.length;
    let slug = slugify(a.slug || a.title);
    if (posts.some((p) => p.slug === slug) || PAGES.some((p) => p.path === `/blog/${slug}/`)) slug = `${slug}-${newId(2)}`;
    const photos = (cfg.covers ?? '').split('\n').map((c) => c.trim()).filter(Boolean);
    let cover = b.cover;
    if (!cover && cfg.coverStyle === 'photos' && photos.length) cover = photos[posts.filter((p) => p.source === 'auto').length % photos.length];
    if (!cover && (cfg.coverStyle === 'ai' || cfg.aiCovers)) cover = await aiCover(a.title, cfg.photoStyle).catch(() => undefined);
    const category = b.category || cfg.category || (cats.some((c) => c.slug === a.category) ? a.category : undefined);
    const post: Post = {
      id: newId(6), slug, title: a.title.slice(0, 200), meta: (a.meta || a.summary).slice(0, 320), summary: (a.summary || '').slice(0, 600), body: a.body.slice(0, 80000), faq: (a.faq || []).slice(0, 8),
      status: publish ? 'published' : gates.length ? 'draft' : 'review', source: 'auto', author: 'Abu Dhabi Golden Visa editorial team', reviewer: publish ? 'Auto Publisher' : '', keyword: a.keyword || b.topic,
      similarity: Math.round(sim * 100) / 100, createdAt: now(), updatedAt: now(), publishedAt: publish ? b.publishAt || now() : undefined, scheduledAt: b.publishAt,
      seoTitle: (a.seoTitle || '').slice(0, 70), category, tags: (a.tags || []).slice(0, 8).map((t) => String(t).slice(0, 40)), cover, coverAlt: a.title.slice(0, 120),
    };
    await insert<Post>('posts', post);
    await patch<Job>('ap-jobs', job.id, (j) => ({ ...j, status: gates.length ? 'held' : 'done', postId: post.id, title: post.title, note: gates.join(', ') || (publish ? 'Published' : 'Waiting for review') }));
    await log(`${publish ? 'Published' : gates.length ? `Held as draft (${gates.join(', ')})` : 'Drafted for review'}: ${post.title} (similarity ${Math.round(sim * 100)}%)${b.mission ? ` · mission ${b.mission.name}` : ''}`);
    await notify('request', `Auto Publisher: "${post.title}" ${publish ? 'published' : 'is waiting for your review'}`, `/admin/posts/${post.id}/`);
    if (publish) void import('./translate').then((m) => m.autoTranslate([`/blog/${slug}/`])).catch(() => {});
    return { ok: true, message: publish ? 'Article published.' : gates.length ? `Article held as draft: ${gates.join(', ')}.` : 'Article drafted and waiting in the review queue.', id: post.id };
  } catch (e) {
    await patch<Job>('ap-jobs', job.id, (j) => ({ ...j, status: 'failed', note: (e as Error).message.slice(0, 200) }));
    await log(`${b.topic}: ${(e as Error).message}`, false);
    return { ok: false, message: (e as Error).message };
  }
}

/** Next topic of a mission: custom titles first, then seed keywords, then AI ideas from its focus. */
async function nextForMission(m: Mission): Promise<Brief | null> {
  const titles = m.titles.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [title, date, category, image] = l.split('|').map((x) => x?.trim()); return { title, date, category, image }; });
  const t = titles.find((x) => x.title && !m.used.includes(x.title));
  if (t) return { topic: t.title, title: t.title, publishAt: t.date && !Number.isNaN(Date.parse(t.date)) ? new Date(t.date).toISOString() : undefined, category: t.category ? slugify(t.category) : m.category, cover: t.image, mission: m, focus: m.focus, countries: m.countries, minWords: m.minWords, maxWords: m.maxWords, after: m.after };
  if (m.end === 'titles') return null;
  let seeds = m.seeds.split('\n').map((k) => k.trim()).filter((k) => k && !m.used.includes(k));
  if (!seeds.length && m.focus) {
    const ideas = await suggestKeywords(8, m.focus, m.countries).catch(() => []);
    if (ideas.length) { await patch<Mission>('ap-missions', m.id, (x) => ({ ...x, seeds: [x.seeds.trim(), ...ideas].filter(Boolean).join('\n') })); seeds = ideas; }
  }
  return seeds[0] ? { topic: seeds[0], mission: m, focus: m.focus, countries: m.countries, minWords: m.minWords, maxWords: m.maxWords, category: m.category, after: m.after } : null;
}

const weekAgo = () => Date.now() - 7 * 864e5;

/** One step of the publisher: each active mission that is behind its weekly number writes one article. */
export async function autoRun(force = false): Promise<{ ok: boolean; message: string }> {
  const cfg = await getBlock<AutoPub>('autopub', AP0);
  if (!force && (!cfg.on || cfg.paused)) return { ok: false, message: cfg.paused ? 'Paused.' : 'Auto Publisher is off.' };
  const missions = (await list<Mission>('ap-missions')).filter((m) => m.active);
  const posts = await list<Post>('posts');
  const out: string[] = [];
  for (const m of missions) {
    if (m.end === 'date' && m.endDate && Date.parse(m.endDate) < Date.now()) continue;
    if (m.end === 'count' && m.endCount && m.done >= m.endCount) continue;
    const recent = (await list<Job>('ap-jobs')).filter((j) => j.missionId === m.id && j.status !== 'failed' && new Date(j.at).getTime() > weekAgo()).length;
    if (!force && recent >= m.perWeek) continue;
    if (!(await underDailyLimit('auto'))) { out.push('Daily AI limit reached.'); break; }
    const brief = await nextForMission(m);
    if (!brief) { out.push(`${m.name}: no topics left.`); continue; }
    const r = await writeArticle(brief);
    await patch<Mission>('ap-missions', m.id, (x) => ({ ...x, used: [...x.used, brief.title || brief.topic], done: x.done + (r.ok ? 1 : 0), lastRun: now() }));
    out.push(`${m.name}: ${r.message}`);
    if (force) break;
  }
  // Without missions (or as an extra), the global keyword queue keeps to its weekly number.
  if (!missions.length || force && !out.length) {
    const recent = posts.filter((p) => p.source === 'auto' && new Date(p.createdAt).getTime() > weekAgo()).length;
    if (force || recent < cfg.perWeek) {
      const kw = cfg.keywords.split('\n').map((k) => k.trim()).find((k) => k && !cfg.used.includes(k));
      if (kw) {
        const r = await writeArticle({ topic: kw });
        await saveBlock('autopub', { ...(await getBlock<AutoPub>('autopub', AP0)), used: [...cfg.used, kw], lastRun: now() });
        out.push(r.message);
      } else out.push('All keywords are used. Add new keywords or a mission.');
    }
  }
  await saveBlock('autopub', { ...(await getBlock<AutoPub>('autopub', AP0)), lastRun: now() });
  return { ok: true, message: out.join(' ') || 'Nothing to do: every mission is on schedule.' };
}

/** Writes the next article of one mission now. */
export async function runMission(m: Mission) {
  const brief = await nextForMission(m);
  if (!brief) return { ok: false, message: 'No topics left in this mission.' };
  const r = await writeArticle(brief);
  await patch<Mission>('ap-missions', m.id, (x) => ({ ...x, used: [...x.used, brief.title || brief.topic], done: x.done + (r.ok ? 1 : 0), lastRun: now() }));
  return r;
}

/** Writes one article now (next topic of the first active mission, else the keyword queue). */
export const generateDraft = (force = true) => autoRun(force);
