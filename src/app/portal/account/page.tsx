import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { PortalTop } from '@/components/dash/PortalTop';
import { currentCustomer, portalBase, T } from '@/lib/server/portal';
import { saveProfile } from '../actions';

export const metadata: Metadata = { title: 'My profile' };
export const dynamic = 'force-dynamic';

export default async function Account() {
  const base = await portalBase();
  const me = await currentCustomer();
  if (!me) redirect(`${base}/login/`);
  const { t, lang } = await T();
  return (
    <>
      <PortalTop t={t} lang={lang.code} base={base} back={`${base}/account/`} signedIn />
      <main className="pwrap" style={{ maxWidth: 640 }}>
        <div className="panel">
          <p className="eyebrow">{t.profile}</p>
          <h1 style={{ margin: '6px 0 4px' }}>{me.name}</h1>
          <p className="muted">{me.email}</p>
          <ActionForm action={saveProfile} className="stack">
            <div className="field"><label htmlFor="name">{t.name}</label><input id="name" name="name" defaultValue={me.name} /></div>
            <div className="field"><label htmlFor="phone">{t.phone}</label><input id="phone" name="phone" defaultValue={me.phone} /></div>
            <div className="field"><label htmlFor="current">{t.currentPassword}</label><input id="current" name="current" type="password" autoComplete="current-password" /></div>
            <div className="field"><label htmlFor="next">{t.newPassword}</label><input id="next" name="next" type="password" autoComplete="new-password" /></div>
            <Submit>{t.save}</Submit>
          </ActionForm>
          <p style={{ marginTop: 16 }}><a href={`${base}/`}>← {t.back}</a></p>
        </div>
      </main>
    </>
  );
}
