import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PayConfirm } from '@/components/dash/PayConfirm';
import { byToken } from '@/lib/server/payments';

export const metadata: Metadata = { title: 'Confirming your payment', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function PayReturn({ params, searchParams }: { params: Promise<{ token: string; pid: string }>; searchParams: Promise<Record<string, string>> }) {
  const { token, pid } = await params;
  const sp = await searchParams;
  const hit = await byToken(token, pid);
  if (!hit) notFound();
  const { a, p } = hit;
  return (
    <PayConfirm token={token} pid={pid} sid={sp.sid || sp.session_id || ''} ref={sp.ref || ''} failed={!!sp.failed}
      initial={p.status === 'paid' ? 'paid' : 'pending'} customer={a.client.name} amount={p.amount} label={p.label} appRef={a.ref}
      receipt={p.receiptNo} paidAt={p.paidAt} reference={p.gw?.ref || `${a.ref}-${p.id}`} />
  );
}
