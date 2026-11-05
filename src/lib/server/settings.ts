import 'server-only';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_SECRETS, mergeSite, type PublicSite, type Secrets } from '@/lib/settings-schema';
import { DATA_DIR, readJsonFile, updateJsonFile } from './store';

type All = { site?: Partial<PublicSite>; secrets?: Partial<Secrets>; [k: string]: unknown };

function mergeSecrets(s?: Partial<Secrets>): Secrets {
  const d = DEFAULT_SECRETS;
  return {
    whatsapp: { ...d.whatsapp, ...s?.whatsapp, autos: { ...d.whatsapp.autos, ...s?.whatsapp?.autos }, templates: { ...d.whatsapp.templates, ...s?.whatsapp?.templates }, templateNames: { ...d.whatsapp.templateNames, ...s?.whatsapp?.templateNames } },
    smtp: { ...d.smtp, ...s?.smtp },
    seo: { ...d.seo, ...s?.seo },
    ai: { ...d.ai, ...s?.ai },
  };
}

/** Loads saved settings into the running server so every page uses them (called at start and after saving). */
export function applyRuntimeSync() {
  try {
    const all = JSON.parse(readFileSync(path.join(DATA_DIR, 'settings.json'), 'utf8')) as All;
    globalThis.__ADGV_SITE = mergeSite(all.site);
  } catch {
    globalThis.__ADGV_SITE = mergeSite();
  }
  return globalThis.__ADGV_SITE!;
}

export async function getSite(): Promise<PublicSite> {
  return mergeSite((await readJsonFile<All>('settings.json', {})).site);
}
export async function getSecrets(): Promise<Secrets> {
  return mergeSecrets((await readJsonFile<All>('settings.json', {})).secrets);
}
export async function saveSite(patch: Partial<PublicSite>) {
  const all = await updateJsonFile<All>('settings.json', {}, (a) => ({ ...a, site: mergeSite({ ...mergeSite(a.site), ...patch }) }));
  globalThis.__ADGV_SITE = mergeSite(all.site);
}
export async function saveSecrets(patch: Partial<Secrets>) {
  await updateJsonFile<All>('settings.json', {}, (a) => ({ ...a, secrets: mergeSecrets({ ...mergeSecrets(a.secrets), ...patch }) }));
}
/** Generic named blocks (chatbot, translations, offer, menu…) */
export async function getBlock<T>(key: string, fallback: T): Promise<T> {
  const all = await readJsonFile<All>('settings.json', {});
  return (all[key] as T) ?? fallback;
}
export async function saveBlock<T>(key: string, value: T) {
  await updateJsonFile<All>('settings.json', {}, (a) => ({ ...a, [key]: value }));
}
