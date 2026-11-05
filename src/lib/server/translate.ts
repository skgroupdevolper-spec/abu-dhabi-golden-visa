import 'server-only';
import { PAGES } from '@/content/pages';
import type { Page } from '@/content/types';
import { LOCALES } from '@/lib/i18n';
import { complete, parseJson, underDailyLimit } from './ai';
import { insert } from './collections';
import { getCustomPages, getOverrides, getPublishedPosts, postToPage, type Translations } from './content';
import type { Block } from '@/lib/blocks';
import { aiReady } from './ai';
import { getBlock, saveBlock } from './settings';
import { newId, now, readJsonFile, updateJsonFile } from './store';

export type TranslateJob = { running: boolean; langs: string[]; total: number; done: number; errors: number; startedAt?: string; finishedAt?: string; current?: string; message?: string; auto: boolean };
export const JOB0: TranslateJob = { running: false, langs: [], total: 0, done: 0, errors: 0, auto: false };
export type AiLog = { id: string; at: string; kind: 'translate' | 'autopub' | 'chat'; text: string; ok: boolean };

declare global { var __adgvTranslating: boolean | undefined }

const KEEP = new Set(['type', 'tool', 'href', 'id', 'src', 'image', 'bgImage', 'style', 'icon', 'layout', 'side', 'cols', 'size', 'anchor', 'className', 'url', 'html', 'hidden']);
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

export async function findPage(path: string) { return (await allPages()).find((p) => p.path === path); }

export async function allPages(): Promise<Page[]> {
  const over = await getOverrides();
  const customs = (await getCustomPages()).filter((c) => !c.hidden);
  const home: Page[] = over['/']?.blocks?.length ? [{ path: '/', seoTitle: over['/'].seoTitle || 'Abu Dhabi Golden Visa', meta: over['/'].meta || '', eyebrow: 'Home', h1: 'Home', intro: '', sections: [] }] : [];
  const cp: Page[] = customs.map((c) => ({ path: c.path, seoTitle: c.seoTitle || c.title, meta: c.meta || '', eyebrow: c.eyebrow || c.title, h1: c.h1 || c.title, intro: c.intro || '', sections: [] }));
  return [...PAGES, ...home, ...cp, ...(await getPublishedPosts()).map(postToPage)];
}

export async function translatePage(p: Page, lang: string) {
  const name = LOCALES.find((l) => l.code === lang)?.name ?? lang;
  const o = (await getOverrides())[p.path] ?? (await getCustomPages()).find((c) => c.path === p.path);
  const blocks: Block[] | undefined = o?.blocks?.length ? o.blocks : undefined;
  const src = { seoTitle: o?.seoTitle || p.seoTitle, meta: o?.meta || p.meta, eyebrow: o?.eyebrow || p.eyebrow, h1: o?.h1 || p.h1, intro: o?.intro || p.intro, sections: blocks ? [] : p.sections, ...(blocks ? { blocks } : {}) };
  const system = `You are a professional legal-immigration translator for a UAE residency consultancy website. Translate every human-readable string value in the JSON into ${name}${lang === 'at' ? ' (Austrian German)' : ''}. Keep the JSON structure and keys identical. Do not translate or change values of "type", "tool" or "href". Keep numbers, currency (AED), names of authorities and brand names accurate. Natural, clear, polite tone; never add promises or guarantees. Return JSON only.`;
  const out = await complete(system, [{ role: 'user', content: JSON.stringify(src) }], { json: true, maxTokens: 8000, kind: 'auto', use: 'translate' });
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
    const over = await getOverrides();
    // Missing translations, and pages edited after they were translated.
    for (const l of langs) for (const p of pages) { const t = tr[l]?.[p.path]; if (!t || (over[p.path]?.at && over[p.path].at! > t.at && !(t as { manual?: boolean }).manual)) todo.push([p, l]); }
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

/** Translates changed pages into all languages in the background after an admin saves (if switched on). */
export async function autoTranslate(paths: string[]) {
  const cfg = await getBlock<{ onSave: boolean }>('langcfg', { onSave: true });
  if (!cfg.onSave || !(await aiReady())) return;
  await updateJsonFile<Translations>('translations.json', {}, (all) => {
    for (const l of Object.keys(all)) for (const p of paths) if (!(all[l][p] as { manual?: boolean } | undefined)?.manual) delete all[l][p];
    return all;
  });
  void runTranslation(LOCALES.filter((l) => l.code !== 'en').map((l) => l.code), true).catch(() => {});
}
