import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/server/auth';
import { list, type Subscriber } from '@/lib/server/collections';
import { day } from '@/lib/stages';

export const metadata: Metadata = { title: 'Subscribers' };

export default async function Subs() {
  await requireAdmin();
  const subs = await list<Subscriber>('subscribers');
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Subscribers</p><h1>Newsletter list <span className="gold">({subs.length})</span></h1></div>
        <a className="btn" href="/admin/export/?f=subscribers">Download CSV</a></div>
      {subs.length === 0 ? <p className="empty">No subscribers yet. The signup form is in the website footer.</p> : (
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Email</th><th>Language</th><th>Joined</th></tr></thead><tbody>
          {subs.map((s) => <tr key={s.id}><td>{s.email}</td><td>{s.lang}</td><td>{day(s.at)}</td></tr>)}
        </tbody></table></div>
      )}
    </>
  );
}
