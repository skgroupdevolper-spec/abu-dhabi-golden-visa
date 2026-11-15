import { allStepNames, stepGroupOf } from '@/lib/server/stages';
import type { Metadata } from 'next';
import Link from 'next/link';
import { listApplications, listLeads } from '@/lib/server/store';
import { day, money, when } from '@/lib/stages';
import { myScope } from '@/lib/server/scope';

export const metadata: Metadata = { title: 'Overview' };

export default async function Overview() {
  const NAMES = await allStepNames();
  const namesOf = (x: { stepGroup?: string; route: string }) => NAMES[stepGroupOf(x)] ?? NAMES['Golden Visa'];
  const sc = await myScope();
  // Staff: only their own files and enquiries, and no business totals (like the customer dashboard).
  const [leads, all] = await Promise.all([listLeads().then((l) => l.filter(sc.lead)), listApplications().then((l) => l.filter(sc.app))]);
  const apps = all.filter((a) => !a.archived);
  const week = Date.now() - 7 * 864e5;
  const due = apps.flatMap((a) => a.payments.filter((p) => p.status === 'due')).reduce((s, p) => s + p.amount, 0);
  const paid = apps.flatMap((a) => a.payments.filter((p) => p.status === 'paid')).reduce((s, p) => s + p.amount, 0);
  const done = apps.filter((a) => a.stage === namesOf(a).length - 1).length;
  const unread = apps.filter((a) => a.messages.some((m) => m.by === 'client' && !m.read));
  // Open files per service, then per step of that service (only steps that have files).
  const bySvc = new Map<string, { i: number; t: string; c: number }[]>();
  for (const a of apps.filter((x) => !x.archived)) {
    const g = stepGroupOf(a), names = NAMES[g] ?? NAMES['Golden Visa'];
    const rows = bySvc.get(g) ?? [];
    const r = rows.find((x) => x.i === a.stage) ?? (rows.push({ i: a.stage, t: names[a.stage] ?? '-', c: 0 }), rows[rows.length - 1]);
    r.c++;
    bySvc.set(g, rows);
  }
  const svcRows = [...bySvc].map(([g, rows]) => ({ g, total: NAMES[g]?.length ?? 0, rows: rows.sort((a, b) => a.i - b.i) }));
  const byStage = svcRows.flatMap((x) => x.rows);
  const max = Math.max(1, ...byStage.map((x) => x.c));
  return (
    <>
      <div className="topbar">
        <div><p className="eyebrow">{sc.full ? 'Overview' : 'My work'}</p><h1>{sc.full ? <>Good to see you. <span className="gold">Here is today.</span></> : <>Hello {sc.me.name.split(' ')[0]}. <span className="gold">Your files today.</span></>}</h1></div>
        <div className="row"><Link className="btn" href="/admin/leads/">{sc.full ? 'Enquiries' : 'My enquiries'}</Link><Link className="btn btn-gold" href={sc.full ? '/admin/applications/new/' : '/admin/applications/'}>{sc.full ? 'New application' : 'My files'}</Link></div>
      </div>
      <div className="grid4">
        <div className="kpi reveal"><small>New enquiries (7 days)</small><b>{leads.filter((l) => new Date(l.at).getTime() > week).length}</b><small>{leads.filter((l) => l.status === 'new').length} waiting for a reply</small></div>
        <div className="kpi reveal"><small>Active applications</small><b>{apps.length - done}</b><small>{done} completed</small></div>
        {sc.full ? <>
          <div className="kpi reveal"><small>Awaiting payment</small><b style={{ fontSize: 30 }}>{money(due)}</b><small>{apps.flatMap((a) => a.payments).filter((p) => p.status === 'due').length} requests</small></div>
          <div className="kpi goldbg reveal"><small>Payments received</small><b style={{ fontSize: 30 }}>{money(paid)}</b><small>All time</small></div>
        </> : <>
          <div className="kpi reveal"><small>Unread client messages</small><b>{unread.reduce((n, a) => n + a.messages.filter((m) => m.by === 'client' && !m.read).length, 0)}</b><small>in {unread.length} files</small></div>
          <div className="kpi goldbg reveal"><small>Client documents (7 days)</small><b>{apps.reduce((n, a) => n + a.documents.filter((d) => d.by === 'client' && new Date(d.at).getTime() > week).length, 0)}</b><small>uploaded to your files</small></div>
        </>}
      </div>
      <div className="grid4" style={{ marginTop: 16 }}>
        {([['approved', 'Approved visas'], ['rejected', 'Not approved'], ['on_hold', 'On hold'], ['none', 'Awaiting decision']] as const).map(([r, t]) => {
          const c = apps.filter((a) => (r === 'none' ? !a.decision : a.decision?.result === r)).length;
          return <Link key={r} href={`/admin/applications/?d=${r}`} className="kpi reveal" style={{ textDecoration: 'none' }}><small>{t}</small><b>{c}</b><small>{r === 'approved' && apps.length ? `${Math.round((c / Math.max(1, apps.filter((a) => a.decision && a.decision.result !== 'on_hold').length)) * 100)}% of decided files` : 'Open list →'}</small></Link>;
        })}
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
            {svcRows.length === 0 ? <p className="empty">No open applications yet.</p> : (
              <div className="abs">
                {svcRows.map((x) => (
                  <div key={x.g} className="abs-svc">
                    <div className="abs-h"><b>{x.g}</b><span>{x.rows.reduce((n, r) => n + r.c, 0)} file{x.rows.reduce((n, r) => n + r.c, 0) === 1 ? '' : 's'}</span></div>
                    {x.rows.map((r) => (
                      <Link key={r.i} href="/admin/applications/" className="abs-row">
                        <span className="abs-n">{r.i + 1}/{x.total}</span><span className="abs-t">{r.t}</span><b>{r.c}</b>
                        <span className="bar"><i style={{ width: `${(r.c / max) * 100}%` }} /></span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
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
              <tr key={a.id}><td><Link href={`/admin/applications/${a.id}/`}>{a.ref}</Link></td><td>{a.client.name}</td><td>{a.route}</td><td>{namesOf(a)[a.stage]}</td><td>{day(a.updatedAt)}</td></tr>
            ))}
          </tbody></table></div>
        )}
      </div>
    </>
  );
}
