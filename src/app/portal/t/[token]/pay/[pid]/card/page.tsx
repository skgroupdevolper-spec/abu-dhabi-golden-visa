import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { byToken, cardFee, fileUrl, getPayCfg, online } from '@/lib/server/payments';
import { SITE, waLink } from '@/lib/site';
import { waHtml } from '@/lib/wa-format';

export const metadata: Metadata = { title: 'Choose your card', robots: { index: false } };
export const dynamic = 'force-dynamic';

const aed = (n: number) => `AED ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Before a card payment: the client picks a UAE or an international card and sees the fee and the total. */
export default async function ChooseCard({ params }: { params: Promise<{ token: string; pid: string }> }) {
  const { token, pid } = await params;
  const hit = await byToken(token, pid);
  if (!hit) notFound();
  const { a, p } = hit;
  const file = fileUrl(await headers(), token);
  if (p.status === 'paid') redirect(`${file}pay/${pid}/return/`);
  const c = await getPayCfg();
  if (!online(c) || !c.feeOn) redirect(`${file}pay/${pid}/?card=local`);
  const opts = [
    { k: 'local', t: 'UAE bank card', s: `Card issued by a bank in the UAE · ${c.feeLocalPct}% + AED ${c.feeFixed}` },
    { k: 'intl', t: 'International bank card', s: `Card issued outside the UAE · ${c.feeIntlPct}% + AED ${c.feeFixed}` },
  ] as const;
  const bankMsg = `Hello, I would like to pay ${p.label} for my file ${a.ref} (${aed(p.amount)}) by bank transfer. Please send me your bank details.`;
  return (
    <main className="paywrap">
      <div className="paycard">
        <div className="paytop"><img src="/brand/coin.webp" alt="" width={44} height={44} /><span>{SITE.name}</span></div>
        <div className="paybody" style={{ textAlign: 'start' }}>
          <h1 style={{ textAlign: 'center' }}>Choose your card</h1>
          <p className="muted" style={{ textAlign: 'center' }}>{p.label} · {a.ref}<br /><b style={{ fontSize: 20, color: 'inherit' }}>{aed(p.amount)}</b></p>
          {c.payText && <div className="paytext" dangerouslySetInnerHTML={{ __html: waHtml(c.payText) }} />}
          <div className="cardopts">
            {opts.map((o) => {
              const fee = cardFee(c, p.amount, o.k);
              return (
                <a key={o.k} className="cardopt" href={`${file}pay/${pid}/?card=${o.k}`}>
                  <span><b>{o.t}</b><small>{o.s}</small></span>
                  <span className="cardopt-amt"><small>Fee {aed(fee)}</small><b>{aed(p.amount + fee)}</b><em>Pay now →</em></span>
                </a>
              );
            })}
          </div>
          <div className="cardalt">
            {c.bankOn && (c.bankIban || c.bankAccount) && <a className="btn" href={`${file}#bank`}>🏦 Pay by bank transfer (no card fee)</a>}
            {c.bankWa && <a className="btn btn-wa" href={waLink(bankMsg)} target="_blank" rel="noopener">💬 Ask for bank transfer on WhatsApp</a>}
            <a className="btn btn-ghost" href={`${file}#payments`}>← Back to my file</a>
          </div>
        </div>
      </div>
    </main>
  );
}
