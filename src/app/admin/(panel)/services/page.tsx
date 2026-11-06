import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Toggle } from '@/components/dash/Fields';
import { SERVICE_CATALOG, mergeCatalog } from '@/content/services-catalog';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getServiceOverrides } from '@/lib/server/content';
import { addService, deleteService, saveServices } from '../../content-actions';

export const metadata: Metadata = { title: 'Services & prices' };

export default async function Services({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin(FULL);
  const { q = '' } = await searchParams;
  const o = await getServiceOverrides();
  const groups = mergeCatalog(o, true);
  const n = q.toLowerCase();
  const total = groups.reduce((s, g) => s + g.items.length, 0);
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Services & prices</p><h1>Services <span className="gold">& prices</span></h1>
        <p className="muted small" style={{ marginTop: 6 }}>Rename services, write the short description, set the price, hide or add services. Changes show in the Our Services menu, the side menu, the services page, service pages and the chatbot.</p></div>
        <div className="row"><a className="btn" href="/admin/fees/">Government fees & calculator →</a><a className="btn btn-gold" href="#add">+ Add service</a></div></div>
      <div className="grid4" style={{ marginBottom: 16 }}>
        <div className="kpi"><small>Services</small><b>{total}</b></div>
        <div className="kpi"><small>With a price</small><b>{Object.keys(o.prices).length}</b></div>
        <div className="kpi"><small>Hidden</small><b>{o.hidden.length}</b></div>
        <div className="kpi goldbg"><small>Added by you</small><b>{(o.added ?? []).length}</b></div>
      </div>
      <form className="row" action="/admin/services/" style={{ marginBottom: 12 }}><input name="q" defaultValue={q} placeholder="Search services" style={{ maxWidth: 320 }} /><button className="btn">Search</button>{q && <a className="btn btn-ghost" href="/admin/services/">Clear</a>}</form>
      <ActionForm action={saveServices} className="stack">
        {groups.map((g) => {
          const items = g.items.filter((i) => !n || `${i.label} ${i.href} ${i.note ?? ''}`.toLowerCase().includes(n));
          if (!items.length && n) return null;
          return (
            <div className="panel" key={g.key}>
              <div className="row" style={{ gap: 10, alignItems: 'center' }}><input type="hidden" name="group" value={g.key} />
                <input name={`gname_${g.key}`} defaultValue={g.title} aria-label="Group name" style={{ maxWidth: 320, fontWeight: 700, fontSize: 17 }} /><span className="muted small">{items.length} services</span></div>
              <div className="tbl-wrap" style={{ marginTop: 10 }}><table className="tbl svc-tbl"><thead><tr><th>Service name</th><th>Short description</th><th>Price shown</th><th>Hide</th><th /></tr></thead><tbody>
                {items.map((i) => {
                  const base = SERVICE_CATALOG.flatMap((x) => x.items).find((x) => x.href === i.href);
                  return (
                    <tr key={i.href} className={o.hidden.includes(i.href) ? 'off' : ''}>
                      <td><input type="hidden" name="href" value={i.href} /><input name={`label_${i.href}`} defaultValue={o.labels?.[i.href] ?? ''} placeholder={base?.label ?? i.label} aria-label="Service name" /><div className="small muted">{i.href}{i.added && <span className="pill new" style={{ marginInlineStart: 6 }}>Added</span>}</div></td>
                      <td><input name={`note_${i.href}`} defaultValue={o.notes[i.href] ?? ''} placeholder={base?.note ?? 'Short description'} aria-label="Short description" /></td>
                      <td><input name={`price_${i.href}`} defaultValue={o.prices[i.href] ?? ''} placeholder="e.g. From AED 1,500 + VAT" aria-label="Price" /></td>
                      <td><input type="checkbox" name={`hide_${i.href}`} defaultChecked={o.hidden.includes(i.href)} aria-label="Hide" /></td>
                      <td><div className="row" style={{ flexWrap: 'nowrap' }}><Link className="btn btn-sm" href={`/admin/pages/edit/?path=${encodeURIComponent(i.href)}`}>Edit page</Link><a className="btn btn-sm btn-ghost" href={i.href} target="_blank" rel="noopener" aria-label="View">↗</a></div></td>
                    </tr>
                  );
                })}
              </tbody></table></div>
            </div>
          );
        })}
        <div className="savebar"><Submit>Save all services</Submit><span className="muted small">Empty name or description = original text.</span></div>
      </ActionForm>

      {(o.added ?? []).length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h2>Services you added</h2>
          <div className="files" style={{ marginTop: 10 }}>{(o.added ?? []).map((a) => (
            <div key={a.href} className="file"><span className="fn"><b>{o.labels?.[a.href] || a.label}</b><small>{a.href} · {groups.find((g) => g.key === a.group)?.title ?? a.group}{o.prices[a.href] ? ` · ${o.prices[a.href]}` : ''}</small></span>
              <Link className="btn btn-sm" href={`/admin/pages/edit/?path=${encodeURIComponent(a.href)}`}>Edit page</Link>
              <form action={deleteService}><input type="hidden" name="href" value={a.href} /><button className="btn btn-sm btn-ghost btn-danger">Remove from menu</button></form></div>))}</div>
        </div>
      )}

      <div className="panel" id="add" style={{ marginTop: 16, maxWidth: 860 }}>
        <h2>Add a service</h2>
        <ActionForm action={addService} className="form" reset>
          <F name="label" label="Service name" placeholder="e.g. Golden Visa for Nurses" />
          <div className="field"><label htmlFor="group">Menu group</label><select id="group" name="group" defaultValue={groups[0]?.key}>{groups.map((g) => <option key={g.key} value={g.key}>{g.title}</option>)}</select></div>
          <F name="note" label="Short description" placeholder="Shown in menus and on cards" full />
          <F name="price" label="Price shown" placeholder="From AED 2,500 + VAT" />
          <F name="slug" label="Page address (optional)" placeholder="golden-visa-for-nurses" help="Becomes /services/your-text/" />
          <div className="full"><Toggle name="page" label="Create its page now (ready to edit in the page builder)" on /></div>
          <div className="full"><Submit>Add service</Submit></div>
        </ActionForm>
      </div>
    </>
  );
}
