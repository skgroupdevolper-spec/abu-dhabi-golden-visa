// Owner-only health check: shows why saves could fail on the live server (cache folder, disk, memory).
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { access, statfs, writeFile, unlink, constants } from 'node:fs/promises';
import path from 'node:path';
import { currentAdmin } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const me = await currentAdmin();
  if (!me || (me.role !== 'owner' && me.role !== 'admin')) return NextResponse.json({ ok: false }, { status: 401 });
  const out: Record<string, unknown> = { cwd: process.cwd(), uid: process.getuid?.(), node: process.version, mem: Math.round(process.memoryUsage().rss / 1e6) + 'MB', uptime: Math.round(process.uptime()) + 's' };
  const check = async (name: string, fn: () => Promise<unknown>) => { try { out[name] = (await fn()) ?? 'ok'; } catch (e) { out[name] = 'ERROR ' + (e as Error).message; } };
  await check('nextCacheWritable', () => access(path.join(process.cwd(), '.next/cache'), constants.W_OK));
  await check('nextServerWritable', () => access(path.join(process.cwd(), '.next/server'), constants.W_OK));
  await check('dataWritable', async () => { const f = path.join(process.env.DATA_DIR || './data', '.selftest'); await writeFile(f, 'x'); await unlink(f); });
  await check('disk', async () => { const s = await statfs(process.cwd()); return Math.round((s.bavail * s.bsize) / 1e6) + 'MB free'; });
  await check('revalidate', async () => { revalidatePath('/admin/', 'layout'); return 'ok (sync)'; });
  return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } });
}
