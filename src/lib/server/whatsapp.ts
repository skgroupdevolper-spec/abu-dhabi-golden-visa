import 'server-only';
import { WA_EVENTS, type WaEvent } from '@/lib/settings-schema';
import { insert, type WaLog } from './collections';
import { getSecrets } from './settings';
import { newId, now } from './store';

const GRAPH = 'https://graph.facebook.com/v21.0';
export const digits = (p: string) => p.replace(/\D/g, '').replace(/^00/, '');

export function fill(tpl: string, vars: Record<string, string | number | undefined>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')).replace(/\s+\n/g, '\n').trim();
}

/** Sends one WhatsApp message through the Cloud API when it is set up; otherwise records it only. */
export async function sendWa(to: string, event: WaEvent, vars: Record<string, string | number | undefined>, opts: { force?: boolean; text?: string } = {}) {
  const w = (await getSecrets()).whatsapp;
  const text = opts.text ?? fill(w.templates[event] || '', vars);
  const number = digits(to);
  if (!number || number.length < 8) return { ok: false, error: 'No valid number' };
  if (!opts.force && !w.autos[event]) return { ok: false, error: 'Automatic message is off' };
  if (w.mode !== 'cloud' || !w.phoneNumberId || !w.accessToken) {
    return { ok: false, error: 'WhatsApp Cloud API is not connected (link mode)' };
  }
  const name = w.templateNames[event];
  const keys = (WA_EVENTS.find((e) => e.key === event)?.vars.match(/\{(\w+)\}/g) ?? []).map((k) => k.slice(1, -1));
  const body = name && !opts.text
    ? { messaging_product: 'whatsapp', to: number, type: 'template', template: { name, language: { code: w.templateLang || 'en' }, components: [{ type: 'body', parameters: keys.map((k) => ({ type: 'text', text: String(vars[k] ?? '-').slice(0, 900) || '-' })) }] } }
    : { messaging_product: 'whatsapp', to: number, type: 'text', text: { body: text.slice(0, 4000), preview_url: true } };
  let ok = false, error = '';
  try {
    const r = await fetch(`${GRAPH}/${encodeURIComponent(w.phoneNumberId)}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${w.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const j = await r.json().catch(() => ({}));
    ok = r.ok;
    if (!r.ok) error = j?.error?.message || `HTTP ${r.status}`;
  } catch (e) {
    error = (e as Error).message;
  }
  await insert<WaLog>('whatsapp-log', { id: newId(6), at: now(), to: number, event, text: text.slice(0, 500), ok, error: error || undefined, dir: 'out' }, 2000);
  return { ok, error };
}

/** Sends to every team number set in WhatsApp settings. */
export async function sendTeam(event: WaEvent, vars: Record<string, string | number | undefined>) {
  const w = (await getSecrets()).whatsapp;
  const nums = w.teamNumbers.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
  return Promise.all(nums.map((n) => sendWa(n, event, vars)));
}
