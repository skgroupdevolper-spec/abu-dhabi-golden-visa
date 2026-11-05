import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { ROLE_LABEL, list, type TeamUser } from '@/lib/server/collections';
import { day, when } from '@/lib/stages';
import { addUser, saveUser, updateUser } from '../../settings-actions';
import { ADMIN_MENU, ALWAYS } from '../menu';

export const metadata: Metadata = { title: 'Admin users' };
const ROLES = ['admin', 'staff', 'viewer'] as const;

function Perms({ u }: { u?: TeamUser }) {
  const custom = !!u?.perms?.length;
  return (
    <div className="full">
      <Toggle name="custom" label="Choose exactly which sections this user can open" help="Off: the role decides. On: only the ticked sections show in their menu and open for them (Dashboard, Notifications and My profile always open)." on={custom} />
      <div className="perm-grid">
        {ADMIN_MENU.map((g) => (
          <fieldset key={g.title}><legend>{g.title}</legend>
            {g.items.filter((i) => !ALWAYS.includes(i.href)).map((i) => (
              <label key={i.href} className="row small"><input type="checkbox" name="perm" value={i.href} defaultChecked={custom ? u!.perms!.includes(i.href) : !i.roles || i.roles.includes(u?.role ?? 'staff')} /> {i.label}</label>))}
          </fieldset>))}
      </div>
    </div>
  );
}

export default async function Users({ searchParams }: { searchParams: Promise<{ edit?: string; q?: string }> }) {
  const me = await requireAdmin(FULL);
  const { edit, q = '' } = await searchParams;
  const all = await list<TeamUser>('team');
  const users = all.filter((u) => !q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q.toLowerCase()));
  const u = all.find((x) => x.id === edit);
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Admin users</p><h1>Team &amp; <span className="gold">access</span></h1><p className="muted small" style={{ marginTop: 6 }}>Add people, choose their role or the exact sections they can open, reset passwords, pause or remove access.</p></div>
        <Link className="btn btn-gold" href="/admin/users/?edit=new">+ Add user</Link></div>
      <div className="grid4" style={{ marginBottom: 16 }}>
        <div className="kpi"><small>Users</small><b>{all.length + 1}</b></div>
        <div className="kpi"><small>Active</small><b>{all.filter((x) => x.active).length + 1}</b></div>
        <div className="kpi"><small>Custom access</small><b>{all.filter((x) => x.perms?.length).length}</b></div>
        <div className="kpi goldbg"><small>Paused</small><b>{all.filter((x) => !x.active).length}</b></div>
      </div>
      <div className="cols">
        <div className="panel">
          <form className="row" action="/admin/users/"><input name="q" defaultValue={q} placeholder="Search name, email or role" style={{ flex: 1 }} /><button className="btn">Search</button></form>
          <div className="files" style={{ marginTop: 12 }}>
            <div className="file"><span className="fi">★</span><span className="fn"><b>Owner</b><small>{process.env.ADMIN_EMAIL || 'set on the server'} · all access · set in the server settings</small></span></div>
            {users.map((x) => (
              <div key={x.id} className="file" style={{ flexWrap: 'wrap', background: x.id === edit ? '#fffaf0' : undefined }}>
                <span className="fi">{x.name.slice(0, 1).toUpperCase()}</span>
                <span className="fn"><b>{x.name}{x.title ? ` · ${x.title}` : ''}</b><small>{x.email} · {x.perms?.length ? `${x.perms.length} sections` : ROLE_LABEL[x.role]} · last login {x.lastLogin ? when(x.lastLogin) : 'never'}</small></span>
                <span className={`pill ${x.active ? 'ok' : 'due'}`}>{x.active ? 'Active' : 'Paused'}</span>
                <div className="row">
                  <Link className="btn btn-sm" href={`/admin/users/?edit=${x.id}`}>Edit</Link>
                  <form action={updateUser}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="op" value="toggle" /><button className="btn btn-sm">{x.active ? 'Pause' : 'Activate'}</button></form>
                  <form action={updateUser}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="op" value="delete" /><button className="btn btn-sm btn-ghost btn-danger">Remove</button></form>
                </div>
              </div>))}
            {!all.length && <p className="empty">No extra users yet. Press “Add user”.</p>}
          </div>
          <p className="help" style={{ marginTop: 10 }}>Signed in as {me.email}.</p>
        </div>
        <div className="panel">
          {edit === 'new' || !u ? (
            <>
              <h2>Add a user</h2>
              <ActionForm action={addUser} className="form" reset>
                <F name="name" label="Name" />
                <F name="title" label="Job title" placeholder="Visa consultant" />
                <F name="email" label="Email (login)" type="email" />
                <F name="phone" label="Phone / WhatsApp" />
                <div className="field"><label htmlFor="role">Role</label><select id="role" name="role" defaultValue="staff">{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></div>
                <F name="password" label="Password (10+ characters)" type="password" />
                <Perms />
                <div className="full"><Submit>Add user</Submit></div>
              </ActionForm>
            </>
          ) : (
            <>
              <h2>Edit: {u.name}</h2>
              <p className="small muted">Added {day(u.createdAt)} · {u.logins ?? 0} sign-ins · last {u.lastLogin ? when(u.lastLogin) : 'never'}</p>
              <ActionForm action={saveUser} className="form" key={u.id}>
                <input type="hidden" name="id" value={u.id} />
                <F name="name" label="Name" value={u.name} />
                <F name="title" label="Job title" value={u.title} />
                <F name="email" label="Email (login)" value={u.email} type="email" />
                <F name="phone" label="Phone / WhatsApp" value={u.phone} />
                <div className="field"><label htmlFor="role">Role</label><select id="role" name="role" defaultValue={u.role}>{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></div>
                <F name="password" label="New password (leave empty to keep)" type="password" />
                <div className="full"><Toggle name="active" label="Active (can sign in)" on={u.active} /></div>
                <Perms u={u} />
                <F name="note" label="Private note" value={u.note} type="textarea" rows={2} full />
                <div className="full row"><Submit>Save user</Submit><Link className="btn" href="/admin/users/">Close</Link></div>
              </ActionForm>
            </>
          )}
        </div>
      </div>
    </>
  );
}
