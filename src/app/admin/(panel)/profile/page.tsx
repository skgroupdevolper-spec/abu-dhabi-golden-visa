import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F } from '@/components/dash/Fields';
import { requireAdmin } from '@/lib/server/auth';
import { changeMyPassword } from '../../settings-actions';

export const metadata: Metadata = { title: 'My profile' };

export default async function Profile() {
  const me = await requireAdmin();
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">My profile</p><h1>{me.name} <span className="gold">· {me.role}</span></h1></div></div>
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
    </>
  );
}
