import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F } from '@/components/dash/Fields';
import { requireAdmin } from '@/lib/server/auth';
import { changeMyPassword } from '../../settings-actions';
import { totpDisable, totpEnable, totpStart } from '../../actions';
import { getTotp } from '@/lib/server/totp';
import { TwoStep } from '@/components/dash/TwoStep';

export const metadata: Metadata = { title: 'My profile' };

export default async function Profile() {
  const me = await requireAdmin();
  const t = await getTotp(me.email);
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">My profile</p><h1>{me.name} · {me.role}</h1></div></div>
      <div className="panel" style={{ maxWidth: 560 }}>
        <p className="muted">{me.email}</p>
        {me.env ? <p className="notice">This owner account comes from the server settings (ADMIN_EMAIL and ADMIN_PASSWORD). Change the password there and restart the site.</p> : (
          <ActionForm action={changeMyPassword} className="stack" reset>
            <F name="name" label="Display name" value={me.name} />
            <F name="current" label="Current password" type="password" />
            <F name="next" label="New password (10+ characters)" type="password" />
            <Submit>Save</Submit>
          </ActionForm>
        )}
      </div>
      <div className="panel" style={{ maxWidth: 560, marginTop: 16 }}>
        <h2 style={{ marginBottom: 10 }}>Two-step login</h2>
        <TwoStep enabled={!!t?.enabled} start={totpStart} enable={totpEnable} disable={totpDisable} />
      </div>
    </>
  );
}
