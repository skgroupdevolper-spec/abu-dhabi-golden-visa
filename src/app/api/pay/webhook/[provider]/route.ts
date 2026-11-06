import { NextResponse, type NextRequest } from 'next/server';
import { findByGw, getPayCfg, methodName, recheckPending, settle, stripeVerify, totalpayVerify } from '@/lib/server/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Payment provider notifications. Every one is verified (signature, hash, or by asking the provider). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const cfg = await getPayCfg();
  const raw = await req.text();
  try {
    if (provider === 'stripe') {
      if (!cfg.stripeWebhook || !stripeVerify(raw, req.headers.get('stripe-signature') || '', cfg.stripeWebhook)) return new NextResponse('Bad signature', { status: 400 });
      const ev = JSON.parse(raw);
      const s = ev?.data?.object;
      if ((ev.type === 'checkout.session.completed' || ev.type === 'checkout.session.async_payment_succeeded') && s?.payment_status === 'paid' && s.metadata?.app && s.metadata?.pid) {
        await settle(s.metadata.app, s.metadata.pid, methodName('stripe'), s.payment_intent || s.id);
      }
      return NextResponse.json({ received: true });
    }
    if (provider === 'totalpay') {
      const f: Record<string, string> = raw.trim().startsWith('{') ? JSON.parse(raw) : Object.fromEntries(new URLSearchParams(raw));
      if (!totalpayVerify(f, cfg.totalpayPass)) return new NextResponse('Bad hash', { status: 400 });
      if (['success', 'settled'].includes(String(f.status).toLowerCase()) && ['sale', 'purchase', 'capture'].includes(String(f.type || 'sale').toLowerCase())) {
        const hit = await findByGw('totalpay', f.order_number);
        if (hit) await settle(hit.a.id, hit.p.id, methodName('totalpay'), f.id);
      }
      return new NextResponse('OK');
    }
    if (['ziina', 'ngenius', 'telr'].includes(provider)) {
      // These are confirmed by asking the provider directly, never by trusting the notification body.
      await recheckPending(provider);
      return new NextResponse('OK');
    }
    return new NextResponse('Unknown provider', { status: 404 });
  } catch (e) {
    console.error('Payment webhook failed', provider, (e as Error).message);
    return new NextResponse('Error', { status: 500 });
  }
}
