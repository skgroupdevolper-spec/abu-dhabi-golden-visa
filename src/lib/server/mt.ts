import 'server-only';
// Text-by-text translation with a cache per language, like the goldenvisauae.ai system:
// every distinct English text is translated once, so a changed page only sends its new texts.
// Engines: Google (free, no key, fastest), DeepL (key) or the AI provider set in Admin > Languages.
import { LOCALES } from '@/lib/i18n';
import { complete, parseJson, underDailyLimit } from './ai';
import { getBlock } from './settings';
import { readJsonFile, updateJsonFile } from './store';

export type Engine = 'google' | 'deepl' | 'ai';
export type LangCfg = { onSave: boolean; engine?: Engine; deeplKey?: string };
export const LANGCFG0: LangCfg = { onSave: true, engine: 'google' };
export const langCfg = () => getBlock<LangCfg>('langcfg', LANGCFG0);

const GOOGLE_CODE: Record<string, string> = { zh: 'zh-CN', at: 'de' };
const DEEPL_CODE: Record<string, string> = { ar: 'AR', ru: 'RU', tr: 'TR', zh: 'ZH-HANS', fr: 'FR', de: 'DE', at: 'DE', it: 'IT', es: 'ES', ro: 'RO', pt: 'PT-PT', pl: 'PL', hu: 'HU', sk: 'SK', cs: 'CS', id: 'ID' };

const decode = (t: string) => t.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const cacheFile = (lang: string) => `tcache-${lang}.json`;

/** Groups texts so each request stays under a size the engines accept. */
function batches(texts: string[], maxChars: number, maxItems: number): string[][] {
  const out: string[][] = [];
  let cur: string[] = [], n = 0;
  for (const t of texts) {
    if (cur.length && (n + t.length > maxChars || cur.length >= maxItems)) { out.push(cur); cur = []; n = 0; }
    cur.push(t); n += t.length;
  }
  if (cur.length) out.push(cur);
  return out;
}

async function google(lang: string, batch: string[]): Promise<string[]> {
  const body = new URLSearchParams();
  for (const t of batch) body.append('q', t);
  const url = `https://translate.googleapis.com/translate_a/t?client=gtx&dt=t&sl=en&tl=${encodeURIComponent(GOOGLE_CODE[lang] ?? lang)}`;
  const r = await fetch(url, { method: 'POST', body, headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }, signal: AbortSignal.timeout(25000) });
  if (!r.ok) throw new Error(`Google Translate ${r.status}`);
  const j = (await r.json()) as unknown[];
  const arr = batch.length === 1 && typeof j === 'string' ? [j as unknown as string] : j;
  return arr.map((x) => decode(Array.isArray(x) ? String(x[0]) : String(x)));
}

async function deepl(lang: string, batch: string[], key: string): Promise<string[]> {
  const host = key.trim().endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';
  const r = await fetch(`https://${host}/v2/translate`, {
    method: 'POST', signal: AbortSignal.timeout(30000),
    headers: { authorization: `DeepL-Auth-Key ${key.trim()}`, 'content-type': 'application/json' },
    body: JSON.stringify({ text: batch, source_lang: 'EN', target_lang: DEEPL_CODE[lang], tag_handling: 'html' }),
  });
  if (!r.ok) throw new Error(`DeepL ${r.status}`);
  const j = (await r.json()) as { translations: { text: string }[] };
  return j.translations.map((x) => x.text);
}

async function ai(lang: string, batch: string[]): Promise<string[]> {
  if (!(await underDailyLimit('auto'))) throw new Error('Daily AI limit reached');
  const name = LOCALES.find((l) => l.code === lang)?.name ?? lang;
  const system = `Translate texts from a UAE Golden Visa consultancy website into ${name}${lang === 'at' ? ' (Austrian German)' : ''}. Keep numbers, AED, names of authorities, brand names and any HTML tags. Natural, polite and accurate; never add promises. Return JSON: {"t": [translations in the same order]}.`;
  const out = await complete(system, [{ role: 'user', content: JSON.stringify(batch) }], { json: true, maxTokens: 8000, kind: 'auto', use: 'translate' });
  const t = parseJson<{ t: string[] }>(out).t ?? [];
  if (t.length !== batch.length) throw new Error('AI returned a different number of texts');
  return t.map(String);
}

/** Translates a list of English texts into one language. Uses the cache, sends only new texts, several requests at once. */
export async function translateTexts(lang: string, texts: string[], cfg?: LangCfg): Promise<Record<string, string>> {
  const c = cfg ?? (await langCfg());
  const engine: Engine = c.engine === 'deepl' && (!c.deeplKey || !DEEPL_CODE[lang]) ? 'google' : c.engine ?? 'google';
  const cache = await readJsonFile<Record<string, string>>(cacheFile(lang), {});
  const want = [...new Set(texts.filter((t) => t && t.trim()))];
  const missing = want.filter((t) => !cache[t]);
  const got: Record<string, string> = {};
  const groups = engine === 'ai' ? batches(missing, 6000, 60) : engine === 'deepl' ? batches(missing, 25000, 50) : batches(missing, 4500, 80);
  let next = 0, firstErr: Error | undefined;
  const run = async () => {
    while (next < groups.length) {
      const g = groups[next++];
      for (let i = 0; i < 3; i++) {
        try {
          const out = engine === 'deepl' ? await deepl(lang, g, c.deeplKey!) : engine === 'ai' ? await ai(lang, g) : await google(lang, g);
          g.forEach((t, k) => { const v = (out[k] ?? '').trim(); if (v) got[t] = v; });
          break;
        } catch (e) {
          firstErr = firstErr ?? (e as Error);
          if (i < 2) await sleep(1200 * (i + 1));
        }
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, groups.length || 1) }, run));
  if (Object.keys(got).length) await updateJsonFile<Record<string, string>>(cacheFile(lang), {}, (all) => ({ ...all, ...got }));
  if (missing.length && !Object.keys(got).length && firstErr) throw firstErr;
  const all = { ...cache, ...got };
  return Object.fromEntries(want.filter((t) => all[t]).map((t) => [t, all[t]]));
}

/** Removes cached texts so they are translated again (after a hand-made correction policy change, or a language reset). */
export async function clearTextCache(lang: string) {
  await updateJsonFile<Record<string, string>>(cacheFile(lang), {}, () => ({}));
}

/** True when the chosen engine can run (Google needs nothing). */
export async function engineReady(): Promise<boolean> {
  const c = await langCfg();
  if ((c.engine ?? 'google') === 'google') return true;
  if (c.engine === 'deepl') return !!c.deeplKey;
  return (await import('./ai')).aiReady('translate');
}
