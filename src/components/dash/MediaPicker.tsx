'use client';

// Image field with a media-library picker and direct upload.
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';

type Item = { url: string; name: string; alt: string };
let cache: Item[] | null = null;

export function MediaPicker({ value, onChange, label = 'Image' }: { value: string; onChange: (url: string, alt?: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>(cache ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!open || cache) return;
    fetch('/api/admin/media/').then((r) => r.json()).then((j) => { if (j.ok) { cache = j.items; setItems(j.items); } }).catch(() => {});
  }, [open]);

  async function upload(f: File | undefined) {
    if (!f) return;
    setBusy(true); setErr('');
    const fd = new FormData(); fd.set('file', f);
    try {
      const r = await fetch('/api/admin/media/', { method: 'POST', body: fd });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Upload failed.');
      const it = { url: j.url, name: j.name, alt: j.alt };
      cache = [it, ...(cache ?? items)]; setItems(cache);
      onChange(j.url); setOpen(false);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <div className="mp">
      <div className="mp-row">
        <div className="mp-thumb">{value ? <img src={value} alt="" /> : <Icon name="image" size={20} />}</div>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image link, or choose / upload" aria-label={label} />
        <button type="button" className="btn btn-sm" onClick={() => setOpen(true)}>Choose</button>
        {value && <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange('')} aria-label="Remove image"><Icon name="close" size={14} /></button>}
      </div>
      {open && (
        <div className="mp-modal" role="dialog" aria-modal="true" aria-label="Media library" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="mp-box">
            <div className="mp-head">
              <b>Media library</b>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search images" />
              <label className="btn btn-gold btn-sm">{busy ? 'Uploading…' : 'Upload new'}<input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} /></label>
              <button type="button" className="btn btn-sm" onClick={() => setOpen(false)}>Close</button>
            </div>
            {err && <p className="notice err">{err}</p>}
            <div className="mp-grid">
              {items.filter((i) => !q || i.name.toLowerCase().includes(q.toLowerCase())).map((i) => (
                <button key={i.url} type="button" className={value === i.url ? 'on' : ''} onClick={() => { onChange(i.url, i.alt); setOpen(false); }}>
                  <img src={i.url} alt={i.alt || i.name} loading="lazy" /><span>{i.name}</span>
                </button>
              ))}
              {!items.length && <p className="muted small">No images yet. Upload your first image.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
