// Owner-only health check: shows why saves could fail on the live server (cache folder, disk, memory).
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { access, statfs, writeFile, unlink, constants } from 'node:fs/promises';
import path from 'node:path';
import { currentAdmin, requireAdmin } from '@/lib/server/auth';
import { DATA_DIR, updateJsonFile } from '@/lib/server/store';
import { readdir, stat } from 'node:fs/promises';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const aid = new URL(req.url).searchParams.get('aid') || '';
  const me = await currentAdmin();
  if (!me || (me.role !== 'owner' && me.role !== 'admin')) return NextResponse.json({ ok: false }, { status: 401 });
  const out: Record<string, unknown> = { cwd: process.cwd(), uid: process.getuid?.(), node: process.version, mem: Math.round(process.memoryUsage().rss / 1e6) + 'MB', uptime: Math.round(process.uptime()) + 's' };
  const check = async (name: string, fn: () => Promise<unknown>) => { try { out[name] = (await fn()) ?? 'ok'; } catch (e) { out[name] = 'ERROR ' + (e as Error).message; } };
  await check('nextCacheWritable', () => access(path.join(process.cwd(), '.next/cache'), constants.W_OK));
  await check('nextServerWritable', () => access(path.join(process.cwd(), '.next/server'), constants.W_OK));
  await check('dataWritable', async () => { const f = path.join(DATA_DIR, '.selftest'); await writeFile(f, 'x'); await unlink(f); });
  await check('disk', async () => { const s = await statfs(process.cwd()); return Math.round((s.bavail * s.bsize) / 1e6) + 'MB free'; });
  await check('revalidate', async () => { revalidatePath('/admin/', 'layout'); return 'ok (sync)'; });
  await check('postsRewrite', async () => { await updateJsonFile<unknown[]>('posts.json', [], (x) => x); return 'ok'; });
  await check('requireAdminEdit', async () => { await requireAdmin(['owner', 'admin', 'staff'] as never); return 'ok'; });
  await check('files', async () => { const r: string[] = []; for (const f of await readdir(DATA_DIR)) { const st = await stat(path.join(DATA_DIR, f)); r.push(`${f}:${st.uid}:${(st.mode & 0o777).toString(8)}`); } return r.join(' '); });
  await check('actionKnown', async () => { const m = JSON.parse(await (await import('node:fs/promises')).readFile(path.join(process.cwd(), '.next/server/server-reference-manifest.json'), 'utf8')); const e = m.node?.[aid]; return aid ? (e ? 'yes ' + JSON.stringify(e).slice(0, 300) : 'NO (of ' + Object.keys(m.node || {}).length + ')') : 'no aid'; });
  await check('pm2', async () => `pid ${process.pid} instance ${process.env.NODE_APP_INSTANCE ?? '-'} build ${(await (await import('node:fs/promises')).readFile(path.join(process.cwd(), '.next/BUILD_ID'), 'utf8')).trim()}`);
  const trace = (globalThis as unknown as { __ADGV_TRACE?: unknown[] }).__ADGV_TRACE; out.trace = trace ?? [];
  out.errors = (globalThis as unknown as { __ADGV_ERR?: unknown[] }).__ADGV_ERR ?? [];
  return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } });
}
