import { NextResponse, type NextRequest } from 'next/server';
import { getApplicationByToken } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

/** Live tracking: last change time of one client file (by its secret token). */
export async function GET(req: NextRequest) {
  const a = await getApplicationByToken(req.nextUrl.searchParams.get('token') || '');
  if (!a) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, stamp: a.updatedAt, stage: a.stage, due: a.payments.filter((p) => p.status === 'due').length }, { headers: { 'Cache-Control': 'no-store' } });
}
