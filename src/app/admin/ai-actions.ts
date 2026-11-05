'use server';

import { revalidatePath } from 'next/cache';
import { EDIT, FULL, requireAdmin } from '@/lib/server/auth';
import { AP0, generateDraft, type AutoPub } from '@/lib/server/autopub';
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
  await saveBlock<ChatbotCfg>('chatbot', { name: s(f, 'name', 60) || CB0.name, greeting: Object.keys(greeting).length ? greeting : CB0.greeting, knowledge: s(f, 'knowledge', 12000), handover: s(f, 'handover', 200) || CB0.handover, position: s(f, 'position') === 'right' ? 'right' : 'left', askContact: f.get('askContact') === 'on', triggers: f.has('t_set') ? { human: f.get('t_human') === 'on', unknown: f.get('t_unknown') === 'on', quote: f.get('t_quote') === 'on', apply: f.get('t_apply') === 'on' } : (await getBlock<ChatbotCfg>('chatbot', CB0)).triggers });
  const site = await getSite();
  await saveSite({ features: { ...site.features, chatbot: f.get('on') === 'on' } });
  revalidatePath('/', 'layout');
  return { ok: (await aiReady()) ? 'Chatbot saved.' : 'Saved. Add an AI key in Site settings > AI keys to switch it on.' };
}

export async function testAi(_: St): Promise<St> {
  await requireAdmin(FULL);
  try {
    const r = await complete('Reply with exactly: OK', [{ role: 'user', content: 'Test' }], { maxTokens: 20, kind: 'chat' });
    return { ok: `AI connected. Reply: ${r.slice(0, 60)}` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function startTranslation(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  if (!(await aiReady())) return { error: 'Add an AI key in Site settings > AI keys first.' };
  const langs = f.getAll('langs').map(String).filter((c) => LOCALES.some((l) => l.code === c && c !== 'en'));
  if (!langs.length) return { error: 'Choose at least one language.' };
  const job = await getBlock<TranslateJob>('translateJob', JOB0);
  if (job.running) return { error: 'A translation is already running.' };
  await saveBlock('translateJob', { ...JOB0, running: true, langs, auto: f.get('auto') === 'on', startedAt: new Date().toISOString() });
  void runTranslation(langs, f.get('auto') === 'on');
  return { ok: 'Translation started. It runs in the background; refresh to see progress.' };
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

export async function saveAutopub(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const cur = await getBlock<AutoPub>('autopub', AP0);
  await saveBlock<AutoPub>('autopub', { ...cur, on: f.get('on') === 'on', perWeek: Math.max(0, Math.min(21, Number(s(f, 'perWeek', 3)) || 0)), review: f.get('review') === 'on', keywords: s(f, 'keywords', 20000), tone: s(f, 'tone', 200) || AP0.tone, words: Math.max(400, Math.min(2500, Number(s(f, 'words', 5)) || 900)), knowledge: s(f, 'knowledge', 12000), used: f.get('resetUsed') ? [] : cur.used, category: s(f, 'category', 80), covers: s(f, 'covers', 6000), audience: s(f, 'audience', 300), faqCount: Math.max(0, Math.min(8, Number(s(f, 'faqCount', 2)) || 4)),
    minWords: Math.max(200, Math.min(3000, Number(s(f, 'minWords', 5)) || 600)), maxSimilarity: Math.max(5, Math.min(90, Number(s(f, 'maxSimilarity', 3)) || 35)), banned: s(f, 'banned', 3000), requireFaq: f.get('requireFaq') === 'on', aiCovers: f.get('aiCovers') === 'on' });
  return { ok: 'Saved.' };
}
export async function draftNow(_: St): Promise<St> {
  await requireAdmin(FULL);
  if (!(await aiReady())) return { error: 'Add an AI key in Site settings > AI keys first.' };
  const r = await generateDraft(true);
  revalidatePath('/admin/posts/');
  return r.ok ? { ok: r.message } : { error: r.message };
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
  if (!(await aiReady())) return { error: 'Add an AI key in Site settings first.' };
  const { getPage } = await import('@/content/pages');
  const { translatePage } = await import('@/lib/server/translate');
  const p = getPage(s(f, 'path', 300));
  if (!p) return { error: 'Unknown page.' };
  try { await translatePage(p, s(f, 'lang', 10)); } catch (e) { return { error: (e as Error).message }; }
  revalidatePath('/', 'layout');
  return { ok: 'Translated again with AI.' };
}

export async function suggestKeywordsNow(_: St): Promise<St> {
  await requireAdmin(FULL);
  if (!(await aiReady())) return { error: 'Add an AI key in Site settings first.' };
  try {
    const { suggestKeywords } = await import('@/lib/server/autopub');
    const k = await suggestKeywords(10);
    const cur = await getBlock<AutoPub>('autopub', AP0);
    await saveBlock<AutoPub>('autopub', { ...cur, keywords: [cur.keywords.trim(), ...k].filter(Boolean).join('\n') });
    revalidatePath('/admin/autopublisher/');
    return { ok: `Added ${k.length} keyword ideas: ${k.slice(0, 4).join(' · ')}…` };
  } catch (e) { return { error: (e as Error).message }; }
}
