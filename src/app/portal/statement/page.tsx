import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PrintButton } from '@/components/dash/ActionForm';
import { PortalTop } from '@/components/dash/PortalTop';
import { currentCustomer, portalBase, T } from '@/lib/server/portal';
import { listApplications } from '@/lib/server/store';
import { SITE } from '@/lib/site';
import { money } from '@/lib/stages';

export const metadata: Metadata = { title: 'Account statement' };
export const dynamic = 'force-dynamic';
const dg = (p: string) => p.replace(/\D/g, '').slice(-9);
const d = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

/** All charges (accepted quotes / payment requests) and payments of a client, with a running balance. */
export default async function Statement() {
  const base = await portalBase();
  const me = await currentCustomer();
  if (!me) redirect(`${base}/login/`);
  const { t, lang } = await T();
  const mine = (await listApplications()).filter((a) => !a.archived && ((a.client.email && a.client.email.toLowerCase() === me.email) || (dg(a.client.phone) && dg(a.client.phone) === dg(me.phone))));
  type Row = { at: string; ref: string; text: string; debit: number; credit: number; link?: string; token: string };
  const rows: Row[] = [];
  for (const a of mine) for (const p of a.payments) {
    rows.push({ at: p.createdAt, ref: a.ref, text: p.label, debit: p.amount, credit: 0, token: a.token });
    if (p.status === 'paid') rows.push({ at: p.paidAt || p.createdAt, ref: a.ref, text: `${t.paid}: ${p.receiptNo} · ${p.method ?? ''}`, debit: 0, credit: p.amount, link: `${base}/t/${a.token}/receipt/${p.id}/pdf/`, token: a.token });
  }
  rows.sort((x, y) => x.at.localeCompare(y.at));
  let bal = 0;
  const lines = rows.map((r) => { bal += r.debit - r.credit; return { ...r, bal }; });
  const debit = rows.reduce((s, r) => s + r.debit, 0), credit = rows.reduce((s, r) => s + r.credit, 0);
  return (
    <>
      <div className="noprint"><PortalTop t={t} lang={lang.code} base={base} back={`${base}/`} signedIn /></div>
      <main className="pwrap" style={{ maxWidth: 980 }}>
        <div className="panel">
          <div className="panel-h">
            <div><p className="eyebrow">{t.statement}</p><h1 style={{ margin: '6px 0 2px' }}>{me.name}</h1><p className="muted small">{me.email} · {me.phone} · {d(new Date().toISOString())}</p></div>
            <img decoding="async" src="/brand/logo.webp" alt="Abu Dhabi Golden Visa" style={{ height: 44, width: 'auto' }} />
          </div>
          <p className="muted small">{t.statementIntro}</p>
          <div className="grid4" style={{ margin: '14px 0' }}>
            <div className="kpi"><small>{t.total}</small><b>{money(debit)}</b></div>
            <div className="kpi"><small>{t.paidSoFar}</small><b>{money(credit)}</b></div>
            <div className="kpi goldbg"><small>{t.balance}</small><b>{money(debit - credit)}</b></div>
            <div className="kpi"><small>{t.myFiles}</small><b>{mine.length}</b></div>
          </div>
          {!lines.length ? <p className="empty">{t.noPayments}</p> : (
            <div className="tbl-wrap"><table className="tbl stmt-tbl"><thead><tr><th>{t.date}</th><th>{t.orderNo}</th><th>{t.description}</th><th className="num">{t.amount}</th><th className="num">{t.paidSoFar}</th><th className="num">{t.balance}</th></tr></thead><tbody>
              {lines.map((r, i) => (
                <tr key={i}><td>{d(r.at)}</td><td><a href={`${base}/t/${r.token}/`}>{r.ref}</a></td><td>{r.text}{r.link && <> · <a className="noprint" href={r.link} target="_blank" rel="noopener">{t.receipt}</a></>}</td>
                  <td className="num">{r.debit ? r.debit.toFixed(2) : ''}</td><td className="num">{r.credit ? r.credit.toFixed(2) : ''}</td><td className="num"><b>{r.bal.toFixed(2)}</b></td></tr>))}
            </tbody></table></div>)}
          <p className="small muted" style={{ marginTop: 14 }}>{SITE.operator} · Trade Licence {SITE.licence} · {SITE.office} · {SITE.email}</p>
          <div className="row noprint" style={{ marginTop: 12 }}><PrintButton /><a className="btn" href={`${base}/`}>← {t.allOrders}</a></div>
        </div>
      </main>
    </>
  );
}
