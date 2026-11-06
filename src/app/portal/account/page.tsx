import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { ClientShell } from '@/components/dash/ClientShell';
import { clientArea } from '@/lib/server/portal';
import { saveProfile } from '../actions';

export const metadata: Metadata = { title: 'My profile' };
export const dynamic = 'force-dynamic';

export default async function Account() {
  const area = await clientArea();
  const { base, me, t } = area;
  return (
    <ClientShell area={area} active="account" title={t.profile} back={`${base}/account/`}>
      <div style={{ maxWidth: 640 }}>
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
        </div>
      </div>
    </ClientShell>
  );
}
