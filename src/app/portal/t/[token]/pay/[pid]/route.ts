import { NextResponse, type NextRequest } from 'next/server';
import { byToken, fileUrl, getPayCfg, online, startCheckout } from '@/lib/server/payments';
import { updateApplication } from '@/lib/server/store';
import { waLink } from '@/lib/site';

export const dynamic = 'force-dynamic';

/** "Pay now": opens the card payment page of the active provider (or the manual payment link). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string; pid: string }> }) {
  const { token, pid } = await params;
  const hit = await byToken(token, pid);
  const file = fileUrl(req.headers, token);
  if (!hit) return NextResponse.redirect(file, 303);
  const { a, p } = hit;
  if (p.status === 'paid') return NextResponse.redirect(`${file}pay/${pid}/return/`, 303);
  const cfg = await getPayCfg();
  if (!online(cfg)) return NextResponse.redirect(p.link || waLink(`Hello, I would like to pay ${p.label} for ${a.ref}.`), 303);
  try {
    const { url, gw } = await startCheckout(a, p, file);
    if (!url) throw new Error('No payment page returned.');
    await updateApplication(a.id, (x) => { const q = x.payments.find((y) => y.id === pid); if (q) { q.gw = gw; q.tries = (q.tries ?? 0) + 1; } });
    return NextResponse.redirect(url, 303);
  } catch (e) {
    console.error('Checkout not started', (e as Error).message);
    return NextResponse.redirect(`${file}?payerror=1#payments`, 303);
  }
}
