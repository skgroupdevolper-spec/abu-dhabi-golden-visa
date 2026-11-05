// Country landing pages (developer specification, section 10). No nationality-based guarantees:
// every applicant must meet the same Golden Visa conditions.
import type { Page } from './types';

type C = { path: string; menu: string; country: string; people: string; legal: string; degree: string; extra: string; lang?: string };

export const COUNTRIES: C[] = [
  { path: '/golden-visa-for-indians/', menu: 'India', country: 'India', people: 'Indian citizens', legal: 'Personal documents are usually certified in India (state level or MEA), legalised by the UAE Embassy in New Delhi or a UAE consulate, then attested by MOFA in the UAE.', degree: 'Degrees often need state verification before the MEA and UAE Embassy stages, and an equivalency certificate for professional routes.', extra: 'Many Indian professionals already living in the UAE qualify through the AED 30,000 salary route without buying property.', lang: 'Hindi' },
  { path: '/golden-visa-for-pakistanis/', menu: 'Pakistan', country: 'Pakistan', people: 'Pakistani citizens', legal: 'Documents are attested by the Ministry of Foreign Affairs of Pakistan, legalised by the UAE Embassy in Islamabad or a UAE consulate, then attested by MOFA in the UAE.', degree: 'Degrees are usually verified by the Higher Education Commission (HEC) before the foreign ministry and UAE Embassy stages.', extra: 'Family files are common: we prepare marriage (Nikah Nama) and birth certificates in the right order so the whole family can apply together.', lang: 'Urdu' },
  { path: '/golden-visa-for-russians/', menu: 'Russia', country: 'Russia', people: 'Russian citizens', legal: 'Documents issued in Russia are legalised through the Russian authorities and the UAE Embassy in Moscow, then attested by MOFA in the UAE, with certified Arabic translation.', degree: 'Diplomas need legalisation and, for professional routes, an equivalency certificate.', extra: 'Property investors are a large share of Russian applicants; we verify ownership and value before you commit to a purchase.', lang: 'Russian' },
  { path: '/golden-visa-for-kazakhs/', menu: 'Kazakhstan', country: 'Kazakhstan', people: 'Kazakh citizens', legal: 'Documents are legalised through the Kazakh authorities and the UAE Embassy in Astana, then attested by MOFA in the UAE, with certified Arabic translation.', degree: 'Diplomas need legalisation and, for professional routes, an equivalency certificate.', extra: 'We plan the order of documents so your family can travel and apply together.', lang: 'Russian' },
  { path: '/golden-visa-for-chinese/', menu: 'China', country: 'China', people: 'Chinese citizens', legal: 'Documents issued in China are legalised through the Chinese authorities and the UAE Embassy in Beijing or a UAE consulate, then attested by MOFA in the UAE, with certified Arabic translation.', degree: 'Degree certificates and transcripts need legalisation, and professional routes need an equivalency certificate.', extra: 'Business owners and investors often compare the company and property routes; we show you which has the clearest evidence.', lang: 'Chinese' },
  { path: '/golden-visa-for-filipinos/', menu: 'Philippines', country: 'the Philippines', people: 'Filipino citizens', legal: 'Documents are authenticated by the Department of Foreign Affairs of the Philippines, legalised by the UAE Embassy in Manila, then attested by MOFA in the UAE.', degree: 'Degrees and transcripts are usually authenticated (CHED and DFA) before the UAE Embassy stage.', extra: 'Healthcare and engineering professionals often qualify through the professional route; we check your classification and salary first.' },
  { path: '/golden-visa-for-nigerians/', menu: 'Nigeria', country: 'Nigeria', people: 'Nigerian citizens', legal: 'Documents are authenticated by the Nigerian Ministry of Foreign Affairs, legalised by the UAE Embassy in Abuja, then attested by MOFA in the UAE.', degree: 'Degrees need verification and authentication before the UAE Embassy stage, and an equivalency certificate for professional routes.', extra: 'We check every document before you send originals, so nothing has to travel twice.' },
  { path: '/golden-visa-for-egyptians/', menu: 'Egypt', country: 'Egypt', people: 'Egyptian citizens', legal: 'Documents are attested by the Egyptian Ministry of Foreign Affairs and the UAE Embassy in Cairo, then by MOFA in the UAE. Arabic documents usually need no translation.', degree: 'Degrees are attested by the issuing university, the Egyptian authorities and the UAE Embassy, plus an equivalency certificate for professional routes.', extra: 'Doctors, engineers and teachers often qualify through the professional route; we review your licence and salary first.', lang: 'Arabic' },
  { path: '/golden-visa-from-uk/', menu: 'United Kingdom', country: 'the United Kingdom', people: 'British citizens', legal: 'UK documents are usually legalised by the FCDO, then by the UAE Embassy in London, then attested by MOFA in the UAE, with certified Arabic translation.', degree: 'Degree certificates follow the same chain, and professional routes need an equivalency certificate.', extra: 'Many British applicants live in the UAE already; we can usually change your status without you leaving the country.' },
  { path: '/golden-visa-from-usa/', menu: 'United States', country: 'the United States', people: 'US citizens', legal: 'US documents are usually authenticated at state level and by the US Department of State, legalised by the UAE Embassy in Washington, then attested by MOFA in the UAE.', degree: 'Degrees follow the same chain, and professional routes need an equivalency certificate.', extra: 'If you already hold property or a company in Abu Dhabi, we review which route fits best before any purchase.' },
  { path: '/golden-visa-for-turkish-citizens/', menu: 'Turkey', country: 'Turkey', people: 'Turkish citizens', legal: 'Documents issued in Turkey are legalised through the Turkish authorities and the UAE Embassy in Ankara or the consulate in Istanbul, then attested by MOFA in the UAE, with certified Arabic translation.', degree: 'Diplomas need legalisation and, for professional routes, an equivalency certificate.', extra: 'Business owners can often use their UAE company; we check ownership and capital documents first.', lang: 'Turkish' },
  { path: '/golden-visa-for-germans/', menu: 'Germany', country: 'Germany', people: 'German citizens', legal: 'German documents are usually legalised through the German authorities and the UAE Embassy in Berlin, then attested by MOFA in the UAE, with certified Arabic translation.', degree: 'Degree certificates follow the same chain, and professional routes need an equivalency certificate.', extra: 'Families moving from Germany usually apply together; we prepare marriage and birth certificates first.', lang: 'German' },
];

export const COUNTRY_PAGES: Page[] = COUNTRIES.map((c) => ({
  path: c.path,
  seoTitle: `Abu Dhabi Golden Visa for ${c.people} | Requirements & Documents`,
  meta: `How ${c.people} can apply for the 10-year Abu Dhabi Golden Visa: routes, documents from ${c.country.replace(/^the /, '')}, attestation, process and costs.`,
  eyebrow: `Golden Visa · ${c.menu}`,
  h1: `Abu Dhabi Golden Visa for ${c.people}`,
  intro: `${c.people} apply for the Abu Dhabi Golden Visa on exactly the same terms as everyone else: the route you qualify for depends on your property, investment, business, profession or talent, not your passport. What changes is how your documents are prepared. ${c.extra}`,
  cta: { label: 'Check My Eligibility', href: '/visa-check/' },
  sections: [
    {
      type: 'cards',
      title: 'Routes you can apply through',
      items: [
        { title: 'Property investment', text: 'Abu Dhabi property worth AED 2 million or more.', href: '/golden-visa/property-investment/' },
        { title: 'Business & investors', text: 'Company capital, deposits or tax paid.', href: '/golden-visa/business-investors/' },
        { title: 'Skilled professionals', text: 'Degree, UAE work permit, AED 30,000 salary.', href: '/golden-visa/skilled-professionals/' },
        { title: 'Family', text: 'Spouse, children and parents.', href: '/family-golden-visa/' },
      ],
    },
    {
      type: 'table',
      title: `Documents from ${c.country}`,
      head: ['Document', 'How it is prepared'],
      rows: [
        ['Passport', `Valid ${c.people.replace(' citizens', '')} passport with at least 6 months left, plus a recent photo`],
        ['Marriage and birth certificates', c.legal],
        ['Degree certificates', c.degree],
        ['Translation', 'Documents not in Arabic or English may need certified legal translation in the UAE'],
      ],
      note: 'Requirements can change. We confirm the current chain for your documents before you send originals.',
    },
    {
      type: 'steps',
      title: 'How the process works',
      items: [
        { title: 'Free eligibility check', text: 'We confirm your route and list the documents you need.' },
        { title: 'Documents and attestation', text: `We guide the ${c.country.replace(/^the /, '')} and UAE attestation stages.` },
        { title: 'Nomination', text: 'Your file is submitted through the Abu Dhabi channel for your route.' },
        { title: 'Entry permit or change of status', text: 'From abroad you receive an entry permit; inside the UAE we change your status.' },
        { title: 'Medical, Emirates ID and residence', text: 'We book the appointments and follow your file until it is issued.' },
      ],
      note: 'Entry rules depend on your passport and current residence. We tell you whether you need a visit visa first or can enter on the Golden Visa entry permit.',
    },
    {
      type: 'faq',
      title: 'Questions',
      items: [
        { q: `Is the Golden Visa easier or harder for ${c.people}?`, a: 'Neither. Every nationality meets the same conditions; only the document preparation differs.' },
        { q: `Can I apply while living in ${c.country.replace(/^the /, '')}?`, a: 'Yes. Many routes can start from abroad. You enter on the Golden Visa entry permit and complete the medical, Emirates ID and residence in the UAE.' },
        { q: 'Can my family join me?', a: 'Yes: spouse, children of any age and parents with health insurance, once their relationship documents are attested.' },
        ...(c.lang ? [{ q: `Do you speak ${c.lang}?`, a: `Our advisors can help in ${c.lang}, and the website is available in 20 languages.` }] : []),
      ],
    },
    { type: 'tool', tool: 'eligibility', title: 'Check your eligibility in a minute' },
  ],
  related: ['/how-to-apply/', '/requirements-documents/', '/golden-visa-cost/'],
}));
