import 'server-only';
// Online card payments with automatic confirmation.
// Providers: Stripe Checkout, Ziina, Network International (N-Genius), Telr, TotalPay (Checkout API).
// Flow: Pay → provider page → back to "Confirming your payment" (we check the provider) and/or the
// provider's webhook → payment marked paid once (receipt, stage, WhatsApp with PDF, email, bell).
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { getBlock, saveBlock } from './settings';
import { getApplicationByToken, listApplications, newId, now, updateApplication, type Application, type Payment } from './store';

export type Provider = 'none' | 'stripe' | 'ziina' | 'ngenius' | 'telr' | 'totalpay';
export type PayCfg = {
  provider: Provider; test: boolean; currency: string;
  stripeSecret: string; stripeWebhook: string;
  ziinaToken: string;
  ngeniusKey: string; ngeniusOutlet: string;
  telrStore: string; telrKey: string;
  totalpayKey: string; totalpayPass: string; totalpayHost: string;
  termsUrl: string; validDays: number; autoStage: boolean; receiptWa: boolean;
};
export const PAY0: PayCfg = {
  provider: 'none', test: true, currency: 'AED',
  stripeSecret: '', stripeWebhook: '', ziinaToken: '', ngeniusKey: '', ngeniusOutlet: '', telrStore: '', telrKey: '',
  totalpayKey: '', totalpayPass: '', totalpayHost: 'https://checkout.totalpay.global',
  termsUrl: '/terms/', validDays: 7, autoStage: true, receiptWa: true,
};
export const PROVIDERS: { id: Provider; name: string; note: string }[] = [
  { id: 'none', name: 'Manual (payment links)', note: 'Paste a payment link on each request and press “Mark paid” yourself.' },
  { id: 'totalpay', name: 'TotalPay', note: 'Checkout API. Merchant key and password from your TotalPay dashboard.' },
  { id: 'stripe', name: 'Stripe', note: 'Secret key (sk_live_ / sk_test_) and the webhook signing secret (whsec_).' },
  { id: 'ziina', name: 'Ziina', note: 'API access token from Ziina Business.' },
  { id: 'ngenius', name: 'Network International (N-Genius)', note: 'Service-account API key and outlet reference.' },
  { id: 'telr', name: 'Telr', note: 'Store ID and authentication key (Hosted Payment Page).' },
];

export async function getPayCfg(): Promise<PayCfg> { return { ...PAY0, ...(await getBlock<Partial<PayCfg>>('payments', {})) }; }
export async function savePayCfg(c: PayCfg) { await saveBlock('payments', c); }
export const online = (c: PayCfg) => c.provider !== 'none' && ready(c);
export function ready(c: PayCfg) {
  switch (c.provider) {
    case 'stripe': return !!c.stripeSecret;
    case 'ziina': return !!c.ziinaToken;
    case 'ngenius': return !!(c.ngeniusKey && c.ngeniusOutlet);
    case 'telr': return !!(c.telrStore && c.telrKey);
    case 'totalpay': return !!(c.totalpayKey && c.totalpayPass);
    default: return false;
  }
}

const fils = (aed: number) => Math.round(aed * 100);
const amt2 = (aed: number) => aed.toFixed(2);
const tpHash = (s: string) => createHash('sha1').update(createHash('md5').update(s.toUpperCase()).digest('hex')).digest('hex');
const ngBase = (c: PayCfg) => (c.test ? 'https://api-gateway.sandbox.ngenius-payments.com' : 'https://api-gateway.ngenius-payments.com');
async function ngToken(c: PayCfg) {
  const r = await fetch(`${ngBase(c)}/identity/auth/access-token`, { method: 'POST', headers: { Authorization: `Basic ${c.ngeniusKey}`, 'Content-Type': 'application/vnd.ni-identity.v1+json', Accept: 'application/vnd.ni-identity.v1+json' }, signal: AbortSignal.timeout(20000) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`N-Genius sign-in failed (${r.status})`);
  return j.access_token as string;
}
async function jfetch(url: string, init: RequestInit) {
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(25000) });
  const text = await r.text();
  let j: Record<string, any> = {};
  try { j = JSON.parse(text); } catch { j = { raw: text.slice(0, 300) }; }
  if (!r.ok) throw new Error(j?.error?.message || j?.message || j?.error || `HTTP ${r.status}`);
  return j;
}

export type Gw = { provider: string; id: string; at: string; ref: string };
type Start = { url: string; gw: Gw };

/** Creates the provider checkout for one payment request and returns where to send the client. */
export async function startCheckout(a: Application, p: Payment, file: string): Promise<Start> {
  const c = await getPayCfg();
  if (!online(c)) throw new Error('Online payment is not set up.');
  // file = absolute link of the client's file page, ending in '/'
  const ret = `${file}pay/${p.id}/return/`;
  const back = `${file}?cancelled=1#payments`;
  const ref = `ADGV-${a.ref}-${p.id}`.replace(/[^\w-]/g, '').slice(0, 40);
  const desc = `${p.label} (${a.ref})`.slice(0, 120);
  const cur = c.currency || 'AED';
  const gw = (id: string): Gw => ({ provider: c.provider, id, at: now(), ref });
  switch (c.provider) {
    case 'stripe': {
      const body = new URLSearchParams({
        mode: 'payment', client_reference_id: ref, success_url: `${ret}?sid={CHECKOUT_SESSION_ID}`, cancel_url: back,
        'line_items[0][quantity]': '1', 'line_items[0][price_data][currency]': cur.toLowerCase(), 'line_items[0][price_data][unit_amount]': String(fils(p.amount)),
        'line_items[0][price_data][product_data][name]': desc, 'metadata[token]': a.token, 'metadata[pid]': p.id, 'metadata[app]': a.id,
        ...(a.client.email ? { customer_email: a.client.email } : {}),
      });
      const j = await jfetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: `Bearer ${c.stripeSecret}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      return { url: j.url, gw: gw(j.id) };
    }
    case 'ziina': {
      const j = await jfetch('https://api-v2.ziina.com/api/payment_intent', {
        method: 'POST', headers: { Authorization: `Bearer ${c.ziinaToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: fils(p.amount), currency_code: cur, message: desc, success_url: ret, cancel_url: back, failure_url: `${ret}?failed=1`, test: c.test }),
      });
      return { url: j.redirect_url, gw: gw(j.id) };
    }
    case 'ngenius': {
      const tok = await ngToken(c);
      const j = await jfetch(`${ngBase(c)}/transactions/outlets/${encodeURIComponent(c.ngeniusOutlet)}/orders`, {
        method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/vnd.ni-payment.v2+json', Accept: 'application/vnd.ni-payment.v2+json' },
        body: JSON.stringify({ action: 'SALE', amount: { currencyCode: cur, value: fils(p.amount) }, merchantOrderReference: ref, emailAddress: a.client.email || undefined, merchantAttributes: { redirectUrl: ret, cancelUrl: back, skipConfirmationPage: true } }),
      });
      return { url: j?._links?.payment?.href, gw: gw(j.reference) };
    }
    case 'telr': {
      const cart = `${ref}-${newId(3)}`;
      const j = await jfetch('https://secure.telr.com/gateway/order.json', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ method: 'create', store: Number(c.telrStore) || c.telrStore, authkey: c.telrKey, framed: 0, order: { cartid: cart, test: c.test ? '1' : '0', amount: amt2(p.amount), currency: cur, description: desc }, return: { authorised: ret, declined: `${ret}?failed=1`, cancelled: back }, customer: { email: a.client.email || undefined, name: { forenames: a.client.name.split(' ')[0], surname: a.client.name.split(' ').slice(1).join(' ') || '-' } } }),
      });
      if (!j?.order?.url) throw new Error(j?.error?.message || 'Telr did not return a payment page.');
      return { url: j.order.url, gw: gw(j.order.ref) };
    }
    case 'totalpay': {
      const number = `${ref}-${newId(3)}`.slice(0, 50);
      const order = { number, amount: amt2(p.amount), currency: cur, description: desc };
      const hash = tpHash(order.number + order.amount + order.currency + order.description + c.totalpayPass);
      const j = await jfetch(`${c.totalpayHost.replace(/\/$/, '')}/api/v1/session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant_key: c.totalpayKey, operation: 'purchase', methods: ['card'], order, success_url: ret, cancel_url: back, error_url: `${ret}?failed=1`, customer: { name: a.client.name, email: a.client.email || undefined }, hash }),
      });
      if (!j.redirect_url) throw new Error('TotalPay did not return a payment page.');
      return { url: j.redirect_url, gw: gw(number) };
    }
    default: throw new Error('Choose a payment provider.');
  }
}

/** Asks the provider whether the checkout was paid. 'paid' | 'pending' | 'failed'. */
export async function checkStatus(gw: Gw, hint: Record<string, string> = {}): Promise<{ state: 'paid' | 'pending' | 'failed'; txn?: string }> {
  const c = await getPayCfg();
  try {
    switch (gw.provider) {
      case 'stripe': {
        const j = await jfetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(hint.sid || gw.id)}`, { headers: { Authorization: `Bearer ${c.stripeSecret}` } });
        return j.payment_status === 'paid' ? { state: 'paid', txn: j.payment_intent || j.id } : j.status === 'expired' ? { state: 'failed' } : { state: 'pending' };
      }
      case 'ziina': {
        const j = await jfetch(`https://api-v2.ziina.com/api/payment_intent/${encodeURIComponent(gw.id)}`, { headers: { Authorization: `Bearer ${c.ziinaToken}` } });
        return j.status === 'completed' ? { state: 'paid', txn: j.id } : ['failed', 'canceled'].includes(j.status) ? { state: 'failed' } : { state: 'pending' };
      }
      case 'ngenius': {
        const tok = await ngToken(c);
        const j = await jfetch(`${ngBase(c)}/transactions/outlets/${encodeURIComponent(c.ngeniusOutlet)}/orders/${encodeURIComponent(hint.ref || gw.id)}`, { headers: { Authorization: `Bearer ${tok}`, Accept: 'application/vnd.ni-payment.v2+json' } });
        const st = j?._embedded?.payment?.[0]?.state as string | undefined;
        return st && ['CAPTURED', 'PURCHASED'].includes(st) ? { state: 'paid', txn: j?._embedded?.payment?.[0]?._id?.split(':').pop() || gw.id } : st && ['FAILED', 'REVERSED', 'CANCELLED'].includes(st) ? { state: 'failed' } : { state: 'pending' };
      }
      case 'telr': {
        const j = await jfetch('https://secure.telr.com/gateway/order.json', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ method: 'check', store: Number(c.telrStore) || c.telrStore, authkey: c.telrKey, order: { ref: gw.id } }) });
        const code = Number(j?.order?.status?.code);
        return code === 3 || code === 2 ? { state: 'paid', txn: j?.order?.transaction?.ref || gw.id } : code < 0 ? { state: 'failed' } : { state: 'pending' };
      }
      case 'totalpay': {
        const j = await jfetch(`${c.totalpayHost.replace(/\/$/, '')}/api/v1/payment/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ merchant_key: c.totalpayKey, order_id: gw.id, hash: tpHash(gw.id + c.totalpayPass) }) });
        const st = String(j.status || '').toLowerCase();
        return st === 'settled' ? { state: 'paid', txn: j.payment_id || gw.id } : ['decline', 'void', 'refund', 'reversal', 'chargeback'].includes(st) ? { state: 'failed' } : { state: 'pending' };
      }
      default: return { state: 'pending' };
    }
  } catch (e) {
    console.error('Payment status check failed', (e as Error).message);
    return { state: 'pending' };
  }
}

/** Marks one payment as paid exactly once and runs everything that follows. */
export async function settle(appId: string, pid: string, method: string, txn: string): Promise<boolean> {
  const c = await getPayCfg();
  let changed = false;
  const app = await updateApplication(appId, (a) => {
    const p = a.payments.find((x) => x.id === pid);
    if (!p || p.status === 'paid') return;
    const count = a.payments.filter((x) => x.receiptNo).length + 1;
    p.status = 'paid'; p.paidAt = now(); p.method = method; p.txn = txn; p.receiptNo = `${a.ref}-R${count}`;
    a.messages.push({ id: newId(6), by: 'team', at: now(), text: `✅ Payment received, thank you! ${p.label}: AED ${p.amount.toFixed(2)}. Receipt ${p.receiptNo} is ready to download.` });
    if (c.autoStage && a.stage < 2 && a.payments.every((x) => x.status === 'paid')) { a.stage = 2; a.stageDates['2'] = now(); }
    a.updatedAt = now();
    changed = true;
  });
  if (!changed || !app) return false;
  const p = app.payments.find((x) => x.id === pid)!;
  void afterPaid(app, p).catch((e) => console.error('After-payment steps failed', e));
  return true;
}

async function afterPaid(a: Application, p: Payment) {
  const [{ notify }, { sendWa, sendWaDoc }, { money }, { portalUrl }, { sendMail }] = await Promise.all([import('./collections'), import('./whatsapp'), import('@/lib/stages'), import('@/lib/site'), import('./mail')]);
  await notify('payment', `Payment received online: ${a.client.name}, AED ${p.amount.toFixed(2)} (${a.ref})`, `/admin/applications/${a.id}/#payments`);
  const link = portalUrl(a.token);
  await sendWa(a.client.phone, 'paid', { name: a.client.name.split(' ')[0], ref: a.ref, item: p.label, amount: money(p.amount), receipt: p.receiptNo, link });
  if ((await getPayCfg()).receiptWa) await sendWaDoc(a.client.phone, `${link}receipt/${p.id}/pdf/`, `Payment Receipt - ${p.receiptNo}.pdf`, `✅ Payment Received, thank you! 🙏\nAmount: AED ${p.amount.toFixed(2)}\nRef: ${a.ref} | ${p.receiptNo}\nYour official receipt is attached.`);
  if (a.client.email) await sendMail(a.client.email, `Payment received · ${p.receiptNo}`, `Hello ${a.client.name},\n\nWe received your payment of AED ${p.amount.toFixed(2)} for ${p.label} (${a.ref}).\nReceipt: ${p.receiptNo}\n\nDownload your receipt and follow your application here:\n${link}\n\nThank you,\nAbu Dhabi Golden Visa`).catch(() => {});
}

/** Finds a payment from a provider reference (webhooks). */
export async function findByGw(provider: Provider, id: string) {
  for (const a of await listApplications()) {
    const p = a.payments.find((x) => x.gw?.provider === provider && (x.gw.id === id || x.gw.ref === id));
    if (p) return { a, p };
  }
  return null;
}
export async function byToken(token: string, pid: string) {
  const a = await getApplicationByToken(token);
  const p = a?.payments.find((x) => x.id === pid);
  return a && p ? { a, p } : null;
}

/* ---------- webhook verification ---------- */
export function stripeVerify(raw: string, header: string, secret: string) {
  const parts = Object.fromEntries(header.split(',').map((x) => x.split('=') as [string, string]));
  if (!parts.t || !parts.v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 600) return false;
  const sig = createHmac('sha256', secret).update(`${parts.t}.${raw}`).digest('hex');
  try { return timingSafeEqual(Buffer.from(sig), Buffer.from(parts.v1)); } catch { return false; }
}
export function totalpayVerify(f: Record<string, string>, pass: string) {
  const h = tpHash((f.id || '') + (f.order_number || '') + (f.order_amount || '') + (f.order_currency || '') + (f.order_description || '') + pass);
  return !!f.hash && h === f.hash;
}

export const methodName = (provider: string) => `Card (${PROVIDERS.find((x) => x.id === provider)?.name ?? provider})`;

/** Checks every open online checkout of a provider started in the last 3 days (webhooks, cron, safety net). */
export async function recheckPending(provider?: string) {
  let n = 0;
  for (const a of await listApplications()) {
    for (const p of a.payments) {
      if (p.status !== 'due' || !p.gw || (provider && p.gw.provider !== provider)) continue;
      if (Date.now() - new Date(p.gw.at).getTime() > 3 * 864e5) continue;
      const s = await checkStatus(p.gw);
      if (s.state === 'paid' && (await settle(a.id, p.id, methodName(p.gw.provider), s.txn || p.gw.id))) n++;
    }
  }
  return n;
}

/** Absolute link of a client's file page as the client sees it (main site or portal subdomain). */
export function fileUrl(headers: Headers, token: string) {
  const host = headers.get('x-forwarded-host') || headers.get('host') || 'localhost:3000';
  const proto = headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return host === process.env.PORTAL_HOST ? `${proto}://${host}/t/${token}/` : `${proto}://${host}/portal/t/${token}/`;
}
