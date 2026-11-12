import { PwInput } from './PwInput';
import type { ReactNode } from 'react';

export function F({ name, label, value, type = 'text', help, full, placeholder, rows }: { name: string; label: string; value?: string | number; type?: string; help?: ReactNode; full?: boolean; placeholder?: string; rows?: number }) {
  return (
    <div className={`field${full ? ' full' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {type === 'textarea'
        ? <textarea id={name} name={name} defaultValue={value as string} placeholder={placeholder} rows={rows ?? 4} />
        : type === 'password'
          ? <PwInput id={name} name={name} defaultValue={value} placeholder={placeholder || (typeof help === 'string' && /^saved/i.test(help) ? '•••••••••••• saved' : undefined)} autoComplete="new-password" />
          : <input id={name} name={name} type={type} defaultValue={value} placeholder={placeholder} autoComplete="off" />}
      {help && <p className="help">{help}</p>}
    </div>
  );
}

export function Toggle({ name, label, help, on }: { name: string; label: string; help?: string; on: boolean }) {
  return (
    <label className="switch"><input type="checkbox" name={name} defaultChecked={on} /><span><b>{label}</b>{help && <small>{help}</small>}</span></label>
  );
}

export function Tabs({ base, tabs, cur }: { base: string; tabs: [string, string][]; cur: string }) {
  return <nav className="tabs">{tabs.map(([k, l]) => <a key={k} href={`${base}?tab=${k}`} className={cur === k ? 'on' : ''}>{l}</a>)}</nav>;
}
