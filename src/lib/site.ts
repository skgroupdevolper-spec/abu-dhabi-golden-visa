// Brand, operator and contact details from the Developer Specification (section 1 and 13).
export const SITE = {
  name: 'Abu Dhabi Golden Visa',
  tagline: 'Long-Term Residency & Investment Advisory',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.abudhabigoldenvisa.com').replace(/\/$/, ''),
  operator: 'Brightlink Management Consultancy LLC',
  licence: '1053387',
  whatsapp: '971566556645',
  whatsappDisplay: '+971 56 655 6645',
  phone: '+971566556645',
  email: 'info@brightlinkconsulting.ae',
  office: 'Business Bay, Dubai, UAE',
  disclaimer:
    'Not an official UAE government website. Visa issuance and eligibility are subject to the competent authorities.',
};

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
