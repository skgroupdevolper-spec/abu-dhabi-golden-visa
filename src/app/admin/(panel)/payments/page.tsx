import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { ActionForm, CopyButton, Submit } from '@/components/dash/ActionForm';
import { F, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { PROVIDERS, getPayCfg, online } from '@/lib/server/payments';
import { listApplications } from '@/lib/server/store';
import { money, when } from '@/lib/stages';
import { savePayments, testPayments } from '../../settings-actions';

export const metadata: Metadata = { title: 'Online payments' };
const dots = (v: string) => (v ? '••••••••' : '');

export default async function Payments() {
  await requireAdmin(FULL);
  const [c, apps, h] = await Promise.all([getPayCfg(), listApplications(), headers()]);
  const host = h.get('x-forwarded-host') || h.get('host') || '';
  const site = `${host.startsWith('localhost') ? 'http' : 'https'}://${host}`;
  const all = apps.flatMap((a) => a.payments.map((p) => ({ a, p }))).sort((x, y) => (y.p.paidAt || y.p.createdAt).localeCompare(x.p.paidAt || x.p.createdAt));
  const paid = all.filter((x) => x.p.status === 'paid'), due = all.filter((x) => x.p.status === 'due');
  const month = new Date().toISOString().slice(0, 7);
  const sum = (l: typeof all) => l.reduce((s, x) => s + x.p.amount, 0);
  const live = online(c);
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Payments</p><h1>Online <span className="gold">payments</span></h1>
        <p className="muted small" style={{ marginTop: 6 }}>Clients pay by card from their file. The payment confirms itself, the receipt is created and sent on WhatsApp and email, and the file moves forward.</p></div>
        <span className={`pill ${live ? 'ok' : 'due'}`}>{live ? `Live · ${PROVIDERS.find((p) => p.id === c.provider)?.name}${c.test ? ' (test mode)' : ''}` : 'Manual payment links'}</span></div>
      <div className="grid4" style={{ marginBottom: 16 }}>
        <div className="kpi"><small>Received this month</small><b>{money(sum(paid.filter((x) => x.p.paidAt?.slice(0, 7) === month)))}</b></div>
        <div className="kpi"><small>Received in total</small><b>{money(sum(paid))}</b></div>
        <div className="kpi"><small>Waiting for payment</small><b>{money(sum(due))}</b></div>
        <div className="kpi goldbg"><small>Open requests</small><b>{due.length}</b></div>
      </div>
      <div className="cols">
        <div className="panel">
          <h2>Payment provider</h2>
          <ActionForm action={savePayments} className="form">
            <div className="field full"><label htmlFor="provider">Provider</label><select id="provider" name="provider" defaultValue={c.provider}>{PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
              <ul className="help" style={{ margin: '6px 0 0', paddingInlineStart: 18 }}>{PROVIDERS.slice(1).map((p) => <li key={p.id}><b>{p.name}:</b> {p.note}</li>)}</ul></div>
            <div className="full"><Toggle name="test" label="Test mode (sandbox, no real money)" on={c.test} /></div>
            <fieldset className="full pay-keys"><legend>TotalPay</legend>
              <F name="totalpayKey" label="Merchant key" value={dots(c.totalpayKey)} /><F name="totalpayPass" label="Merchant password" value={dots(c.totalpayPass)} type="password" />
              <F name="totalpayHost" label="Checkout host" value={c.totalpayHost} full help="Default https://checkout.totalpay.global. Use the host TotalPay gives you." /></fieldset>
            <fieldset className="full pay-keys"><legend>Stripe</legend>
              <F name="stripeSecret" label="Secret key" value={dots(c.stripeSecret)} type="password" /><F name="stripeWebhook" label="Webhook signing secret" value={dots(c.stripeWebhook)} type="password" /></fieldset>
            <fieldset className="full pay-keys"><legend>Ziina</legend><F name="ziinaToken" label="API access token" value={dots(c.ziinaToken)} type="password" full /></fieldset>
            <fieldset className="full pay-keys"><legend>Network International (N-Genius)</legend>
              <F name="ngeniusKey" label="API key" value={dots(c.ngeniusKey)} type="password" /><F name="ngeniusOutlet" label="Outlet reference" value={c.ngeniusOutlet} /></fieldset>
            <fieldset className="full pay-keys"><legend>Telr</legend><F name="telrStore" label="Store ID" value={c.telrStore} /><F name="telrKey" label="Authentication key" value={dots(c.telrKey)} type="password" /></fieldset>
            <F name="currency" label="Currency" value={c.currency} />
            <F name="validDays" label="Quote valid for (days)" value={c.validDays} type="number" />
            <F name="termsUrl" label="Terms & conditions page" value={c.termsUrl} full />
            <div className="full"><Toggle name="autoStage" label="Move the file to “Quote accepted and paid” when everything is paid" on={c.autoStage} /></div>
            <div className="full"><Toggle name="receiptWa" label="Send the receipt PDF on WhatsApp automatically" help="Needs the WhatsApp Cloud API (Settings › WhatsApp)." on={c.receiptWa} /></div>
            <div className="full row"><Submit>Save</Submit></div>
          </ActionForm>
          <ActionForm action={testPayments}><Submit className="btn">Test connection</Submit></ActionForm>
        </div>
        <div className="stack">
          <div className="panel">
            <h2>Webhook addresses</h2>
            <p className="help">Add the one for your provider in its dashboard, so payments confirm even if the client closes the browser.</p>
            <div className="files" style={{ marginTop: 10 }}>{['totalpay', 'stripe', 'ziina', 'ngenius', 'telr'].map((p) => (
              <div key={p} className="file"><span className="fn"><b>{PROVIDERS.find((x) => x.id === p)?.name}</b><small style={{ overflowWrap: 'anywhere' }}>{site}/api/pay/webhook/{p}/</small></span><CopyButton text={`${site}/api/pay/webhook/${p}/`} label="Copy" /></div>))}</div>
            <p className="help" style={{ marginTop: 8 }}>Stripe events: checkout.session.completed. TotalPay: set it as the notification (callback) URL.</p>
          </div>
          <div className="panel">
            <h2>How clients pay</h2>
            <ol className="small" style={{ paddingInlineStart: 18, lineHeight: 1.7 }}>
              <li>Add a payment request in a client file (Applications › file › Payments).</li>
              <li>The client gets it on WhatsApp with their secure link and presses <b>Pay now</b>.</li>
              <li>They pay on the secure card page, then see <b>Confirming your payment → Payment received</b>.</li>
              <li>The receipt PDF is created and sent; the bell rings here.</li>
            </ol>
          </div>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        <h2>All payments</h2>
        {!all.length ? <p className="empty">No payment requests yet.</p> : (
          <div className="tbl-wrap" style={{ marginTop: 10 }}><table className="tbl"><thead><tr><th>Date</th><th>Client</th><th>File</th><th>Description</th><th>Amount</th><th>Status</th><th>Method</th><th /></tr></thead><tbody>
            {all.slice(0, 200).map(({ a, p }) => (
              <tr key={a.id + p.id}><td>{when(p.paidAt || p.createdAt)}</td><td>{a.client.name}</td><td><Link href={`/admin/applications/${a.id}/#payments`}>{a.ref}</Link></td><td>{p.label}</td><td><b>{money(p.amount)}</b></td>
                <td><span className={`pill ${p.status === 'paid' ? 'ok' : p.gw ? 'new' : 'due'}`}>{p.status === 'paid' ? 'Paid' : p.gw ? 'Checkout opened' : 'Due'}</span></td><td>{p.method || '—'}{p.txn ? <small className="muted" style={{ display: 'block' }}>{p.txn.slice(0, 26)}</small> : null}</td>
                <td>{p.status === 'paid' && <a className="btn btn-sm" href={`/portal/t/${a.token}/receipt/${p.id}/pdf/`} target="_blank" rel="noopener">Receipt</a>}</td></tr>))}
          </tbody></table></div>)}
      </div>
    </>
  );
}
