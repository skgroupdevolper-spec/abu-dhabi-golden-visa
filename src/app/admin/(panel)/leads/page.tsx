import type { Metadata } from 'next';
import Link from 'next/link';
import { listLeads, type LeadStatus } from '@/lib/server/store';
import { when } from '@/lib/stages';
import { waTo } from '@/lib/site';
import { convertLead, setLeadStatus } from '../../actions';

export const metadata: Metadata = { title: 'Enquiries' };
const TABS: (LeadStatus | 'all')[] = ['all', 'new', 'contacted', 'converted', 'closed'];

export default async function Leads({ searchParams }: { searchParams: Promise<{ s?: string; q?: string }> }) {
  const { s = 'all', q = '' } = await searchParams;
  const all = await listLeads();
  const needle = q.toLowerCase();
  const leads = all.filter((l) => (s === 'all' || l.status === s) && (!needle || `${l.name} ${l.phone} ${l.email} ${l.service} ${l.message}`.toLowerCase().includes(needle)));
  const details = (d: string) => { try { return Object.entries(JSON.parse(d || '{}')).map(([k, v]) => `${k}: ${v}`).join(' · '); } catch { return ''; } };
  return (
    <>
      <div className="topbar">
        <div><p className="eyebrow">Enquiries</p><h1>Every request <span className="gold">from the website.</span></h1></div>
        <form className="row" action="/admin/leads/"><input type="hidden" name="s" value={s} /><input name="q" defaultValue={q} placeholder="Search name, phone, service" style={{ width: 260 }} /><button className="btn" type="submit">Search</button></form>
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        {TABS.map((t) => <Link key={t} href={`/admin/leads/?s=${t}`} className={`btn btn-sm${s === t ? ' btn-gold' : ''}`}>{t[0].toUpperCase() + t.slice(1)} ({t === 'all' ? all.length : all.filter((l) => l.status === t).length})</Link>)}
      </div>
      {leads.length === 0 ? <p className="empty">Nothing here yet.</p> : (
        <div className="stack">
          {leads.map((l) => (
            <div className="panel" key={l.id} style={{ padding: 18 }}>
              <div className="panel-h" style={{ marginBottom: 8 }}>
                <div><b style={{ fontSize: 17 }}>{l.name}</b> <span className={`pill ${l.status}`}>{l.status}</span><div className="small muted">{when(l.at)} · from {l.source}</div></div>
                <div className="row">
                  <a className="btn btn-sm btn-wa" href={waTo(l.phone, `Hello ${l.name}, thank you for your Golden Visa enquiry. `)} target="_blank" rel="noopener">WhatsApp</a>
                  {l.email && <a className="btn btn-sm" href={`mailto:${l.email}`}>Email</a>}
                  <form action={convertLead}><input type="hidden" name="id" value={l.id} /><button className="btn btn-sm btn-gold" type="submit">{l.applicationId ? 'Open application' : 'Create application'}</button></form>
                </div>
              </div>
              <div className="grid3 small">
                <div><span className="lbl">Phone</span><div>{l.phone}</div></div>
                <div><span className="lbl">Email</span><div>{l.email || '—'}</div></div>
                <div><span className="lbl">Service</span><div>{l.service || '—'}</div></div>
              </div>
              {(l.message || l.details) && <p style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap' }}>{l.message}{l.details && <span className="small muted" style={{ display: 'block' }}>{details(l.details)}</span>}</p>}
              <form action={setLeadStatus} className="row" style={{ marginTop: 12 }}>
                <input type="hidden" name="id" value={l.id} />
                <select name="status" defaultValue={l.status} style={{ width: 150 }}>{TABS.slice(1).map((t) => <option key={t} value={t}>{t}</option>)}</select>
                <input name="note" defaultValue={l.note} placeholder="Private note" style={{ flex: 1, minWidth: 180 }} />
                <button className="btn btn-sm" type="submit">Save</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
