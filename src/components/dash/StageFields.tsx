'use client';

// Stage + "next step" fields: choosing a stage fills in that stage's default next-step text (each stage
// has its own), unless the advisor already typed something different. The text stays editable.
import { useState } from 'react';

export function StageFields({ stages, defaults, stage, next, expected }: { stages: string[]; defaults: string[]; stage: number; next: string; expected?: string }) {
  const [cur, setCur] = useState(stage);
  const [text, setText] = useState(next || defaults[stage] || '');
  const change = (i: number) => {
    // replace the text only when it is empty or still a default text
    if (!text.trim() || defaults.includes(text.trim())) setText(defaults[i] || '');
    setCur(i);
  };
  return (
    <>
      <div className="field"><label htmlFor="stage">Current stage</label>
        <select id="stage" name="stage" value={cur} onChange={(e) => change(Number(e.target.value))}>{stages.map((t, i) => <option key={t} value={i}>{i + 1}. {t}</option>)}</select>
      </div>
      <div className="field"><label htmlFor="expected">Expected next date</label><input id="expected" name="expected" defaultValue={expected} placeholder="e.g. 14 Nov 2026" /></div>
      <div className="field full">
        <label htmlFor="nextStep">Next step shown to the client</label>
        <textarea id="nextStep" name="nextStep" rows={2} value={text} onChange={(e) => setText(e.target.value)} />
        <small className="muted">Filled in from the default text of this stage. Change it for this client if needed. <button type="button" className="linkish" onClick={() => setText(defaults[cur] || '')}>Use default</button></small>
        <label className="row small" style={{ marginTop: 8, gap: 8 }}><input type="checkbox" name="saveDefault" /> Save this text as the default for “{stages[cur]}” (used for all clients from now on)</label>
      </div>
    </>
  );
}
