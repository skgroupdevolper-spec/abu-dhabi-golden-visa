import 'server-only';
import { PAGES } from '@/content/pages';
import type { Page } from '@/content/types';
import { LOCALES } from '@/lib/i18n';
import { complete, parseJson, underDailyLimit } from './ai';
import { insert } from './collections';
import { getPublishedPosts, postToPage, type Translations } from './content';
import { getBlock, saveBlock } from './settings';
import { newId, now, readJsonFile, updateJsonFile } from './store';

export type TranslateJob = { running: boolean; langs: string[]; total: number; done: number; errors: number; startedAt?: string; finishedAt?: string; current?: string; message?: string; auto: boolean };
export const JOB0: TranslateJob = { running: false, langs: [], total: 0, done: 0, errors: 0, auto: false };
export type AiLog = { id: string; at: string; kind: 'translate' | 'autopub' | 'chat'; text: string; ok: boolean };

declare global { var __adgvTranslating: boolean | undefined }

const KEEP = new Set(['type', 'tool', 'href']);
/** Puts back structural values (types, tools, links) from the original, whatever the AI returned. */
function restore(orig: unknown, tr: unknown): unknown {
  if (Array.isArray(orig)) return orig.map((o, i) => restore(o, Array.isArray(tr) ? tr[i] : undefined));
  if (orig && typeof orig === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(orig)) out[k] = KEEP.has(k) ? v : restore(v, (tr as Record<string, unknown> | undefined)?.[k]);
    return out;
  }
  return typeof orig === 'string' && typeof tr === 'string' && tr.trim() ? tr : orig;
}

async function allPages(): Promise<Page[]> {
  return [...PAGES, ...(await getPublishedPosts()).map(postToPage)];
}

export async function translatePage(p: Page, lang: string) {
  const name = LOCALES.find((l) => l.code === lang)?.name ?? lang;
  const src = { seoTitle: p.seoTitle, meta: p.meta, eyebrow: p.eyebrow, h1: p.h1, intro: p.intro, sections: p.sections };
  const system = `You are a professional legal-immigration translator for a UAE residency consultancy website. Translate every human-readable string value in the JSON into ${name}${lang === 'at' ? ' (Austrian German)' : ''}. Keep the JSON structure and keys identical. Do not translate or change values of "type", "tool" or "href". Keep numbers, currency (AED), names of authorities and brand names accurate. Natural, clear, polite tone; never add promises or guarantees. Return JSON only.`;
  const out = await complete(system, [{ role: 'user', content: JSON.stringify(src) }], { json: true, maxTokens: 8000, kind: 'auto' });
  const t = restore(src, parseJson(out)) as typeof src;
  await updateJsonFile<Translations>('translations.json', {}, (all) => {
    all[lang] = all[lang] ?? {};
    all[lang][p.path] = { ...t, at: now() };
    return all;
  });
}

/** Translates every page that is missing in the chosen languages, one by one, in the background. */
export async function runTranslation(langs: string[], auto = false) {
  if (globalThis.__adgvTranslating) return;
  globalThis.__adgvTranslating = true;
  try {
    const pages = await allPages();
    const tr = await readJsonFile<Translations>('translations.json', {});
    const todo: [Page, string][] = [];
    for (const l of langs) for (const p of pages) if (!tr[l]?.[p.path]) todo.push([p, l]);
    let job: TranslateJob = { running: true, langs, total: todo.length, done: 0, errors: 0, startedAt: now(), auto };
    await saveBlock('translateJob', job);
    for (const [p, l] of todo) {
      const cur = await getBlock<TranslateJob>('translateJob', JOB0);
      if (!cur.running) break;
      if (!(await underDailyLimit('auto'))) { job = { ...job, message: 'Daily AI limit reached. It continues tomorrow or when you raise the limit.' }; break; }
      job = { ...job, current: `${l.toUpperCase()} ${p.path}` };
      await saveBlock('translateJob', job);
      try {
        await translatePage(p, l);
        job.done++;
      } catch (e) {
        job.errors++;
        await insert<AiLog>('ai-log', { id: newId(6), at: now(), kind: 'translate', text: `${l} ${p.path}: ${(e as Error).message}`.slice(0, 300), ok: false }, 1000);
        if (job.errors > 20 && job.done === 0) { job.message = `Stopped: ${(e as Error).message}`; break; }
      }
    }
    await saveBlock('translateJob', { ...job, running: false, current: undefined, finishedAt: now() });
  } finally {
    globalThis.__adgvTranslating = false;
  }
}

export async function translationProgress() {
  const pages = await allPages();
  const tr = await readJsonFile<Translations>('translations.json', {});
  return { total: pages.length, perLang: Object.fromEntries(LOCALES.filter((l) => l.code !== 'en').map((l) => [l.code, Object.keys(tr[l.code] ?? {}).length])) as Record<string, number> };
}
