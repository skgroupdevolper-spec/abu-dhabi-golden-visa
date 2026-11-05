'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';

/** Creates a new page in the builder. */
export function NewPageForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function create() {
    setBusy(true); setErr('');
    const r = await fetch('/api/admin/page/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ create: { title, slug } }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!j.ok) return setErr(j.error || 'Could not create the page.');
    window.location.href = `/admin/pages/edit/?path=${encodeURIComponent(j.path)}`;
  }
  if (!open) return <button type="button" className="btn btn-gold" onClick={() => setOpen(true)}><Icon name="plus" size={16} /> New page</button>;
  return (
    <div className="panel row" style={{ padding: 12 }}>
      <input value={title} onChange={(e) => { setTitle(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }} placeholder="Page title" style={{ width: 220 }} />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="web-address" style={{ width: 200 }} />
      <button type="button" className="btn btn-gold btn-sm" onClick={create} disabled={busy || !title}>{busy ? 'Creating…' : 'Create'}</button>
      <button type="button" className="btn btn-sm" onClick={() => setOpen(false)}>Cancel</button>
      {err && <p className="notice err" style={{ width: '100%' }}>{err}</p>}
    </div>
  );
}
