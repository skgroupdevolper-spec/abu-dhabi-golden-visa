// Brand, operator and contact details. Defaults come from the Developer Specification (sections 1 and 13);
// the main admin can change them at any time (Settings), and the change applies to the live site.
import { DEFAULT_SITE, type PublicSite } from './settings-schema';

declare global {
  // eslint-disable-next-line no-var
  var __ADGV_SITE: PublicSite | undefined;
  interface Window { __ADGV_SITE?: PublicSite }
}

function current(): PublicSite {
  if (typeof window !== 'undefined') return window.__ADGV_SITE ?? DEFAULT_SITE;
  return globalThis.__ADGV_SITE ?? DEFAULT_SITE;
}

/** Live site details: reads the admin's saved settings on the server and in the browser. */
export const SITE: PublicSite = new Proxy({} as PublicSite, {
  get: (_, k: string) => (current() as unknown as Record<string, unknown>)[k],
}) as PublicSite;

export function waLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Secure client-portal link for one application (served on the portal subdomain). */
export function portalUrl(token: string): string {
  const host = process.env.PORTAL_HOST;
  return host ? `https://${host}/t/${token}/` : `${SITE.url}/portal/t/${token}/`;
}

/** WhatsApp link to a client's own number. */
export function waTo(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
