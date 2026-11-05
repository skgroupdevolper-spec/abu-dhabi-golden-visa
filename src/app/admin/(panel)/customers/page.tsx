import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/server/auth';
import { list, type Customer } from '@/lib/server/collections';
import { listApplications } from '@/lib/server/store';
import { waTo } from '@/lib/site';
import { day } from '@/lib/stages';
import { updateCustomer } from '../../settings-actions';

export const metadata: Metadata = { title: 'Customers' };
const dg = (p: string) => p.replace(/\D/g, '').slice(-9);

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const me = await requireAdmin();
  const { q = '' } = await searchParams;
  const [all, apps] = await Promise.all([list<Customer>('customers'), listApplications()]);
  const n = q.toLowerCase();
  const rows = all.filter((c) => !n || `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(n));
  const full = me.role === 'owner' || me.role === 'admin';
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Customers</p><h1>Client accounts <span className="gold">({all.length})</span></h1></div>
        <form className="row" action="/admin/customers/"><input name="q" defaultValue={q} placeholder="Search name, email, phone" style={{ width: 260 }} /><button className="btn" type="submit">Search</button></form></div>
      {rows.length === 0 ? <p className="empty">No client accounts yet. Clients sign up at the portal login page.</p> : (
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Client</th><th>Contact</th><th>Applications</th><th>Joined</th><th>Account</th></tr></thead><tbody>
          {rows.map((c) => {
            const mine = apps.filter((a) => (a.client.email && a.client.email.toLowerCase() === c.email) || (dg(a.client.phone) && dg(a.client.phone) === dg(c.phone)));
            return (
              <tr key={c.id}>
                <td><b>{c.name}</b><div className="small muted">Language: {c.lang}</div></td>
                <td>{c.email}<div className="small"><a href={waTo(c.phone, `Hello ${c.name.split(' ')[0]}, `)} target="_blank" rel="noopener">{c.phone}</a></div></td>
                <td>{mine.length ? mine.map((a) => <div key={a.id}><Link href={`/admin/applications/${a.id}/`}>{a.ref}</Link></div>) : <span className="muted small">None</span>}</td>
                <td>{day(c.createdAt)}<div className="small muted">{c.lastLogin ? `Last login ${day(c.lastLogin)}` : ''}</div></td>
                <td>{full ? (
                  <form action={updateCustomer} className="row"><input type="hidden" name="id" value={c.id} />
                    <label className="row small"><input type="checkbox" name="active" defaultChecked={c.active} /> Active</label>
                    <input name="password" type="password" placeholder="Set new password" style={{ width: 160, minHeight: 34 }} autoComplete="new-password" />
                    <button className="btn btn-sm" type="submit">Save</button></form>
                ) : <span className={`pill ${c.active ? 'ok' : 'closed'}`}>{c.active ? 'Active' : 'Disabled'}</span>}</td>
              </tr>
            );
          })}
        </tbody></table></div>
      )}
    </>
  );
}
