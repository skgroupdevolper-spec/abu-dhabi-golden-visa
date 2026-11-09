'use client';

// Extra WhatsApp messages: the team can add as many as needed (each with a trigger, on/off, text and an
// optional approved template name) and remove them. Saved with the rest of the WhatsApp settings form.
import { useState } from 'react';
import type { WaCustom } from '@/lib/settings-schema';

type Ev = { key: string; label: string; vars: string };
type Row = WaCustom & { gone?: boolean; k: number };

export function WaCustomList({ initial, events }: { initial: WaCustom[]; events: Ev[] }) {
  const [rows, setRows] = useState<Row[]>(initial.map((c, k) => ({ ...c, k })));
  const add = () => setRows((r) => [...r, { id: '', label: '', on: true, when: (events[0]?.key ?? 'status') as WaCustom['when'], text: '', k: Date.now() }]);
  const del = (k: number) => setRows((r) => r.map((x) => (x.k === k ? { ...x, gone: true } : x)));
  return (
    <div className="stack" style={{ marginTop: 18 }}>
      <h3 style={{ margin: 0 }}>Your extra messages</h3>
      <p className="help" style={{ margin: 0 }}>Add more messages for any moment above. Each one is sent right after the main message when it happens. Use the same variables, e.g. {'{name}'} and {'{ref}'}.</p>
      <input type="hidden" name="c_count" value={rows.length} />
      {rows.length === 0 && <p className="muted small">No extra messages yet.</p>}
      {rows.map((r, i) => {
        const ev = events.find((e) => e.key === r.when);
        return (
          <div key={r.k} className="notice" style={{ display: r.gone ? 'none' : undefined }}>
            <input type="hidden" name={`c_id_${i}`} value={r.id} />
            {r.gone && <input type="hidden" name={`c_del_${i}`} value="on" />}
            <div className="form">
              <div className="field"><label htmlFor={`c_label_${i}`}>Name</label><input id={`c_label_${i}`} name={`c_label_${i}`} defaultValue={r.label} placeholder="e.g. Thank-you note" /></div>
              <div className="field"><label htmlFor={`c_when_${i}`}>Send when</label>
                <select id={`c_when_${i}`} name={`c_when_${i}`} defaultValue={r.when} onChange={(e) => setRows((x) => x.map((y) => (y.k === r.k ? { ...y, when: e.target.value as WaCustom['when'] } : y)))}>
                  {events.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
                </select>
              </div>
              <div className="field full"><label htmlFor={`c_text_${i}`}>Message text</label><textarea id={`c_text_${i}`} name={`c_text_${i}`} rows={2} defaultValue={r.text} /><small className="muted">Variables: {ev?.vars}</small></div>
              <div className="field"><label htmlFor={`c_name_${i}`}>Approved template name (optional)</label><input id={`c_name_${i}`} name={`c_name_${i}`} defaultValue={r.templateName ?? ''} /></div>
              <div className="field" style={{ alignSelf: 'end', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: 0 }}><input type="checkbox" name={`c_on_${i}`} defaultChecked={r.on} /> On</label>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => del(r.k)}>Delete</button>
              </div>
            </div>
          </div>
        );
      })}
      <div><button type="button" className="btn btn-glass" onClick={add}>+ Add message</button></div>
    </div>
  );
}
