import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { PortalTop } from '@/components/dash/PortalTop';
import { SERVICE_CATALOG } from '@/content/services-catalog';
import { currentCustomer, portalBase, T } from '@/lib/server/portal';
import { listApplications, listLeads } from '@/lib/server/store';
import { SITE } from '@/lib/site';
import { STAGES, day, money } from '@/lib/stages';
import { requestService } from './actions';

export const metadata: Metadata = { title: 'My applications' };
export const dynamic = 'force-dynamic';
const dg = (p: string) => p.replace(/\D/g, '').slice(-9);

export default async function Home() {
  const base = await portalBase();
  const me = await currentCustomer();
  if (!me) redirect(`${base}/login/`);
  const { t, lang } = await T();
  const [apps, leads] = await Promise.all([listApplications(), listLeads()]);
  const mine = apps.filter((a) => !a.archived && ((a.client.email && a.client.email.toLowerCase() === me.email) || (dg(a.client.phone) && dg(a.client.phone) === dg(me.phone))));
  const dueAll = mine.flatMap((a) => a.payments).filter((p) => p.status === 'due').reduce((s, p) => s + p.amount, 0);
  const paidAll = mine.flatMap((a) => a.payments).filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const requests = leads.filter((l) => l.source === 'portal' && l.email === me.email && l.status !== 'converted');
  return (
    <>
      <PortalTop t={t} lang={lang.code} base={base} back={`${base}/`} signedIn />
      <main className="pwrap">
        <section className="phero reveal">
          <div>
            <p className="eyebrow">{t.myFiles}</p>
            <h1 style={{ marginTop: 8 }}>{t.hello} {me.name.split(' ')[0]}, <span className="gold">{t.yourFile}.</span></h1>
          </div>
          <img decoding="async" className="coinb" src="/brand/coin.webp" alt="" width={120} height={120} />
        </section>
        <div className="grid4 pk" style={{ marginTop: 16 }}>
          <div className="kpi"><small>{t.myFiles}</small><b>{mine.length}</b></div>
          <div className="kpi"><small>{t.amountDue}</small><b>{money(dueAll)}</b></div>
          <div className="kpi"><small>{t.paidSoFar}</small><b>{money(paidAll)}</b></div>
          <a className="kpi goldbg" href={`${base}/statement/`} style={{ textDecoration: 'none', color: 'inherit' }}><small>{t.statement}</small><b style={{ fontSize: 18 }}>🧾 {t.open} →</b></a>
        </div>
        <div className="cols" style={{ marginTop: 18 }}>
          <div className="stack">
            {mine.length === 0 ? <p className="empty">{t.noFiles}</p> : mine.map((a) => {
              const due = a.payments.filter((p) => p.status === 'due');
              const total = a.quote.lines.reduce((s, l) => s + l.amount, 0) + a.quote.serviceFee + a.quote.vat;
              const st = a.stage >= STAGES.length - 1 ? t.stCompleted : !a.quote.sentAt ? t.stPreparing : !a.quote.acceptedAt && !a.payments.some((p) => p.status === 'paid') ? t.stQuotation : due.length ? t.stConfirmed : t.inProgress;
              return (
                <div key={a.id} className="panel reveal ocard">
                  <a href={`${base}/t/${a.token}/`} className="oc-top">
                    <span><small>{t.orderLabel}</small><b>{a.ref}</b><em>● {st}</em></span>
                    <span className="oc-amt"><small>{t.totalAmount}</small><b>{total ? money(total) : '—'}</b></span>
                  </a>
                  <p style={{ margin: '12px 0 8px', fontWeight: 700 }}>{a.route} · {t.step} {a.stage + 1} {t.of} {STAGES.length}: {t.stages[a.stage]}</p>
                  <div className="bar"><i style={{ width: `${((a.stage + 1) / STAGES.length) * 100}%` }} /></div>
                  {a.nextStep && <p className="small muted" style={{ margin: '10px 0 0' }}>{t.next}: {a.nextStep}</p>}
                  <div className="row" style={{ marginTop: 12, flexWrap: 'wrap' }}>
                    {due.map((p) => <a key={p.id} className="btn btn-gold btn-sm" href={`${base}/t/${a.token}/pay/${p.id}/`}>💳 {t.payNow} · {money(p.amount)}</a>)}
                    <a className="btn btn-sm" href={`${base}/t/${a.token}/`}>{t.open} →</a>
                  </div>
                </div>
              );
            })}
            {requests.length > 0 && (
              <div className="panel">
                <h2>{t.myRequests}</h2>
                <div className="files" style={{ marginTop: 12 }}>
                  {requests.map((r) => <div className="file" key={r.id}><span className="fi">✉</span><span className="fn"><b>{r.service}</b><small>{day(r.at)}</small></span><span className="pill new">{r.status === 'new' ? t.received : t.inProgress}</span></div>)}
                </div>
              </div>
            )}
          </div>
          <div className="panel reveal" id="request">
            <h2>{t.newRequest}</h2>
            <ActionForm action={requestService} className="stack" reset>
              <div className="field"><label htmlFor="service">{t.chooseService}</label>
                <select id="service" name="service" required defaultValue="">
                  <option value="" disabled>{t.chooseService}</option>
                  {SERVICE_CATALOG.filter((g) => g.title !== 'Quick access').map((g) => <optgroup key={g.title} label={g.title}>{g.items.map((i) => <option key={i.href}>{i.label}</option>)}</optgroup>)}
                </select>
              </div>
              <div className="field"><label htmlFor="message">{t.details}</label><textarea id="message" name="message" /></div>
              <Submit>{t.sendRequest}</Submit>
            </ActionForm>
          </div>
        </div>
        <p className="pfoot">{SITE.operator} · {SITE.disclaimer}</p>
      </main>
    </>
  );
}
