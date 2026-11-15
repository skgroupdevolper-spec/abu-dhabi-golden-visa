import 'server-only';
// Loads the editable step lists (one per service group) and keeps every file pointing at the right step
// when steps are added, removed or reordered (files remember the step id, not only its position).
import { DEFAULT_SERVICE, LEGACY_IDS, SERVICE_STEPS0, STAGES0, STEP_SERVICES, stepServiceOf, type StageDef } from '@/lib/stage-defs';
import { APPLY_SERVICES } from '@/content/apply';
import { getBlock, saveBlock } from './settings';
import { listApplications, withLock, writeJsonFile, type Application } from './store';

type Saved = { v: 2 | 3; list: StageDef[]; groups?: Record<string, StageDef[]> };

/** The service group (step list) a file follows. */
export function stepGroupOf(a: Pick<Application, 'route'> & { stepGroup?: string; service?: string }): string {
  if (a.stepGroup) return a.stepGroup;
  const svc = APPLY_SERVICES.find((x) => x.id === a.service) || APPLY_SERVICES.find((x) => x.label === a.route);
  if (svc) return stepServiceOf(svc.group);
  if (a.route === 'family') return 'Family & residency';
  return DEFAULT_SERVICE; // Golden Visa routes (property, investor, professional…) and anything unknown
}

async function data(): Promise<Saved & { groups: Record<string, StageDef[]> }> {
  const s = await getBlock<Saved | null>('stages', null);
  if (s?.v === 3 && s.list?.length) return { ...s, groups: s.groups ?? {} };
  return withLock('stages-migrate', async () => {
    const again = await getBlock<Saved | null>('stages', null);
    if (again?.v === 3 && again.list?.length) return { ...again, groups: again.groups ?? {} };
    let list = again?.v === 2 && again.list?.length ? again.list : STAGES0;
    if (!(again?.v === 2 && again.list?.length)) { await remapFiles(LEGACY_IDS, STAGES0, true, () => true); list = STAGES0; }
    // Every service group gets its own steps; files outside Golden Visa move to the same step id in
    // their new list (or the nearest earlier one).
    const groups: Record<string, StageDef[]> = { ...SERVICE_STEPS0 };
    await withLock('apps', async () => {
      const apps = await listApplications();
      for (const a of apps) a.stepGroup = stepGroupOf(a);
      await writeJsonFile('applications.json', apps);
    });
    for (const [g, gl] of Object.entries(groups)) await remapFiles(list.map((x) => x.id), gl, false, (a) => a.stepGroup === g);
    const saved: Saved = { v: 3, list, groups };
    await saveBlock('stages', saved);
    return { ...saved, groups };
  });
}

/** Steps of one service group (Golden Visa when none is given or the group has no own list). */
export async function getStages(group?: string): Promise<StageDef[]> {
  const d = await data();
  return (group && group !== DEFAULT_SERVICE && d.groups[group]?.length ? d.groups[group] : d.list);
}

/** Steps a file follows. */
export const stepsFor = (a: Pick<Application, 'route'> & { stepGroup?: string; service?: string }) => getStages(stepGroupOf(a));

/** Step names of every service group, for pages that list many files. */
export async function allStepNames(): Promise<Record<string, string[]>> {
  const d = await data();
  const out: Record<string, string[]> = { [DEFAULT_SERVICE]: d.list.map((x) => x.name) };
  for (const g of STEP_SERVICES) if (g !== DEFAULT_SERVICE) out[g] = (d.groups[g]?.length ? d.groups[g] : d.list).map((x) => x.name);
  return out;
}

/** Saves a new list for one service group and moves its files to the same step in it (by id). */
export async function saveStages(list: StageDef[], group: string = DEFAULT_SERVICE) {
  const d = await data();
  const prev = await getStages(group);
  const inGroup = (a: Application) => stepGroupOf(a) === group || (group === DEFAULT_SERVICE && !d.groups[stepGroupOf(a)]?.length);
  await remapFiles(prev.map((x) => x.id), list, false, inGroup);
  const next: Saved = group === DEFAULT_SERVICE ? { v: 3, list, groups: d.groups } : { v: 3, list: d.list, groups: { ...d.groups, [group]: list } };
  await saveBlock('stages', next);
}

async function remapFiles(oldIds: string[], list: StageDef[], legacy: boolean, which: (a: Application) => boolean) {
  await withLock('apps', async () => {
    const apps = await listApplications();
    let changed = false;
    for (const a of apps as (Application & { stageId?: string })[]) {
      if (!which(a)) continue;
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
