'use server';

import { revalidatePath } from 'next/cache';
import { EDIT, FULL, requireAdmin } from '@/lib/server/auth';
import { AP0, generateDraft, type AutoPub, type Mission } from '@/lib/server/autopub';
import { insert, list, patch, remove } from '@/lib/server/collections';
import type { Post } from '@/lib/server/content';
import { newId, now } from '@/lib/server/store';
import { aiReady, complete } from '@/lib/server/ai';
import { CB0, type ChatbotCfg } from '@/lib/server/chatbot';
import { getBlock, getSite, saveBlock, saveSite } from '@/lib/server/settings';
import { JOB0, runTranslation, type TranslateJob } from '@/lib/server/translate';
import { LOCALES } from '@/lib/i18n';
import { updateJsonFile } from '@/lib/server/store';
import type { Translations } from '@/lib/server/content';

type St = { ok?: string; error?: string } | undefined;
const s = (f: FormData, k: string, max = 4000) => String(f.get(k) ?? '').trim().slice(0, max);

export async function saveChatbot(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const greeting: Record<string, string> = {};
  for (const l of LOCALES) { const g = s(f, `g_${l.code}`, 400); if (g) greeting[l.code] = g; }
  await saveBlock<ChatbotCfg>('chatbot', { name: s(f, 'name', 60) || CB0.name, greeting: Object.keys(greeting).length ? greeting : CB0.greeting, knowledge: s(f, 'knowledge', 12000), handover: s(f, 'handover', 200) || CB0.handover, position: s(f, 'position') === 'right' ? 'right' : 'left', askContact: f.get('askContact') === 'on', ...(f.has('maxPerDay') ? { maxPerDay: Math.max(0, Number(s(f, 'maxPerDay', 6)) || 0), maxPerChat: Math.max(0, Number(s(f, 'maxPerChat', 4)) || 0), keepDays: Math.max(0, Number(s(f, 'keepDays', 4)) || 0), rules: s(f, 'rules', 4000), waNumber: s(f, 'waNumber', 30) } : (({ maxPerDay, maxPerChat, keepDays, rules, waNumber }) => ({ maxPerDay, maxPerChat, keepDays, rules, waNumber }))(await getBlock<ChatbotCfg>('chatbot', CB0))),
    triggers: f.has('t_set') ? { human: f.get('t_human') === 'on', unknown: f.get('t_unknown') === 'on', quote: f.get('t_quote') === 'on', apply: f.get('t_apply') === 'on' } : (await getBlock<ChatbotCfg>('chatbot', CB0)).triggers });
  const site = await getSite();
  await saveSite({ features: { ...site.features, chatbot: f.get('on') === 'on' } });
  revalidatePath('/', 'layout');
  return { ok: (await aiReady()) ? 'Chatbot saved.' : 'Saved. Add an AI key in Site settings > AI keys to switch it on.' };
}

export async function testAi(_: St, f?: FormData): Promise<St> {
  await requireAdmin(FULL);
  const use = (['chat', 'translate', 'writer', 'editor'].includes(String(f?.get('use'))) ? String(f?.get('use')) : 'chat') as 'chat';
  try {
    const r = await complete('Reply with exactly: OK', [{ role: 'user', content: 'Test' }], { maxTokens: 20, kind: 'chat', use });
    return { ok: `AI connected. Reply: ${r.slice(0, 60)}` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function startTranslation(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  if (!(await (await import('@/lib/server/mt')).engineReady())) return { error: 'The chosen translation engine needs a key. Choose Google (free) or add the key.' };
  const langs = f.getAll('langs').map(String).filter((c) => LOCALES.some((l) => l.code === c && c !== 'en'));
  if (!langs.length) return { error: 'Choose at least one language.' };
  const job = await getBlock<TranslateJob>('translateJob', JOB0);
  if (job.running) return { error: 'A translation is already running.' };
  await saveBlock('translateJob', { ...JOB0, running: true, langs, auto: f.get('auto') === 'on', startedAt: new Date().toISOString() });
  void runTranslation(langs, f.get('auto') === 'on');
  return { ok: 'Translation started. It runs in the background; refresh to see progress.' };
}
/** One click: every page, every website language, missing or changed. */
export async function translateEverything(): Promise<St> {
  await requireAdmin(FULL);
  if (!(await (await import('@/lib/server/mt')).engineReady())) return { error: 'The chosen translation engine needs a key. Choose Google (free) or add the key.' };
  const { siteLangs, clearStaleJob } = await import('@/lib/server/translate');
  await clearStaleJob();
  const job = await getBlock<TranslateJob>('translateJob', JOB0);
  if (job.running) return { error: 'Translation is already running. Watch the progress bar at the top.' };
  const langs = await siteLangs();
  await saveBlock('translateJob', { ...JOB0, running: true, langs, auto: true, startedAt: new Date().toISOString() });
  void runTranslation(langs, true);
  revalidatePath('/admin/languages/');
  return { ok: `Started: all pages into ${langs.length} languages. You can leave this page; it keeps running in the background.` };
}

export async function stopTranslation() {
  await requireAdmin(FULL);
  const job = await getBlock<TranslateJob>('translateJob', JOB0);
  await saveBlock('translateJob', { ...job, running: false, auto: false });
  revalidatePath('/admin/languages/');
}
export async function clearTranslations(f: FormData) {
  await requireAdmin(FULL);
  const lang = s(f, 'lang', 5);
  await updateJsonFile<Translations>('translations.json', {}, (all) => { delete all[lang]; return all; });
  revalidatePath('/', 'layout');
}

const num = (f: FormData, k: string, lo: number, hi: number, d: number) => Math.max(lo, Math.min(hi, Number(s(f, k, 8)) || d));

/** Saves only the Auto Publisher fields present in the submitted tab (toggles are listed in _toggles). */
export async function saveAutopub(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const cur = await getBlock<AutoPub>('autopub', AP0);
  const n: Partial<AutoPub> = {};
  const has = (k: string) => f.has(k);
  for (const k of s(f, '_toggles', 400).split(',').filter(Boolean)) (n as Record<string, unknown>)[k] = f.get(k) === 'on';
  if (has('perWeek')) n.perWeek = num(f, 'perWeek', 0, 21, 0);
  if (has('words')) n.words = num(f, 'words', 400, 3000, 900);
  if (has('minWords')) n.minWords = num(f, 'minWords', 200, 3000, 600);
  if (has('maxWords')) n.maxWords = num(f, 'maxWords', 400, 5000, 1400);
  if (has('maxSimilarity')) n.maxSimilarity = num(f, 'maxSimilarity', 5, 90, 35);
  if (has('faqCount')) n.faqCount = num(f, 'faqCount', 0, 8, 4);
  if (has('internalLinks')) n.internalLinks = num(f, 'internalLinks', 0, 10, 4);
  for (const [k, max] of [['keywords', 20000], ['tone', 200], ['knowledge', 12000], ['references', 8000], ['category', 80], ['covers', 6000], ['audience', 300], ['banned', 3000], ['photoStyle', 300]] as const) if (has(k)) (n as Record<string, unknown>)[k] = s(f, k, max);
  if (has('coverStyle')) n.coverStyle = (['designed', 'photos', 'ai'].includes(s(f, 'coverStyle')) ? s(f, 'coverStyle') : 'designed') as AutoPub['coverStyle'];
  if (f.get('resetUsed')) n.used = [];
  await saveBlock<AutoPub>('autopub', { ...cur, ...n, tone: n.tone === '' ? AP0.tone : n.tone ?? cur.tone });
  revalidatePath('/admin/autopublisher/');
  return { ok: 'Saved.' };
}
export async function draftNow(_: St): Promise<St> {
  await requireAdmin(FULL);
  if (!(await aiReady('writer'))) return { error: 'Add the Writer AI key in the “AI & pictures” tab first.' };
  const r = await generateDraft(true);
  revalidatePath('/admin/posts/'); revalidatePath('/admin/autopublisher/');
  return r.ok ? { ok: r.message } : { error: r.message };
}
export async function togglePause(f: FormData) {
  await requireAdmin(FULL);
  const cur = await getBlock<AutoPub>('autopub', AP0);
  const what = s(f, 'what', 10);
  await saveBlock<AutoPub>('autopub', what === 'on' ? { ...cur, on: !cur.on, paused: false } : { ...cur, paused: !cur.paused });
  revalidatePath('/admin/autopublisher/');
}

/* ---------- missions ---------- */
export async function saveMission(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const name = s(f, 'name', 120);
  if (!name) return { error: 'Give the mission a name.' };
  const id = s(f, 'id', 20);
  const end = (['never', 'date', 'count', 'titles'].includes(s(f, 'end')) ? s(f, 'end') : 'never') as Mission['end'];
  const data = { name, active: f.get('active') === 'on', focus: s(f, 'focus', 1000), seeds: s(f, 'seeds', 10000), titles: s(f, 'titles', 20000), countries: s(f, 'countries', 400),
    perWeek: num(f, 'perWeek', 1, 21, 2), after: (s(f, 'after') === 'publish' ? 'publish' : 'draft') as Mission['after'], minWords: num(f, 'minWords', 200, 3000, 700), maxWords: num(f, 'maxWords', 400, 5000, 1400),
    category: s(f, 'category', 80), end, endDate: s(f, 'endDate', 20) || undefined, endCount: Number(s(f, 'endCount', 6)) || undefined };
  if (id) await patch<Mission>('ap-missions', id, (m) => ({ ...m, ...data }));
  else await insert<Mission>('ap-missions', { id: newId(6), ...data, done: 0, used: [], createdAt: now() });
  revalidatePath('/admin/autopublisher/');
  return { ok: id ? 'Mission saved.' : 'Mission created. It writes on the next daily run, or press “Run now”.' };
}
export async function missionAction(f: FormData) {
  await requireAdmin(FULL);
  const id = s(f, 'id', 20), op = s(f, 'op', 10);
  if (op === 'delete') await remove<Mission>('ap-missions', id);
  else if (op === 'toggle') await patch<Mission>('ap-missions', id, (m) => ({ ...m, active: !m.active }));
  else if (op === 'reset') await patch<Mission>('ap-missions', id, (m) => ({ ...m, used: [], done: 0 }));
  else if (op === 'run') {
    const m = (await list<Mission>('ap-missions')).find((x) => x.id === id);
    if (m) {
      const { runMission } = await import('@/lib/server/autopub');
      await runMission(m);
    }
  }
  revalidatePath('/admin/autopublisher/');
}

/* ---------- keywords and review ---------- */
export async function addKeywords(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const add = s(f, 'add', 8000).split('\n').map((k) => k.trim()).filter(Boolean);
  if (!add.length) return { error: 'Type at least one keyword.' };
  const cur = await getBlock<AutoPub>('autopub', AP0);
  const have = new Set(cur.keywords.split('\n').map((k) => k.trim().toLowerCase()));
  const fresh = add.filter((k) => !have.has(k.toLowerCase()));
  await saveBlock<AutoPub>('autopub', { ...cur, keywords: [cur.keywords.trim(), ...fresh].filter(Boolean).join('\n') });
  revalidatePath('/admin/autopublisher/');
  return { ok: `Added ${fresh.length} keyword${fresh.length === 1 ? '' : 's'}.` };
}
export async function keywordAction(f: FormData) {
  await requireAdmin(FULL);
  const k = s(f, 'k', 300), op = s(f, 'op', 10);
  const cur = await getBlock<AutoPub>('autopub', AP0);
  if (op === 'delete') await saveBlock<AutoPub>('autopub', { ...cur, keywords: cur.keywords.split('\n').filter((x) => x.trim() !== k).join('\n') });
  else if (op === 'reuse') await saveBlock<AutoPub>('autopub', { ...cur, used: cur.used.filter((x) => x !== k) });
  else if (op === 'write') {
    const { writeArticle } = await import('@/lib/server/autopub');
    await writeArticle({ topic: k });
    await saveBlock<AutoPub>('autopub', { ...(await getBlock<AutoPub>('autopub', AP0)), used: [...cur.used, k] });
  }
  revalidatePath('/admin/autopublisher/');
}
export async function reviewPost(f: FormData) {
  await requireAdmin(EDIT);
  const id = s(f, 'id', 20), op = s(f, 'op', 10);
  let slug = '';
  await patch<Post>('posts', id, (x) => { slug = x.slug; return op === 'publish' ? { ...x, status: 'published', publishedAt: x.publishedAt || now(), updatedAt: now() } : { ...x, status: 'draft', updatedAt: now() }; });
  if (op === 'publish' && slug) {
    void import('@/lib/server/translate').then((m) => m.autoTranslate([`/blog/${slug}/`])).catch(() => {});
    void import('@/lib/server/indexnow').then((m) => m.pingIndexNow([`/blog/${slug}/`])).catch(() => {});
  }
  revalidatePath('/', 'layout');
}

/* ---------- translation editor ---------- */
export async function saveTranslation(_: St, f: FormData): Promise<St> {
  await requireAdmin(EDIT);
  const lang = s(f, 'lang', 10), path = s(f, 'path', 300);
  if (!LOCALES.some((l) => l.code === lang) || lang === 'en') return { error: 'Choose a language.' };
  const { now } = await import('@/lib/server/store');
  type T = Record<string, Record<string, Record<string, unknown>>>;
  await updateJsonFile<T>('translations.json', {}, (all) => {
    all[lang] = all[lang] ?? {};
    const cur = all[lang][path] ?? {};
    all[lang][path] = { ...cur, seoTitle: s(f, 'seoTitle', 200), meta: s(f, 'meta', 400), eyebrow: s(f, 'eyebrow', 160), h1: s(f, 'h1', 300), intro: s(f, 'intro', 2000), at: now(), manual: true };
    return all;
  });
  revalidatePath('/', 'layout');
  return { ok: 'Translation saved.' };
}
export async function retranslatePage(_: St, f: FormData): Promise<St> {
  await requireAdmin(EDIT);
  if (!(await (await import('@/lib/server/mt')).engineReady())) return { error: 'The chosen translation engine needs a key. Choose Google (free) in Languages.' };
  const { findPage, translatePage } = await import('@/lib/server/translate');
  const p = await findPage(s(f, 'path', 300));
  if (!p) return { error: 'Save or publish this page first.' };
  const lang = s(f, 'lang', 10);
  if (lang === 'all') {
    const langs = LOCALES.filter((l) => l.code !== 'en').map((l) => l.code);
    void (async () => { await Promise.all(langs.map((l) => translatePage(p, l).catch(() => {}))); revalidatePath('/', 'layout'); })();
    return { ok: `Translating into ${langs.length} languages in the background. Refresh in a minute to see the ticks.` };
  }
  try { await translatePage(p, lang); } catch (e) { return { error: (e as Error).message }; }
  revalidatePath('/', 'layout');
  return { ok: `Translated into ${LOCALES.find((l) => l.code === lang)?.name ?? lang}.` };
}

export async function suggestKeywordsNow(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  if (!(await aiReady())) return { error: 'Add an AI key in Site settings first.' };
  try {
    const { suggestKeywords } = await import('@/lib/server/autopub');
    const k = await suggestKeywords(10, s(f, 'focus', 300), s(f, 'countries', 300));
    const cur = await getBlock<AutoPub>('autopub', AP0);
    await saveBlock<AutoPub>('autopub', { ...cur, keywords: [cur.keywords.trim(), ...k].filter(Boolean).join('\n') });
    revalidatePath('/admin/autopublisher/');
    return { ok: `Added ${k.length} keyword ideas: ${k.slice(0, 4).join(' · ')}…` };
  } catch (e) { return { error: (e as Error).message }; }
}
export async function saveLangCfg(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const { langCfg } = await import('@/lib/server/mt');
  const cur = await langCfg();
  const engine = (['google', 'deepl', 'ai'].includes(String(f.get('engine'))) ? String(f.get('engine')) : cur.engine ?? 'google') as 'google';
  const key = String(f.get('deeplKey') ?? '').trim();
  await saveBlock('langcfg', { ...cur, onSave: f.get('onSave') === 'on', engine, ...(key ? { deeplKey: key.slice(0, 120) } : {}) });
  revalidatePath('/admin/languages/');
  return { ok: 'Saved.' };
}

export async function toggleChatbot(f: FormData) {
  await requireAdmin(FULL);
  const site = await getSite();
  await saveSite({ features: { ...site.features, chatbot: f.get('on') === '1' } });
  revalidatePath('/', 'layout');
}

/** Which languages appear on the website (switcher, sitemap, hreflang, auto-translation). */
export async function saveSiteLanguages(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const on = f.getAll('lang').map(String).filter((c) => LOCALES.some((l) => l.code === c && c !== 'en'));
  const site = await getSite();
  await saveSite({ ...site, languages: on.length === LOCALES.length - 1 ? [] : on, features: { ...site.features, languageSwitcher: f.get('switcher') === 'on' } });
  revalidatePath('/', 'layout');
  return { ok: `${on.length + 1} languages on the website.` };
}

/** Translates the website interface (menus, buttons, booking, flight path, contact/about) into the website languages. */
export async function translateInterface(_: St): Promise<St> {
  await requireAdmin(FULL);
  if (!(await (await import('@/lib/server/mt')).engineReady())) return { error: 'The chosen translation engine needs a key. Choose Google (free) on this page.' };
  const { translateUi } = await import('@/lib/server/translate');
  const on = (await getSite()).languages;
  const langs = LOCALES.filter((l) => l.code !== 'en' && (!on?.length || on.includes(l.code))).map((l) => l.code);
  void translateUi(langs).then(() => revalidatePath('/', 'layout')).catch(() => {});
  return { ok: `Translating menus, buttons and widgets into ${langs.length} languages in the background. Refresh in a few minutes.` };
}
