'use client';

// Team sign-in: email + password (with a show/hide eye). The two-step code box only appears when the
// server says this account has two-step login turned on; the typed email and password are kept.
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

type State = { ok?: string; error?: string; need2fa?: boolean } | undefined;

function Go() {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn btn-gold" disabled={pending}>{pending ? 'Please wait…' : 'Sign in'}</button>;
}

export function AdminLoginForm({ action }: { action: (s: State, f: FormData) => Promise<State> }) {
  const [state, run] = useActionState(action, undefined);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [code, setCode] = useState('');
  const [show, setShow] = useState(false);
  const need = !!state?.need2fa;
  return (
    <form action={run} className="stack">
      <div style={{ height: 8 }} />
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="pw-wrap">
          <input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} />
          <button type="button" className="pw-eye" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{show && <path d="M3 3l18 18" />}
            </svg>
          </button>
        </div>
      </div>
      {need && (
        <div className="field">
          <label htmlFor="code">Two-step code</label>
          <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="123 456" autoFocus value={code} onChange={(e) => setCode(e.target.value)} />
          <small className="muted">From your authenticator app, or one of your backup codes.</small>
        </div>
      )}
      <Go />
      {state?.error && <p className="notice err full" role="alert">{state.error}</p>}
    </form>
  );
}
