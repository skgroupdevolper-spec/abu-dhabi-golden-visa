'use client';

// Document list you can tick off, with a counter and a one-tap WhatsApp message listing what is ready and missing.
import { useState } from 'react';
import { Icon } from './Icon';
import { waLink } from '@/lib/site';

export function DocChecklist({ items, service }: { items: string[]; service: string }) {
  const [have, setHave] = useState<boolean[]>(() => items.map(() => false));
  const n = have.filter(Boolean).length;
  const msg = (name: string) => `Hello, I need help with: ${name}\n\nDocuments I have:\n${items.filter((_, i) => have[i]).map((x) => '✅ ' + x).join('\n') || '–'}\n\nStill missing:\n${items.filter((_, i) => !have[i]).map((x) => '▫️ ' + x).join('\n') || '–'}`;
  return (
    <div className="dchk">
      <div className="dchk-top">
        <span className="dchk-count"><b>{n}</b> of {items.length} ready</span>
        <span className="dchk-bar" aria-hidden="true"><i style={{ width: `${(n / Math.max(1, items.length)) * 100}%` }} /></span>
        {n > 0 && <button type="button" className="linkish" onClick={() => setHave(items.map(() => false))}>Clear</button>}
      </div>
      <ul className="doc-grid">
        {items.map((it, i) => (
          <li key={it} className={have[i] ? 'got' : ''}>
            <label>
              <input type="checkbox" checked={have[i]} onChange={() => setHave((h) => h.map((v, k) => (k === i ? !v : v)))} />
              <span className="di">{have[i] ? <Icon name="check" size={18} /> : <Icon name="doc" size={18} />}</span>
              <span>{it}</span>
            </label>
          </li>
        ))}
      </ul>
      <a className="btn btn-gold dchk-send" href={waLink(msg(service))} target="_blank" rel="noopener" onClick={(e) => { e.currentTarget.href = waLink(msg(document.title.split('|')[0].trim() || service)); }}><Icon name="wa" size={18} /> Send my list on WhatsApp</a>
      <p className="fnote">Tick what you already have. We reply with what is missing and an itemised quote.</p>
    </div>
  );
}
