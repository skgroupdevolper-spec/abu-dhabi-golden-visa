import { ok, fail } from '@/lib/server/ap/shim/http';
import { requireAdmin } from '@/lib/server/ap/shim/http';
import { getAutoConfig } from '@/lib/server/ap/config';
import { rebuildFingerprints, siteReport } from '@/lib/server/ap/similarity';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET() {
  if (!(await requireAdmin())) return fail('Admins only', 403);
  const cfg = await getAutoConfig();
  return ok(await siteReport(cfg));
}

/** Rebuild fingerprints (in batches; call again until remaining = 0) */
export async function POST(req: Request) {
  if (!(await requireAdmin())) return fail('Admins only', 403);
  const b = await req.json().catch(() => ({}));
  const cfg = await getAutoConfig();
  const done = await rebuildFingerprints(cfg.quality.embeddings !== 'off' ? 20 : 400, cfg, !!b.force);
  return ok({ done });
}
