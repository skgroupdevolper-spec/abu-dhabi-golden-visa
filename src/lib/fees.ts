// Government fee schedule used by the cost calculator (AED).
// Phase 3 moves these numbers into the admin panel so they can be changed without code.
// Every calculator result shows the schedule date below (spec section 8 and 16).
export const FEE_SCHEDULE = {
  date: '5 November 2026',
  currency: 'AED',
  perPerson: {
    visa: { label: 'Immigration & residence visa', aed: 1614.25 },
    emiratesId: { label: 'Emirates ID, 10 years', aed: 1107.85 },
    changeOfStatus: { label: 'Change of status (inside the UAE)', aed: 656.05 },
  },
  medical: {
    normal: { label: 'Normal medical test', aed: 300 },
    vip: { label: 'VIP medical test', aed: 750 },
  },
  sponsorFile: { label: 'Sponsor file opening (once)', aed: 353.91 },
  propertyValuation: { label: 'Property value certificate', aed: 1050 },
  vatRate: 0.05,
  assumptions: [
    'Government fees only, for a new 10-year Golden Visa.',
    'Adults 18 and over need a medical test; children under 18 do not.',
    'Health insurance, attestation and our consultancy fee are quoted separately (VAT applies to consultancy).',
    'Fees can change. We confirm the final amount in writing before you pay.',
  ],
};

export type Route = {
  id: string;
  label: string;
  note: string;
  valuation: boolean;
};

export const ROUTES: Route[] = [
  { id: 'property', label: 'Property investor', note: 'Abu Dhabi property worth AED 2M+', valuation: true },
  { id: 'investor', label: 'Company owner or investor', note: 'AED 2M deposit or company stake', valuation: false },
  { id: 'entrepreneur', label: 'Entrepreneur', note: 'Approved idea or AED 1M+ revenue', valuation: false },
  { id: 'professional', label: 'Skilled professional', note: 'AED 30,000+ salary and a degree', valuation: false },
  { id: 'graduate', label: 'Outstanding graduate', note: 'GPA 3.5+ in the last 2 years', valuation: false },
  { id: 'family', label: 'Family member', note: 'Joining a Golden Visa holder', valuation: false },
];

/** Approximate exchange rates, 1 AED = x (early November 2026). Display only. */
export const RATES: Record<string, { rate: number; symbol: string; name: string }> = {
  AED: { rate: 1, symbol: 'AED ', name: 'UAE dirham' },
  USD: { rate: 0.2723, symbol: '$', name: 'US dollar' },
  EUR: { rate: 0.2421, symbol: '€', name: 'Euro' },
  GBP: { rate: 0.202, symbol: '£', name: 'British pound' },
  INR: { rate: 25.71, symbol: '₹', name: 'Indian rupee' },
  PKR: { rate: 75.8, symbol: 'Rs ', name: 'Pakistani rupee' },
  PHP: { rate: 17.14, symbol: '₱', name: 'Philippine peso' },
  SAR: { rate: 1.0211, symbol: 'SAR ', name: 'Saudi riyal' },
  RUB: { rate: 22.72, symbol: '₽', name: 'Russian rouble' },
  CNY: { rate: 1.8163, symbol: '¥', name: 'Chinese yuan' },
};

export function aed(n: number): string {
  return 'AED ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function convert(n: number, code: string): string | null {
  const r = RATES[code];
  if (!r || code === 'AED') return null;
  return `≈ ${r.symbol}${Math.round(n * r.rate).toLocaleString('en-US')} ${code}`;
}
