import { NextResponse } from 'next/server';
import { quotePdf } from '@/lib/server/pdf';
import { getApplicationByToken } from '@/lib/server/store';
import { SITE } from '@/lib/site';
import { money } from '@/lib/stages';

export const dynamic = 'force-dynamic';

/** Official payment receipt as a PDF (also sent as a WhatsApp attachment). */
export async function GET(_: Request, { params }: { params: Promise<{ token: string; pid: string }> }) {
  const { token, pid } = await params;
  const a = await getApplicationByToken(token);
  const p = a?.payments.find((x) => x.id === pid && x.status === 'paid');
  if (!a || !p) return new NextResponse('Not found', { status: 404 });
  const paid = p.paidAt ? new Date(p.paidAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai' }) : '';
  const pdf = await quotePdf({
    kind: 'receipt', title: 'Payment receipt', label: 'PAYMENT RECEIPT', name: a.client.name, ref: `${p.receiptNo} · Application ${a.ref}`,
    desc: `${a.route}. Received with thanks. All amounts in AED.`,
    lines: [[p.label, p.amount.toFixed(2)], ['Payment method', p.method || 'Card'], ['Transaction', p.txn || '-'], ['Date (UAE time)', paid]],
    total: `${money(p.amount)} PAID`, date: paid,
    assumptions: [`${SITE.operator} - Trade Licence ${SITE.licence} - ${SITE.office}`, `${SITE.email} - ${SITE.whatsappDisplay}`, 'This receipt confirms payment received. Visa issuance is decided by the UAE authorities.'],
  });
  return new NextResponse(Buffer.from(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="Payment-Receipt-${p.receiptNo}.pdf"`, 'Cache-Control': 'private, no-store' } });
}
