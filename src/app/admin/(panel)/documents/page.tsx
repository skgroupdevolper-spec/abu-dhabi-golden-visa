import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { docCfg } from '@/lib/server/doccfg';
import { list } from '@/lib/server/collections';
import type { MailLog } from '@/lib/server/mail';
import { when } from '@/lib/stages';
import { saveDocCfg, saveNoteMail } from '../../settings-actions';
import { getBlock } from '@/lib/server/settings';
import { MAIL_EVENTS } from '@/lib/mail-events';

export const metadata: Metadata = { title: 'Emails & PDFs' };
export const dynamic = 'force-dynamic';

export default async function Documents() {
  await requireAdmin(FULL);
  const { pdf, mail } = await docCfg();
  const log = (await list<MailLog>('mail-log')).slice(0, 40);
  const nm = await getBlock<{ on?: boolean; kinds?: Record<string, boolean> }>('note-mail', {});
  const NK: [string, string][] = [['message', 'Client messages'], ['upload', 'Documents uploaded'], ['payment', 'Payments'], ['quote', 'Quote accepted'], ['request', 'Client requests'], ['customer', 'New client accounts'], ['whatsapp', 'WhatsApp from clients and website contacts'], ['chat', 'Website chat']];
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Emails &amp; PDFs</p><h1>Your quotes, receipts and emails, <span className="gold">your way.</span></h1></div></div>

      <div className="panel" style={{ maxWidth: 900 }}>
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0 }}>PDF quote and receipt</h2>
          <div className="row" style={{ gap: 8 }}>
            <a className="btn btn-sm" href="/api/admin/preview-pdf/" target="_blank" rel="noopener">Preview quote ↗</a>
            <a className="btn btn-sm" href="/api/admin/preview-pdf/?kind=receipt" target="_blank" rel="noopener">Preview receipt ↗</a>
          </div>
        </div>
        <p className="help">Save first, then open a preview. Empty fields use the standard text.</p>
        <ActionForm action={saveDocCfg} className="form">
          <input type="hidden" name="which" value="pdf" />
          <F name="quoteTitle" label="Quote title" value={pdf.quoteTitle} />
          <F name="quoteLabel" label="Quote label (top right)" value={pdf.quoteLabel} />
          <F name="receiptTitle" label="Receipt title" value={pdf.receiptTitle} />
          <F name="receiptLabel" label="Receipt label (top right)" value={pdf.receiptLabel} />
          <F name="accent" label="Accent colour" value={pdf.accent} type="color" help="Headings and the label" />
          <div />
          <F name="intro" label="Intro text under the title" value={pdf.intro} type="textarea" rows={3} full placeholder="e.g. Thank you for choosing us. Below is your personalised quotation." />
          <F name="notes" label="Notes / terms section" value={pdf.notes} type="textarea" rows={4} full placeholder="e.g. Quote valid for 7 days. 50% payable to start, balance before submission." />
          <F name="signName" label="Signature name" value={pdf.signName} placeholder="e.g. Muhammad Naveed" />
          <F name="signTitle" label="Signature title" value={pdf.signTitle} placeholder="e.g. Senior Visa Advisor" />
          <F name="footer" label="Footer text (every page)" value={pdf.footer} type="textarea" rows={2} full help="Centred at the bottom of every page, up to 3 lines. Empty = company name, licence, office, WhatsApp and email." />
          <div className="full"><Toggle name="showLogo" label="Show the logo" on={pdf.showLogo} /></div>
          <div className="full"><Toggle name="showDate" label="Show the date" on={pdf.showDate} /></div>
          <div className="full"><Toggle name="showTimeline" label="Show the timeline (quote)" on={pdf.showTimeline} /></div>
          <div className="full"><Toggle name="showChecklist" label="Show the document checklist (quote)" on={pdf.showChecklist} /></div>
          <div className="full"><Toggle name="showAssumptions" label="Show assumptions / details" on={pdf.showAssumptions} /></div>
          <div className="full"><Toggle name="showDisclaimer" label="Show the website disclaimer" on={pdf.showDisclaimer} /></div>
          <div className="full"><Toggle name="pageNumbers" label="Page numbers (when more than one page)" on={pdf.pageNumbers} /></div>
          <div className="full"><Submit>Save PDF settings</Submit></div>
        </ActionForm>
      </div>

      <div className="panel" style={{ maxWidth: 900, marginTop: 18 }}>
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0 }}>Emails</h2>
          <a className="btn btn-sm" href="/api/admin/preview-mail/" target="_blank" rel="noopener">Preview email ↗</a>
        </div>
        <p className="help">Every email (status updates, quotes, payments, applications, team notices) goes out as a branded card in your white, gold and black colours.</p>
        <ActionForm action={saveDocCfg} className="form">
          <input type="hidden" name="which" value="mail" />
          <F name="headerTitle" label="Header text (top right)" value={mail.headerTitle} />
          <F name="accent" label="Accent colour" value={mail.accent} type="color" />
          <F name="buttonLabel" label="Main button text" value={mail.buttonLabel} />
          <F name="whatsAppLabel" label="WhatsApp button text" value={mail.whatsAppLabel} />
          <F name="helpText" label="Text above the WhatsApp button" value={mail.helpText} full />
          <F name="signOff" label="Sign-off" value={mail.signOff} type="textarea" rows={2} />
          <F name="footer" label="Bottom bar text" value={mail.footer} type="textarea" rows={2} help="Empty = © year, company name and office" />
          <div className="full"><Toggle name="showWhatsApp" label="Show the WhatsApp button and phone" on={mail.showWhatsApp} /></div>
          <div className="full"><Toggle name="showContact" label="Show office, WhatsApp and email" on={mail.showContact} /></div>
          <div className="full"><Toggle name="showSocial" label="Show social links" on={mail.showSocial} /></div>
          <div className="full"><Submit>Save email settings</Submit></div>
        </ActionForm>
      </div>

      <div className="panel" style={{ maxWidth: 900, marginTop: 18 }} id="messages">
        <h2 style={{ margin: 0 }}>Email messages</h2>
        <p className="help">The email sent for each event. Use the words in braces, e.g. {'{name}'} or {'{ref}'}; they are filled in for each client. A line like “Amount: {'{amount}'}” shows as a neat table row (left out when empty), and a line with only {'{link}'} becomes a gold button. Emails are sent in the background, so saving never waits for them.</p>
        <ActionForm action={saveDocCfg} className="form">
          <input type="hidden" name="which" value="events" />
          {MAIL_EVENTS.map((e) => {
            const t = mail.events[e.key];
            return (
              <details key={e.key} className="full mail-ev" style={{ border: '1px solid var(--line, #eee3c8)', borderRadius: 10, padding: '10px 14px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{e.label} <span className={`pill ${t.on ? 'ok' : 'closed'}`} style={{ marginLeft: 8 }}>{t.on ? 'on' : 'off'}</span> <small className="muted">to {e.to === 'team' ? 'your team' : 'the client'}</small></summary>
                <div className="form" style={{ marginTop: 10 }}>
                  <div className="full"><Toggle name={`${e.key}_on`} label="Send this email" on={t.on} /></div>
                  <F name={`${e.key}_subject`} label="Subject" value={t.subject} />
                  <F name={`${e.key}_badge`} label="Gold line under the logo" value={t.badge} />
                  <F name={`${e.key}_body`} label="Message" value={t.body} type="textarea" rows={9} full help={<>Words you can use: {e.vars}</>} />
                </div>
              </details>
            );
          })}
          <div className="full"><Submit>Save email messages</Submit></div>
        </ActionForm>
      </div>
      <div className="panel" style={{ maxWidth: 900, marginTop: 18 }} id="notify">
        <h2 style={{ margin: 0 }}>Email me the admin notifications</h2>
        <p className="help">Every notification in the admin also arrives by email: to the staff member it is for, otherwise to “Send website notifications to” (Settings → Email). New enquiries, applications and bookings always send their detailed email.</p>
        <ActionForm action={saveNoteMail} className="form">
          <div className="full"><Toggle name="on" label="Send notifications by email" on={nm.on !== false} /></div>
          {NK.map(([k, l]) => <div key={k}><Toggle name={`k_${k}`} label={l} on={nm.kinds?.[k] !== false} /></div>)}
          <div className="full"><Submit>Save</Submit></div>
        </ActionForm>
      </div>

      <div className="panel" style={{ maxWidth: 900, marginTop: 18 }} id="log">
        <h2 style={{ margin: 0 }}>Email log</h2>
        <p className="help">The last emails the website tried to send. A red line shows why one failed.</p>
        {log.length === 0 ? <p className="empty">No emails yet.</p> : (
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>When</th><th>To</th><th>Subject</th><th>Result</th></tr></thead>
            <tbody>{log.map((x) => <tr key={x.id}><td className="small">{when(x.at)}</td><td className="small">{x.to}</td><td className="small">{x.subject}</td><td className="small">{x.ok ? <span className="pill ok">Sent</span> : <span className="pill due" title={x.error}>Failed</span>}{!x.ok && x.error && <div className="small" style={{ color: '#b42318', maxWidth: 320 }}>{x.error}</div>}</td></tr>)}</tbody>
          </table></div>
        )}
      </div>
    </>
  );
}
