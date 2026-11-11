// Website visitor counter: one record per page view (not bots, not the admin), grouped by day.
// Stores counts only (no IP addresses): views per day, unique visitors per day, views per page per day.
import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { clientIp } from '@/lib/server/ratelimit';
import { updateJsonFile } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export type Day = { v: number; u: number; pages: Record<string, number>; ref?: Record<string, number> };
export type Visits = { days: Record<string, Day>; total: number };

const BOT = /bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|facebookexternalhit|preview|headless|lighthouse|pingdom|curl|wget|python|axios|playwright/i;
const seenView = new Map<string, number>();
const seenDay = new Set<string>();
/** Visitors active in the last few minutes (for "online now"). */
const live = new Map<string, number>();
declare global { var __ADGV_LIVE: Map<string, number> | undefined }
globalThis.__ADGV_LIVE = live;

const today = () => new Date(Date.now() + 4 * 3600_000).toISOString().slice(0, 10); // UAE date
const okPath = (p: unknown): p is string => typeof p === 'string' && p.length < 200 && p.startsWith('/') && !p.startsWith('/admin') && !p.startsWith('/api');

export async function POST(req: NextRequest) {
  let body: { path?: unknown; ref?: unknown } = {};
  try { body = await req.json(); } catch { /* empty */ }
  const path = body.path;
  const ua = req.headers.get('user-agent') || '';
  if (!okPath(path) || BOT.test(ua)) return NextResponse.json({ ok: false });
  const id = createHash('sha256').update(`${clientIp(req.headers)}|${ua}`).digest('hex').slice(0, 16);
  const t = Date.now(), day = today();
  live.set(id, t);
  if (live.size > 5000) for (const [k, v] of live) if (v < t - 10 * 60_000) live.delete(k);
  const vk = `${id}|${path}`;
  if ((seenView.get(vk) ?? 0) > t - 30 * 60_000) return NextResponse.json({ ok: true });
  seenView.set(vk, t);
  if (seenView.size > 50000) for (const [k, v] of seenView) if (v < t - 30 * 60_000) seenView.delete(k);
  const dk = `${day}|${id}`;
  const fresh = !seenDay.has(dk);
  if (fresh) { seenDay.add(dk); if (seenDay.size > 100000) seenDay.clear(); }
  let ref = typeof body.ref === 'string' ? body.ref : '';
  try { ref = ref ? new URL(ref).hostname.replace(/^www\./, '') : ''; } catch { ref = ''; }
  if (/abudhabigoldenvisa\.com$/.test(ref)) ref = '';
  await updateJsonFile<Visits>('visits.json', { days: {}, total: 0 }, (all) => {
    const d = all.days[day] ?? (all.days[day] = { v: 0, u: 0, pages: {}, ref: {} });
    d.v += 1; if (fresh) d.u += 1;
    d.pages[path] = (d.pages[path] ?? 0) + 1;
    if (ref) { d.ref ??= {}; d.ref[ref] = (d.ref[ref] ?? 0) + 1; }
    all.total = (all.total ?? 0) + 1;
    const keys = Object.keys(all.days).sort();
    for (const k of keys.slice(0, Math.max(0, keys.length - 400))) delete all.days[k];
    return all;
  });
  return NextResponse.json({ ok: true });
}
