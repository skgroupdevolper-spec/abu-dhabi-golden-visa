import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { ROLE_LABEL, list, type TeamUser } from '@/lib/server/collections';
import { day, when } from '@/lib/stages';
import { addUser, saveUser, updateUser } from '../../settings-actions';
import { PwInput } from '@/components/dash/PwInput';
import { ADMIN_MENU, ALWAYS } from '../menu';

export const metadata: Metadata = { title: 'Admin users' };
const ROLES = ['admin', 'staff', 'viewer'] as const;

function Perms({ u }: { u?: TeamUser }) {
  const custom = !!u?.perms?.length;
  return (
    <div className="full">
      <Toggle name="custom" label="Choose exactly which sections this user can open" help="Owners and admins see everything. Staff and viewers see only the client files and enquiries assigned to them (assign them on each application or enquiry). Off: staff get Applications and Enquiries only. On: tick exactly which sections they can open; inside each section they still see only their own clients." on={custom} />
      <div className="perm-grid">
        {ADMIN_MENU.map((g) => (
          <fieldset key={g.title}><legend>{g.title}</legend>
            {g.items.filter((i) => !ALWAYS.includes(i.href)).map((i) => (
              <label key={i.href} className="row small"><input type="checkbox" name="perm" value={i.href} defaultChecked={custom ? u!.perms!.includes(i.href) : u?.role === 'owner' || u?.role === 'admin' ? !i.roles || i.roles.includes(u.role) : ['/admin/applications/', '/admin/leads/'].includes(i.href)} /> {i.label}</label>))}
          </fieldset>))}
      </div>
    </div>
  );
}

/** One form for adding and editing a team member, so both look and work the same. */
function UserForm({ u, created }: { u?: TeamUser; created?: boolean }) {
  const isNew = !u;
  return (
    <>
      <div className="uf-head">
        <span className="uf-avatar">{(u?.name || '+').slice(0, 1).toUpperCase()}</span>
        <div>
          <h2 style={{ margin: 0 }}>{isNew ? 'Add a team member' : u.name}</h2>
          <p className="small muted" style={{ margin: '4px 0 0' }}>{isNew ? 'Fill in their details, choose what they can open and set a password.' : `${u.title || ROLE_LABEL[u.role]} · added ${day(u.createdAt)} · ${u.logins ?? 0} sign-ins · last ${u.lastLogin ? when(u.lastLogin) : 'never'}`}</p>
        </div>
        {!isNew && <span className={`pill ${u.active ? 'ok' : 'due'}`} style={{ marginInlineStart: 'auto' }}>{u.active ? 'Active' : 'Paused'}</span>}
      </div>
      {created && <p className="notice ok" role="status">User added. Share the password with them privately. You can change anything below.</p>}
      <ActionForm action={isNew ? addUser : saveUser} className="form" key={u?.id ?? 'new'}>
        {u && <input type="hidden" name="id" value={u.id} />}
        <h3 className="full uf-sec">1. Profile</h3>
        <F name="name" label="Full name" value={u?.name} placeholder="e.g. Abbas Khan" />
        <F name="title" label="Job title" value={u?.title} placeholder="e.g. Visa Consultant" />
        <F name="phone" label="Phone / WhatsApp" value={u?.phone} placeholder="+971 5x xxx xxxx" />
        <div className="field"><label htmlFor="role">Role</label><select id="role" name="role" defaultValue={u?.role ?? 'staff'}>{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></div>
        <h3 className="full uf-sec">2. Sign-in</h3>
        <F name="email" label="Email (used to sign in)" value={u?.email} type="email" placeholder="name@company.com" />
        <div className="field">
          <label htmlFor="password">{isNew ? 'Password (10+ characters)' : 'New password'}</label>
          <PwInput id="password" name="password" autoComplete="new-password" placeholder={isNew ? '' : 'Leave empty to keep the current one'} generate />
        </div>
        <div className="full"><Toggle name="active" label="Active (can sign in)" help="Pause to block sign-in without deleting the user" on={u ? u.active : true} /></div>
        <h3 className="full uf-sec">3. Access</h3>
        <Perms u={u} />
        <h3 className="full uf-sec">4. Private note</h3>
        <F name="note" label="Only admins see this" value={u?.note} type="textarea" rows={2} full />
        <div className="full row uf-actions"><Submit>{isNew ? 'Create user' : 'Save changes'}</Submit><Link className="btn" href="/admin/users/">{isNew ? 'Cancel' : 'Close'}</Link></div>
      </ActionForm>
    </>
  );
}

export default async function Users({ searchParams }: { searchParams: Promise<{ edit?: string; q?: string; created?: string }> }) {
  const me = await requireAdmin(FULL);
  const { edit, q = '', created } = await searchParams;
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
        <div className="panel user-form">
          <UserForm u={u} created={created === '1'} />
        </div>
      </div>
    </>
  );
}
