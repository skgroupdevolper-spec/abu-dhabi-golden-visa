import 'server-only';
// Loads the editable step list and keeps every file pointing at the right step when steps are added,
// removed or reordered (files remember the step id, not only its position).
import { LEGACY_IDS, STAGES0, type StageDef } from '@/lib/stage-defs';
import { getBlock, saveBlock } from './settings';
import { listApplications, withLock, writeJsonFile, type Application } from './store';

type Saved = { v: 2; list: StageDef[] };

export async function getStages(): Promise<StageDef[]> {
  const s = await getBlock<Saved | null>('stages', null);
  if (s?.v === 2 && s.list?.length) return s.list;
  // First run: move from the old 9 steps to the new list once.
  return withLock('stages-migrate', async () => {
    const again = await getBlock<Saved | null>('stages', null);
    if (again?.v === 2 && again.list?.length) return again.list;
    await remapFiles(LEGACY_IDS, STAGES0, true);
    await saveBlock('stages', { v: 2, list: STAGES0 } satisfies Saved);
    return STAGES0;
  });
}

/** Saves a new list and moves every file to the same step in it (by id). */
export async function saveStages(list: StageDef[]) {
  const prev = await getStages();
  await remapFiles(prev.map((x) => x.id), list, false);
  await saveBlock('stages', { v: 2, list } satisfies Saved);
}

async function remapFiles(oldIds: string[], list: StageDef[], legacy: boolean) {
  await withLock('apps', async () => {
    const apps = await listApplications();
    let changed = false;
    for (const a of apps as (Application & { stageId?: string })[]) {
      const id = (!legacy && a.stageId) || oldIds[Math.min(a.stage, oldIds.length - 1)] || list[0].id;
      let idx = list.findIndex((x) => x.id === id);
      if (idx < 0) {
        // step was removed: keep the nearest earlier step that still exists
        const oi = oldIds.indexOf(id);
        for (let k = oi - 1; k >= 0 && idx < 0; k--) idx = list.findIndex((x) => x.id === oldIds[k]);
        if (idx < 0) idx = 0;
      }
      const dates: Record<string, string> = {};
      for (const [k, at] of Object.entries(a.stageDates || {})) {
        const sid = /^\d+$/.test(k) ? oldIds[Number(k)] : k;
        const ni = list.findIndex((x) => x.id === sid);
        if (ni >= 0 && (!dates[ni] || at < dates[ni])) dates[ni] = at;
      }
      a.stage = idx; a.stageId = list[idx].id; a.stageDates = dates;
      changed = true;
    }
    if (changed) await writeJsonFile('applications.json', apps);
  });
}

export const stageIdx = (list: StageDef[], id: string, fallback = 0) => { const i = list.findIndex((x) => x.id === id); return i < 0 ? fallback : i; };
