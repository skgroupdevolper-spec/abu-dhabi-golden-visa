import type { Metadata } from 'next';
import { DeleteButton } from '@/components/dash/DeleteButton';
import { clearItems, deleteItems } from '@/app/admin/delete-actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActionForm, CopyButton, Submit } from '@/components/dash/ActionForm';
import { sizeLabel } from '@/lib/server/files';
import { mergeCatalog } from '@/content/services-catalog';
import { getServiceOverrides } from '@/lib/server/content';
import { list, type TeamUser } from '@/lib/server/collections';
import { saveStageDefaults, setAdvisor } from '../../../settings-actions';
import { StageFields } from '@/components/dash/StageFields';
import { getBlock } from '@/lib/server/settings';
import { portalUrl, waTo } from '@/lib/site';
import { myScope, scopedApp } from '@/lib/server/scope';
import { DECISION_PILL, DECISION_TEXT } from '@/lib/decision';
import { ROUTE_LABELS, STAGES, STAGE_NEXT_DEFAULT, day, money, when } from '@/lib/stages';
import {
  addPayment, archiveApplication, fillQuote, markPaid, newPortalLink, assignApp, removePayment, saveClient, saveQuote, setDecision, setRequests, setStage, teamMessage, toggleShare, uploadTeamDoc,
} from '../../../actions';

export const metadata: Metadata = { title: 'Application' };

export default async function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await scopedApp(id);
  if (!a) notFound();
  const sc = await myScope();
  const staffList = sc.full ? (await list<TeamUser>('team')).filter((u) => u.active) : [];
  const link = portalUrl(a.token);
  const gov = a.quote.lines.reduce((s, l) => s + l.amount, 0);
  const quoteTotal = gov + a.quote.serviceFee + a.quote.vat;
  const blanks = Math.max(3, 8 - a.quote.lines.length);
  const H = <input type="hidden" name="app" value={a.id} />;
  const first = a.client.name.split(' ')[0];
  const team = await list<TeamUser>('team');
  const saved = await getBlock<string[]>('stage-next', []);
  const nextDefaults = STAGES.map((_, i) => saved[i]?.trim() || STAGE_NEXT_DEFAULT[i] || '');
  const svc = mergeCatalog(await getServiceOverrides()).flatMap((g) => g.items);

  return (
    <>
      <div className="topbar">
        <div>
          <p className="eyebrow"><Link href="/admin/applications/" style={{ textDecoration: 'none' }}>Applications</Link> / {a.ref}</p>
          <h1>{a.client.name} <span className="gold">· {a.route}</span></h1>
          <p className="muted small" style={{ margin: '6px 0 0' }}>Opened {day(a.createdAt)} · updated {when(a.updatedAt)} {a.archived && <span className="pill closed">Archived</span>}</p>
        </div>
        <div className="row">
          <a className="btn btn-wa" href={waTo(a.client.phone, `Hello ${first}, here is your secure Golden Visa portal for ${a.ref}: ${link}`)} target="_blank" rel="noopener">Send portal link on WhatsApp</a>
          <CopyButton text={link} label="Copy portal link" />
          <a className="btn btn-sm" href={`/portal/t/${a.token}/`} target="_blank" rel="noopener">Open client view ↗</a>
        </div>
      </div>

      <div className="cols">
        <div className="stack">
          {/* STATUS */}
          <section className="panel" id="status">
            <div className="panel-h"><h2>Status</h2><span className="pill new">Step {a.stage + 1} of {STAGES.length}</span></div>
            <div className="bar" style={{ marginBottom: 16 }}><i style={{ width: `${((a.stage + 1) / STAGES.length) * 100}%` }} /></div>
            <ActionForm action={setStage} className="form">
              {H}
              <StageFields stages={STAGES} defaults={nextDefaults} stage={a.stage} next={a.nextStep} expected={a.expected} />
              <label className="row full small"><input type="checkbox" name="notify" defaultChecked /> Tell the client (portal message, WhatsApp and email)</label>
              <div className="full"><Submit>Update status</Submit></div>
            </ActionForm>
            <details className="more" style={{ marginTop: 12 }}>
              <summary>Default next-step text for each stage</summary>
              <ActionForm action={saveStageDefaults} className="form" >
                {STAGES.map((t, i) => <div key={t} className="field full"><label htmlFor={`sd_${i}`}>{i + 1}. {t}</label><textarea id={`sd_${i}`} name={`sd_${i}`} rows={2} defaultValue={nextDefaults[i]} /></div>)}
                <div className="full"><Submit>Save default texts</Submit></div>
              </ActionForm>
            </details>
            <ol className="timeline" style={{ marginTop: 18 }}>
              {STAGES.map((t, i) => (
                <li key={t} className={i <= a.stage ? 'done' : i === a.stage + 1 ? 'now' : ''}><span className="dot">{i <= a.stage ? '✓' : i + 1}</span><div><b>{t}</b>{i <= a.stage && a.stageDates[String(i)] && <small>{day(a.stageDates[String(i)])}</small>}</div></li>
              ))}
            </ol>
          </section>

          {/* ASSIGNED TEAM MEMBER (owners and admins) */}
          {sc.full && (
            <section className="panel" id="assign">
              <div className="panel-h"><h2>Assigned to</h2><span className="pill">{a.assignee ? (staffList.find((u) => u.email === a.assignee)?.name || a.assignee) : 'Not assigned'}</span></div>
              <form action={assignApp} className="row">
                <input type="hidden" name="app" value={a.id} />
                <select name="assignee" defaultValue={a.assignee ?? ''} aria-label="Team member" style={{ minWidth: 240 }}>
                  <option value="">Not assigned (owners and admins only)</option>
                  {staffList.map((u) => <option key={u.id} value={u.email}>{u.name} · {u.role}</option>)}
                </select>
                <button className="btn btn-gold btn-sm" type="submit">Save</button>
              </form>
              <p className="help">Staff see only the files and enquiries assigned to them, with their messages and documents. They get a notification when you assign one.</p>
            </section>
          )}

          {/* DECISION */}
          <section className="panel" id="decision">
            <div className="panel-h"><h2>Authority decision</h2>{a.decision ? <span className={`pill ${DECISION_PILL[a.decision.result]}`}>{DECISION_TEXT[a.decision.result].title} · {day(a.decision.at)}</span> : <span className="pill">Awaiting decision</span>}</div>
            {a.decision && (
              <div className="notice" style={{ marginBottom: 14 }}>
                <b>{DECISION_TEXT[a.decision.result].title}</b> on {when(a.decision.at)}{a.decision.by ? ` by ${a.decision.by}` : ''}
                {a.decision.refNo && <><br />Authority reference: {a.decision.refNo}</>}
                {a.decision.validTo && <><br />Visa valid until: {day(a.decision.validTo)}</>}
                {a.decision.reason && <><br />Reason / note: {a.decision.reason}</>}
                {a.decision.nextAction && <><br />Next step for client: {a.decision.nextAction}</>}
              </div>
            )}
            <ActionForm action={setDecision} className="form">
              {H}
              <div className="field full">
                <label>Decision</label>
                <div className="row" role="radiogroup">
                  {(['approved', 'rejected', 'on_hold', 'withdrawn'] as const).map((r) => (
                    <label key={r} className="row small" style={{ gap: 6 }}><input type="radio" name="result" value={r} defaultChecked={a.decision?.result === r} required /> {DECISION_TEXT[r].title}</label>
                  ))}
                </div>
              </div>
              <div className="field"><label htmlFor="refNo">Authority reference (optional)</label><input id="refNo" name="refNo" defaultValue={a.decision?.refNo ?? ''} placeholder="e.g. ICP or TAMM application number" /></div>
              <div className="field"><label htmlFor="validTo">Visa valid until (if approved)</label><input id="validTo" name="validTo" type="date" defaultValue={a.decision?.validTo ?? ''} /></div>
              <div className="field full"><label htmlFor="reason">Reason or note from the authority (required if rejected)</label><textarea id="reason" name="reason" rows={3} defaultValue={a.decision?.reason ?? ''} placeholder="e.g. Salary certificate not accepted; degree attestation missing" /></div>
              <div className="field full"><label htmlFor="nextAction">What the client should do next</label><textarea id="nextAction" name="nextAction" rows={2} defaultValue={a.decision?.nextAction ?? ''} placeholder="e.g. We can appeal or re-apply once the attested degree is ready" /></div>
              <label className="row full small"><input type="checkbox" name="advance" defaultChecked /> If approved, move the file to “Entry permit or change of status”</label>
              <label className="row full small"><input type="checkbox" name="notify" defaultChecked /> Tell the client (portal message, WhatsApp and email)</label>
              <div className="full row"><Submit>Save decision</Submit>{a.decision && <Submit className="btn" name="clear" value="1">Clear decision (reopen)</Submit>}</div>
            </ActionForm>
            {!!a.decision?.history?.length && (
              <details className="more" style={{ marginTop: 12 }}><summary>Earlier decisions ({a.decision.history.length})</summary>
                <ul className="small">{a.decision.history.map((h, i) => <li key={i}>{DECISION_TEXT[h.result].title} · {when(h.at)}{h.reason ? ` · ${h.reason}` : ''}</li>)}</ul>
              </details>
            )}
          </section>

          {/* QUOTE */}
          <section className="panel" id="quote">
            <div className="panel-h">
              <h2>Quote</h2>
              <span className={`pill ${a.quote.acceptedAt ? 'ok' : a.quote.sentAt ? 'due' : ''}`}>{a.quote.acceptedAt ? `Accepted ${day(a.quote.acceptedAt)}` : a.quote.sentAt ? `Sent ${day(a.quote.sentAt)}` : 'Draft'}</span>
            </div>
            <form action={fillQuote} className="row notice" style={{ marginBottom: 14 }}>
              {H}
              <span className="small" style={{ flex: 1, minWidth: 200 }}>Fill government fees from the calculator for {1 + a.adults + a.kids} {a.adults + a.kids ? 'people' : 'person'}, {a.location === 'in' ? 'inside' : 'outside'} the UAE.</span>
              <label className="row small"><input type="checkbox" name="vip" /> VIP medical</label>
              <label className="row small"><input type="checkbox" name="newFile" defaultChecked /> Open sponsor file</label>
              <button className="btn btn-sm" type="submit">Fill lines</button>
            </form>
            <ActionForm action={saveQuote}>
              {H}
              <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Item</th><th className="num">Qty</th><th className="num">Unit price (AED)</th><th className="num">Amount</th></tr></thead><tbody>
                {a.quote.lines.map((l, i) => { const q = l.qty || 1, un = l.unit ?? l.amount / q; return <tr key={i}><td><input name="label" defaultValue={l.label} /></td><td style={{ width: 70 }}><input name="qty" defaultValue={q} inputMode="numeric" /></td><td style={{ width: 140 }}><input name="amount" defaultValue={un.toFixed(2)} inputMode="decimal" /></td><td className="num" style={{ width: 110 }}>{l.amount.toFixed(2)}</td></tr>; })}
                {Array.from({ length: blanks }, (_, i) => <tr key={`b${i}`}><td><input name="label" placeholder="Add an item" list="svc-items" /></td><td style={{ width: 70 }}><input name="qty" inputMode="numeric" placeholder="1" /></td><td style={{ width: 140 }}><input name="amount" inputMode="decimal" placeholder="0.00" /></td><td /></tr>)}
              </tbody></table></div>
              <datalist id="svc-items">{svc.map((x) => <option key={x.href} value={x.label} label={x.price ? `${x.label} · ${x.price}` : x.label} />)}</datalist>
              <p className="small muted" style={{ marginTop: 6 }}>Pick a service or type your own item. Amount = Qty × Unit price. Prices of services are set in Services &amp; prices.</p>
              <div className="form" style={{ marginTop: 12 }}>
                <div className="field"><label htmlFor="serviceFee">Our service fee (AED, before VAT)</label><input id="serviceFee" name="serviceFee" inputMode="decimal" defaultValue={a.quote.serviceFee ? a.quote.serviceFee.toFixed(2) : ''} /></div>
                <div className="field"><label htmlFor="insurance">Health insurance</label><input id="insurance" name="insurance" defaultValue={a.quote.insurance} /></div>
              </div>
              <div className="lines" style={{ marginTop: 12 }}>
                <div><span>Government fees</span><b>{money(gov)}</b></div>
                <div><span>Service fee + 5% VAT</span><b>{money(a.quote.serviceFee + a.quote.vat)}</b></div>
              </div>
              <div className="total"><span>Quote total</span><b>{money(quoteTotal)}</b></div>
              <div className="row" style={{ marginTop: 14 }}><Submit className="btn">Save draft</Submit><Submit name="send" value="1">Save and send to client</Submit></div>
            </ActionForm>
          </section>

          {/* PAYMENTS */}
          <section className="panel" id="advisor">
            <div className="panel-h"><h2>Client order page</h2><a className="btn btn-sm" href={link} target="_blank" rel="noopener">View as client ↗</a></div>
            <form action={setAdvisor} className="form">{H}
              <div className="field"><label htmlFor="adv">Your contact (advisor shown to the client)</label><input id="adv" name="name" list="team-names" defaultValue={a.advisor?.name ?? ''} placeholder="e.g. Sara Ahmed" /><datalist id="team-names">{team.map((u) => <option key={u.id} value={u.name} />)}</datalist></div>
              <div className="field"><label htmlFor="advp">Advisor phone / WhatsApp</label><input id="advp" name="phone" defaultValue={a.advisor?.phone ?? ''} placeholder="+971…" /></div>
              <div className="field"><label htmlFor="vu">Quote valid until</label><input id="vu" name="validUntil" type="date" defaultValue={a.validUntil ?? ''} /></div>
              <div className="field" style={{ alignSelf: 'end' }}><button className="btn btn-gold" type="submit">Save</button></div>
            </form>
          </section>
          <section className="panel" id="payments">
            <div className="panel-h"><h2>Payments</h2><Link className="btn btn-sm" href="/admin/payments/">Online payment settings</Link></div>
            {a.payments.length === 0 ? <p className="empty">No payment requests yet.</p> : (
              <div className="files">
                {a.payments.map((p) => (
                  <div className="file" key={p.id}>
                    <span className="fi">AED</span>
                    <span className="fn"><b>{p.label}</b><small>{money(p.amount)} · {p.status === 'paid' ? `Paid ${day(p.paidAt)} · ${p.method} · ${p.receiptNo}` : `Requested ${day(p.createdAt)}`}{p.link && p.status === 'due' ? ' · payment link set' : ''}</small></span>
                    <span className={`pill ${p.status}`}>{p.status}</span>
                    {p.status === 'paid' && <a className="btn btn-sm" href={`${link}receipt/${p.id}/pdf/`} target="_blank" rel="noopener">Receipt PDF</a>}
                    {p.status === 'due' && (
                      <>
                        <CopyButton text={`${link}pay/${p.id}/`} label="Copy pay link" />
                        <form action={markPaid} className="row">{H}<input type="hidden" name="pid" value={p.id} /><select name="method" style={{ width: 120, minHeight: 34 }}><option>Card</option><option>Bank transfer</option><option>Cash</option></select><button className="btn btn-sm btn-gold" type="submit">Mark paid</button></form>
                        <form action={removePayment}>{H}<input type="hidden" name="pid" value={p.id} /><button className="btn btn-sm btn-ghost btn-danger" type="submit" aria-label="Remove request">✕</button></form>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <details className="more" style={{ marginTop: 14 }} open={a.payments.length === 0}>
              <summary>+ Request a payment</summary>
              <ActionForm action={addPayment} className="form" reset>
                {H}
                <div className="field"><label htmlFor="plabel">Description</label><input id="plabel" name="label" defaultValue={a.payments.length ? '' : 'Government fees and service fee'} /></div>
                <div className="field"><label htmlFor="pamount">Amount (AED)</label><input id="pamount" name="amount" inputMode="decimal" defaultValue={a.payments.length || !quoteTotal ? '' : quoteTotal.toFixed(2)} /></div>
                <div className="field full"><label htmlFor="plink">Secure payment link (from your card provider, optional)</label><input id="plink" name="link" type="url" placeholder="https://" /></div>
                <div className="full"><Submit>Add payment request</Submit></div>
              </ActionForm>
            </details>
          </section>

          {/* DOCUMENTS */}
          <section className="panel" id="documents">
            <div className="panel-h"><h2>Documents</h2><span className="muted small">{a.documents.length} files</span></div>
            {a.documents.length === 0 ? <p className="empty">No documents yet.</p> : (
              <div className="files">
                {a.documents.map((d) => (
                  <div className="file" key={d.id}>
                    <span className="fi">{d.file.split('.').pop()?.toUpperCase().slice(0, 4)}</span>
                    <span className="fn"><b>{d.name}</b><small>{d.by === 'client' ? 'From client' : 'From team'} · {sizeLabel(d.size)} · {when(d.at)}</small></span>
                    {d.by === 'team' && <form action={toggleShare}>{H}<input type="hidden" name="doc" value={d.id} /><button className="btn btn-sm" type="submit">{d.shared ? 'Shared ✓' : 'Share with client'}</button></form>}
                    <a className="btn btn-sm" href={`/admin/files/${a.id}/${d.id}/`}>Download</a>
                  </div>
                ))}
              </div>
            )}
            <div className="grid2" style={{ marginTop: 16 }}>
              <ActionForm action={uploadTeamDoc} className="stack" reset>
                {H}
                <span className="lbl">Upload a document</span>
                <input name="label" placeholder="Name, e.g. Valuation certificate" />
                <input name="file" type="file" required />
                <label className="row small"><input type="checkbox" name="shared" defaultChecked /> Share with the client</label>
                <Submit className="btn">Upload</Submit>
              </ActionForm>
              <ActionForm action={setRequests} className="stack">
                {H}
                <span className="lbl">Documents the client must upload (one per line)</span>
                <textarea name="requests" defaultValue={a.requests.join('\n') || 'Passport copy\nPassport photo\nEmirates ID (if inside the UAE)\nTitle deed'} />
                <label className="row small"><input type="checkbox" name="notify" /> Message the client with this list</label>
                <Submit className="btn">Save list</Submit>
              </ActionForm>
            </div>
          </section>
        </div>

        <div className="stack">
          {/* MESSAGES */}
          <section className="panel" id="messages">
            <div className="panel-h"><h2>Messages</h2><a className="btn btn-sm btn-wa" href={waTo(a.client.phone, `Hello ${first}, `)} target="_blank" rel="noopener">WhatsApp</a></div>
            <div className="thread">
              {a.messages.length === 0 ? <p className="muted small" style={{ margin: 0 }}>No messages yet.</p> : a.messages.map((m) => (
                <div key={m.id} className={`msg${m.by === 'team' ? ' mine' : ''}`}>{m.by === 'client' && !m.read && <span className="pill new" style={{ marginBottom: 4 }}>New</span>} {m.text}<span className="meta">{m.by === 'team' ? 'Team' : first} · {when(m.at)}</span></div>
              ))}
            </div>
            <ActionForm action={teamMessage} className="stack" reset>
              {H}
              <div style={{ height: 4 }} />
              <textarea name="text" placeholder="Write to the client. It appears in their portal." />
              <Submit>Send message</Submit>
            </ActionForm>
          </section>

          {/* CLIENT */}
          <section className="panel" id="client">
            <h2>Client details</h2>
            <ActionForm action={saveClient} className="form" >
              {H}
              <div style={{ height: 4 }} className="full" />
              <div className="field"><label htmlFor="cname">Name</label><input id="cname" name="name" defaultValue={a.client.name} /></div>
              <div className="field"><label htmlFor="cphone">WhatsApp</label><input id="cphone" name="phone" defaultValue={a.client.phone} /></div>
              <div className="field"><label htmlFor="cemail">Email</label><input id="cemail" name="email" defaultValue={a.client.email} /></div>
              <div className="field"><label htmlFor="cnat">Nationality</label><input id="cnat" name="nationality" defaultValue={a.client.nationality} /></div>
              <div className="field"><label htmlFor="croute">Route</label><select id="croute" name="route" defaultValue={a.route}>{[...new Set([a.route, ...ROUTE_LABELS])].map((r) => <option key={r}>{r}</option>)}</select></div>
              <div className="field"><label htmlFor="cloc">Location</label><select id="cloc" name="location" defaultValue={a.location}><option value="in">Inside the UAE</option><option value="out">Outside the UAE</option></select></div>
              <div className="field"><label htmlFor="cad">Adults</label><input id="cad" name="adults" type="number" min={0} max={10} defaultValue={a.adults} /></div>
              <div className="field"><label htmlFor="ckid">Children</label><input id="ckid" name="kids" type="number" min={0} max={10} defaultValue={a.kids} /></div>
              <div className="field full"><label htmlFor="clang">Language</label><input id="clang" name="language" defaultValue={a.client.language} /></div>
              <div className="field full"><label htmlFor="cnotes">Private notes (never shown to the client)</label><textarea id="cnotes" name="notes" defaultValue={a.notes} /></div>
              <div className="full"><Submit className="btn">Save details</Submit></div>
            </ActionForm>
          </section>

          <section className="panel">
            <h2>Portal access</h2>
            <p className="small muted">Anyone with the link can open this file. Make a new link if it was shared by mistake.</p>
            <code style={{ display: 'block', padding: 10, borderRadius: 12, background: '#fbf4df', fontSize: 12.5, overflowWrap: 'anywhere' }}>{link}</code>
            <div className="row" style={{ marginTop: 12 }}>
              <form action={newPortalLink}>{H}<button className="btn btn-sm" type="submit">Make a new link</button></form>
              <form action={archiveApplication}>{H}<button className="btn btn-sm btn-ghost" type="submit">{a.archived ? 'Restore application' : 'Archive application'}</button></form>
              <form action={deleteItems}><input type="hidden" name="kind" value="applications" /><input type="hidden" name="id" value={a.id} /><input type="hidden" name="detail" value="1" /><DeleteButton label="Delete application" confirm="Delete for ever? Click again" /></form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
