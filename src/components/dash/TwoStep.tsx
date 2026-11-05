'use client';

import { useActionState, useState } from 'react';

type St = { ok?: string; error?: string; codes?: string[] } | undefined;

/** Two-step login set-up on the profile page. */
export function TwoStep({ enabled, start, enable, disable }: { enabled: boolean; start: () => Promise<{ ok?: string; error?: string; secret?: string; uri?: string }>; enable: (s: St, f: FormData) => Promise<St>; disable: (s: St, f: FormData) => Promise<St> }) {
  const [setup, setSetup] = useState<{ secret?: string; uri?: string; error?: string } | null>(null);
  const [es, runEnable] = useActionState(enable, undefined);
  const [ds, runDisable] = useActionState(disable, undefined);
  if (es?.codes) return (
    <div className="stack">
      <p className="notice ok">{es.ok}</p>
      <div className="codes">{es.codes.map((c) => <code key={c} className="k">{c}</code>)}</div>
    </div>
  );
  if (enabled && !ds?.ok) return (
    <form action={runDisable} className="stack">
      <p className="notice ok">Two-step login is on for your account.</p>
      <div className="field"><label htmlFor="dcode">Current code (to turn it off)</label><input id="dcode" name="code" inputMode="numeric" autoComplete="one-time-code" /></div>
      {ds?.error && <p className="notice err">{ds.error}</p>}
      <button className="btn btn-danger" type="submit">Turn two-step login off</button>
    </form>
  );
  return (
    <div className="stack">
      {ds?.ok && <p className="notice ok">{ds.ok}</p>}
      <p className="help">Protect your account with a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy or 1Password) each time you sign in.</p>
      {!setup?.secret ? (
        <button className="btn btn-gold" type="button" onClick={async () => setSetup(await start())}>Set up two-step login</button>
      ) : (
        <form action={runEnable} className="stack">
          <ol className="help" style={{ paddingInlineStart: 18, display: 'grid', gap: 6 }}>
            <li>In your authenticator app, choose <b>Add account → Enter a setup key</b>.</li>
            <li>Account: your email. Key: <code className="k" style={{ userSelect: 'all' }}>{setup.secret.replace(/(.{4})/g, '$1 ').trim()}</code> (time based).</li>
            <li>On a phone you can also <a href={setup.uri}>open this link</a> to add it directly.</li>
            <li>Type the 6-digit code the app shows:</li>
          </ol>
          <div className="field"><label htmlFor="ecode">Code from the app</label><input id="ecode" name="code" inputMode="numeric" autoComplete="one-time-code" /></div>
          {es?.error && <p className="notice err">{es.error}</p>}
          <button className="btn btn-gold" type="submit">Turn on</button>
        </form>
      )}
      {setup?.error && <p className="notice err">{setup.error}</p>}
    </div>
  );
}
