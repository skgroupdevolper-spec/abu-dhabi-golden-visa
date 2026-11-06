import { NextResponse } from 'next/server';
import { quotePdf } from '@/lib/server/pdf';
import { getFees, getApplicationByToken } from '@/lib/server/store';
import { CHECKLISTS, TIMELINE } from '@/lib/checklists';
import { ROUTES } from '@/lib/fees';
import { money } from '@/lib/stages';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const a = await getApplicationByToken(token);
  if (!a || !a.quote.sentAt) return new NextResponse('Not found', { status: 404 });
  const fees = await getFees();
  const gov = a.quote.lines.reduce((s, l) => s + l.amount, 0);
  const lines: [string, string][] = [
    ...a.quote.lines.map((l): [string, string] => [(l.qty ?? 1) > 1 ? `${l.label} (${l.qty} × ${(l.unit ?? l.amount / (l.qty ?? 1)).toFixed(2)})` : l.label, l.amount.toFixed(2)]),
    ...(a.quote.serviceFee ? [['Service fee', a.quote.serviceFee.toFixed(2)] as [string, string], ['VAT 5% on service fee', a.quote.vat.toFixed(2)] as [string, string]] : []),
    ['Health insurance', a.quote.insurance],
  ];
  const route = ROUTES.find((r) => r.label === a.route)?.id ?? 'property';
  const pdf = await quotePdf({
    title: 'Abu Dhabi Golden Visa quotation', name: a.client.name, ref: a.ref,
    desc: `${a.route} - ${a.location === 'in' ? 'Inside the UAE' : 'Outside the UAE'} - ${1 + a.adults + a.kids} people`,
    lines, total: money(gov + a.quote.serviceFee + a.quote.vat), checklist: CHECKLISTS[route], timeline: TIMELINE, date: fees.date, assumptions: fees.assumptions,
  });
  return new NextResponse(Buffer.from(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${a.ref}-quote.pdf"`, 'Cache-Control': 'private, no-store' } });
}
