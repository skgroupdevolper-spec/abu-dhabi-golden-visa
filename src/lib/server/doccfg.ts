import 'server-only';
// What the team controls on the PDFs (quote, receipt) and on every email sent to clients and the team.
// Edited in Admin > Emails & PDFs. Empty text fields fall back to the defaults below.
import { getBlock } from './settings';

export type PdfCfg = {
  accent: string; showLogo: boolean; showDate: boolean;
  quoteTitle: string; quoteLabel: string; receiptTitle: string; receiptLabel: string;
  intro: string; notes: string;
  showTimeline: boolean; showChecklist: boolean; showAssumptions: boolean; showDisclaimer: boolean;
  signName: string; signTitle: string;
  footer: string; pageNumbers: boolean;
};
export type MailCfg = {
  accent: string; headerTitle: string; buttonLabel: string; showWhatsApp: boolean; whatsAppLabel: string;
  helpText: string; signOff: string; footer: string; showSocial: boolean; showContact: boolean;
};
export type DocCfg = { pdf: PdfCfg; mail: MailCfg };

export const DOC0: DocCfg = {
  pdf: {
    accent: '#b8901f', showLogo: true, showDate: true,
    quoteTitle: 'Abu Dhabi Golden Visa quotation', quoteLabel: 'QUOTATION', receiptTitle: 'Payment receipt', receiptLabel: 'PAYMENT RECEIPT',
    intro: '', notes: '',
    showTimeline: true, showChecklist: true, showAssumptions: true, showDisclaimer: false,
    signName: '', signTitle: '',
    footer: '', pageNumbers: true,
  },
  mail: {
    accent: '#b8901f', headerTitle: 'Client update', buttonLabel: 'Open your dashboard', showWhatsApp: true, whatsAppLabel: 'Chat on WhatsApp',
    helpText: 'Have a question or need help?', signOff: 'Kind regards,\nAbu Dhabi Golden Visa', footer: '', showSocial: true, showContact: true,
  },
};

export async function docCfg(): Promise<DocCfg> {
  const c = await getBlock<Partial<DocCfg>>('doccfg', {});
  return { pdf: { ...DOC0.pdf, ...c.pdf }, mail: { ...DOC0.mail, ...c.mail } };
}

export const hexOk = (v: string, d: string) => (/^#[0-9a-f]{6}$/i.test(v.trim()) ? v.trim() : d);
