// One list of every service, grouped as in the Services Menu guide and the developer specification.
// Used by the service-page side menu, the "Our Services" mega menu and the services hub.
export type CatalogItem = { label: string; href: string; note?: string; price?: string; added?: boolean };
export type CatalogGroup = { title: string; icon: string; items: CatalogItem[]; key?: string };

export const SERVICE_CATALOG: CatalogGroup[] = [
  {
    title: 'Visas',
    icon: 'star',
    items: [
      { label: 'Golden Visa', href: '/golden-visa/', note: '10-year residency' },
      { label: 'Retirement Visa', href: '/retirement-visa/', note: 'Renewable 5 years' },
      { label: 'Family Visa', href: '/services/family-visa/', note: 'Spouse, children, parents' },
      { label: 'Investor & Partner Visa', href: '/services/investor-visa/', note: 'Company owners' },
      { label: 'Newborn Visa', href: '/services/newborn-visa/', note: 'Babies born in the UAE' },
      { label: 'Maid Visa', href: '/services/maid-visa/', note: 'Domestic workers' },
      { label: 'Tourist Visa', href: '/services/tourist-visa/', note: 'Visit the UAE' },
      { label: 'Virtual Work Visa', href: '/remote-work-visa/', note: 'Work remotely from the UAE' },
    ],
  },
  {
    title: 'Visa services',
    icon: 'shield',
    items: [
      { label: 'Golden Visa Renewal', href: '/services/golden-visa-renewal/' },
      { label: 'Visa Cancellation', href: '/services/visa-cancellation/' },
      { label: 'Emirates ID Services', href: '/services/emirates-id/' },
      { label: 'Medical & Biometrics', href: '/services/medical-biometrics/' },
      { label: 'Entry Permit & Status Change', href: '/services/entry-permit-status-change/' },
      { label: 'Health Insurance', href: '/services/health-insurance/' },
    ],
  },
  {
    title: 'Attestation & legalisation',
    icon: 'doc',
    items: [
      { label: 'MOFA / Embassy Attestation', href: '/document-services/mofa-attestation/' },
      { label: 'Notary & Power of Attorney', href: '/services/notary-power-of-attorney/' },
      { label: 'Legal Translation', href: '/document-services/legal-translation/' },
      { label: 'Degree Attestation', href: '/document-services/degree-attestation/' },
      { label: 'Marriage & Birth Certificates', href: '/document-services/marriage-certificate/' },
      { label: 'Birth Certificate Attestation', href: '/document-services/birth-certificate/' },
      { label: 'Document Legalisation', href: '/document-services/document-legalisation/' },
    ],
  },
  {
    title: 'Employment visas & permits',
    icon: 'briefcase',
    items: [
      { label: 'All employment services', href: '/services/employment-visas-permits/' },
      { label: 'Employment Visa', href: '/services/employment-visa/' },
      { label: 'Freelancer Visa', href: '/services/freelancer-visa/' },
      { label: 'Work Permit Services', href: '/services/work-permit/' },
      { label: 'ILOE Insurance', href: '/services/iloe-insurance/' },
    ],
  },
  {
    title: 'Property & business',
    icon: 'home',
    items: [
      { label: 'Valuation Certificate', href: '/document-services/valuation-certificate/', note: 'Property revaluation' },
      { label: 'Property Documentation', href: '/document-services/property-documentation/' },
      { label: 'Company Setup & PRO', href: '/services/company-setup-pro/' },
      { label: 'Document Clearing', href: '/services/document-clearing/' },
      { label: 'Tasheel Services', href: '/services/tasheel/' },
      { label: 'Tawjeeh Services', href: '/services/tawjeeh/' },
    ],
  },
  {
    title: 'Other services',
    icon: 'globe',
    items: [
      { label: 'Green Visa Guidance', href: '/services/green-visa/' },
      { label: 'Driving Licence', href: '/services/driving-licence/' },
      { label: 'Bank Account Opening', href: '/services/bank-account-opening/' },
    ],
  },
  {
    title: 'Wills & estate planning',
    icon: 'heart',
    items: [
      { label: 'DIFC Wills', href: '/services/difc-wills/' },
      { label: 'ADJD Wills', href: '/services/adjd-wills/' },
      { label: 'Muslim Wills', href: '/services/muslim-wills/' },
    ],
  },
  {
    title: 'Quick access',
    icon: 'pin',
    items: [
      { label: 'Medical & EID Centres', href: '/services/medical-emirates-id-centres/' },
      { label: 'Visa Validity Check', href: '/services/visa-validity-check/' },
      { label: 'Cost Calculator', href: '/golden-visa-cost/' },
      { label: 'Eligibility Checker', href: '/visa-check/' },
    ],
  },
];

const ALL = new Set(SERVICE_CATALOG.flatMap((g) => g.items.map((i) => i.href)));

/** Pages that show the service side menu. */
export function isServicePage(path: string) {
  return path === '/services/' || path.startsWith('/services/') || path.startsWith('/document-services/') || (ALL.has(path) && path !== '/golden-visa/');
}

/* ---------- Editable catalog (Admin > Services & prices) ---------- */
export type AddedService = { id: string; group: string; label: string; href: string; note?: string };
export type ServiceData = { hidden: string[]; prices: Record<string, string>; notes: Record<string, string>; labels?: Record<string, string>; added?: AddedService[]; groupNames?: Record<string, string> };

/** Base catalog plus admin edits: names, descriptions, prices, hidden items and added services. */
export function mergeCatalog(d?: Partial<ServiceData> | null, keepHidden = false): CatalogGroup[] {
  const groups: CatalogGroup[] = SERVICE_CATALOG.map((g) => ({
    ...g, key: g.title, title: d?.groupNames?.[g.title] || g.title,
    items: g.items.map((i) => ({ ...i, label: d?.labels?.[i.href] || i.label, note: d?.notes?.[i.href] || i.note, price: d?.prices?.[i.href] })),
  }));
  for (const a of d?.added ?? []) {
    const g = groups.find((x) => x.key === a.group) ?? groups[groups.length - 1];
    g.items.push({ label: d?.labels?.[a.href] || a.label, href: a.href, note: d?.notes?.[a.href] || a.note, price: d?.prices?.[a.href], added: true });
  }
  return keepHidden ? groups : groups.map((g) => ({ ...g, items: g.items.filter((i) => !d?.hidden?.includes(i.href)) }));
}

declare global {
  // eslint-disable-next-line no-var
  var __ADGV_SVC: CatalogGroup[] | undefined;
  interface Window { __ADGV_SVC?: CatalogGroup[] }
}
/** The live catalog (set by the website layout); falls back to the base list. */
export function catalog(): CatalogGroup[] {
  if (typeof window !== 'undefined') return window.__ADGV_SVC ?? SERVICE_CATALOG;
  return globalThis.__ADGV_SVC ?? SERVICE_CATALOG;
}
