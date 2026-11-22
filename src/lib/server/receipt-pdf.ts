import 'server-only';
import { quotePdf } from '@/lib/server/pdf';
import type { Application, Payment } from '@/lib/server/store';
import { SITE } from '@/lib/site';
import { money } from '@/lib/stages';

/** Official payment receipt PDF: the same one the client downloads, attached to the email and the WhatsApp message. */
export async function receiptPdfFor(a: Application, p: Payment) {
  const paid = p.paidAt ? new Date(p.paidAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai' }) : '';
  return quotePdf({
    kind: 'receipt', title: 'Payment receipt', label: 'PAYMENT RECEIPT', name: a.client.name, ref: `${p.receiptNo} · Application ${a.ref}`,
    desc: `${a.route}. Received with thanks. All amounts in AED.`,
    lines: [[p.label, p.amount.toFixed(2)], ...(p.fee ? [[`Card fee (${p.card === 'intl' ? 'international card' : 'UAE card'})`, p.fee.toFixed(2)] as [string, string]] : []), ['Payment method', p.method || 'Card'], ['Transaction', p.txn || '-'], ['Date (UAE time)', paid]],
    total: `${money(p.amount + (p.fee || 0))} PAID`, date: paid,
    assumptions: [`${SITE.operator} - Trade Licence ${SITE.licence} - ${SITE.office}`, `${SITE.email} - ${SITE.whatsappDisplay}`, 'This receipt confirms payment received. Visa issuance is decided by the UAE authorities.'],
  });
}
