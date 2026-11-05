import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { PortalTop } from '@/components/dash/PortalTop';
import { SERVICE_CATALOG } from '@/content/services-catalog';
import { currentCustomer, portalBase, T } from '@/lib/server/portal';
import { listApplications, listLeads } from '@/lib/server/store';
import { SITE } from '@/lib/site';
import { STAGES, day } from '@/lib/stages';
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
        <div className="cols" style={{ marginTop: 18 }}>
          <div className="stack">
            {mine.length === 0 ? <p className="empty">{t.noFiles}</p> : mine.map((a) => (
              <a key={a.id} href={`${base}/t/${a.token}/`} className="panel reveal" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div className="panel-h"><div><p className="eyebrow">{a.ref}</p><h2 style={{ marginTop: 6 }}>{a.route}</h2></div><span className="btn btn-gold btn-sm">{t.open} →</span></div>
                <p style={{ margin: '0 0 8px', fontWeight: 700 }}>{t.step} {a.stage + 1} {t.of} {STAGES.length}: {t.stages[a.stage]}</p>
                <div className="bar"><i style={{ width: `${((a.stage + 1) / STAGES.length) * 100}%` }} /></div>
                {a.nextStep && <p className="small muted" style={{ margin: '10px 0 0' }}>{t.next}: {a.nextStep}</p>}
              </a>
            ))}
            {requests.length > 0 && (
              <div className="panel">
                <h2>{t.myRequests}</h2>
                <div className="files" style={{ marginTop: 12 }}>
                  {requests.map((r) => <div className="file" key={r.id}><span className="fi">✉</span><span className="fn"><b>{r.service}</b><small>{day(r.at)}</small></span><span className="pill new">{r.status === 'new' ? t.received : t.inProgress}</span></div>)}
                </div>
              </div>
            )}
          </div>
          <div className="panel reveal">
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
