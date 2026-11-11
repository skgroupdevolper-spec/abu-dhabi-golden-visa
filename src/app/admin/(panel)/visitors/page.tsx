import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/server/auth';
import { readJsonFile } from '@/lib/server/store';
import { getPage } from '@/content/pages';
import type { Visits } from '@/app/api/visit/route';

export const metadata: Metadata = { title: 'Visitors' };
export const dynamic = 'force-dynamic';

const uaeDay = (offset = 0) => new Date(Date.now() + 4 * 3600_000 - offset * 86400_000).toISOString().slice(0, 10);
const fmt = (n: number) => n.toLocaleString('en-US');

export default async function VisitorsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAdmin();
  const { range = '30' } = await searchParams;
  const days = Math.min(365, Math.max(1, Number(range) || 30));
  const data = await readJsonFile<Visits>('visits.json', { days: {}, total: 0 });
  const list = Array.from({ length: days }, (_, i) => uaeDay(days - 1 - i)).map((d) => ({ d, ...(data.days[d] ?? { v: 0, u: 0, pages: {}, ref: {} }) }));
  const sum = (n: number, k: 'v' | 'u') => Array.from({ length: n }, (_, i) => data.days[uaeDay(i)]?.[k] ?? 0).reduce((a, b) => a + b, 0);
  const t = Date.now();
  const online = [...(globalThis.__ADGV_LIVE ?? new Map<string, number>()).values()].filter((v) => v > t - 5 * 60_000).length;
  const pages: Record<string, number> = {}, refs: Record<string, number> = {};
  for (const x of list) {
    for (const [p, n] of Object.entries(x.pages)) pages[p] = (pages[p] ?? 0) + n;
    for (const [r, n] of Object.entries(x.ref ?? {})) refs[r] = (refs[r] ?? 0) + n;
  }
  const top = Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 25);
  const topRef = Object.entries(refs).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const max = Math.max(1, ...list.map((x) => x.v));
  const cards: [string, string, string][] = [
    ['Online now', fmt(online), 'in the last 5 minutes'],
    ['Today', fmt(sum(1, 'v')), `${fmt(sum(1, 'u'))} visitors`],
    ['Last 7 days', fmt(sum(7, 'v')), `${fmt(sum(7, 'u'))} visitors`],
    ['Last 30 days', fmt(sum(30, 'v')), `${fmt(sum(30, 'u'))} visitors`],
    ['All time', fmt(data.total ?? 0), 'page views'],
  ];
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Website</p><h1>Visitors</h1></div>
        <nav className="tabs" style={{ margin: 0 }}>{[['7', '7 days'], ['30', '30 days'], ['90', '90 days'], ['365', '1 year']].map(([k, l]) => <a key={k} href={`/admin/visitors/?range=${k}`} className={String(days) === k ? 'on' : ''}>{l}</a>)}</nav>
      </div>
      <p className="help">Counted automatically on every website page. Bots, the admin and repeat views of the same page within 30 minutes are not counted. No IP addresses are stored.</p>
      <div className="vis-cards">{cards.map(([l, v, s]) => <div key={l} className="panel vis-card"><span>{l}</span><b>{v}</b><small>{s}</small></div>)}</div>
      <div className="panel">
        <h2 className="ph">Page views per day</h2>
        <div className="vis-chart" role="img" aria-label={`Page views for the last ${days} days`}>
          {list.map((x) => <div key={x.d} className="vis-col" title={`${x.d}: ${x.v} views, ${x.u} visitors`}><i style={{ height: `${(x.v / max) * 100}%` }} /><em style={{ height: `${(x.u / max) * 100}%` }} /></div>)}
        </div>
        <div className="vis-axis"><span>{list[0]?.d}</span><span><i className="k1" /> Page views <i className="k2" /> Visitors</span><span>{list[list.length - 1]?.d}</span></div>
      </div>
      <div className="vis-two">
        <div className="panel">
          <h2 className="ph">Most visited pages</h2>
          {top.length ? <table className="tbl-lite"><thead><tr><th>Page</th><th style={{ textAlign: 'end' }}>Views</th></tr></thead><tbody>
            {top.map(([p, n]) => <tr key={p}><td><a href={p} target="_blank" rel="noopener">{getPage(p)?.h1 ?? p}</a><br /><small className="muted">{p}</small></td><td style={{ textAlign: 'end' }}><b>{fmt(n)}</b></td></tr>)}
          </tbody></table> : <p className="muted">No visits counted yet.</p>}
        </div>
        <div className="panel">
          <h2 className="ph">Where visitors come from</h2>
          {topRef.length ? <table className="tbl-lite"><tbody>{topRef.map(([r, n]) => <tr key={r}><td>{r}</td><td style={{ textAlign: 'end' }}><b>{fmt(n)}</b></td></tr>)}</tbody></table> : <p className="muted">Direct visits only so far.</p>}
        </div>
      </div>
    </>
  );
}
