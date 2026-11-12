import type { Metadata } from 'next';
import { DeleteButton } from '@/components/dash/DeleteButton';
import Link from 'next/link';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Toggle } from '@/components/dash/Fields';
import { requireAdmin } from '@/lib/server/auth';
import { list, type Customer } from '@/lib/server/collections';
import { listApplications } from '@/lib/server/store';
import { LOCALES } from '@/lib/i18n';
import { waTo } from '@/lib/site';
import { day, when } from '@/lib/stages';
import { addCustomer, customerAction, saveCustomer } from '../../settings-actions';

export const metadata: Metadata = { title: 'Customers' };
const dg = (p: string) => p.replace(/\D/g, '').slice(-9);

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; edit?: string; s?: string }> }) {
  const me = await requireAdmin();
  const { q = '', edit, s = 'all' } = await searchParams;
  const [allC, apps] = await Promise.all([list<Customer>('customers'), listApplications()]);
  // Staff see only the clients of the files assigned to them.
  const { scopeOf } = await import('@/lib/server/scope');
  const sc = scopeOf(me, apps);
  const all = allC.filter((c) => sc.contact(c.email, c.phone));
  const n = q.toLowerCase();
  const rows = all.filter((c) => (s === 'all' || (s === 'active' ? c.active : !c.active)) && (!n || `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(n)));
  const full = me.role === 'owner' || me.role === 'admin' || !!me.perms?.includes('/admin/customers/');
  const appsOf = (c: Customer) => apps.filter((a) => (a.client.email && a.client.email.toLowerCase() === c.email) || (dg(a.client.phone) && dg(a.client.phone) === dg(c.phone)));
  const cur = all.find((c) => c.id === edit);
  const langs = LOCALES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>);
  const week = all.filter((c) => Date.now() - new Date(c.createdAt).getTime() < 7 * 864e5).length;
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Customers</p><h1>Client accounts <span className="gold">({all.length})</span></h1>
        <p className="muted small" style={{ marginTop: 6 }}>Every client gets a private dashboard to follow their application, upload documents, accept quotes, pay and download receipts, in their own language.</p></div>
        <div className="row"><a className="btn" href="/portal/" target="_blank" rel="noopener">Open the customer dashboard ↗</a>{full && <Link className="btn btn-gold" href="/admin/customers/?edit=new">+ Add client</Link>}</div></div>
      <div className="grid4" style={{ marginBottom: 16 }}>
        <div className="kpi"><small>All clients</small><b>{all.length}</b></div>
        <div className="kpi"><small>Active</small><b>{all.filter((c) => c.active).length}</b></div>
        <div className="kpi"><small>New this week</small><b>{week}</b></div>
        <div className="kpi goldbg"><small>With an application</small><b>{all.filter((c) => appsOf(c).length).length}</b></div>
      </div>
      <div className="cols">
        <div className="panel">
          <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <nav className="tabs">{[['all', 'All'], ['active', 'Active'], ['off', 'Disabled']].map(([k, l]) => <a key={k} href={`/admin/customers/?s=${k}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className={s === k ? 'on' : ''}>{l}</a>)}</nav>
            <form className="row" action="/admin/customers/"><input type="hidden" name="s" value={s} /><input name="q" defaultValue={q} placeholder="Search name, email, phone" style={{ width: 220 }} /><button className="btn btn-sm">Search</button></form>
          </div>
          {rows.length === 0 ? <p className="empty" style={{ marginTop: 12 }}>No client accounts yet. Clients sign up on the customer dashboard, or add one here.</p> : (
            <div className="files" style={{ marginTop: 12 }}>
              {rows.map((c) => {
                const mine = appsOf(c);
                return (
                  <div key={c.id} className="file" style={{ flexWrap: 'wrap', background: c.id === edit ? '#fffaf0' : undefined }}>
                    <span className="fi">{c.name.slice(0, 1).toUpperCase()}</span>
                    <span className="fn"><b>{c.name}</b><small>{c.email} · <a href={waTo(c.phone, `Hello ${c.name.split(' ')[0]}, `)} target="_blank" rel="noopener">{c.phone}</a> · {c.lang.toUpperCase()} · joined {day(c.createdAt)}{c.lastLogin ? ` · last login ${when(c.lastLogin)}` : ''}</small>
                      {mine.length > 0 && <small>{mine.map((a) => <Link key={a.id} href={`/admin/applications/${a.id}/`} style={{ marginInlineEnd: 8 }}>{a.ref}</Link>)}</small>}</span>
                    <span className={`pill ${c.active ? 'ok' : 'closed'}`}>{c.active ? 'Active' : 'Disabled'}</span>
                    {full && (
                      <div className="row">
                        <Link className="btn btn-sm" href={`/admin/customers/?edit=${c.id}`}>Edit</Link>
                        <form action={customerAction}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="op" value="open" /><button className="btn btn-sm" title="Opens the client's dashboard as them">View as client</button></form>
                        <form action={customerAction}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="op" value="toggle" /><button className="btn btn-sm">{c.active ? 'Disable' : 'Enable'}</button></form>
                        <form action={customerAction}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="op" value="delete" /><DeleteButton /></form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {full && (
          <div className="panel">
            {cur ? (
              <>
                <h2>Edit: {cur.name}</h2>
                <ActionForm action={saveCustomer} className="form" key={cur.id}>
                  <input type="hidden" name="id" value={cur.id} />
                  <F name="name" label="Name" value={cur.name} />
                  <F name="email" label="Email (login)" value={cur.email} type="email" />
                  <F name="phone" label="Phone / WhatsApp" value={cur.phone} />
                  <div className="field"><label htmlFor="lang">Dashboard language</label><select id="lang" name="lang" defaultValue={cur.lang}>{langs}</select></div>
                  <F name="password" label="New password (empty = keep)" type="password" full />
                  <div className="full"><Toggle name="active" label="Active (can sign in)" on={cur.active} /></div>
                  <div className="full row"><Submit>Save client</Submit><Link className="btn" href="/admin/customers/">Close</Link></div>
                </ActionForm>
              </>
            ) : (
              <>
                <h2>Add a client</h2>
                <p className="help">Creates a customer dashboard login. Their applications are linked by email or phone.</p>
                <ActionForm action={addCustomer} className="form" reset>
                  <F name="name" label="Name" />
                  <F name="email" label="Email (login)" type="email" />
                  <F name="phone" label="Phone / WhatsApp" placeholder="+971…" />
                  <div className="field"><label htmlFor="lang">Dashboard language</label><select id="lang" name="lang" defaultValue="en">{langs}</select></div>
                  <F name="password" label="Password (8+ characters)" type="password" full />
                  <div className="full"><Submit>Create client account</Submit></div>
                </ActionForm>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
