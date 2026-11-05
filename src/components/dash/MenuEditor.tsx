'use client';

// Editor for the main menu (items, drop-down groups and links) and the footer link columns.
import { useState } from 'react';
import { Icon } from '@/components/Icon';

type Link = { label: string; href: string; note?: string };
type Group = { title: string; links: Link[] };
type Item = { label: string; href: string; groups?: Group[] };

function swap<T>(a: T[], i: number, j: number) { const c = [...a]; if (j < 0 || j >= c.length) return a; [c[i], c[j]] = [c[j], c[i]]; return c; }

function Groups({ groups, set }: { groups: Group[]; set: (g: Group[]) => void }) {
  return (
    <div className="me-groups">
      {groups.map((g, gi) => (
        <div key={gi} className="me-group">
          <div className="me-gh">
            <input value={g.title} onChange={(e) => set(groups.map((x, k) => (k === gi ? { ...x, title: e.target.value } : x)))} placeholder="Column / group title" />
            <button type="button" className="ib" onClick={() => set(swap(groups, gi, gi - 1))} aria-label="Move up"><Icon name="up" size={14} /></button>
            <button type="button" className="ib" onClick={() => set(swap(groups, gi, gi + 1))} aria-label="Move down"><Icon name="down" size={14} /></button>
            <button type="button" className="ib" onClick={() => set(groups.filter((_, k) => k !== gi))} aria-label="Delete group"><Icon name="trash" size={14} /></button>
          </div>
          {g.links.map((l, li) => {
            const up = (p: Partial<Link>) => set(groups.map((x, k) => (k === gi ? { ...x, links: x.links.map((y, m) => (m === li ? { ...y, ...p } : y)) } : x)));
            return (
              <div key={li} className="me-link">
                <input value={l.label} onChange={(e) => up({ label: e.target.value })} placeholder="Link text" />
                <input value={l.href} onChange={(e) => up({ href: e.target.value })} placeholder="/page/" />
                <input value={l.note ?? ''} onChange={(e) => up({ note: e.target.value })} placeholder="Small note (optional)" />
                <button type="button" className="ib" onClick={() => set(groups.map((x, k) => (k === gi ? { ...x, links: swap(x.links, li, li - 1) } : x)))} aria-label="Move up"><Icon name="up" size={14} /></button>
                <button type="button" className="ib" onClick={() => set(groups.map((x, k) => (k === gi ? { ...x, links: x.links.filter((_, m) => m !== li) } : x)))} aria-label="Delete link"><Icon name="trash" size={14} /></button>
              </div>
            );
          })}
          <button type="button" className="btn btn-sm" onClick={() => set(groups.map((x, k) => (k === gi ? { ...x, links: [...x.links, { label: '', href: '' }] } : x)))}><Icon name="plus" size={13} /> Add link</button>
        </div>
      ))}
      <button type="button" className="btn btn-sm" onClick={() => set([...groups, { title: 'New group', links: [{ label: '', href: '' }] }])}><Icon name="plus" size={13} /> Add group</button>
    </div>
  );
}

export function MenuEditor({ initial, footer, custom }: { initial: Item[]; footer: Group[]; custom: boolean }) {
  const [menu, setMenu] = useState<Item[]>(initial);
  const [cols, setCols] = useState<Group[]>(footer);
  const [open, setOpen] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(reset = false) {
    setBusy(true); setMsg('');
    const r = await fetch('/api/admin/menu/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reset ? { menu: [], footerCols: [] } : { menu, footerCols: cols }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (reset && j.ok) { window.location.reload(); return; }
    setMsg(j.ok ? 'Saved. The website menu is updated.' : j.error || 'Not saved.');
  }
  return (
    <div className="stack">
      <div className="panel">
        <div className="panel-h"><div><h2>Main menu</h2><p className="help">Drag order with the arrows. Items with groups open a drop-down; 4 or more groups show as a tabbed panel with cards.</p></div>
          <div className="row">{custom && <button type="button" className="btn btn-sm btn-danger" onClick={() => confirm('Go back to the original menu?') && save(true)}>Reset to original</button>}<button type="button" className="btn btn-gold" onClick={() => save()} disabled={busy}>{busy ? 'Saving…' : 'Save menu'}</button></div></div>
        {msg && <p className="notice ok">{msg}</p>}
        <div className="me-items">
          {menu.map((m, i) => (
            <div key={i} className={`me-item${open === i ? ' open' : ''}`}>
              <div className="me-ih">
                <span className="pb-ic"><Icon name={m.groups?.length ? 'grid' : 'ext'} size={15} /></span>
                <input value={m.label} onChange={(e) => setMenu(menu.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} placeholder="Menu text" />
                <input value={m.href} onChange={(e) => setMenu(menu.map((x, k) => (k === i ? { ...x, href: e.target.value } : x)))} placeholder="/page/" />
                <button type="button" className="btn btn-sm" onClick={() => setOpen(open === i ? null : i)}>{m.groups?.length ? `Drop-down (${m.groups.length})` : 'Add drop-down'}</button>
                <button type="button" className="ib" onClick={() => setMenu(swap(menu, i, i - 1))} aria-label="Move up"><Icon name="up" size={14} /></button>
                <button type="button" className="ib" onClick={() => setMenu(swap(menu, i, i + 1))} aria-label="Move down"><Icon name="down" size={14} /></button>
                <button type="button" className="ib" onClick={() => setMenu(menu.filter((_, k) => k !== i))} aria-label="Delete"><Icon name="trash" size={14} /></button>
              </div>
              {open === i && <Groups groups={m.groups ?? []} set={(g) => setMenu(menu.map((x, k) => (k === i ? { ...x, groups: g } : x)))} />}
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => setMenu([...menu, { label: 'New item', href: '/' }])}><Icon name="plus" size={13} /> Add menu item</button>
      </div>
      <div className="panel">
        <div className="panel-h"><div><h2>Footer link columns</h2><p className="help">Leave empty to use Golden Visa, Family &amp; Residency and Resources from the menu.</p></div><button type="button" className="btn btn-gold" onClick={() => save()} disabled={busy}>Save</button></div>
        <Groups groups={cols} set={setCols} />
      </div>
    </div>
  );
}
