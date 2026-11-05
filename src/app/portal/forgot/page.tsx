import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { AuthShell } from '@/components/dash/AuthShell';
import { LangSelect, PasswordInput } from '@/components/dash/LangSelect';
import { portalBase, T } from '@/lib/server/portal';
import { resetPassword, sendResetCode, setLang } from '../actions';

export const metadata: Metadata = { title: 'Reset password' };
export const dynamic = 'force-dynamic';

export default async function Forgot() {
  const base = await portalBase();
  const { t, lang } = await T();
  return (
    <AuthShell eyebrow={t.leftEyebrow} title={t.resetTitle} text={t.leftText} ticks={[t.tick1, t.tick2, t.tick3]}
      top={<div className="auth-top"><img decoding="async" src="/brand/logo.webp" alt="Abu Dhabi Golden Visa" /><LangSelect action={setLang} current={lang.code} back={`${base}/forgot/`} label={t.language} /></div>}>
      <h2>{t.resetTitle}</h2>
      <p className="muted">{t.resetText}</p>
      <ActionForm action={sendResetCode} className="stack">
        <div className="field"><label htmlFor="email">{t.email}</label><input id="email" name="email" type="email" required /></div>
        <Submit className="btn">{t.sendCode}</Submit>
      </ActionForm>
      <ActionForm action={resetPassword} className="stack">
        <div className="field"><label htmlFor="email2">{t.email}</label><input id="email2" name="email" type="email" required /></div>
        <div className="field"><label htmlFor="code">{t.code}</label><input id="code" name="code" inputMode="numeric" maxLength={6} required /></div>
        <PasswordInput id="password" name="password" label={t.newPassword} autoComplete="new-password" />
        <Submit className="btn btn-gold">{t.setPassword}</Submit>
      </ActionForm>
      <p className="switch-link"><a href={`${base}/login/`}>{t.backToLogin}</a></p>
    </AuthShell>
  );
}
