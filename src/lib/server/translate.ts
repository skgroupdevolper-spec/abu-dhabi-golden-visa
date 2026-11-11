import 'server-only';
import { PAGES } from '@/content/pages';
import type { Page } from '@/content/types';
import { LOCALES } from '@/lib/i18n';
import { underDailyLimit } from './ai';
import { insert } from './collections';
import { getCustomPages, getOverrides, getPublishedPosts, postToPage, type Translations } from './content';
import type { Block } from '@/lib/blocks';
import { getBlock, saveBlock } from './settings';
import { newId, now, readJsonFile, updateJsonFile } from './store';
import UI_STRINGS from '@/lib/ui-strings.json';

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

/** Short fingerprint of the English source, so changed pages are translated again automatically. */
function fingerprint(v: unknown): string {
  const t = JSON.stringify(v);
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + t.length.toString(36);
}

async function sourceOf(p: Page) {
  const o = (await getOverrides())[p.path] ?? (await getCustomPages()).find((c) => c.path === p.path);
  const blocks: Block[] | undefined = o?.blocks?.length ? o.blocks : undefined;
  return { seoTitle: o?.seoTitle || p.seoTitle, meta: o?.meta || p.meta, eyebrow: o?.eyebrow || p.eyebrow, h1: o?.h1 || p.h1, intro: o?.intro || p.intro, sections: blocks ? [] : p.sections, ...(blocks ? { blocks } : {}) };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function translatePage(p: Page, lang: string, cfg?: import('./mt').LangCfg) {
  const src = await sourceOf(p);
  const { translateTexts } = await import('./mt');
  // Text by text with a cache: only texts not translated before are sent, many at the same time.
  const map = await translateTexts(lang, texts(src), cfg);
  const t = swap(src, map) as typeof src;
  await updateJsonFile<Translations>('translations.json', {}, (all) => {
    all[lang] = all[lang] ?? {};
    all[lang][p.path] = { ...t, at: now(), h: fingerprint(src) } as Translations[string][string];
    return all;
  });
}

/** Pages whose translation is missing or older than the English text (manual edits are kept). */
async function staleList(langs: string[]) {
  const pages = await allPages();
  const tr = await readJsonFile<Translations>('translations.json', {});
  const prints = new Map<string, string>();
  for (const p of pages) prints.set(p.path, fingerprint(await sourceOf(p)));
  const todo: [Page, string][] = [];
  // Language by language for the most visited pages first, so whole languages finish early.
  for (const l of langs) for (const p of pages) {
    const t = tr[l]?.[p.path] as { h?: string; manual?: boolean } | undefined;
    if (!t || (!t.manual && t.h !== prints.get(p.path))) todo.push([p, l]);
  }
  return todo;
}

/** Translates every page that is missing or changed, several at the same time, in the background. */
export async function runTranslation(langs: string[], auto = false) {
  if (globalThis.__adgvTranslating) return;
  globalThis.__adgvTranslating = true;
  try {
    const ui = translateUi(langs).catch(() => 0);
    const todo = await staleList(langs);
    const fresh = new Set<string>();
    const { langCfg } = await import('./mt');
    const cfg = await langCfg();
    const job: TranslateJob = { running: true, langs, total: todo.length, done: 0, errors: 0, startedAt: now(), auto };
    await saveBlock('translateJob', job);
    let next = 0, stop = false, lastSave = 0;
    const save = async (force = false) => {
      if (!force && Date.now() - lastSave < 2500) return;
      lastSave = Date.now();
      // Respect a Stop pressed in the admin meanwhile.
      if (!force && !(await getBlock<TranslateJob>('translateJob', JOB0)).running) { stop = true; return; }
      await saveBlock('translateJob', { ...job });
    };
    const worker = async () => {
      while (!stop && next < todo.length) {
        const [p, l] = todo[next++];
        if (!(await getBlock<TranslateJob>('translateJob', JOB0)).running) { stop = true; break; }
        if (cfg.engine === 'ai' && !(await underDailyLimit('auto'))) { job.message = 'Daily AI limit reached. It continues tomorrow or when you raise the limit in Site settings.'; stop = true; break; }
        job.current = `${l.toUpperCase()} ${p.path}`;
        try {
          await translatePage(p, l, cfg);
          job.done++;
          fresh.add(p.path);
        } catch (e) {
          job.errors++;
          await insert<AiLog>('ai-log', { id: newId(6), at: now(), kind: 'translate', text: `${l} ${p.path}: ${(e as Error).message}`.slice(0, 300), ok: false }, 1000);
          if (job.errors > 25 && job.done === 0) { job.message = `Stopped: ${(e as Error).message}`; stop = true; }
        }
        await save();
      }
    };
    // Several pages at the same time (each page also sends its texts in parallel batches).
    await Promise.all(Array.from({ length: Math.min(cfg.engine === 'ai' ? 4 : 5, todo.length || 1) }, worker));
    await ui;
    job.running = false; job.current = undefined; job.finishedAt = now();
    if (stop && !job.message) job.message = 'Stopped.';
    await saveBlock('translateJob', { ...job, auto: (await getBlock<TranslateJob>('translateJob', JOB0)).auto && auto });
    if (fresh.size) void import('./indexnow').then((m) => m.pingIndexNow([...fresh])).catch(() => {});
  } finally {
    globalThis.__adgvTranslating = false;
  }
}

/** Languages switched on for the website (all of them if none are chosen). */
export async function siteLangs() {
  const on = (await import('./settings').then((m) => m.getSite())).languages;
  return LOCALES.filter((l) => l.code !== 'en' && (!on?.length || on.includes(l.code))).map((l) => l.code);
}

/** Starts a background run for everything missing or changed, if automatic translation is on. Used at server start and by the daily job. */
export async function autoCatchUp() {
  const cfg = await getBlock<{ onSave: boolean }>('langcfg', { onSave: true });
  if (!cfg.onSave || globalThis.__adgvTranslating || !(await (await import('./mt')).engineReady())) return;
  const langs = await siteLangs();
  if (!(await staleList(langs)).length) return;
  void runTranslation(langs, true).catch(() => {});
}

export async function translationProgress() {
  const pages = await allPages();
  const tr = await readJsonFile<Translations>('translations.json', {});
  const prints = new Map<string, string>();
  for (const p of pages) prints.set(p.path, fingerprint(await sourceOf(p)));
  const codes = LOCALES.filter((l) => l.code !== 'en').map((l) => l.code);
  const perLang = Object.fromEntries(codes.map((c) => [c, pages.filter((p) => tr[c]?.[p.path]).length])) as Record<string, number>;
  const upToDate = Object.fromEntries(codes.map((c) => [c, pages.filter((p) => { const t = tr[c]?.[p.path]; return t && (t.manual || t.h === prints.get(p.path)); }).length])) as Record<string, number>;
  return { total: pages.length, perLang, upToDate };
}

/** Translates changed pages into all languages in the background after an admin saves (if switched on). */
export async function autoTranslate(_paths: string[]) {
  const cfg = await getBlock<{ onSave: boolean }>('langcfg', { onSave: true });
  if (!cfg.onSave || !(await (await import('./mt')).engineReady())) return;
  // The fingerprint check picks up exactly the pages that changed. If a run is busy, try again shortly.
  const start = async (tries = 0): Promise<void> => {
    if (globalThis.__adgvTranslating) { if (tries < 30) { await sleep(20000); return start(tries + 1); } return; }
    await runTranslation(await siteLangs(), true);
  };
  void start().catch(() => {});
}

/* ---------- Website interface texts (menus, buttons, widgets) ---------- */

export async function uiProgress() {
  const all = await readJsonFile<Record<string, Record<string, string>>>('ui-translations.json', {});
  return { total: UI_STRINGS.length, per: Object.fromEntries(LOCALES.filter((l) => l.code !== 'en').map((l) => [l.code, UI_STRINGS.filter((s) => all[l.code]?.[s]).length])) as Record<string, number> };
}

/** Translates the interface texts still missing in the given languages. Returns how many were added. */
export async function translateUi(langs: string[]) {
  const { translateTexts } = await import('./mt');
  let added = 0;
  await Promise.all(langs.filter((l) => l !== 'en').map(async (lang) => {
    const have = (await readJsonFile<Record<string, Record<string, string>>>('ui-translations.json', {}))[lang] ?? {};
    const missing = UI_STRINGS.filter((s) => !have[s]);
    if (!missing.length) return;
    try {
      const map = await translateTexts(lang, missing);
      await updateJsonFile<Record<string, Record<string, string>>>('ui-translations.json', {}, (all) => {
        all[lang] = all[lang] ?? {};
        for (const [k, v] of Object.entries(map)) if (!all[lang][k]) { all[lang][k] = v.slice(0, 600); added++; }
        return all;
      });
    } catch (e) {
      await insert<AiLog>('ai-log', { id: newId(6), at: now(), kind: 'translate', text: `Interface texts (${lang}): ${(e as Error).message}`.slice(0, 300), ok: false }, 1000);
    }
  }));
  return added;
}

/* ---------- Translation status per page and language (sitemap dates) ---------- */
export async function readiness() {
  const [pages, tr] = await Promise.all([allPages().catch(() => [] as Page[]), readJsonFile<Translations>('translations.json', {})]);
  const translatable = new Set(pages.map((p) => p.path));
  const ready = (path: string, loc: string) => loc === 'en' || path === '/' || !translatable.has(path) || !!tr[loc]?.[path];
  const at = (path: string, loc: string) => (loc === 'en' ? undefined : (tr[loc]?.[path] as { at?: string } | undefined)?.at);
  return { ready, at };
}
