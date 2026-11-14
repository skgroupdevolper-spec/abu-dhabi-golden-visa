'use client';

// Stage + "next step" fields: choosing a stage fills in that stage's default next-step text (each stage
// has its own), unless the advisor already typed something different. The text stays editable.
import { useState } from 'react';

export function StageFields({ stages, defaults, stage, next, expected, groups }: { stages: string[]; defaults: string[]; stage: number; next: string; expected?: string; groups?: string[] }) {
  const [cur, setCur] = useState(stage);
  const [text, setText] = useState(next || defaults[stage] || '');
  const [typed, setTyped] = useState(false);
  const change = (i: number) => {
    // Each of the steps has its own client message: choosing a step loads it, unless the advisor
    // already typed their own text for this update.
    if (!typed) setText(defaults[i] || '');
    setCur(i);
  };
  return (
    <>
      <div className="field"><label htmlFor="stage">Current stage</label>
        <select id="stage" name="stage" value={cur} onChange={(e) => change(Number(e.target.value))}>
          {groups?.some(Boolean)
            ? [...new Set(groups)].map((g) => <optgroup key={g} label={g || 'Other'}>{stages.map((t, i) => (groups[i] === g ? <option key={i} value={i}>{i + 1}. {t}</option> : null))}</optgroup>)
            : stages.map((t, i) => <option key={i} value={i}>{i + 1}. {t}</option>)}
        </select>
      </div>
      <div className="field"><label htmlFor="expected">Expected next date</label><input id="expected" name="expected" defaultValue={expected} placeholder="e.g. 14 Nov 2026" /></div>
      <div className="field full">
        <label htmlFor="nextStep">Next step shown to the client</label>
        <textarea id="nextStep" name="nextStep" rows={2} value={text} onChange={(e) => { setText(e.target.value); setTyped(true); }} />
        <small className="muted">Filled in from the default text of this stage. Change it for this client if needed. <button type="button" className="linkish" onClick={() => { setText(defaults[cur] || ''); setTyped(false); }}>Use default</button></small>
        <label className="row small" style={{ marginTop: 8, gap: 8 }}><input type="checkbox" name="saveDefault" /> Save this text as the default for “{stages[cur]}” (used for all clients from now on)</label>
      </div>
    </>
  );
}
