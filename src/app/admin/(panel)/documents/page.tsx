import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { docCfg } from '@/lib/server/doccfg';
import { saveDocCfg } from '../../settings-actions';

export const metadata: Metadata = { title: 'Emails & PDFs' };
export const dynamic = 'force-dynamic';

export default async function Documents() {
  await requireAdmin(FULL);
  const { pdf, mail } = await docCfg();
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
    </>
  );
}
