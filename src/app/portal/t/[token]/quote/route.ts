import { NextResponse } from 'next/server';
import { getApplicationByToken } from '@/lib/server/store';
import { quotePdfFor } from '@/lib/server/quote-pdf';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const a = await getApplicationByToken(token);
  if (!a || !a.quote.sentAt) return new NextResponse('Not found', { status: 404 });
  const pdf = await quotePdfFor(a);
  return new NextResponse(Buffer.from(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${a.ref}-quote.pdf"`, 'Cache-Control': 'private, no-store' } });
}
