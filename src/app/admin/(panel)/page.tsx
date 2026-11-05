import type { Metadata } from 'next';
import Link from 'next/link';
import { listApplications, listLeads } from '@/lib/server/store';
import { STAGES, day, money, when } from '@/lib/stages';

export const metadata: Metadata = { title: 'Overview' };

export default async function Overview() {
  const [leads, all] = await Promise.all([listLeads(), listApplications()]);
  const apps = all.filter((a) => !a.archived);
  const week = Date.now() - 7 * 864e5;
  const due = apps.flatMap((a) => a.payments.filter((p) => p.status === 'due')).reduce((s, p) => s + p.amount, 0);
  const paid = apps.flatMap((a) => a.payments.filter((p) => p.status === 'paid')).reduce((s, p) => s + p.amount, 0);
  const done = apps.filter((a) => a.stage === STAGES.length - 1).length;
  const unread = apps.filter((a) => a.messages.some((m) => m.by === 'client' && !m.read));
  const byStage = STAGES.map((t, i) => ({ t, c: apps.filter((a) => a.stage === i).length }));
  const max = Math.max(1, ...byStage.map((x) => x.c));
  return (
    <>
      <div className="topbar">
        <div><p className="eyebrow">Overview</p><h1>Good to see you. <span className="gold">Here is today.</span></h1></div>
        <div className="row"><Link className="btn" href="/admin/leads/">Enquiries</Link><Link className="btn btn-gold" href="/admin/applications/new/">New application</Link></div>
      </div>
      <div className="grid4">
        <div className="kpi reveal"><small>New enquiries (7 days)</small><b>{leads.filter((l) => new Date(l.at).getTime() > week).length}</b><small>{leads.filter((l) => l.status === 'new').length} waiting for a reply</small></div>
        <div className="kpi reveal"><small>Active applications</small><b>{apps.length - done}</b><small>{done} completed</small></div>
        <div className="kpi reveal"><small>Awaiting payment</small><b style={{ fontSize: 30 }}>{money(due)}</b><small>{apps.flatMap((a) => a.payments).filter((p) => p.status === 'due').length} requests</small></div>
        <div className="kpi goldbg reveal"><small>Payments received</small><b style={{ fontSize: 30 }}>{money(paid)}</b><small>All time</small></div>
      </div>
      <div className="cols" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="panel-h"><h2>Latest enquiries</h2><Link href="/admin/leads/" className="btn btn-sm">See all</Link></div>
          {leads.length === 0 ? <p className="empty">No enquiries yet. Forms on the website arrive here.</p> : (
            <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Name</th><th>Service</th><th>From</th><th>Received</th><th>Status</th></tr></thead><tbody>
              {leads.slice(0, 8).map((l) => (
                <tr key={l.id}><td><b>{l.name}</b><div className="small muted">{l.phone}</div></td><td>{l.service || '—'}</td><td>{l.source}</td><td>{when(l.at)}</td><td><span className={`pill ${l.status}`}>{l.status}</span></td></tr>
              ))}
            </tbody></table></div>
          )}
        </div>
        <div className="stack">
          <div className="panel">
            <h2>Applications by stage</h2>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              {byStage.map((x, i) => (
                <div key={x.t}><div className="row" style={{ justifyContent: 'space-between', fontSize: 13.5 }}><span>{i + 1}. {x.t}</span><b>{x.c}</b></div><div className="bar"><i style={{ width: `${(x.c / max) * 100}%` }} /></div></div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h2>Client messages</h2>
            {unread.length === 0 ? <p className="muted" style={{ marginTop: 8 }}>No unread messages.</p> : (
              <div className="files" style={{ marginTop: 12 }}>
                {unread.map((a) => <Link key={a.id} href={`/admin/applications/${a.id}/#messages`} className="file" style={{ textDecoration: 'none', color: 'inherit' }}><span className="fi">✉</span><span className="fn"><b>{a.client.name}</b><small>{a.ref} · {a.messages.filter((m) => m.by === 'client' && !m.read).length} new</small></span></Link>)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-h"><h2>Recently updated applications</h2><Link href="/admin/applications/" className="btn btn-sm">See all</Link></div>
        {apps.length === 0 ? <p className="empty">No applications yet. Convert an enquiry or create one.</p> : (
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Ref</th><th>Client</th><th>Route</th><th>Stage</th><th>Updated</th></tr></thead><tbody>
            {[...apps].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6).map((a) => (
              <tr key={a.id}><td><Link href={`/admin/applications/${a.id}/`}>{a.ref}</Link></td><td>{a.client.name}</td><td>{a.route}</td><td>{STAGES[a.stage]}</td><td>{day(a.updatedAt)}</td></tr>
            ))}
          </tbody></table></div>
        )}
      </div>
    </>
  );
}
