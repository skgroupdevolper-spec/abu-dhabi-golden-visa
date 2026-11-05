import { NextResponse, type NextRequest } from 'next/server';
import { quotePdf } from '@/lib/server/pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const str = (v: unknown, n = 200) => (typeof v === 'string' ? v.slice(0, n) : '');
const arr = (v: unknown, n = 40) => (Array.isArray(v) ? v.slice(0, n).map((x) => str(x, 240)) : []);

/** Branded, itemised PDF quote from the calculator result (spec 8 and 16). */
export async function POST(req: NextRequest) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const lines = (Array.isArray(b.lines) ? b.lines : []).slice(0, 80).map((l) => (Array.isArray(l) ? [str(l[0], 160), str(l[1], 40)] : ['', ''])) as [string, string][];
  if (!lines.length) return NextResponse.json({ error: 'No lines' }, { status: 400 });
  const pdf = await quotePdf({ name: str(b.name, 80), desc: str(b.desc, 240), lines, total: str(b.total, 40), converted: str(b.converted, 80) || null, checklist: arr(b.checklist), timeline: arr(b.timeline, 12), date: str(b.date, 40), assumptions: arr(b.assumptions, 10) });
  return new NextResponse(Buffer.from(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="Abu-Dhabi-Golden-Visa-quote.pdf"', 'Cache-Control': 'no-store' } });
}
