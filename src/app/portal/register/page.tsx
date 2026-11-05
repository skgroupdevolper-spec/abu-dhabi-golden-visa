import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { AuthShell } from '@/components/dash/AuthShell';
import { LangSelect, PasswordInput } from '@/components/dash/LangSelect';
import { currentCustomer, portalBase, T } from '@/lib/server/portal';
import { register, setLang } from '../actions';

export const metadata: Metadata = { title: 'Create account' };
export const dynamic = 'force-dynamic';

export default async function Register() {
  const base = await portalBase();
  if (await currentCustomer()) redirect(`${base}/`);
  const { t, lang } = await T();
  return (
    <AuthShell eyebrow={t.leftEyebrow} title={t.createAccount} text={t.leftText} ticks={[t.tick1, t.tick2, t.tick3]}
      top={<div className="auth-top"><img decoding="async" src="/brand/logo.webp" alt="Abu Dhabi Golden Visa" /><LangSelect action={setLang} current={lang.code} back={`${base}/register/`} label={t.language} /></div>}>
      <p className="eyebrow">{t.newHere}</p>
      <h2>{t.createAccount}</h2>
      <ActionForm action={register} className="stack">
        <div className="field"><label htmlFor="name">{t.name}</label><input id="name" name="name" autoComplete="name" required /></div>
        <div className="field"><label htmlFor="email">{t.email}</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="field"><label htmlFor="phone">{t.phone}</label><input id="phone" name="phone" type="tel" placeholder="+971" autoComplete="tel" required /></div>
        <PasswordInput id="password" name="password" label={`${t.password} (8+)`} autoComplete="new-password" />
        <Submit className="btn btn-gold">{t.register}</Submit>
      </ActionForm>
      <p className="switch-link">{t.haveAccount} <a href={`${base}/login/`}><b>{t.signIn}</b></a></p>
    </AuthShell>
  );
}
