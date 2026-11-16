'use client';

// Tick boxes on list rows + a bar to delete the ticked ones (or all on the page) in one click.
// Usage: wrap the list in <Bulk kind="leads"> and put <BulkCheck id={x.id} /> in each row.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { bulkDelete } from '@/app/admin/delete-actions';

export function BulkCheck({ id, label = 'Select' }: { id: string; label?: string }) {
  return <input type="checkbox" className="bulk-ck" value={id} aria-label={label} onClick={(e) => e.stopPropagation()} />;
}

export function Bulk({ kind, children, what = 'items' }: { kind: string; children: ReactNode; what?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  const [total, setTotal] = useState(0);
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();
  const boxes = () => [...(box.current?.querySelectorAll<HTMLInputElement>('input.bulk-ck') ?? [])].filter((x) => !x.closest('[style*="display: none"]'));
  const count = () => { const b = boxes(); setTotal(b.length); setN(b.filter((x) => x.checked).length); };
  useEffect(() => {
    count();
    const el = box.current;
    if (!el) return;
    const on = (e: Event) => { if ((e.target as HTMLElement).classList?.contains('bulk-ck')) count(); };
    el.addEventListener('change', on);
    const mo = new MutationObserver(() => count());
    mo.observe(el, { childList: true, subtree: true });
    return () => { el.removeEventListener('change', on); mo.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const all = n > 0 && n === total;
  const toggleAll = () => { const b = boxes(); const v = !all; b.forEach((x) => { x.checked = v; x.closest('tr, li, .bulk-row')?.classList.toggle('bulk-on', v); }); count(); };
  useEffect(() => { boxes().forEach((x) => x.closest('tr, li, .bulk-row')?.classList.toggle('bulk-on', x.checked)); });
  const go = async () => {
    setAsk(false); setBusy(true); setErr('');
    const picked = boxes().filter((x) => x.checked);
    const rows = picked.map((x) => x.closest('tr, li, .bulk-row') as HTMLElement | null).filter(Boolean) as HTMLElement[];
    rows.forEach((r) => { r.style.transition = 'opacity .2s'; r.style.opacity = '.3'; });
    try {
      await bulkDelete(kind, picked.map((x) => x.value));
      rows.forEach((r) => { r.style.display = 'none'; });
      picked.forEach((x) => { x.checked = false; });
      router.refresh();
    } catch (e) {
      rows.forEach((r) => { r.style.opacity = ''; });
      setErr((e as Error).message || 'Could not delete');
    }
    setBusy(false); count();
  };
  return (
    <div ref={box} className="bulk">
      {total > 0 && (
        <div className={`bulk-bar${n ? ' on' : ''}`}>
          <label className="bulk-all"><input type="checkbox" checked={all} ref={(i) => { if (i) i.indeterminate = n > 0 && !all; }} onChange={toggleAll} /> {all ? 'All selected' : 'Select all'}</label>
          <span className="bulk-n">{n ? `${n} of ${total} selected` : `${total} ${what}`}</span>
          {n > 0 && <button type="button" className="btn btn-sm" onClick={() => { boxes().forEach((x) => { x.checked = false; }); count(); }}>Clear</button>}
          <button type="button" className="btn btn-sm btn-danger" disabled={!n || busy} onClick={() => setAsk(true)}>{busy ? 'Deleting…' : `Delete selected${n ? ` (${n})` : ''}`}</button>
          {err && <span className="bulk-err">{err}</span>}
        </div>
      )}
      {children}
      {ask && createPortal(
        <div className="cdlg-back" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setAsk(false); }}>
          <div className="cdlg" role="alertdialog" aria-modal="true" aria-labelledby="bulk-t">
            <div className="cdlg-ic" aria-hidden="true">!</div>
            <p id="bulk-t" className="cdlg-t">Delete {n} {n === 1 ? 'item' : what}? This cannot be undone.</p>
            <div className="cdlg-a">
              <button type="button" className="btn" onClick={() => setAsk(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" autoFocus onClick={go}>Yes, delete {n}</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
