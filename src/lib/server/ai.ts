import 'server-only';
import { getSecrets } from './settings';
import { readJsonFile, updateJsonFile } from './store';

type Msg = { role: 'user' | 'assistant'; content: string };
const DEFAULT_MODEL = { openai: 'gpt-4.1-mini', gemini: 'gemini-2.5-flash', anthropic: 'claude-haiku-4-5' } as const;

export async function aiReady() {
  const a = (await getSecrets()).ai;
  const p = a.provider;
  return !!p && !!(p === 'openai' ? a.openaiKey : p === 'gemini' ? a.geminiKey : a.anthropicKey);
}

/** Counts automatic AI requests per day so background jobs stay inside the admin's daily limit. */
export async function underDailyLimit(kind: 'auto' | 'chat') {
  if (kind === 'chat') return true;
  const a = (await getSecrets()).ai;
  const today = new Date().toISOString().slice(0, 10);
  const u = await readJsonFile<{ day: string; n: number }>('ai-usage.json', { day: today, n: 0 });
  return u.day !== today || u.n < Math.max(1, a.dailyBudget || 0);
}
async function count() {
  const today = new Date().toISOString().slice(0, 10);
  await updateJsonFile<{ day: string; n: number }>('ai-usage.json', { day: today, n: 0 }, (u) => (u.day === today ? { day: today, n: u.n + 1 } : { day: today, n: 1 }));
}

/** One chat completion with whichever provider the admin chose. */
export async function complete(system: string, messages: Msg[], o: { json?: boolean; maxTokens?: number; kind?: 'auto' | 'chat' } = {}): Promise<string> {
  const a = (await getSecrets()).ai;
  const p = a.provider;
  if (!p) throw new Error('AI is switched off. Add a key in Admin > Site settings > AI keys.');
  const model = a.model || DEFAULT_MODEL[p];
  const max = o.maxTokens ?? 1200;
  let text = '';
  if (p === 'openai') {
    if (!a.openaiKey) throw new Error('OpenAI key missing');
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${a.openaiKey}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(90000),
      body: JSON.stringify({ model, max_completion_tokens: max, messages: [{ role: 'system', content: system }, ...messages], ...(o.json ? { response_format: { type: 'json_object' } } : {}) }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || `OpenAI error ${r.status}`);
    text = j.choices?.[0]?.message?.content ?? '';
  } else if (p === 'gemini') {
    if (!a.geminiKey) throw new Error('Gemini key missing');
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'x-goog-api-key': a.geminiKey, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(90000),
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })), generationConfig: { maxOutputTokens: max, ...(o.json ? { responseMimeType: 'application/json' } : {}) } }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || `Gemini error ${r.status}`);
    text = j.candidates?.[0]?.content?.parts?.map((x: { text?: string }) => x.text ?? '').join('') ?? '';
  } else {
    if (!a.anthropicKey) throw new Error('Anthropic key missing');
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': a.anthropicKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(90000),
      body: JSON.stringify({ model, max_tokens: max, system: o.json ? `${system}\nReply with JSON only.` : system, messages }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || `Anthropic error ${r.status}`);
    text = j.content?.map((x: { text?: string }) => x.text ?? '').join('') ?? '';
  }
  if (o.kind !== 'chat') await count();
  return text.trim();
}

export function parseJson<T>(s: string): T {
  const m = s.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return JSON.parse(m ? m[0] : s) as T;
}
