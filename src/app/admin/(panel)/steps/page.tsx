import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { StageListEditor } from '@/components/dash/StageListEditor';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getStages } from '@/lib/server/stages';
import { listApplications } from '@/lib/server/store';
import { resetStageList, saveStageList } from '../../settings-actions';

export const metadata: Metadata = { title: 'Application steps' };
export const dynamic = 'force-dynamic';

export default async function Steps() {
  await requireAdmin(FULL);
  const [list, apps] = await Promise.all([getStages(), listApplications()]);
  const counts: Record<string, number> = {};
  for (const a of apps) if (!a.archived) { const id = list[a.stage]?.id; if (id) counts[id] = (counts[id] ?? 0) + 1; }
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Application steps</p><h1>The steps your clients <span className="gold">see and follow.</span></h1></div></div>
      <div className="panel" style={{ maxWidth: 980 }}>
        <p className="help" style={{ marginTop: 0 }}>Rename a step, change the message the client sees, put it in a section, move it up or down, add new steps or remove ones you do not use. Files keep their place: when you remove a step, its files move to the step before it. In each file you can also mark single steps as On hold, Action required or Not applicable.</p>
        <ActionForm action={saveStageList} className="stack">
          <StageListEditor initial={list} counts={counts} />
          <div className="row uf-actions" style={{ gap: 10 }}><Submit>Save steps</Submit></div>
        </ActionForm>
        <details className="more" style={{ marginTop: 14 }}>
          <summary>Go back to the standard 17 steps</summary>
          <ActionForm action={resetStageList} className="row"><Submit className="btn btn-sm">Restore the standard steps</Submit></ActionForm>
        </details>
      </div>
    </>
  );
}
