'use client';

import { T } from './T';
import { useState, type FormEvent } from 'react';

export function Newsletter({ inline = false }: { inline?: boolean }) {
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') || '');
    setState('busy');
    const r = await fetch('/api/subscribe/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, lang: document.documentElement.lang }) }).catch(() => null);
    setState(r?.ok ? 'ok' : 'err');
  }
  if (state === 'ok') return <p className="nl-ok"><T>{"Thank you. You will get our Golden Visa updates."}</T></p>;
  return (
    <form className={`nl${inline ? ' nl-inline' : ''}`} onSubmit={submit}>
      <label htmlFor="nl-email" className={inline ? 'sr-only' : undefined}><T>{"Golden Visa updates by email"}</T></label>
      <div><input id="nl-email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" /><button type="submit" disabled={state === 'busy'}><T>{"Subscribe"}</T></button></div>
      {state === 'err' && <small><T>{"Please check the email address."}</T></small>}
    </form>
  );
}
