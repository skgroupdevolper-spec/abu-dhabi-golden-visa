import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/dash/ActionForm';
import { getApplicationByToken } from '@/lib/server/store';
import { SITE } from '@/lib/site';
import { money, when } from '@/lib/stages';

export const metadata: Metadata = { title: 'Receipt' };
export const dynamic = 'force-dynamic';

export default async function Receipt({ params }: { params: Promise<{ token: string; pid: string }> }) {
  const { token, pid } = await params;
  const a = await getApplicationByToken(token);
  const p = a?.payments.find((x) => x.id === pid && x.status === 'paid');
  if (!a || !p) notFound();
  return (
    <main className="pwrap" style={{ maxWidth: 760 }}>
      <div className="panel">
        <div className="panel-h">
          <img decoding="async" src="/brand/logo.webp" alt="Abu Dhabi Golden Visa" style={{ height: 48, width: 'auto' }} />
          <div style={{ textAlign: 'end' }}><p className="eyebrow">Payment receipt</p><b style={{ fontSize: 18 }}>{p.receiptNo}</b></div>
        </div>
        <div className="lines" style={{ marginTop: 10 }}>
          <div><span>Received from</span><b>{a.client.name}</b></div>
          <div><span>Application</span><b>{a.ref} · {a.route}</b></div>
          <div><span>Description</span><b>{p.label}</b></div>
          <div><span>Payment method</span><b>{p.method}</b></div>
          <div><span>Date</span><b>{when(p.paidAt)}</b></div>
        </div>
        <div className="total"><span>Amount received</span><b>{money(p.amount)}</b></div>
        <p className="small muted" style={{ marginTop: 18 }}>{SITE.operator} · Trade Licence {SITE.licence} · {SITE.office} · {SITE.email}</p>
        <div className="row noprint" style={{ marginTop: 16 }}><PrintButton /><a className="btn" href="../../">Back to my file</a></div>
      </div>
    </main>
  );
}
