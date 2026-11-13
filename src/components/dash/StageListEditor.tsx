'use client';

// Edit the application steps: rename, change the client message and the section, move up/down, add, remove.
import { useState } from 'react';
import type { StageDef } from '@/lib/stage-defs';

export function StageListEditor({ initial, counts }: { initial: StageDef[]; counts: Record<string, number> }) {
  const [rows, setRows] = useState<(StageDef & { key: number })[]>(() => initial.map((x, i) => ({ ...x, key: i })));
  const [nextKey, setNextKey] = useState(initial.length);
  const groups = [...new Set(rows.map((r) => r.group).filter(Boolean))];
  const upd = (k: number, p: Partial<StageDef>) => setRows((r) => r.map((x) => (x.key === k ? { ...x, ...p } : x)));
  const move = (i: number, d: number) => setRows((r) => { const c = [...r]; const j = i + d; if (j < 0 || j >= c.length) return r; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const add = (i: number) => { setRows((r) => { const c = [...r]; c.splice(i + 1, 0, { key: nextKey, id: '', name: '', group: r[i]?.group ?? groups[0] ?? '', next: '' }); return c; }); setNextKey((n) => n + 1); };
  const del = (k: number) => {
    const x = rows.find((r) => r.key === k);
    const n = x?.id ? counts[x.id] ?? 0 : 0;
    if (n && !window.confirm(`${n} file(s) are on “${x?.name}”. They will move to the step before it. Remove this step?`)) return;
    setRows((r) => r.filter((y) => y.key !== k));
  };
  return (
    <>
      <input type="hidden" name="list" value={JSON.stringify(rows.map(({ key: _k, ...x }) => x))} />
      <datalist id="stage-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
      <ol className="sle">
        {rows.map((r, i) => {
          const newGroup = i === 0 || rows[i - 1].group !== r.group;
          return (
            <li key={r.key}>
              {newGroup && r.group && <p className="sle-g">{r.group}</p>}
              <div className="sle-row">
                <span className="sle-n">{String(i + 1).padStart(2, '0')}</span>
                <div className="sle-f">
                  <div className="sle-top">
                    <input aria-label="Step name" value={r.name} placeholder="Step name, e.g. Medical test" onChange={(e) => upd(r.key, { name: e.target.value })} />
                    <input aria-label="Section" list="stage-groups" value={r.group} placeholder="Section" onChange={(e) => upd(r.key, { group: e.target.value })} className="sle-grp" />
                  </div>
                  <textarea aria-label="Message the client sees" rows={2} value={r.next} placeholder="Message the client sees at this step" onChange={(e) => upd(r.key, { next: e.target.value })} />
                  {r.id && counts[r.id] ? <small className="muted">{counts[r.id]} file(s) on this step now</small> : null}
                </div>
                <div className="sle-a">
                  <button type="button" className="btn btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" title="Move up">↑</button>
                  <button type="button" className="btn btn-sm" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down" title="Move down">↓</button>
                  <button type="button" className="btn btn-sm" onClick={() => add(i)} title="Add a step below">+ Add</button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => del(r.key)} disabled={rows.length <= 2} title="Remove this step">Remove</button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <button type="button" className="btn" onClick={() => add(rows.length - 1)} style={{ marginTop: 10 }}>+ Add a step at the end</button>
    </>
  );
}
