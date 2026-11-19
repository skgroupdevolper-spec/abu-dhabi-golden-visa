import type { Metadata } from 'next';
import { DeleteButton } from '@/components/dash/DeleteButton';
import { Bulk, BulkCheck } from '@/components/dash/Bulk';
import { clearItems, deleteItems } from '@/app/admin/delete-actions';
import { ActionForm, CopyButton as CopyBtn, Submit } from '@/components/dash/ActionForm';
import type { ReactNode } from 'react';
import { webhookToken } from '@/lib/server/whatsapp';
import { F, Tabs, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { list, type WaLog } from '@/lib/server/collections';
import { getSecrets } from '@/lib/server/settings';
import { SITE } from '@/lib/site';
import { WaCustomList } from '@/components/dash/WaCustomList';
import { WA_EVENTS } from '@/lib/settings-schema';
import { when } from '@/lib/stages';
import { getStages } from '@/lib/server/stages';
import { WaText } from '@/components/dash/WaText';
import { waHtml } from '@/lib/wa-format';
import { STEP_SERVICES } from '@/lib/stage-defs';
import { saveWhatsApp, testWhatsApp, waTemplates } from '../../settings-actions';

export const metadata: Metadata = { title: 'WhatsApp' };

export default async function WhatsApp({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin(FULL);
  const { tab = 'setup' } = await searchParams;
  const w = (await getSecrets()).whatsapp;
  const log = tab === 'log' ? await list<WaLog>('whatsapp-log') : [];
  const stepSets = tab === 'messages' ? await Promise.all(STEP_SERVICES.map(async (g) => [g, await getStages(g)] as const)) : [];
  const connected = w.mode === 'cloud' && !!w.phoneNumberId && !!w.accessToken;
  return (
    <>
      <div className="topbar">
        <div><p className="eyebrow">WhatsApp</p><h1>Every update, <span className="gold">on WhatsApp.</span></h1></div>
        <span className={`pill ${connected ? 'ok' : 'due'}`}>{connected ? 'Cloud API connected' : 'Link mode (buttons only)'}</span>
      </div>
      <Tabs base="/admin/whatsapp/" tabs={[['setup', 'Setup'], ['messages', 'Automatic messages'], ['test', 'Send a test'], ['log', 'Message log']]} cur={tab} />
      {tab === 'setup' && (() => {
        const names = Object.values(w.templateNames ?? {}).filter(Boolean).length;
        const waba = encodeURIComponent(w.businessId || '');
        const L = (href: string, t: string) => <a className="btn btn-sm" href={href} target="_blank" rel="noopener noreferrer">{t} ↗</a>;
        const steps: [boolean, string, string, ReactNode?][] = [
          [!!w.phoneNumberId && !!w.businessId, 'Phone number ID and Business account ID', 'Meta for Developers → your app → WhatsApp → API setup.', <><ActionForm action={waTemplates} className="wa-inline"><input type="hidden" name="do" value="check" /><Submit className="btn btn-sm btn-gold">Check connection</Submit></ActionForm> <ActionForm action={waTemplates} className="wa-inline"><input type="hidden" name="do" value="register" /><input name="pin" inputMode="numeric" pattern="\d{6}" maxLength={6} placeholder="6-digit PIN" style={{ width: 110 }} aria-label="6-digit PIN" /> <Submit className="btn btn-sm">Register number</Submit></ActionForm> {L('https://developers.facebook.com/apps/', 'Open my Meta apps')}</>],
          [!!w.accessToken, 'Permanent access token', 'Business settings → System users → Add (Admin) → assign your app → Generate token with whatsapp_business_messaging and whatsapp_business_management, “Never expires”. The 24-hour test token stops working the next day.', L('https://business.facebook.com/settings/system-users', 'Open System users')],
          [w.mode === 'cloud', 'Mode set to “Cloud API”', 'Choose “Cloud API: send automatic messages” below and press Save.'],
          [!!(w.webhookSubscribedAt || w.lastIncomingAt), `Webhook connected${w.webhookVerifiedAt ? ' · verified by Meta ✓' : ''}${w.webhookSubscribedAt || w.lastIncomingAt ? ' · incoming messages ✓' : ' · incoming messages not connected'}`, `Webhook URL: ${SITE.url}/api/whatsapp/webhook/ (with the / at the end) · Verify token: ${webhookToken(w)}. Then open your app → WhatsApp → Configuration → Webhook → Edit, paste both, press “Verify and save”, then Subscribe to “messages”. Press Save here too, then “Connect incoming messages” (links your number to the app so replies reach the website).`, <><ActionForm action={waTemplates} className="wa-inline"><input type="hidden" name="do" value="subscribe" /><Submit className="btn btn-sm btn-gold">Connect incoming messages</Submit></ActionForm> <CopyBtn text={`${SITE.url}/api/whatsapp/webhook/`} label="Copy webhook URL" /> {L('https://developers.facebook.com/apps/', 'Open my Meta apps')}</>],
          [names > 0, `Approved message templates (${names} of 9 filled in)`, 'One click sends all 9 ready-made templates (Utility, English) to Meta. Approval usually takes minutes; then press “Check approval” and the names fill in by themselves.', <><ActionForm action={waTemplates} className="wa-inline"><input type="hidden" name="do" value="create" /><Submit className="btn btn-sm btn-gold">Create all templates in Meta</Submit></ActionForm> <ActionForm action={waTemplates} className="wa-inline"><input type="hidden" name="do" value="sync" /><Submit className="btn btn-sm">Check approval</Submit></ActionForm> {w.businessId && L(`https://business.facebook.com/wa/manage/message-templates/?waba_id=${waba}`, 'Open templates in Meta')}</>],
        ];
        const doneN = steps.filter((x) => x[0]).length;
        return (
          <div className="panel wa-check" style={{ marginBottom: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}><h2 style={{ margin: 0 }}>Setup checklist</h2><span className={`pill ${doneN === steps.length ? 'ok' : 'due'}`}>{doneN} of {steps.length} done</span></div>
            <ol style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'grid', gap: 10 }}>
              {steps.map(([ok, t, how, link], i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ flex: 'none', width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, background: ok ? 'linear-gradient(135deg,#f3d77e,#c9961a)' : 'transparent', border: ok ? '0' : '1.5px solid #d9c48a', color: '#111' }}>{ok ? '✓' : i + 1}</span>
                  <div style={{ flex: 1 }}><b>{t}</b>{!ok && <p className="help" style={{ margin: '2px 0 6px' }}>{how}</p>}{link && <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 4 }}>{link}</div>}</div>
                </li>
              ))}
            </ol>
            <p className="help" style={{ marginTop: 12 }}>When all steps are done, open “Send a test” and send to your own number. Also make sure the number is registered (display name approved) and a payment method is added: {w.businessId && <a href={`https://business.facebook.com/wa/manage/phone-numbers/?waba_id=${waba}`} target="_blank" rel="noopener noreferrer">phone numbers ↗</a>} · <a href="https://business.facebook.com/billing_hub/payment_settings" target="_blank" rel="noopener noreferrer">payment settings ↗</a></p>
          </div>
        );
      })()}
      {(tab === 'setup' || tab === 'messages') && (
        <ActionForm action={saveWhatsApp} className="stack">
          <div className="panel" style={{ display: tab === 'setup' ? 'block' : 'none' }}>
            <h2>Connection</h2>
            <p className="help">Website buttons always open WhatsApp with your number ({SITE.whatsappDisplay}, change it in Site settings). To send messages automatically, connect the WhatsApp Business Cloud API from Meta.</p>
            <div className="form" style={{ marginTop: 14 }}>
              <div className="field full"><label htmlFor="mode">Mode</label><select id="mode" name="mode" defaultValue={w.mode}><option value="link">Link mode: buttons open WhatsApp, no automatic sending</option><option value="cloud">Cloud API: send automatic messages</option></select></div>
              <F name="phoneNumberId" label="Phone number ID" value={w.phoneNumberId} help="Meta Business → WhatsApp → API setup" />
              <F name="businessId" label="WhatsApp Business account ID" value={w.businessId} />
              <F name="accessToken" label="Permanent access token" type="password" help={w.accessToken ? `Saved (…${w.accessToken.slice(-4)}). Leave empty to keep it.` : 'Create a system-user token with whatsapp_business_messaging permission.'} full />
              <F name="verifyToken" label="Webhook verify token (any text you choose)" value={webhookToken(w)} help={w.verifyToken ? 'Use exactly this word in Meta.' : 'Ready to use: put exactly this word in Meta (it works even before you press Save).'} />
              <div className="field"><label>Webhook URL (paste in Meta)</label><code className="k" style={{ padding: 12, display: 'block', overflowWrap: 'anywhere' }}>{SITE.url}/api/whatsapp/webhook/</code><p className="help">Subscribe to “messages”. Client replies then appear in their application.</p></div>
              <F name="teamNumbers" label="Company numbers for alerts (enquiries, applications, appointments)" value={w.teamNumbers} type="textarea" rows={2} help="One per line, with country code" full />
              <div className="full"><input type="hidden" name="copyTeam_present" value="1" /><Toggle name="copyTeam" label="Copy client messages to team numbers" help="The team numbers above also receive every update sent to a client (welcome, status, quote, payment), exactly as the client sees it." on={w.copyTeam !== false} /></div>
              <fieldset className="full pay-keys"><legend>⭐ Google review request</legend>
                <input type="hidden" name="reviewUrl_present" value="1" />
                <F name="reviewUrl" label="Your Google review link" value={w.reviewUrl ?? ''} placeholder="https://g.page/r/…/review" help="Google Business Profile → Ask for reviews → copy the link. Empty = your Google Maps listing (Site settings)." full />
                <div className="full"><Toggle name="reviewAuto" label="Ask for a review when a file reaches its last step" help="Sent once per file on WhatsApp: thank-you, the Google Reviews picture and a “Leave a Google review” button. The text is under Automatic messages." on={w.reviewAuto !== false} /></div>
              </fieldset>
              <F name="templateLang" label="Template language code" value={w.templateLang} help="For approved templates, e.g. en, ar" />
            </div>
          </div>
          <div className="panel" style={{ display: tab === 'messages' ? 'block' : 'none' }}>
            <h2>Automatic messages</h2>
            <p className="help">Free text works within 24 hours of the client’s last message. Outside that window Meta needs an approved template: enter its name and the variables are sent in the order shown.</p>
            <div className="notice ok" style={{ marginTop: 12 }}>
              <input type="hidden" name="useMailText_present" value="1" />
              <Toggle name="useMailText" label="Use the email text for client messages" help="On: WhatsApp sends the same friendly message as the email (Admin > Emails & PDFs > Email messages), e.g. “Hello Muhammad, Thank you for choosing us. We have received your application…”. Off: the short texts below are used." on={w.useMailText !== false} />
            </div>
            <div className="stack" style={{ marginTop: 14 }}>
              {WA_EVENTS.map((e) => (
                <div key={e.key} className="notice">
                  <Toggle name={`auto_${e.key}`} label={e.label} help={`Variables: ${e.vars}`} on={w.autos[e.key]} />
                  <div className="form" style={{ marginTop: 10 }}>
                    <WaText name={`tpl_${e.key}`} label="Message text" value={w.templates[e.key]} rows={3} help="Bold, italic, lists and emojis show on WhatsApp. A new line (or <br>) starts a new line. WhatsApp has no colours." />
                    <F name={`name_${e.key}`} label="Approved template name (optional)" value={w.templateNames[e.key] ?? ''} />
                  </div>
                </div>
              ))}
            </div>
            <WaCustomList initial={w.customs ?? []} events={WA_EVENTS.map((e) => ({ key: e.key, label: e.label, vars: e.vars }))} />
          </div>
          <div><Submit>Save WhatsApp settings</Submit></div>
        </ActionForm>
      )}
      {tab === 'messages' && (
        <div className="panel" style={{ marginTop: 18 }} id="steps">
          <h2 style={{ marginTop: 0 }}>Step messages, one for every step of every service</h2>
          <p className="help">When you change a file&rsquo;s step (with &ldquo;Tell the client&rdquo; ticked), the client gets that step&rsquo;s message on WhatsApp and by email: &ldquo;Hello &#123;name&#125;, update on &#123;ref&#125;: &#123;step&#125;. Next: &#123;message&#125;&rdquo;. Steps marked <span className="pill closed">off</span> only update the client dashboard. Change the texts and the on/off in Application steps.</p>
          {stepSets.map(([svc, steps]) => (
            <details key={svc} className="mail-ev" style={{ border: '1px solid var(--line, #eee3c8)', borderRadius: 12, padding: '10px 14px', marginTop: 10 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{svc} <small className="muted">· {steps.length} steps · {steps.filter((x) => x.notify !== false).length} send WhatsApp</small></summary>
              <ol className="wa-steps">
                {steps.map((x) => (
                  <li key={x.id}><b>{x.name}</b> <span className={`pill ${x.notify !== false ? 'ok' : 'closed'}`}>{x.notify !== false ? 'WhatsApp + email' : 'off'}</span><div className="wt-bub wt-bub-sm" dangerouslySetInnerHTML={{ __html: waHtml(x.next) }} /></li>
                ))}
              </ol>
              <a className="btn btn-sm" href={`/admin/steps/?svc=${encodeURIComponent(svc)}`}>Edit {svc} steps and messages</a>
            </details>
          ))}
        </div>
      )}
      {tab === 'test' && (
        <div className="panel" style={{ maxWidth: 640 }}>
          <ActionForm action={testWhatsApp} className="stack">
            <F name="to" label="Send to (with country code)" placeholder="+9715…" />
            <F name="text" label="Message" type="textarea" rows={3} value="Test message from your Abu Dhabi Golden Visa website." />
            <div className="field"><label htmlFor="mode">Send as</label><select id="mode" name="mode" defaultValue="template"><option value="template">Approved template (works any time, like real client updates)</option><option value="text">Plain text (only if they wrote to you in the last 24 h)</option></select></div>
            <Submit>Send test</Submit>
          </ActionForm>
        </div>
      )}
      {tab === 'log' && (log.length === 0 ? <p className="empty">No messages yet.</p> : (<>
        {log.length > 0 && <form action={clearItems} style={{ margin: '0 0 10px' }}><input type="hidden" name="kind" value="walog" /><input type="hidden" name="scope" value="all" /><DeleteButton label="Clear the log" /></form>}
        <Bulk kind="walog" what="messages"><div className="tbl-wrap"><table className="tbl"><thead><tr><th className="bulk-td" /><th>When</th><th>Direction</th><th>Number</th><th>Event</th><th>Message</th><th>Result</th></tr></thead><tbody>
          {log.slice(0, 300).map((l) => <tr key={l.id}><td className="bulk-td"><BulkCheck id={l.id} /></td><td>{when(l.at)}</td><td>{l.dir === 'in' ? 'Received' : 'Sent'}</td><td>+{l.to}</td><td>{l.event}</td><td style={{ maxWidth: 380 }}>{l.text}</td><td style={{ maxWidth: 320 }}>{l.ok ? <span className={`pill ${l.st === 'read' || l.st === 'delivered' ? 'ok' : 'new'}`}>{l.dir === 'in' ? 'OK' : l.st === 'read' ? 'Read' : l.st === 'delivered' ? 'Delivered' : 'Sent'}</span> : <><span className="pill due">Failed</span><div className="small" style={{ color: '#b42318', marginTop: 4 }}>{l.error}</div></>}</td></tr>)}
        </tbody></table></div></Bulk>
      </>))}
    </>
  );
}
