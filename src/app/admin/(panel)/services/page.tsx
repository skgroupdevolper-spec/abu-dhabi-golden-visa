import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { SERVICE_CATALOG } from '@/content/services-catalog';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getServiceOverrides } from '@/lib/server/content';
import { saveServices } from '../../content-actions';

export const metadata: Metadata = { title: 'Services & prices' };

export default async function Services() {
  await requireAdmin(FULL);
  const o = await getServiceOverrides();
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Services & prices</p><h1>What you offer, <span className="gold">and from what price.</span></h1></div><a className="btn" href="/admin/fees/">Government fees →</a></div>
      <p className="help" style={{ marginBottom: 12 }}>The price text shows on the service page (e.g. “From AED 1,500 + VAT”). Hidden services disappear from the service menu and hub. Edit page text under Pages.</p>
      <ActionForm action={saveServices} className="stack">
        {SERVICE_CATALOG.map((g) => (
          <div className="panel" key={g.title}>
            <h2>{g.title}</h2>
            <div className="tbl-wrap" style={{ marginTop: 10 }}><table className="tbl"><thead><tr><th>Service</th><th>Price text</th><th>Hide</th></tr></thead><tbody>
              {g.items.map((i) => (
                <tr key={i.href}><td><input type="hidden" name="href" value={i.href} /><b>{i.label}</b><div className="small muted">{i.href}</div></td>
                  <td><input name={`price_${i.href}`} defaultValue={o.prices[i.href] ?? ''} placeholder="e.g. From AED 1,500 + VAT" /></td>
                  <td><input type="checkbox" name={`hide_${i.href}`} defaultChecked={o.hidden.includes(i.href)} /></td></tr>
              ))}
            </tbody></table></div>
          </div>
        ))}
        <div><Submit>Save services</Submit></div>
      </ActionForm>
    </>
  );
}
