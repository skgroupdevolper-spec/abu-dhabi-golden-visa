import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { ROLE_LABEL, list, type TeamUser } from '@/lib/server/collections';
import { day } from '@/lib/stages';
import { addUser, updateUser } from '../../settings-actions';

export const metadata: Metadata = { title: 'Admin users' };

export default async function Users() {
  const me = await requireAdmin(FULL);
  const users = await list<TeamUser>('team');
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Admin users</p><h1>Your team, <span className="gold">your rules.</span></h1></div></div>
      <div className="cols">
        <div className="panel">
          <h2>Team</h2>
          <p className="help">Owner: {process.env.ADMIN_EMAIL || 'set on the server'} (from the server settings). Signed in as {me.email}.</p>
          {users.length === 0 ? <p className="empty" style={{ marginTop: 12 }}>No extra users yet.</p> : (
            <div className="stack" style={{ marginTop: 12 }}>
              {users.map((u) => (
                <form key={u.id} action={updateUser} className="notice row">
                  <input type="hidden" name="id" value={u.id} />
                  <div style={{ flex: 1, minWidth: 180 }}><b>{u.name}</b><div className="small muted">{u.email} · last login {u.lastLogin ? day(u.lastLogin) : 'never'}</div></div>
                  <select name="role" defaultValue={u.role} style={{ width: 'auto' }}>{(['admin', 'staff', 'viewer'] as const).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select>
                  <label className="row small"><input type="checkbox" name="active" defaultChecked={u.active} /> Active</label>
                  <input name="password" type="password" placeholder="New password (optional)" style={{ width: 200 }} autoComplete="new-password" />
                  <button className="btn btn-sm" type="submit">Save</button>
                  <button className="btn btn-sm btn-ghost btn-danger" type="submit" name="delete" value="1">Remove</button>
                </form>
              ))}
            </div>
          )}
        </div>
        <div className="panel">
          <h2>Add a user</h2>
          <ActionForm action={addUser} className="stack" reset>
            <F name="name" label="Name" />
            <F name="email" label="Email" type="email" />
            <div className="field"><label htmlFor="role">Role</label><select id="role" name="role" defaultValue="staff">{(['admin', 'staff', 'viewer'] as const).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></div>
            <F name="password" label="Password (10+ characters)" type="password" />
            <Submit>Add user</Submit>
          </ActionForm>
        </div>
      </div>
    </>
  );
}
