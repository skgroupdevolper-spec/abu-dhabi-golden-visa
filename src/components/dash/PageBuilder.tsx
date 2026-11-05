'use client';

// Page builder: edit every section of a page, add widgets, change styles, page hero, featured image and SEO.
import { useMemo, useRef, useState } from 'react';
import { BLOCKS, HOME_SECTIONS, STYLE_FIELDS, arr, str, uid, type Block, type BlockType, type Field } from '@/lib/blocks';
import { Icon } from '@/components/Icon';
import { MediaPicker } from './MediaPicker';
import { RichEditor } from './RichEditor';

type Over = Record<string, unknown> & { facts?: { label: string; value: string }[] };
type Props = { path: string; custom: boolean; original: { h1: string; intro: string; eyebrow: string; seoTitle: string; meta: string; facts: { label: string; value: string }[] }; initial: Over; blocks: Block[]; hasOverride: boolean; home?: boolean };

function FieldInput({ f, value, set }: { f: Field; value: unknown; set: (v: unknown) => void }) {
  switch (f.kind) {
    case 'textarea': return <textarea rows={3} value={str(value)} onChange={(e) => set(e.target.value)} />;
    case 'md': return <RichEditor value={str(value)} onChange={(h) => set(h)} minHeight={220} />;
    case 'number': return <input type="number" value={str(value)} onChange={(e) => set(Number(e.target.value))} />;
    case 'check': return <label className="row small"><input type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} /> {f.label}</label>;
    case 'image': return <MediaPicker value={str(value)} onChange={(u) => set(u)} />;
    case 'select': return <select value={str(value) || f.options?.[0][0]} onChange={(e) => set(e.target.value)}>{f.options?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
    case 'lines': return <textarea rows={5} value={arr<string>(value).join('\n')} onChange={(e) => set(e.target.value.split('\n'))} placeholder="One item per line" />;
    case 'table': return <textarea rows={6} className="mono" value={str(value)} onChange={(e) => set(e.target.value)} />;
    case 'items': {
      const list = arr<Record<string, unknown>>(value);
      const upd = (i: number, k: string, v: unknown) => set(list.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
      return (
        <div className="pb-items">
          {list.map((it, i) => (
            <div key={i} className="pb-item">
              <div className="pb-item-h"><b>{str(it.title || it.label || it.q || it.value || it.alt) || `Item ${i + 1}`}</b>
                <span className="row">
                  <button type="button" className="ib" disabled={i === 0} onClick={() => { const c = [...list]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; set(c); }} aria-label="Move up"><Icon name="up" size={14} /></button>
                  <button type="button" className="ib" disabled={i === list.length - 1} onClick={() => { const c = [...list]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; set(c); }} aria-label="Move down"><Icon name="down" size={14} /></button>
                  <button type="button" className="ib" onClick={() => set(list.filter((_, j) => j !== i))} aria-label="Remove"><Icon name="trash" size={14} /></button>
                </span>
              </div>
              {f.sub?.map((sf) => <div className="field" key={sf.k}>{sf.kind !== 'check' && <label>{sf.label}</label>}<FieldInput f={sf} value={it[sf.k]} set={(v) => upd(i, sf.k, v)} /></div>)}
            </div>
          ))}
          <button type="button" className="btn btn-sm" onClick={() => set([...list, Object.fromEntries((f.sub ?? []).map((sf) => [sf.k, '']))])}><Icon name="plus" size={14} /> Add</button>
        </div>
      );
    }
    default: return <input value={str(value)} onChange={(e) => set(e.target.value)} />;
  }
}

function MdField({ value, set }: { value: string; set: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrap = (a: string, b = a) => {
    const t = ref.current; if (!t) return;
    const s = t.selectionStart, e = t.selectionEnd;
    set(value.slice(0, s) + a + (value.slice(s, e) || 'text') + b + value.slice(e));
  };
  const line = (p: string) => { const t = ref.current; if (!t) return; const s = value.lastIndexOf('\n', t.selectionStart - 1) + 1; set(value.slice(0, s) + p + value.slice(s)); };
  return (
    <div className="md">
      <div className="md-bar">
        <button type="button" onClick={() => line('## ')}>H2</button><button type="button" onClick={() => line('### ')}>H3</button>
        <button type="button" onClick={() => wrap('**')}><b>B</b></button><button type="button" onClick={() => wrap('*')}><i>I</i></button>
        <button type="button" onClick={() => line('- ')}>• List</button><button type="button" onClick={() => line('1. ')}>1. List</button>
        <button type="button" onClick={() => wrap('[', '](/apply/)')}>Link</button><button type="button" onClick={() => line('> ')}>Quote</button>
        <button type="button" onClick={() => wrap('![alt](', ')')}>Image</button>
      </div>
      <textarea ref={ref} rows={8} value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );
}

function seoChecks(title: string, meta: string, h1: string, kw: string, img: string) {
  const k = kw.toLowerCase();
  return [
    { ok: title.length >= 30 && title.length <= 62, t: `SEO title length ${title.length} (best 30–62)` },
    { ok: meta.length >= 110 && meta.length <= 160, t: `Description length ${meta.length} (best 110–160)` },
    { ok: !!h1 && h1.length <= 80, t: 'One clear main heading (H1)' },
    { ok: !k || title.toLowerCase().includes(k), t: 'Focus keyword in the SEO title' },
    { ok: !k || meta.toLowerCase().includes(k), t: 'Focus keyword in the description' },
    { ok: !k || h1.toLowerCase().includes(k), t: 'Focus keyword in the H1' },
    { ok: !!img, t: 'Featured image for Google and social sharing' },
  ];
}

export function PageBuilder({ path, custom, original, initial, blocks: start, hasOverride, home = false }: Props) {
  const [tab, setTab] = useState<'sections' | 'page' | 'seo' | 'css' | 'home'>(home ? 'home' : 'sections');
  const [o, setO] = useState<Over>(initial);
  const [blocks, setBlocks] = useState<Block[]>(start);
  const [sel, setSel] = useState<string | null>(start[0]?.id ?? null);
  const [side, setSide] = useState<'content' | 'style'>('content');
  const [adding, setAdding] = useState<number | null>(null);
  const [placeFor, setPlaceFor] = useState('contact');
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const frame = useRef<HTMLIFrameElement>(null);

  const cur = blocks.find((b) => b.id === sel) ?? null;
  const setOv = (k: string, v: unknown) => { setO((x) => ({ ...x, [k]: v })); setDirty(true); };
  const upd = (id: string, fn: (b: Block) => Block) => { setBlocks((bs) => bs.map((b) => (b.id === id ? fn(b) : b))); setDirty(true); };
  const move = (i: number, d: number) => { setBlocks((bs) => { const c = [...bs]; const j = i + d; if (j < 0 || j >= c.length) return bs; [c[i], c[j]] = [c[j], c[i]]; return c; }); setDirty(true); };
  const add = (type: BlockType, at: number) => { const b: Block = { id: uid(), type, data: BLOCKS[type].make(), style: home ? { place: placeFor } : {} }; setBlocks((bs) => [...bs.slice(0, at), b, ...bs.slice(at)]); setSel(b.id); setSide('content'); setAdding(null); setDirty(true); };
  const groups = useMemo(() => (['Content', 'Media', 'Widgets', 'Layout'] as const).map((g) => ({ g, items: (Object.keys(BLOCKS) as BlockType[]).filter((t) => BLOCKS[t].group === g) })), []);

  async function save() {
    setBusy(true); setMsg({});
    try {
      const r = await fetch('/api/admin/page/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, o: { ...o, blocks } }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Not saved.');
      setMsg({ ok: 'Saved. The page is live with your changes.' }); setDirty(false);
      if (frame.current) frame.current.src = `${path}?v=${Date.now()}`;
    } catch (e) { setMsg({ error: (e as Error).message }); } finally { setBusy(false); }
  }
  async function reset() {
    if (!confirm(custom ? 'Delete this page?' : 'Reset this page to its original content? Your edits will be removed.')) return;
    await fetch(`/api/admin/page/?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
    window.location.href = custom ? '/admin/pages/' : `/admin/pages/edit/?path=${encodeURIComponent(path)}`;
  }

  const title = str(o.seoTitle) || original.seoTitle, meta = str(o.meta) || original.meta, h1 = str(o.h1) || original.h1;
  const checks = seoChecks(title, meta, h1, str(o.keyword), str(o.ogImage) || str(o.image));
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  return (
    <div className="pb">
      <div className="pb-top">
        <nav className="pb-tabs">
          {((home ? [['home', 'Homepage sections', 'layout'], ['sections', 'Added sections & widgets', 'grid'], ['seo', `SEO · ${score}%`, 'seo'], ['css', 'Custom CSS', 'palette']] : [['sections', 'Sections & widgets', 'grid'], ['page', 'Page header & image', 'image'], ['seo', `SEO · ${score}%`, 'seo'], ['css', 'Custom CSS', 'palette']]) as ['sections' | 'page' | 'seo' | 'css' | 'home', string, string][]).map(([k, l, ic]) => (
            <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}><Icon name={ic} size={16} /> {l}</button>
          ))}
        </nav>
        <div className="row">
          <button type="button" className="btn btn-sm" onClick={() => setPreview((p) => !p)}><Icon name="eye" size={15} /> {preview ? 'Hide preview' : 'Live preview'}</button>
          <a className="btn btn-sm" href={path} target="_blank" rel="noopener"><Icon name="ext" size={15} /> Open page</a>
          {(hasOverride || custom) && <button type="button" className="btn btn-sm btn-danger" onClick={reset}>{custom ? 'Delete page' : 'Reset to original'}</button>}
          <button type="button" className="btn btn-gold" onClick={save} disabled={busy}>{busy ? 'Saving…' : dirty ? 'Save changes •' : 'Save'}</button>
        </div>
      </div>
      {msg.ok && <p className="notice ok">{msg.ok}</p>}
      {msg.error && <p className="notice err">{msg.error}</p>}

      <div className={`pb-body${preview ? ' with-preview' : ''}`}>
        <div className="pb-main">
          {tab === 'sections' && (
            <div className="pb-grid">
              <div className="pb-list">
                <p className="pb-h">Page sections <small>{blocks.length}</small></p>
                <button type="button" className="pb-add" onClick={() => setAdding(0)}><Icon name="plus" size={14} /> Add section at top</button>
                {blocks.map((b, i) => (
                  <div key={b.id}>
                    <div className={`pb-row${sel === b.id ? ' on' : ''}${b.hidden ? ' off' : ''}`} onClick={() => setSel(b.id)}>
                      <span className="pb-ic"><Icon name={BLOCKS[b.type]?.icon ?? 'doc'} size={16} /></span>
                      <span className="pb-tx"><b>{str(b.data.title) || str(b.data.eyebrow) || BLOCKS[b.type]?.label}</b><small>{BLOCKS[b.type]?.label}{home ? ` · after ${HOME_SECTIONS.find(([k]) => k === (b.style?.place || 'contact'))?.[1] ?? b.style?.place}` : ''}{b.hidden ? ' · hidden' : ''}</small></span>
                      <span className="pb-acts" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="ib" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><Icon name="up" size={14} /></button>
                        <button type="button" className="ib" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="Move down"><Icon name="down" size={14} /></button>
                        <button type="button" className="ib" onClick={() => upd(b.id, (x) => ({ ...x, hidden: !x.hidden }))} aria-label={b.hidden ? 'Show' : 'Hide'}><Icon name="eye" size={14} /></button>
                        <button type="button" className="ib" onClick={() => { const c = { ...JSON.parse(JSON.stringify(b)), id: uid() }; setBlocks((bs) => [...bs.slice(0, i + 1), c, ...bs.slice(i + 1)]); setDirty(true); }} aria-label="Duplicate"><Icon name="copy" size={14} /></button>
                        <button type="button" className="ib" onClick={() => { if (confirm('Delete this section?')) { setBlocks((bs) => bs.filter((x) => x.id !== b.id)); setDirty(true); } }} aria-label="Delete"><Icon name="trash" size={14} /></button>
                      </span>
                    </div>
                    <button type="button" className="pb-add sm" onClick={() => setAdding(i + 1)}><Icon name="plus" size={12} /> Add section here</button>
                  </div>
                ))}
              </div>
              <div className="pb-edit">
                {cur ? (
                  <>
                    <div className="pb-edit-h">
                      <span className="pb-ic"><Icon name={BLOCKS[cur.type].icon} size={16} /></span><b>{BLOCKS[cur.type].label}</b>
                      <div className="seg-s"><button type="button" className={side === 'content' ? 'on' : ''} onClick={() => setSide('content')}>Content</button><button type="button" className={side === 'style' ? 'on' : ''} onClick={() => setSide('style')}>Design</button></div>
                    </div>
                    {side === 'content' ? (
                      <div className="pb-fields">
                        {BLOCKS[cur.type].fields.length === 0 && <p className="muted small">This block has no settings. Use Design to change its look.</p>}
                        {BLOCKS[cur.type].fields.map((f) => (
                          <div className="field" key={f.k}>{f.kind !== 'check' && <label>{f.label}</label>}<FieldInput f={f} value={cur.data[f.k]} set={(v) => upd(cur.id, (x) => ({ ...x, data: { ...x.data, [f.k]: v } }))} />{f.help && <p className="help">{f.help}</p>}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="pb-fields two">
                        {home && (
                          <div className="field full"><label>Show this section on the homepage after</label>
                            <select value={cur.style?.place || 'contact'} onChange={(e) => upd(cur.id, (x) => ({ ...x, style: { ...x.style, place: e.target.value } }))}>{HOME_SECTIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                        )}
                        {STYLE_FIELDS.filter((f) => f.k !== 'bgImage' || cur.style?.bg === 'image').map((f) => (
                          <div className={`field${f.kind === 'image' ? ' full' : ''}`} key={f.k}>{f.kind !== 'check' && <label>{f.label}</label>}<FieldInput f={f} value={(cur.style as Record<string, unknown> | undefined)?.[f.k]} set={(v) => upd(cur.id, (x) => ({ ...x, style: { ...x.style, [f.k]: v } }))} /></div>
                        ))}
                      </div>
                    )}
                  </>
                ) : <p className="muted">Select a section on the left, or add a new one.</p>}
              </div>
            </div>
          )}

          {tab === 'home' && (() => {
            const hide = (o.homeHide as string[] | undefined) ?? [];
            return (
              <div className="pb-fields panel-in">
                <p className="help">Turn built-in homepage parts on or off, and add your own sections between them in “Added sections &amp; widgets”. Each added section has a “Show after” choice in its Design tab.</p>
                <div className="home-parts">
                  {HOME_SECTIONS.filter(([k]) => k !== 'top').map(([k, l]) => {
                    const added = blocks.filter((b) => (b.style?.place || 'contact') === k).length;
                    return (
                      <div key={k} className={`home-part${hide.includes(k) ? ' off' : ''}`}>
                        <label className="switch"><input type="checkbox" checked={!hide.includes(k)} onChange={(e) => setOv('homeHide', e.target.checked ? hide.filter((x) => x !== k) : [...hide, k])} /><span><b>{l}</b><small>{hide.includes(k) ? 'Hidden' : 'Shown'}{added ? ` · ${added} added section${added > 1 ? 's' : ''} after it` : ''}</small></span></label>
                        <button type="button" className="btn btn-sm" onClick={() => { setPlaceFor(k); setTab('sections'); setAdding(blocks.length); }}><Icon name="plus" size={13} /> Add after</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {tab === 'page' && (
            <div className="pb-fields two panel-in">
              <div className="field full"><label>Featured image (top of the page, Google and social sharing)</label><MediaPicker value={str(o.image)} onChange={(u, alt) => { setOv('image', u); if (alt && !o.imageAlt) setOv('imageAlt', alt); }} /></div>
              <div className="field"><label>Image alt text</label><input value={str(o.imageAlt)} onChange={(e) => setOv('imageAlt', e.target.value)} /></div>
              <div className="field"><label>Header style</label><select value={str(o.heroStyle) || 'default'} onChange={(e) => setOv('heroStyle', e.target.value)}><option value="default">Standard (text + quick facts)</option><option value="image">Full image behind the title</option><option value="minimal">Minimal (smaller title)</option></select></div>
              <div className="field"><label>Small heading above the title</label><input value={str(o.eyebrow)} placeholder={original.eyebrow} onChange={(e) => setOv('eyebrow', e.target.value)} /></div>
              <div className="field"><label>Main title (H1)</label><input value={str(o.h1)} placeholder={original.h1} onChange={(e) => setOv('h1', e.target.value)} /></div>
              <div className="field full"><label>Introduction</label><textarea rows={3} value={str(o.intro)} placeholder={original.intro} onChange={(e) => setOv('intro', e.target.value)} /></div>
              <div className="field full"><label>Quick facts box (label | value, one per line; empty = original)</label>
                <textarea rows={5} value={(o.facts ?? []).map((f) => `${f.label} | ${f.value}`).join('\n')} placeholder={original.facts.map((f) => `${f.label} | ${f.value}`).join('\n')}
                  onChange={(e) => setOv('facts', e.target.value.split('\n').map((l) => { const [label, ...v] = l.split('|'); return { label: (label || '').trim(), value: v.join('|').trim() }; }).filter((f) => f.label))} />
              </div>
              <label className="switch"><input type="checkbox" checked={!!o.hideFacts} onChange={(e) => setOv('hideFacts', e.target.checked)} /><span><b>Hide the quick facts box</b></span></label>
              <label className="switch"><input type="checkbox" checked={!!o.hideCta} onChange={(e) => setOv('hideCta', e.target.checked)} /><span><b>Hide header buttons</b></span></label>
              <label className="switch"><input type="checkbox" checked={!!o.hideAside} onChange={(e) => setOv('hideAside', e.target.checked)} /><span><b>Hide the side Apply box</b></span></label>
              <label className="switch"><input type="checkbox" checked={!!o.hidden} onChange={(e) => setOv('hidden', e.target.checked)} /><span><b>Hide this page from the website</b></span></label>
            </div>
          )}

          {tab === 'seo' && (
            <div className="pb-seo">
              <div className="pb-fields">
                <div className="field"><label>Focus keyword</label><input value={str(o.keyword)} onChange={(e) => setOv('keyword', e.target.value)} placeholder="e.g. Abu Dhabi Golden Visa property" /></div>
                <div className="field"><label>SEO title <small className="muted">({title.length})</small></label><input value={str(o.seoTitle)} placeholder={original.seoTitle} onChange={(e) => setOv('seoTitle', e.target.value)} /></div>
                <div className="field"><label>Meta description <small className="muted">({meta.length})</small></label><textarea rows={3} value={str(o.meta)} placeholder={original.meta} onChange={(e) => setOv('meta', e.target.value)} /></div>
                <div className="field"><label>Social sharing image (empty = featured image)</label><MediaPicker value={str(o.ogImage)} onChange={(u) => setOv('ogImage', u)} /></div>
                <div className="field"><label>Canonical link (only if this page copies another)</label><input value={str(o.canonical)} onChange={(e) => setOv('canonical', e.target.value)} placeholder="https://www.abudhabigoldenvisa.com/…" /></div>
                <label className="switch"><input type="checkbox" checked={!!o.noindex} onChange={(e) => setOv('noindex', e.target.checked)} /><span><b>Hide from Google (noindex)</b><small>Removes the page from search results and the sitemap.</small></span></label>
              </div>
              <div>
                <p className="pb-h">Google preview</p>
                <div className="serp"><small>www.abudhabigoldenvisa.com{path === '/' ? '' : ' › ' + path.split('/').filter(Boolean).join(' › ')}</small><b>{title.slice(0, 62)}{title.length > 62 ? '…' : ''}</b><p>{meta.slice(0, 160)}{meta.length > 160 ? '…' : ''}</p></div>
                <p className="pb-h" style={{ marginTop: 18 }}>SEO score <span className={`score s${score >= 80 ? 'g' : score >= 50 ? 'm' : 'b'}`}>{score}%</span></p>
                <ul className="checks">{checks.map((c) => <li key={c.t} className={c.ok ? 'ok' : 'no'}><Icon name={c.ok ? 'check' : 'close'} size={14} /> {c.t}</li>)}</ul>
                <p className="help">This page is published in all 20 languages with hreflang links, listed in the sitemap, and sent to search engines (IndexNow) each time you save.</p>
              </div>
            </div>
          )}

          {tab === 'css' && (
            <div className="pb-fields">
              <div className="field"><label>CSS for this page only</label><textarea rows={14} className="mono" value={str(o.css)} onChange={(e) => setOv('css', e.target.value)} placeholder={'.bk-hero h2 { color: #8a6a12; }\n.my-class { padding: 40px; }'} /></div>
              <p className="help">Tip: give a section an &quot;Extra CSS class&quot; in its Design tab and style it here. Site-wide CSS is in Design &amp; colours.</p>
            </div>
          )}
        </div>
        {preview && (
          <div className={`pb-preview ${device}`}>
            <div className="pb-dev"><button type="button" className={device === 'desktop' ? 'on' : ''} onClick={() => setDevice('desktop')}>Desktop</button><button type="button" className={device === 'mobile' ? 'on' : ''} onClick={() => setDevice('mobile')}>Mobile</button></div>
            <iframe ref={frame} src={path} title="Live preview" />
          </div>
        )}
      </div>

      {adding !== null && (
        <div className="mp-modal" role="dialog" aria-modal="true" aria-label="Add a section" onClick={(e) => { if (e.target === e.currentTarget) setAdding(null); }}>
          <div className="mp-box">
            <div className="mp-head"><b>Add a section or widget</b><button type="button" className="btn btn-sm" style={{ marginInlineStart: 'auto' }} onClick={() => setAdding(null)}>Close</button></div>
            {groups.map(({ g, items }) => (
              <div key={g} className="lib-g"><p className="pb-h">{g}</p>
                <div className="lib">{items.map((t) => <button key={t} type="button" onClick={() => add(t, adding)}><span className="pb-ic"><Icon name={BLOCKS[t].icon} size={18} /></span>{BLOCKS[t].label}</button>)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
