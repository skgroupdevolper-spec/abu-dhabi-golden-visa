import { NextResponse, type NextRequest } from 'next/server';
import { byToken, checkStatus, methodName, settle } from '@/lib/server/payments';

export const dynamic = 'force-dynamic';

/** Polled by the "Confirming your payment" page. Asks the provider and settles the payment when paid. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const token = q.get('token') || '', pid = q.get('pid') || '';
  const hit = await byToken(token, pid);
  if (!hit) return NextResponse.json({ state: 'unknown' }, { status: 404 });
  let { p } = hit;
  if (p.status !== 'paid' && p.gw && !q.get('failed')) {
    const s = await checkStatus(p.gw, { sid: q.get('sid') || '', ref: q.get('ref') || '' });
    if (s.state === 'paid') { await settle(hit.a.id, pid, methodName(p.gw.provider), s.txn || p.gw.id); p = (await byToken(token, pid))?.p ?? p; }
    else if (s.state === 'failed') return NextResponse.json({ state: 'failed' }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (q.get('failed') && p.status !== 'paid') return NextResponse.json({ state: 'failed' });
  return NextResponse.json(p.status === 'paid' ? { state: 'paid', receipt: p.receiptNo, amount: p.amount, at: p.paidAt, method: p.method, txn: p.txn } : { state: 'pending' }, { headers: { 'Cache-Control': 'no-store' } });
}
