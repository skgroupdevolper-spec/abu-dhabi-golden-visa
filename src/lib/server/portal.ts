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
