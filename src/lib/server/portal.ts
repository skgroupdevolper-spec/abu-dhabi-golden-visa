import 'server-only';
import { cookies, headers } from 'next/headers';
import { dict, langInfo, PORTAL_LANGS } from '@/lib/portal-i18n';
import { currentClientId } from './auth';
import { list, type Customer } from './collections';

/** Portal pages live at /portal/... on the main site and at /... on the portal subdomain. */
export async function portalBase() {
  const host = ((await headers()).get('host') || '').split(':')[0].toLowerCase();
  return host && host === (process.env.PORTAL_HOST || '').toLowerCase() ? '' : '/portal';
}

export async function currentCustomer(): Promise<Customer | null> {
  const id = await currentClientId();
  if (!id) return null;
  return (await list<Customer>('customers')).find((c) => c.id === id && c.active) ?? null;
}

export async function portalLang() {
  const c = (await cookies()).get('adgv_lang')?.value;
  if (c && PORTAL_LANGS.some((l) => l.code === c)) return c;
  const al = ((await headers()).get('accept-language') || '').slice(0, 2).toLowerCase();
  return PORTAL_LANGS.some((l) => l.code === al) ? al : 'en';
}
export async function T() {
  const code = await portalLang();
  return { t: dict(code), lang: langInfo(code) };
}

/* ---------- signed-in client area (Wordcraft-style dashboard) ---------- */
const dg9 = (p: string) => p.replace(/\D/g, '').slice(-9);
/** Everything a signed-in client page needs; sends visitors who are not signed in to the login page. */
export async function clientArea() {
  const base = await portalBase();
  const me = await currentCustomer();
  if (!me) (await import('next/navigation')).redirect(`${base}/login/`);
  const cust = me as Customer;
  const { t, lang } = await T();
  const { listApplications, listLeads } = await import('./store');
  const { getPayCfg, online, orderBalance } = await import('./payments');
  const [apps, leads, pay] = await Promise.all([listApplications(), listLeads(), getPayCfg()]);
  const mine = apps.filter((a) => !a.archived && ((a.client.email && a.client.email.toLowerCase() === cust.email) || (dg9(a.client.phone) && dg9(a.client.phone) === dg9(cust.phone))))
    .sort((x, y) => y.updatedAt.localeCompare(x.updatedAt));
  const requests = leads.filter((l) => l.source === 'portal' && l.email === cust.email).sort((x, y) => y.at.localeCompare(x.at));
  const live = online(pay);
  /** Amount the client can pay right now on a sent quote (Pay & confirm). */
  const quotePay = (a: (typeof mine)[number]) => (pay.payOnQuote && a.quote.sentAt && !a.payments.some((p) => p.status === 'due') && (live || pay.bankOn) ? Math.max(0, orderBalance(a)) : 0);
  return { base, me: cust, t, lang, mine, requests, pay, live, quotePay };
}
export type ClientArea = Awaited<ReturnType<typeof clientArea>>;
