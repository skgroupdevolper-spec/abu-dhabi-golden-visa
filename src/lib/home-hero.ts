// Text in the home page hero. Admin > Home page text can change every line; empty fields fall back to these.
export type HomeHero = {
  badge: string; line1: string; line2: string; gold: string; lead: string;
  btn1: string; btn1Link: string; btn2: string; btn2Link: string; trust: string[];
};

export const HOME_HERO: HomeHero = {
  badge: 'Abu Dhabi Golden Visa · Long-term UAE residency',
  line1: 'Your future in',
  line2: 'Abu Dhabi starts',
  gold: 'with a Golden Visa.',
  lead: 'Explore long-term UAE residency through property investment, business ownership, professional achievements and exceptional talent. From eligibility assessment to Emirates ID issuance, our specialists guide you through every stage.',
  btn1: 'Check My Eligibility', btn1Link: '/visa-check/',
  btn2: 'Calculate Visa Cost', btn2Link: '/golden-visa-cost/',
  trust: ['Free Initial Consultation', 'Family Applications', 'VIP Assistance'],
};

export function mergeHero(o?: Partial<HomeHero>): HomeHero {
  const d = HOME_HERO;
  const pick = (k: keyof Omit<HomeHero, 'trust'>) => (typeof o?.[k] === 'string' && o[k]!.trim() ? o[k]!.trim() : d[k]);
  const trust = Array.isArray(o?.trust) ? o!.trust.map((x) => String(x).trim()).filter(Boolean).slice(0, 5) : [];
  return {
    badge: pick('badge'), line1: pick('line1'), line2: pick('line2'), gold: pick('gold'), lead: pick('lead'),
    btn1: pick('btn1'), btn1Link: pick('btn1Link'), btn2: pick('btn2'), btn2Link: pick('btn2Link'),
    trust: trust.length ? trust : d.trust,
  };
}
