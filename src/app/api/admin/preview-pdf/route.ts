import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/server/auth';
import { quotePdf } from '@/lib/server/pdf';
import { getFees } from '@/lib/server/store';
import { TIMELINE, CHECKLISTS } from '@/lib/checklists';

export const dynamic = 'force-dynamic';

/** Sample quote or receipt with the saved PDF settings (Admin > Emails & PDFs). */
export async function GET(req: Request) {
  if (!(await currentAdmin())) return new NextResponse('Not allowed', { status: 401 });
  const receipt = new URL(req.url).searchParams.get('kind') === 'receipt';
  const fees = await getFees();
  const pdf = receipt
    ? await quotePdf({ kind: 'receipt', title: 'Payment receipt', label: 'PAYMENT RECEIPT', name: 'Sample Client', ref: 'RCPT-0001 - Application ADGV-0001', desc: 'Golden Visa: property investor. Received with thanks. All amounts in AED.', lines: [['Government fees (part 1)', '4,000.00'], ['Payment method', 'Card'], ['Transaction', 'TX123456'], ['Date (UAE time)', new Date().toLocaleString('en-GB')]], total: 'AED 4,000.00 PAID', date: '', assumptions: ['This receipt confirms payment received. Visa issuance is decided by the UAE authorities.'] })
    : await quotePdf({ kind: 'quote', title: 'Abu Dhabi Golden Visa quotation', name: 'Sample Client', ref: 'ADGV-0001', desc: 'Golden Visa: property investor - Inside the UAE - 2 people', lines: [['Entry permit / change of status', '1,250.00'], ['Emirates ID (10 years)', '1,170.00'], ['Medical fitness test', '700.00'], ['Service fee', '3,500.00'], ['VAT 5% on service fee', '175.00']], total: 'AED 6,795.00', checklist: CHECKLISTS.property, timeline: TIMELINE, date: fees.date, assumptions: fees.assumptions });
  return new NextResponse(Buffer.from(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="sample-${receipt ? 'receipt' : 'quote'}.pdf"`, 'Cache-Control': 'no-store' } });
}
