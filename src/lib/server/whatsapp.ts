import 'server-only';
import { createHash } from 'node:crypto';
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
  const r = await sendOne(to, event, vars, opts);
  // Extra messages the team added for this trigger go out right after the main one.
  if (!opts.text && !opts.force) {
    const extra = ((await getSecrets()).whatsapp.customs ?? []).filter((c) => c.on && c.when === event && c.text.trim());
    for (const c of extra) await sendOne(to, event, vars, {}, { text: c.text, name: c.templateName });
  }
  return r;
}

async function sendOne(to: string, event: WaEvent, vars: Record<string, string | number | undefined>, opts: { force?: boolean; text?: string } = {}, custom?: { text: string; name?: string }) {
  const w = (await getSecrets()).whatsapp;
  const text = custom ? fill(custom.text, vars) : opts.text ?? fill(w.templates[event] || '', vars);
  const number = digits(to);
  if (!number || number.length < 8) return { ok: false, error: 'No valid number' };
  if (!custom && !opts.force && !w.autos[event]) return { ok: false, error: 'Automatic message is off' };
  if (w.mode !== 'cloud' || !w.phoneNumberId || !w.accessToken) {
    return { ok: false, error: 'WhatsApp Cloud API is not connected (link mode)' };
  }
  // Inside the 24-hour window (the client wrote to us in the last 24 h) a normal message always arrives and is free,
  // so the template is only used outside it. This also avoids templates Meta moved to "marketing".
  const open = await wroteLast24h(number);
  const name = open ? '' : custom ? custom.name : w.templateNames[event];
  const keys = (WA_EVENTS.find((e) => e.key === event)?.vars.match(/\{(\w+)\}/g) ?? []).map((k) => k.slice(1, -1));
  // Outside the 24-hour window with no approved template for this message: send it inside the approved
  // "new message" template ({{1}} name, {{2}} file, {{3}} text, {{4}} link), so it still reaches the client.
  const viaMsg = !open && !name && !custom && event !== 'message' && event !== 'leadTeam' && w.templateNames.message;
  const flat = (v: unknown) => String(v ?? '').replace(/https?:\/\/\S+/g, '').replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim();
  const body = viaMsg
    ? { messaging_product: 'whatsapp', to: number, type: 'template', template: { name: w.templateNames.message, language: { code: w.templateLang || 'en' }, components: [{ type: 'body', parameters: [vars.name, vars.ref || '-', flat(text).slice(0, 900) || '-', vars.link || SITE_URL()].map((x) => ({ type: 'text', text: String(x ?? '-') || '-' })) }] } }
    : name && (custom || !opts.text)
    ? { messaging_product: 'whatsapp', to: number, type: 'template', template: { name, language: { code: w.templateLang || 'en' }, components: [{ type: 'body', parameters: keys.map((k) => ({ type: 'text', text: flat(vars[k]).slice(0, 900) || String(vars[k] ?? '-').slice(0, 900) || '-' })) }] } }
    : { messaging_product: 'whatsapp', to: number, type: 'text', text: { body: text.slice(0, 4000), preview_url: true } };
  let ok = false, error = '', mid = '';
  try {
    const r = await fetch(`${GRAPH}/${encodeURIComponent(w.phoneNumberId)}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${w.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const j = await r.json().catch(() => ({}));
    ok = r.ok;
    mid = j?.messages?.[0]?.id || '';
    if (!r.ok) error = waAdvice(j?.error?.message || `HTTP ${r.status}`, j?.error?.code);
  } catch (e) {
    error = (e as Error).message;
  }
  await insert<WaLog>('whatsapp-log', { id: newId(6), at: now(), to: number, event, text: `${body.type === 'template' ? `[template ${viaMsg ? w.templateNames.message : name}] ` : ''}${text}`.slice(0, 500), ok, error: error || undefined, dir: 'out', ...(mid ? { mid } : {}) }, 2000);
  return { ok, error };
}

/** Sends to every team number set in WhatsApp settings. */
export async function sendTeam(event: WaEvent, vars: Record<string, string | number | undefined>) {
  const w = (await getSecrets()).whatsapp;
  const nums = w.teamNumbers.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
  return Promise.all(nums.map((n) => sendWa(n, event, vars)));
}

/** Sends a PDF (or other file) by link with a caption, e.g. the payment receipt. Cloud API only. */
export async function sendWaDoc(to: string, link: string, filename: string, caption: string) {
  const w = (await getSecrets()).whatsapp;
  const number = digits(to);
  if (!number || number.length < 8) return { ok: false, error: 'No valid number' };
  if (w.mode !== 'cloud' || !w.phoneNumberId || !w.accessToken) return { ok: false, error: 'WhatsApp Cloud API is not connected (link mode)' };
  let ok = false, error = '';
  try {
    const r = await fetch(`${GRAPH}/${encodeURIComponent(w.phoneNumberId)}/messages`, {
      method: 'POST', headers: { Authorization: `Bearer ${w.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: number, type: 'document', document: { link, filename, caption: caption.slice(0, 1000) } }),
      signal: AbortSignal.timeout(20000),
    });
    const j = await r.json().catch(() => ({}));
    ok = r.ok; if (!r.ok) error = j?.error?.message || `HTTP ${r.status}`;
  } catch (e) { error = (e as Error).message; }
  await insert<WaLog>('whatsapp-log', { id: newId(6), at: now(), to: number, event: 'paid', text: `[PDF] ${filename} · ${caption}`.slice(0, 500), ok, error: error || undefined, dir: 'out' }, 2000);
  return { ok, error };
}

/** Webhook verify word: the one saved in Admin > WhatsApp, or a fixed word made from your IDs (same every time). */
export function webhookToken(w: { verifyToken?: string; phoneNumberId?: string; businessId?: string }) {
  if (w.verifyToken?.trim()) return w.verifyToken.trim();
  return 'adgv-' + createHash('sha256').update(`adgv|${w.businessId || ''}|${w.phoneNumberId || ''}`).digest('hex').slice(0, 10);
}

/** Plain advice for the WhatsApp errors seen most often. */
export function waAdvice(msg: string, code?: number) {
  if (/Object with ID .* does not exist|missing permissions/i.test(msg)) return `The access token cannot use this phone number. In Business settings → System users, give the user full control of your WhatsApp account, generate a new token, and check the Phone number ID (Setup → “Check connection”). (${msg.slice(0, 120)})`;
  if (code === 131047 || /re-engagement|24 hours/i.test(msg)) return 'Not delivered: more than 24 hours since the client last wrote. An approved template is needed for this message (Setup → templates).';
  if (code === 131026 || /undeliverable/i.test(msg)) return 'Not delivered: this number is not on WhatsApp or cannot receive messages.';
  if (code === 132001 || /template name does not exist/i.test(msg)) return 'The template name is not approved in this language. Press “Check approval” in Setup.';
  if (code === 190 || /access token/i.test(msg)) return 'The access token expired or is wrong. Generate a permanent System user token and save it in Setup.';
  return msg;
}

/** True when this number sent us a WhatsApp in the last 24 hours (Meta's customer service window). */
async function wroteLast24h(number: string) {
  try {
    const { list } = await import('./collections');
    const since = new Date(Date.now() - 23.5 * 3600_000).toISOString();
    const tail = number.slice(-9);
    return (await list<WaLog>('whatsapp-log')).some((l) => l.dir === 'in' && l.at >= since && digits(l.to).endsWith(tail));
  } catch { return false; }
}

const SITE_URL = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.abudhabigoldenvisa.com').replace(/\/$/, '') + '/';
