import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { StageListEditor } from '@/components/dash/StageListEditor';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getStages, stepGroupOf } from '@/lib/server/stages';
import { listApplications } from '@/lib/server/store';
import { DEFAULT_SERVICE, STEP_SERVICES } from '@/lib/stage-defs';
import { resetStageList, saveStageList } from '../../settings-actions';

export const metadata: Metadata = { title: 'Application steps' };
export const dynamic = 'force-dynamic';

export default async function Steps({ searchParams }: { searchParams: Promise<{ svc?: string }> }) {
  await requireAdmin(FULL);
  const { svc: q } = await searchParams;
  const svc = (STEP_SERVICES as readonly string[]).includes(q ?? '') ? q! : DEFAULT_SERVICE;
  const [list, apps] = await Promise.all([getStages(svc), listApplications()]);
  const open = apps.filter((a) => !a.archived);
  const counts: Record<string, number> = {};
  const perSvc: Record<string, number> = {};
  for (const a of open) {
    const g = stepGroupOf(a);
    perSvc[g] = (perSvc[g] ?? 0) + 1;
    if (g !== svc) continue;
    const id = list[a.stage]?.id;
    if (id) counts[id] = (counts[id] ?? 0) + 1;
  }
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Application steps</p><h1>The steps your clients <span className="gold">see and follow.</span></h1></div></div>
      <nav className="svc-tabs" aria-label="Service">
        {STEP_SERVICES.map((s) => (
          <Link key={s} href={`/admin/steps/?svc=${encodeURIComponent(s)}`} className={s === svc ? 'on' : ''} aria-current={s === svc ? 'page' : undefined}>
            {s}{perSvc[s] ? <em>{perSvc[s]}</em> : null}
          </Link>
        ))}
      </nav>
      <div className="panel" style={{ maxWidth: 980 }}>
        <h2 style={{ marginTop: 0 }}>{svc} <small className="muted">· {list.length} steps</small></h2>
        <p className="help" style={{ marginTop: 0 }}>Each service has its own steps. A file follows the steps of its service. Rename a step, change the message the client gets, move it up or down, add or remove steps. Untick &ldquo;Send this message on WhatsApp &amp; email&rdquo; for steps the client does not need to hear about. When you remove a step, its files move to the step before it.</p>
        <ActionForm action={saveStageList} className="stack" key={svc}>
          <input type="hidden" name="svc" value={svc} />
          <StageListEditor initial={list} counts={counts} />
          <div className="row uf-actions" style={{ gap: 10 }}><Submit>Save {svc} steps</Submit></div>
        </ActionForm>
        <details className="more" style={{ marginTop: 14 }}>
          <summary>Go back to the standard {svc} steps</summary>
          <ActionForm action={resetStageList} className="row"><input type="hidden" name="svc" value={svc} /><Submit className="btn btn-sm">Restore the standard steps</Submit></ActionForm>
        </details>
      </div>
    </>
  );
}
