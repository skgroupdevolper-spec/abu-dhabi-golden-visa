'use client';

// FAQ accordion with category filter tabs.
import { useState } from 'react';

export function FaqTabs({ items, all = 'All' }: { items: { cat: string; q: string; a: string }[]; all?: string }) {
  const cats = [all, ...Array.from(new Set(items.map((i) => i.cat)))];
  const [cat, setCat] = useState(all);
  const [open, setOpen] = useState(0);
  const list = items.filter((i) => cat === all || i.cat === cat);
  return (
    <div className="faqt">
      <div className="faqt-tabs" role="tablist">
        {cats.map((c) => <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => { setCat(c); setOpen(0); }}>{c}</button>)}
      </div>
      <div className="faq">
        {list.map((f, i) => (
          <details key={f.q} open={open === i} onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) setOpen(i); }}>
            <summary>{f.q}<i aria-hidden="true">+</i></summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
