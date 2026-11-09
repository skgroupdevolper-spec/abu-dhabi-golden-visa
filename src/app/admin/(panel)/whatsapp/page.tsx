import type { Metadata } from 'next';
import { DeleteButton } from '@/components/dash/DeleteButton';
import { clearItems, deleteItems } from '@/app/admin/delete-actions';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Tabs, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { list, type WaLog } from '@/lib/server/collections';
import { getSecrets } from '@/lib/server/settings';
import { SITE } from '@/lib/site';
import { WaCustomList } from '@/components/dash/WaCustomList';
import { WA_EVENTS } from '@/lib/settings-schema';
import { when } from '@/lib/stages';
import { saveWhatsApp, testWhatsApp } from '../../settings-actions';

export const metadata: Metadata = { title: 'WhatsApp' };

export default async function WhatsApp({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin(FULL);
  const { tab = 'setup' } = await searchParams;
  const w = (await getSecrets()).whatsapp;
  const log = tab === 'log' ? await list<WaLog>('whatsapp-log') : [];
  const connected = w.mode === 'cloud' && !!w.phoneNumberId && !!w.accessToken;
  return (
    <>
      <div className="topbar">
        <div><p className="eyebrow">WhatsApp</p><h1>Every update, <span className="gold">on WhatsApp.</span></h1></div>
        <span className={`pill ${connected ? 'ok' : 'due'}`}>{connected ? 'Cloud API connected' : 'Link mode (buttons only)'}</span>
      </div>
      <Tabs base="/admin/whatsapp/" tabs={[['setup', 'Setup'], ['messages', 'Automatic messages'], ['test', 'Send a test'], ['log', 'Message log']]} cur={tab} />
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
              <F name="verifyToken" label="Webhook verify token (any text you choose)" value={w.verifyToken} />
              <div className="field"><label>Webhook URL (paste in Meta)</label><code className="k" style={{ padding: 12, display: 'block', overflowWrap: 'anywhere' }}>{SITE.url}/api/whatsapp/webhook</code><p className="help">Subscribe to “messages”. Client replies then appear in their application.</p></div>
              <F name="teamNumbers" label="Team numbers for new-enquiry alerts" value={w.teamNumbers} type="textarea" rows={2} help="One per line, with country code" full />
              <F name="templateLang" label="Template language code" value={w.templateLang} help="For approved templates, e.g. en, ar" />
            </div>
          </div>
          <div className="panel" style={{ display: tab === 'messages' ? 'block' : 'none' }}>
            <h2>Automatic messages</h2>
            <p className="help">Free text works within 24 hours of the client’s last message. Outside that window Meta needs an approved template: enter its name and the variables are sent in the order shown.</p>
            <div className="stack" style={{ marginTop: 14 }}>
              {WA_EVENTS.map((e) => (
                <div key={e.key} className="notice">
                  <Toggle name={`auto_${e.key}`} label={e.label} help={`Variables: ${e.vars}`} on={w.autos[e.key]} />
                  <div className="form" style={{ marginTop: 10 }}>
                    <F name={`tpl_${e.key}`} label="Message text" value={w.templates[e.key]} type="textarea" rows={2} full />
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
      {tab === 'test' && (
        <div className="panel" style={{ maxWidth: 640 }}>
          <ActionForm action={testWhatsApp} className="stack">
            <F name="to" label="Send to (with country code)" placeholder="+9715…" />
            <F name="text" label="Message" type="textarea" rows={3} value="Test message from your Abu Dhabi Golden Visa website." />
            <Submit>Send test</Submit>
          </ActionForm>
        </div>
      )}
      {tab === 'log' && (log.length === 0 ? <p className="empty">No messages yet.</p> : (<>
        {log.length > 0 && <form action={clearItems} style={{ margin: '0 0 10px' }}><input type="hidden" name="kind" value="walog" /><input type="hidden" name="scope" value="all" /><DeleteButton label="Clear the log" /></form>}
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>When</th><th>Direction</th><th>Number</th><th>Event</th><th>Message</th><th>Result</th></tr></thead><tbody>
          {log.slice(0, 300).map((l) => <tr key={l.id}><td>{when(l.at)}</td><td>{l.dir === 'in' ? 'Received' : 'Sent'}</td><td>+{l.to}</td><td>{l.event}</td><td style={{ maxWidth: 380 }}>{l.text}</td><td>{l.ok ? <span className="pill ok">OK</span> : <span className="pill due" title={l.error}>{l.error?.slice(0, 40)}</span>}</td></tr>)}
        </tbody></table></div>
      </>))}
    </>
  );
}
