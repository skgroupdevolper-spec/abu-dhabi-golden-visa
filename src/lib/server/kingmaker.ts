import 'server-only';
// King Maker API: your own OpenAI-compatible AI server. The key is saved in Settings → AI and only used here,
// on the server; it is never sent to the browser.
export const KM_URL = 'https://ollama-lrok.srv2184834.hstgr.cloud/api/v1';

const models = new Map<string, { at: number; list: string[] }>();
/** Models the server offers (cached 10 minutes). */
export async function kmModels(url: string, key: string): Promise<string[]> {
  const base = (url || KM_URL).replace(/\/+$/, '');
  const hit = models.get(base);
  if (hit && Date.now() - hit.at < 600_000) return hit.list;
  const r = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000), cache: 'no-store' });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`King Maker API: ${j?.error?.message || j?.error || `HTTP ${r.status}`}`);
  const list = ((j?.data ?? j?.models ?? []) as { id?: string; name?: string; model?: string }[]).map((m) => m.id || m.name || m.model || '').filter(Boolean);
  models.set(base, { at: Date.now(), list });
  return list;
}

/** One chat completion on the King Maker API (OpenAI format). An empty model uses the first model the server offers. */
export async function kmChat(o: { url?: string; key: string; model?: string; system: string; messages: { role: 'user' | 'assistant'; content: unknown }[]; json?: boolean; maxTokens?: number; temperature?: number; timeoutMs?: number }) {
  if (!o.key) throw new Error('King Maker API key missing (Settings → AI).');
  const base = (o.url || KM_URL).replace(/\/+$/, '');
  const model = o.model?.trim() || (await kmModels(base, o.key))[0];
  if (!model) throw new Error('King Maker API: no model found. Type a model name in the AI settings.');
  const r = await fetch(`${base}/chat/completions`, {
    method: 'POST', headers: { Authorization: `Bearer ${o.key}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(o.timeoutMs ?? 120000), cache: 'no-store',
    body: JSON.stringify({ model, messages: [{ role: 'system', content: o.json ? `${o.system}\n\nReturn valid JSON only.` : o.system }, ...o.messages], max_tokens: o.maxTokens ?? 1200, ...(o.temperature !== undefined ? { temperature: o.temperature } : {}), ...(o.json ? { response_format: { type: 'json_object' } } : {}), stream: false }),
  });
  const t = await r.text();
  let j: { choices?: { message?: { content?: string } }[]; error?: { message?: string } | string } = {};
  try { j = JSON.parse(t); } catch { /* not JSON */ }
  if (!r.ok) { const e = typeof j.error === 'string' ? j.error : j.error?.message; throw Object.assign(new Error(`King Maker API HTTP ${r.status}: ${e || t.slice(0, 300)}`), { status: r.status }); }
  return String(j.choices?.[0]?.message?.content ?? '').trim();
}
