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
import { day, money, payState, when } from '@/lib/stages';
import { addCustomer, customerAction, saveCustomer } from '../../settings-actions';
import { PwInput } from '@/components/dash/PwInput';

export const metadata: Metadata = { title: 'Customers' };
const dg = (p: string) => p.replace(/\D/g, '').slice(-9);

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; edit?: string; s?: string; created?: string }> }) {
  const me = await requireAdmin();
  const { q = '', edit, s = 'all', created } = await searchParams;
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
                    {mine.length > 0 && (() => {
                      const st = mine.map((a) => payState(a));
                      const paid = st.reduce((s, x) => s + x.paid, 0), rem = st.reduce((s, x) => s + x.remaining, 0);
                      return st.every((x) => x.state === 'none') ? <span className="pill">No payment yet</span> : rem <= 0.009 ? <span className="pill ok">Paid · {money(paid)}</span> : <span className={`pill ${paid > 0 ? 'new' : 'due'}`}>{paid > 0 ? `Paid ${money(paid)} · ` : ''}{money(rem)} remaining</span>;
                    })()}
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
          <div className="panel user-form">
            <div className="uf-head">
              <span className="uf-avatar">{(cur?.name || '+').slice(0, 1).toUpperCase()}</span>
              <div>
                <h2 style={{ margin: 0 }}>{cur ? cur.name : 'Add a client'}</h2>
                <p className="small muted" style={{ margin: '4px 0 0' }}>{cur ? `${cur.email} · joined ${new Date(cur.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · last sign-in ${cur.lastLogin ? new Date(cur.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'never'}` : 'Creates a customer dashboard login. Their applications are linked by email or phone.'}</p>
              </div>
              {cur && <span className={`pill ${cur.active ? 'ok' : 'due'}`} style={{ marginInlineStart: 'auto' }}>{cur.active ? 'Active' : 'Disabled'}</span>}
            </div>
            {created === '1' && <p className="notice ok" role="status">Client account created. You can change anything below.</p>}
            <ActionForm action={cur ? saveCustomer : addCustomer} className="form" key={cur?.id ?? 'new'}>
              {cur && <input type="hidden" name="id" value={cur.id} />}
              <h3 className="full uf-sec">1. Client details</h3>
              <F name="name" label="Full name" value={cur?.name} />
              <F name="phone" label="Phone / WhatsApp" value={cur?.phone} placeholder="+971…" />
              <div className="field"><label htmlFor="lang">Dashboard language</label><select id="lang" name="lang" defaultValue={cur?.lang ?? 'en'}>{langs}</select></div>
              <div />
              <h3 className="full uf-sec">2. Sign-in</h3>
              <F name="email" label="Email (used to sign in)" value={cur?.email} type="email" />
              <div className="field">
                <label htmlFor="password">{cur ? 'New password' : 'Password (8+ characters)'}</label>
                <PwInput id="password" name="password" autoComplete="new-password" placeholder={cur ? 'Leave empty to keep the current one' : ''} generate />
              </div>
              <div className="full"><Toggle name="active" label="Active (can sign in)" help="Disable to block sign-in without deleting the account" on={cur ? cur.active : true} /></div>
              {!cur && <div className="full"><Toggle name="welcome" label="Email the client that their account is ready" help="Sends the “Client account created” email with the dashboard link (never the password)" on={true} /></div>}
              <div className="full row uf-actions"><Submit>{cur ? 'Save changes' : 'Create client account'}</Submit><Link className="btn" href="/admin/customers/">{cur ? 'Close' : 'Cancel'}</Link></div>
            </ActionForm>
          </div>
        )}
      </div>
    </>
  );
}
