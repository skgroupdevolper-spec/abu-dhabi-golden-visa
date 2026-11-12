'use client';

import { PORTAL_LANGS } from '@/lib/portal-i18n';
import { PwInput } from './PwInput';

/** Language picker for the customer dashboard; saves the choice and reloads the page. */
export function LangSelect({ action, current, back, label }: { action: (f: FormData) => Promise<void>; current: string; back: string; label: string }) {
  return (
    <form action={action}>
      <input type="hidden" name="back" value={back} />
      <select name="lang" aria-label={label} defaultValue={current} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
        {PORTAL_LANGS.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
      </select>
    </form>
  );
}

export function PasswordInput({ id, name, label, autoComplete }: { id: string; name: string; label: string; autoComplete?: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <PwInput id={id} name={name} autoComplete={autoComplete} required />
    </div>
  );
}
