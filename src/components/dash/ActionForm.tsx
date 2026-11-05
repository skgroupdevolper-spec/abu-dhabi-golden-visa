'use client';

import { useActionState, useEffect, useRef, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

type State = { ok?: string; error?: string } | undefined;

/** A form that runs a server action and shows its result underneath. */
export function ActionForm({ action, children, className, reset, encType }: { action: (s: State, f: FormData) => Promise<State>; children: ReactNode; className?: string; reset?: boolean; encType?: string }) {
  const [state, run] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && reset) ref.current?.reset();
  }, [state, reset]);
  return (
    <form ref={ref} action={run} className={className} encType={encType}>
      {children}
      {state?.error && <p className="notice err full" role="alert">{state.error}</p>}
      {state?.ok && <p className="notice ok full" role="status">{state.ok}</p>}
    </form>
  );
}

export function Submit({ children, className = 'btn btn-gold', name, value }: { children: ReactNode; className?: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} name={name} value={value}>
      {pending ? 'Please wait…' : children}
    </button>
  );
}

export function CopyButton({ text, label = 'Copy link' }: { text: string; label?: string }) {
  return (
    <button
      type="button"
      className="btn btn-sm"
      onClick={(e) => {
        const b = e.currentTarget;
        navigator.clipboard?.writeText(text).then(() => { b.textContent = 'Copied'; setTimeout(() => (b.textContent = label), 1500); }, () => {});
      }}
    >
      {label}
    </button>
  );
}

export function PrintButton() {
  return <button type="button" className="btn btn-gold noprint" onClick={() => window.print()}>Print or save as PDF</button>;
}
