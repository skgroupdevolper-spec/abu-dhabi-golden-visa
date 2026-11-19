'use client';

// Several email addresses, one per box, with "+ Add email" and a remove button.
// Posted as one comma-separated value under `name` (the server already splits it).
import { useState } from 'react';

export function EmailList({ name, value, label, help }: { name: string; value: string; label: string; help?: string }) {
  const start = value.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
  const [list, setList] = useState<string[]>(start.length ? start : ['']);
  const set = (i: number, v: string) => setList((l) => l.map((x, j) => (j === i ? v : x)));
  const ok = (v: string) => !v || /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(v.trim());
  return (
    <div className="field full emaillist">
      <label>{label}</label>
      <input type="hidden" name={name} value={list.map((x) => x.trim()).filter(Boolean).join(', ')} />
      <div className="el-rows">
        {list.map((v, i) => (
          <div className="el-row" key={i}>
            <span className="el-n" aria-hidden="true">{i + 1}</span>
            <input type="email" value={v} placeholder="name@company.com" aria-label={`Email ${i + 1}`} aria-invalid={!ok(v)} onChange={(e) => set(i, e.target.value)} />
            {list.length > 1 && <button type="button" className="el-x" aria-label={`Remove email ${i + 1}`} title="Remove" onClick={() => setList((l) => l.filter((_, j) => j !== i))}>✕</button>}
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-sm el-add" onClick={() => setList((l) => [...l, ''])}>+ Add email</button>
      {help && <small className="help">{help}</small>}
    </div>
  );
}
