// Article views: the article page calls this once per visit; the count is shown on the page and in admin.
// One view per visitor and article every 30 minutes; bots are not counted.
import { NextResponse, type NextRequest } from 'next/server';
import { clientIp } from '@/lib/server/ratelimit';
import { readJsonFile, updateJsonFile } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
const seen = new Map<string, number>();
const BOT = /bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|facebookexternalhit|preview|headless|lighthouse|pingdom|curl|wget|python|axios/i;
const ok = (p: unknown): p is string => typeof p === 'string' && /^\/blog\/[a-z0-9-]+\/$/.test(p);

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams.get('path');
  if (!ok(p)) return NextResponse.json({ views: 0 });
  const all = await readJsonFile<Record<string, number>>('views.json', {});
  return NextResponse.json({ views: all[p] ?? 0 });
}

export async function POST(req: NextRequest) {
  let path: unknown;
  try { ({ path } = await req.json()); } catch { /* empty */ }
  if (!ok(path)) return NextResponse.json({ views: 0 }, { status: 400 });
  const all0 = await readJsonFile<Record<string, number>>('views.json', {});
  const ua = req.headers.get('user-agent') || '';
  const key = `${clientIp(req.headers)}|${path}`, t = Date.now();
  if (BOT.test(ua) || (seen.get(key) ?? 0) > t - 30 * 60_000) return NextResponse.json({ views: all0[path] ?? 0 });
  seen.set(key, t);
  if (seen.size > 20000) for (const [k, v] of seen) if (v < t - 30 * 60_000) seen.delete(k);
  let n = 0;
  await updateJsonFile<Record<string, number>>('views.json', {}, (all) => { all[path as string] = (all[path as string] ?? 0) + 1; n = all[path as string]; return all; });
  return NextResponse.json({ views: n });
}
