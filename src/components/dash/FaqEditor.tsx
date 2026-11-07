'use client';

// FAQ editor: add a new question, delete one (two clicks), move up/down, then Save.
import { useState } from 'react';
import { ActionForm, Submit } from './ActionForm';
import type { saveFaqs } from '@/app/admin/content-actions';

type Row = { key: string; q: string; a: string; armed?: boolean };
let n = 0;
const k = () => `r${Date.now()}${n++}`;

export function FaqEditor({ items, action }: { items: { q: string; a: string }[]; action: typeof saveFaqs }) {
  const [rows, setRows] = useState<Row[]>(() => items.map((x) => ({ key: k(), q: x.q, a: x.a })));
  const upd = (i: number, p: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const add = () => { setRows((r) => [{ key: k(), q: '', a: '' }, ...r]); setTimeout(() => document.querySelector<HTMLInputElement>('.faq-ed input')?.focus(), 50); };
  const del = (i: number) => {
    if (!rows[i].armed) { upd(i, { armed: true }); setTimeout(() => setRows((r) => r.map((x) => (x.key === rows[i].key ? { ...x, armed: false } : x))), 4000); return; }
    setRows((r) => r.filter((_, j) => j !== i));
  };
  const move = (i: number, d: number) => setRows((r) => { const c = [...r], j = i + d; if (j < 0 || j >= c.length) return r; [c[i], c[j]] = [c[j], c[i]]; return c; });
  return (
    <ActionForm action={action} className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-gold" onClick={add}>+ Add new FAQ</button>
        <span className="small muted">{rows.length} questions · changes are kept when you press Save FAQs</span>
      </div>
      {rows.map((f, i) => (
        <div className="panel faq-ed" key={f.key} style={{ padding: 16 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <b className="small">Question {i + 1}</b>
            <div className="row" style={{ gap: 6 }}>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down">↓</button>
              <button type="button" className={`btn btn-sm btn-danger${f.armed ? ' armed' : ''}`} onClick={() => del(i)}>{f.armed ? 'Click again to delete' : 'Delete'}</button>
            </div>
          </div>
          <div className="field"><input name="q" value={f.q} onChange={(e) => upd(i, { q: e.target.value })} placeholder="Question" aria-label={`Question ${i + 1}`} /></div>
          <div className="field" style={{ marginTop: 8 }}><textarea name="a" value={f.a} onChange={(e) => upd(i, { a: e.target.value })} rows={3} placeholder="Answer" aria-label={`Answer ${i + 1}`} /></div>
        </div>
      ))}
      <div className="row"><Submit>Save FAQs</Submit><button type="button" className="btn" onClick={add}>+ Add new FAQ</button></div>
    </ActionForm>
  );
}
