'use client';

// Switchable tabs for a page section: one panel per option, keyboard accessible.
import { useId, useState } from 'react';
import { Icon } from './Icon';

type Tab = { label: string; sub?: string; text?: string; items?: string[]; facts?: { label: string; value: string }[] };

export function SectionTabs({ tabs }: { tabs: Tab[] }) {
  const [on, setOn] = useState(0);
  const id = useId();
  const t = tabs[on];
  const move = (d: number) => setOn((i) => (i + d + tabs.length) % tabs.length);
  return (
    <div className="stabs">
      <div className="stabs-list" role="tablist" onKeyDown={(e) => { if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); }}>
        {tabs.map((x, i) => (
          <button key={x.label} type="button" role="tab" id={`${id}-t${i}`} aria-selected={i === on} aria-controls={`${id}-p${i}`} tabIndex={i === on ? 0 : -1} className={i === on ? 'on' : ''} onClick={() => setOn(i)}>
            <b>{x.label}</b>{x.sub && <small>{x.sub}</small>}
          </button>
        ))}
      </div>
      <div className="stabs-panel" role="tabpanel" id={`${id}-p${on}`} aria-labelledby={`${id}-t${on}`} key={on}>
        <h3>{t.label}</h3>
        {t.text && <p>{t.text}</p>}
        {t.facts?.length ? <dl className="stabs-facts">{t.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl> : null}
        {t.items?.length ? <ul className="stabs-items">{t.items.map((it) => <li key={it}><Icon name="check" size={16} /><span>{it}</span></li>)}</ul> : null}
      </div>
    </div>
  );
}
