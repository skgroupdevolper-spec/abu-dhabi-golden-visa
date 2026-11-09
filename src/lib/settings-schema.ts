// Everything the main admin controls. Public fields are safe to send to browsers; secrets never are.
export type PublicSite = {
  name: string; tagline: string; url: string; operator: string; licence: string;
  whatsapp: string; whatsappDisplay: string; phone: string; email: string; office: string; hours: string; mapsUrl: string;
  /** PO Box, licence registration date (YYYY-MM-DD) and issuer, approved activities, founder: shown on About / Contact. */
  poBox?: string; registered?: string; licenceIssuer?: string; legalType?: string; activities?: string;
  founder?: { name: string; title: string; quote: string; linkedin: string };
  /** Offices on the About page globe (country, city, latitude, longitude, note). */
  offices?: { country: string; city: string; lat: number; lng: number; note?: string }[];
  /** Logo and brand images (empty = the built-in gold coin and name). */
  brand?: { logoText?: string; logoMark?: string; logo?: string; coin?: string; favicon?: string; spin?: boolean };
  /** Cities on the About page "Clients worldwide" globe (empty = built-in list). */
  world?: { country: string; city: string; lat: number; lng: number }[];
  /** Departure cities that rotate on the flight route. */
  flightFrom?: string[];
  disclaimer: string; footerAbout: string;
  social: { facebook: string; instagram: string; linkedin: string; tiktok: string; youtube: string; x: string };
  /** Languages shown on the website (empty = all 20). English is always on. */
  languages?: string[];
  features: { topBar: boolean; topBarText: string; floatingWhatsApp: boolean; mobileBar: boolean; dock: boolean; newsletter: boolean; clientLogin: boolean; chatbot: boolean; offer: boolean; preloader: boolean; languageSwitcher: boolean };
  offer: { title: string; text: string; button: string; link: string; delaySeconds: number };
  colors: { gold: string; goldDeep: string; ink: string; paper: string };
  nav: { ctaLabel: string; ctaLink: string; extra: { label: string; href: string }[]; footerLinks: { label: string; href: string }[]; copyright: string; menu?: MenuItem[]; footerCols?: MenuGroup[] };
};

export type MenuLink = { label: string; href: string; note?: string };
export type MenuGroup = { title: string; links: MenuLink[] };
/** Main menu item; with groups it opens a drop-down (4+ groups show as a tabbed panel). */
export type MenuItem = { label: string; href: string; groups?: MenuGroup[] };

export type Secrets = {
  whatsapp: {
    mode: 'link' | 'cloud'; phoneNumberId: string; accessToken: string; businessId: string; verifyToken: string; teamNumbers: string;
    autos: Record<WaEvent, boolean>; templates: Record<WaEvent, string>; templateNames: Partial<Record<WaEvent, string>>; templateLang: string;
    /** Extra messages the team adds: each one is sent too when its trigger happens. */
    customs?: WaCustom[];
  };
  smtp: { host: string; port: number; secure: boolean; user: string; pass: string; from: string; notify: string };
  seo: { homeTitle: string; homeMeta: string; googleVerify: string; bingVerify: string; headCode: string; bodyCode: string };
  ai: {
    provider: 'openai' | 'gemini' | 'anthropic' | ''; openaiKey: string; geminiKey: string; anthropicKey: string; model: string; dailyBudget: number;
    /** Optional provider and model per feature (empty = main provider). */
    routes?: Partial<Record<AiUse, { provider: 'openai' | 'gemini' | 'anthropic' | ''; model: string }>>;
    images?: { provider: 'none' | 'openai' | 'gemini'; model: string };
  };
};

export type WaCustom = { id: string; label: string; on: boolean; when: WaEvent; text: string; templateName?: string };
export type AiUse = 'chat' | 'translate' | 'writer' | 'editor';
export type WaEvent = 'leadTeam' | 'welcome' | 'status' | 'quote' | 'confirmed' | 'payment' | 'paid' | 'message' | 'document' | 'reset';

export const WA_EVENTS: { key: WaEvent; label: string; to: 'team' | 'client'; vars: string }[] = [
  { key: 'leadTeam', label: 'New enquiry (to your team)', to: 'team', vars: '{name} {phone} {service} {message}' },
  { key: 'welcome', label: 'Application opened (to client)', to: 'client', vars: '{name} {ref} {link}' },
  { key: 'status', label: 'Status update (to client)', to: 'client', vars: '{name} {ref} {status} {next} {link}' },
  { key: 'quote', label: 'Quote ready (to client)', to: 'client', vars: '{name} {ref} {total} {link}' },
  { key: 'confirmed', label: 'Order confirmed (to client)', to: 'client', vars: '{name} {ref} {route} {total} {date} {link}' },
  { key: 'payment', label: 'Payment request (to client)', to: 'client', vars: '{name} {ref} {item} {amount} {link}' },
  { key: 'paid', label: 'Payment received (to client)', to: 'client', vars: '{name} {ref} {item} {amount} {receipt} {link}' },
  { key: 'message', label: 'New message from advisor (to client)', to: 'client', vars: '{name} {ref} {text} {link}' },
  { key: 'document', label: 'New document shared (to client)', to: 'client', vars: '{name} {ref} {document} {link}' },
  { key: 'reset', label: 'Password reset code (to client)', to: 'client', vars: '{name} {code}' },
];

export const DEFAULT_SITE: PublicSite = {
  name: 'Abu Dhabi Golden Visa',
  tagline: 'Long-Term Residency & Investment Advisory',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.abudhabigoldenvisa.com').replace(/\/$/, ''),
  operator: 'Brightlink Management Consultancy LLC',
  licence: '1053387',
  whatsapp: '971566556645',
  whatsappDisplay: '+971 56 655 6645',
  phone: '+971566556645',
  email: 'info@brightlinkconsulting.ae',
  office: 'Office M08-27, M1 Floor, Crystal Tower, Millennium Central, Al Asayel St, Business Bay, Dubai, UAE',
  hours: 'Mon–Sat 9:00–18:00 · Sunday closed',
  mapsUrl: 'https://maps.app.goo.gl/Wub4NZefiQ7LBMkd9',
  poBox: '554552', registered: '2022-04-10', licenceIssuer: 'Government of Dubai, Department of Economy and Tourism (DET)', legalType: 'LLC, single owner',
  activities: 'Management consultancies\nDocuments clearing services\nProject development consultant\nMarketing research consultancies',
  offices: [
    { country: 'United Arab Emirates', city: 'Dubai', lat: 25.186, lng: 55.272, note: 'Head office · Crystal Tower, Business Bay' },
    { country: 'Pakistan', city: '', lat: 31.52, lng: 74.36, note: '' },
    { country: 'United Kingdom', city: '', lat: 51.507, lng: -0.128, note: '' },
  ],
  founder: { name: 'Muhammad Bilal Saleem', title: 'Founder & CEO, Brightlink', quote: 'I built Brightlink with one purpose: to create a link between ambition and opportunity.', linkedin: '' },
  disclaimer: 'Not an official UAE government website. Visa issuance and eligibility are subject to the competent authorities.',
  footerAbout: '',
  social: { facebook: 'https://www.facebook.com/brightlinkconsulting.uae/', instagram: 'https://www.instagram.com/brightlink.consulting/', linkedin: 'https://www.linkedin.com/company/brightlink-management-consultancy/', tiktok: 'https://www.tiktok.com/@brightlink.consulting', youtube: 'https://www.youtube.com/@brightlinkconsulting', x: 'https://twitter.com/BRIGHTLINKCONS1' },
  features: { topBar: false, topBarText: '', floatingWhatsApp: true, mobileBar: true, dock: true, newsletter: true, clientLogin: true, chatbot: true, offer: false, preloader: false, languageSwitcher: true },
  offer: { title: 'Free eligibility check', text: 'Send us your details and get a written answer on your Golden Visa route.', button: 'Start my free check', link: '/visa-check/', delaySeconds: 12 },
  colors: { gold: '#d4af37', goldDeep: '#8a6a12', ink: '#0d0d0d', paper: '#f8f7f5' },
  nav: { ctaLabel: 'Check Eligibility', ctaLink: '/visa-check/', extra: [], footerLinks: [], copyright: '' },
};

export const DEFAULT_SECRETS: Secrets = {
  whatsapp: {
    mode: 'link', phoneNumberId: '', accessToken: '', businessId: '', verifyToken: '', teamNumbers: '',
    autos: { leadTeam: true, welcome: true, status: true, quote: true, confirmed: true, payment: true, paid: true, message: true, document: true, reset: true },
    templates: {
      leadTeam: 'New enquiry from {name} ({phone}). Service: {service}. {message}',
      welcome: 'Hello {name}, your Golden Visa file {ref} is open. Follow every step here: {link}',
      status: 'Hello {name}, update on {ref}: {status}. Next: {next}. Details: {link}',
      quote: 'Hello {name}, your quote for {ref} is ready ({total}). Review and accept it here: {link}',
      confirmed: '✅ Order Confirmed\n{ref}\n\nHello {name},\n\n📄 {route}\n💰 Total: {total}\n📅 {date}\n\nWe have started working on your file and will update you shortly. 🌹\n\n🔗 Track / Pay:\n{link}',
      payment: 'Hello {name},\n\n💳 Payment request for {ref}\n{item}: {amount}\n\nPay securely by card here:\n{link}',
      paid: '✅ Payment Received, thank you! 🙏\nAmount: {amount}\nRef: {ref} | {receipt}\nFor: {item}\nAll dues for this request are cleared. 🌹\nTrack your file: {link}',
      message: 'Hello {name}, your advisor wrote on {ref}: "{text}" Reply here: {link}',
      document: 'Hello {name}, a new document is ready on {ref}: {document}. {link}',
      reset: 'Your Abu Dhabi Golden Visa portal code is {code}. It expires in 15 minutes.',
    },
    templateNames: {}, templateLang: 'en',
  },
  smtp: { host: '', port: 465, secure: true, user: '', pass: '', from: '', notify: '' },
  seo: { homeTitle: '', homeMeta: '', googleVerify: '', bingVerify: '', headCode: '', bodyCode: '' },
  ai: { provider: '', openaiKey: '', geminiKey: '', anthropicKey: '', model: '', dailyBudget: 200 },
};

export function mergeSite(o?: Partial<PublicSite>): PublicSite {
  const d = DEFAULT_SITE;
  return { ...d, ...o, social: { ...d.social, ...o?.social }, features: { ...d.features, ...o?.features }, offer: { ...d.offer, ...o?.offer }, colors: { ...d.colors, ...o?.colors }, nav: { ...d.nav, ...o?.nav } };
}
