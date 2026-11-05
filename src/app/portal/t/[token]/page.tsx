import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { sizeLabel } from '@/lib/server/files';
import { getApplicationByToken } from '@/lib/server/store';
import { SITE, waLink } from '@/lib/site';
import { STAGES, day, money, when } from '@/lib/stages';
import { PortalTop } from '@/components/dash/PortalTop';
import { currentCustomer, portalBase, T } from '@/lib/server/portal';
import { acceptQuote, clientMessage, clientUpload } from '../../actions';

export const metadata: Metadata = { title: 'My application' };
export const dynamic = 'force-dynamic';

export default async function ClientFile({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const a = await getApplicationByToken(token);
  if (!a) notFound();
  const { t, lang } = await T();
  const base = await portalBase();
  const signedIn = !!(await currentCustomer());
  const first = a.client.name.split(' ')[0];
  const gov = a.quote.lines.reduce((s, l) => s + l.amount, 0);
  const total = gov + a.quote.serviceFee + a.quote.vat;
  const due = a.payments.filter((p) => p.status === 'due');
  const paid = a.payments.filter((p) => p.status === 'paid');
  const pct = Math.round(((a.stage + 1) / STAGES.length) * 100);
  const mine = a.documents.filter((d) => d.by === 'client');
  const fromTeam = a.documents.filter((d) => d.by === 'team' && d.shared);
  const TK = <input type="hidden" name="token" value={a.token} />;
  const ask = waLink(`Hello, this is ${a.client.name} (${a.ref}). `);

  return (
    <>
      <PortalTop t={t} lang={lang.code} base={base} back={`${base}/t/${a.token}/`} signedIn={signedIn} right={<span className="small muted"><b style={{ color: 'var(--ink)' }}>{a.ref}</b></span>} />
      <main className="pwrap">
        <section className="phero reveal">
          <div>
            <p className="eyebrow">{t.yourFile}</p>
            <h1 style={{ marginTop: 8 }}>{t.hello} {first}, <span className="gold">{a.stage === STAGES.length - 1 ? t.issued : t.whereStand}</span></h1>
            <p style={{ margin: '12px 0 6px', fontWeight: 700 }}>{t.step} {a.stage + 1} {t.of} {STAGES.length}: {t.stages[a.stage]}</p>
            <div className="bar" style={{ maxWidth: 520, background: 'rgba(255,255,255,.6)' }}><i style={{ width: `${pct}%` }} /></div>
            {a.nextStep && <p className="small" style={{ margin: '12px 0 0' }}><b>{t.next}:</b> {a.nextStep}{a.expected ? ` · ${t.expected} ${a.expected}` : ''}</p>}
          </div>
          <img decoding="async" className="coinb" src="/brand/coin.webp" alt="" width={120} height={120} />
        </section>

        <nav className="ptabs" aria-label="Sections">
          <a href="#status">{t.status}</a><a href="#quote">{t.quote}</a><a href="#payments">{t.payments}{due.length ? ` (${due.length})` : ''}</a><a href="#documents">{t.documents}</a><a href="#messages">{t.messages}</a>
        </nav>

        <div className="cols">
          <div className="stack">
            <section className="panel reveal" id="status">
              <h2>{t.progress}</h2>
              <ol className="timeline" style={{ marginTop: 14 }}>
                {STAGES.map((st, i) => (
                  <li key={st} className={i < a.stage ? 'done' : i === a.stage ? 'now' : ''}><span className="dot">{i < a.stage ? '✓' : i + 1}</span><div><b>{t.stages[i]}</b>{a.stageDates[String(i)] && <small>{day(a.stageDates[String(i)])}</small>}</div></li>
                ))}
              </ol>
            </section>

            <section className="panel reveal" id="quote">
              <div className="panel-h"><h2>{t.yourQuote}</h2>{a.quote.acceptedAt && <span className="pill ok">{t.accepted} {day(a.quote.acceptedAt)}</span>}</div>
              {!a.quote.sentAt ? <p className="empty">{t.quotePreparing}</p> : (
                <>
                  <div className="lines">
                    {a.quote.lines.map((l, i) => <div key={i}><span>{l.label}</span><b>{l.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></div>)}
                    {a.quote.serviceFee > 0 && <div><span>{t.serviceFee}</span><b>{a.quote.serviceFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></div>}
                    {a.quote.vat > 0 && <div><span>{t.vat}</span><b>{a.quote.vat.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></div>}
                    <div><span>{t.insurance}</span><b>{a.quote.insurance}</b></div>
                  </div>
                  <div className="total"><span>{t.total}</span><b>{money(total)}</b></div>
                  <p className="small muted" style={{ marginTop: 10 }}>{t.feesNote}</p>
                  <div className="row" style={{ marginTop: 12 }}>{!a.quote.acceptedAt && <form action={acceptQuote}>{TK}<button className="btn btn-gold" type="submit">{t.accept}</button></form>}<a className="btn" href="quote/">{t.downloadQuote}</a></div>
                </>
              )}
            </section>

            <section className="panel reveal" id="payments">
              <h2>{t.payments}</h2>
              {a.payments.length === 0 ? <p className="empty" style={{ marginTop: 12 }}>{t.noPayments}</p> : (
                <div className="files" style={{ marginTop: 12 }}>
                  {due.map((p) => (
                    <div className="file" key={p.id}>
                      <span className="fi">AED</span>
                      <span className="fn"><b>{p.label}</b><small>{money(p.amount)} · {t.requested} {day(p.createdAt)}</small></span>
                      {p.link ? <a className="btn btn-gold btn-sm" href={p.link} target="_blank" rel="noopener">{t.payNow}</a> : <a className="btn btn-sm btn-wa" href={waLink(`Hello, I would like to pay ${p.label} for ${a.ref}.`)} target="_blank" rel="noopener">{t.getPayLink}</a>}
                    </div>
                  ))}
                  {paid.map((p) => (
                    <div className="file" key={p.id}>
                      <span className="fi">✓</span>
                      <span className="fn"><b>{p.label}</b><small>{money(p.amount)} · {t.paid} {day(p.paidAt)}</small></span>
                      <a className="btn btn-sm" href={`receipt/${p.id}/`}>{t.receipt}</a>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="panel reveal" id="documents">
              <h2>{t.documents}</h2>
              {a.requests.length > 0 && (
                <div className="notice" style={{ marginTop: 12 }}>
                  <b>{t.pleaseUpload}</b>
                  <ul style={{ margin: '6px 0 0', paddingInlineStart: 18 }}>{a.requests.map((r) => <li key={r}>{r}{mine.some((d) => d.name.toLowerCase() === r.toLowerCase()) ? ' ✓' : ''}</li>)}</ul>
                </div>
              )}
              <ActionForm action={clientUpload} className="form" reset>
                {TK}
                <div className="full" style={{ height: 4 }} />
                <div className="field"><label htmlFor="label">{t.whichDoc}</label>{a.requests.length ? <select id="label" name="label">{a.requests.map((r) => <option key={r}>{r}</option>)}<option value="">{t.other}</option></select> : <input id="label" name="label" placeholder="e.g. Passport copy" />}</div>
                <div className="field"><label htmlFor="file">{t.fileHint}</label><input id="file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx" capture="environment" required /></div>
                <div className="full"><Submit>{t.upload}</Submit></div>
              </ActionForm>
              {(fromTeam.length > 0 || mine.length > 0) && (
                <div className="files" style={{ marginTop: 14 }}>
                  {[...fromTeam, ...mine].map((d) => (
                    <div className="file" key={d.id}>
                      <span className="fi">{d.file.split('.').pop()?.toUpperCase().slice(0, 4)}</span>
                      <span className="fn"><b>{d.name}</b><small>{d.by === 'team' ? t.fromAdvisor : t.byYou} · {sizeLabel(d.size)} · {day(d.at)}</small></span>
                      <a className="btn btn-sm" href={`file/${d.id}/`}>{t.download}</a>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="stack">
            <section className="panel reveal" id="messages">
              <div className="panel-h"><h2>{t.messages}</h2><a className="btn btn-sm btn-wa" href={ask} target="_blank" rel="noopener">WhatsApp</a></div>
              <div className="thread">
                {a.messages.length === 0 ? <p className="muted small" style={{ margin: 0 }}>{t.advisorPosts}</p> : a.messages.map((m) => (
                  <div key={m.id} className={`msg${m.by === 'client' ? ' mine' : ''}`}>{m.text}<span className="meta">{m.by === 'client' ? t.you : t.yourAdvisor} · {when(m.at)}</span></div>
                ))}
              </div>
              <ActionForm action={clientMessage} className="stack" reset>
                {TK}
                <div style={{ height: 4 }} />
                <textarea name="text" placeholder={t.writeAdvisor} />
                <Submit>{t.send}</Submit>
              </ActionForm>
            </section>
            <section className="panel reveal">
              <h2>{t.yourDetails}</h2>
              <div className="lines" style={{ marginTop: 10 }}>
                <div><span>{t.name}</span><b>{a.client.name}</b></div>
                <div><span>{t.route}</span><b>{a.route}</b></div>
                <div><span>{t.applyingFrom}</span><b>{a.location === 'in' ? t.inside : t.outside}</b></div>
                <div><span>{t.people}</span><b>{1 + a.adults + a.kids}</b></div>
              </div>
            </section>
          </div>
        </div>
        <p className="pfoot">{SITE.operator} · Trade Licence {SITE.licence} · {SITE.disclaimer}</p>
      </main>
      <a className="fab" href={ask} target="_blank" rel="noopener" aria-label="WhatsApp your advisor">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19z" /><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.6l1.2-1.1 1.8.8c-.2 1.3-1.2 2-2.5 1.8-3-.5-5.4-2.9-5.9-5.9-.2-1.3.5-2.3 1.8-2.5l.8 1.8z" /></svg>
      </a>
    </>
  );
}
