import type { Metadata } from 'next';
import { DeleteButton } from '@/components/dash/DeleteButton';
import { clearItems, deleteItems } from '@/app/admin/delete-actions';
import Link from 'next/link';
import { listApplications } from '@/lib/server/store';
import { STAGES, day, money } from '@/lib/stages';
import { DECISION_PILL, DECISION_TEXT } from '@/lib/decision';

export const metadata: Metadata = { title: 'Applications' };

export default async function Apps({ searchParams }: { searchParams: Promise<{ q?: string; a?: string; d?: string }> }) {
  const { q = '', a, d } = await searchParams;
  const needle = q.toLowerCase();
  const all = await listApplications();
  const count = (r: string) => all.filter((x) => !x.archived && (r === 'none' ? !x.decision : x.decision?.result === r)).length;
  const apps = all.filter((x) => (a ? x.archived : !x.archived) && (!d || (d === 'none' ? !x.decision : x.decision?.result === d)) && (!needle || `${x.ref} ${x.client.name} ${x.client.phone} ${x.route}`.toLowerCase().includes(needle)));
  return (
    <>
      <div className="topbar">
        <div><p className="eyebrow">Applications</p><h1>Client files, <span className="gold">start to finish.</span></h1></div>
        <div className="row">
          <form className="row" action="/admin/applications/">{a && <input type="hidden" name="a" value="1" />}<input name="q" defaultValue={q} placeholder="Search ref, name, phone" style={{ width: 240 }} /><button className="btn" type="submit">Search</button></form>
          <Link className="btn btn-gold" href="/admin/applications/new/">New application</Link>
        </div>
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        <Link className={`btn btn-sm${a ? '' : ' btn-gold'}`} href="/admin/applications/">Active</Link>
        <Link className={`btn btn-sm${a ? ' btn-gold' : ''}`} href="/admin/applications/?a=1">Archived</Link>
        <span className="muted small" style={{ marginInline: 8 }}>Decision:</span>
        {(['none', 'approved', 'rejected', 'on_hold', 'withdrawn'] as const).map((r) => (
          <Link key={r} className={`btn btn-sm${d === r ? ' btn-gold' : ''}`} href={d === r ? '/admin/applications/' : `/admin/applications/?d=${r}`}>{r === 'none' ? 'Awaiting' : DECISION_TEXT[r].title} ({count(r)})</Link>
        ))}
      </div>
      {apps.length === 0 ? <p className="empty">No applications here.</p> : (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Ref</th><th>Client</th><th>Route</th><th>Progress</th><th className="num">Due</th><th>Messages</th><th>Updated</th><th /></tr></thead>
          <tbody>
            {apps.map((x) => {
              const due = x.payments.filter((p) => p.status === 'due').reduce((s, p) => s + p.amount, 0);
              const unread = x.messages.filter((m) => m.by === 'client' && !m.read).length;
              return (
                <tr key={x.id}>
                  <td><Link href={`/admin/applications/${x.id}/`}>{x.ref}</Link></td>
                  <td><b>{x.client.name}</b><div className="small muted">{x.client.phone}</div></td>
                  <td>{x.route}<div className="small muted">{x.location === 'in' ? 'Inside UAE' : 'Outside UAE'} · {1 + x.adults + x.kids} people</div></td>
                  <td style={{ minWidth: 180 }}><div className="small">{STAGES[x.stage]}{x.decision && <> <span className={`pill ${DECISION_PILL[x.decision.result]}`}>{DECISION_TEXT[x.decision.result].title}</span></>}</div><div className="bar" style={{ marginTop: 6 }}><i style={{ width: `${((x.stage + 1) / STAGES.length) * 100}%` }} /></div></td>
                  <td className="num">{due ? <span className="pill due">{money(due)}</span> : '—'}</td>
                  <td>{unread ? <span className="pill new">{unread} new</span> : <span className="muted small">{x.messages.length}</span>}</td>
                  <td>{day(x.updatedAt)}</td>
                  <td><form action={deleteItems}><input type="hidden" name="kind" value="applications" /><input type="hidden" name="id" value={x.id} /><DeleteButton label="Delete" confirm="Delete file + documents?" /></form></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      )}
    </>
  );
}
