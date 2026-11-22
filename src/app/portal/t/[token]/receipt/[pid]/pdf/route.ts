import { NextResponse } from 'next/server';
import { receiptPdfFor } from '@/lib/server/receipt-pdf';
import { getApplicationByToken } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

/** Official payment receipt as a PDF (also sent as a WhatsApp attachment). */
export async function GET(_: Request, { params }: { params: Promise<{ token: string; pid: string }> }) {
  const { token, pid } = await params;
  const a = await getApplicationByToken(token);
  const p = a?.payments.find((x) => x.id === pid && x.status === 'paid');
  if (!a || !p) return new NextResponse('Not found', { status: 404 });
  const pdf = await receiptPdfFor(a, p);
  return new NextResponse(Buffer.from(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="Payment-Receipt-${p.receiptNo}.pdf"`, 'Cache-Control': 'private, no-store' } });
}
