// Second round of extra sections for pages that were still short (client review, November 2026).
// Facts from ICP, u.ae, TAMM, ADDED and ADIO, rewritten in our own words. Nothing here promises approval.
import type { Section } from './types';
import { CAT_TABS, GV_BENEFITS, GV_DOCS_BASE, GV_FAQ_COMMON, HOW_NOMINATION, type Extra } from './pages-extra';
import { COUNTRIES } from './countries';

type Tab = { label: string; sub?: string; text?: string; items?: string[]; facts?: { label: string; value: string }[] };
const tabs = (title: string, intro: string, list: Tab[]): Section => ({ type: 'tabs', title, intro, tabs: list });
const table = (title: string, head: string[], rows: string[][], note?: string): Section => ({ type: 'table', title, head, rows, note });
const ticks = (title: string, items: string[], intro?: string): Section => ({ type: 'list', title, intro, items, style: 'ticks' });
const cards = (title: string, items: string[], intro?: string): Section => ({ type: 'list', title, intro, items, style: 'cards' });
const docs = (title: string, items: string[], intro?: string): Section => ({ type: 'list', title, intro, items, style: 'docs' });
const steps = (title: string, items: { title: string; text: string }[], note?: string): Section => ({ type: 'steps', title, items, note });

const ATTEST_CHAIN = steps('How documents from abroad are made valid in the UAE', [
  { title: 'Issuing authority', text: 'The certificate is first certified where it was issued: the university, registry office or notary.' },
  { title: 'Foreign ministry', text: 'The foreign ministry of the issuing country authenticates the signature.' },
  { title: 'UAE embassy', text: 'The UAE embassy or consulate in that country legalises the document.' },
  { title: 'MOFA in the UAE', text: 'The Ministry of Foreign Affairs attests it inside the UAE, usually online with a digital stamp.' },
  { title: 'Legal translation', text: 'A sworn legal translator prepares the Arabic version for documents not issued in Arabic.' },
], 'We check every certificate before it travels, so nothing has to be sent twice.');

const FAMILY_STEPS = steps('How we add a family member to your file', [
  { title: 'Document check', text: 'We review relationship certificates, passports and photos and tell you what needs attestation.' },
  { title: 'Entry permit or status change', text: 'If the relative is abroad, an entry permit is issued. If they are already in the UAE, the status is changed without leaving.' },
  { title: 'Health insurance', text: 'Each family member needs valid health insurance for the residence period.' },
  { title: 'Medical and biometrics', text: 'Adults 18 and over take the medical test. Fingerprints are taken for Emirates ID where required.' },
  { title: 'Residence and Emirates ID', text: 'Residence is issued linked to your Golden Visa and the Emirates ID card is delivered.' },
]);

const OUR_PROCESS = steps('How a case runs with us', [
  { title: 'Free eligibility check', text: 'Send your passport and a short summary. A named advisor replies with the route that fits and what is missing.' },
  { title: 'Written quote', text: 'Government fees listed at cost and our professional fee fixed in writing before you pay anything.' },
  { title: 'Document preparation', text: 'Attestation, translation, valuation certificates and forms prepared and checked twice.' },
  { title: 'Filing and follow-up', text: 'We file with TAMM, ICP, ADIO or the relevant authority and answer any requests for more information.' },
  { title: 'Medical, ID and handover', text: 'Appointments booked for you, Emirates ID tracked and your documents handed back with a renewal reminder.' },
]);

const RETIRE: Extra = {
  top: [tabs('Retirement routes', 'You must be 55 or older. The authorities then look at your work history and one financial condition. Tap a route.', [
    { label: 'Property', sub: 'AED 1M+', items: ['Property in the UAE worth at least AED 1 million', 'Owned in your name, with title deed and valuation', 'A ready property, not off-plan', 'Valuation certificate from the land department'] },
    { label: 'Savings', sub: 'AED 1M+', items: ['Financial savings of at least AED 1 million', 'Usually held as a fixed deposit with a UAE bank', 'Bank letter confirming the balance and term'] },
    { label: 'Income', sub: 'Annual', items: ['Annual income of at least AED 180,000 from any source, inside or outside the UAE', 'In Dubai the benchmark is higher: AED 240,000 a year', 'Pension statements or bank evidence of regular income'] },
    { label: 'Work history', sub: '15 years', items: ['At least 15 years of work, inside or outside the UAE', 'Service certificates or pension records help prove it', 'Combined with one of the financial conditions above'] },
  ])],
  add: [
    steps('How the retirement visa is issued', [
      { title: 'Eligibility review', text: 'We check your age, work history and the financial condition you will use, and which emirate you will file in.' },
      { title: 'Financial evidence', text: 'Bank letters, title deed, valuation or pension statements prepared and translated where needed.' },
      { title: 'Application', text: 'The request is filed with ICP for Abu Dhabi and the northern emirates, or GDRFA in Dubai.' },
      { title: 'Entry permit or status change', text: 'From abroad you receive an entry permit. Inside the UAE your status is changed.' },
      { title: 'Medical, insurance, Emirates ID', text: 'Medical test, health insurance valid in the UAE, biometrics and Emirates ID.' },
      { title: 'Residence for 5 years', text: 'The visa is issued for 5 years and can be renewed while you still meet the conditions.' },
    ], 'The authority decides each application. We confirm the current benchmark for your emirate before you apply.'),
    docs('Retirement visa documents', ['Passport valid for at least six months', 'Recent photo on a white background', 'Proof of the financial condition: bank letter, title deed with valuation, or pension statements', 'Evidence of work history: service or pension certificates', 'Health insurance valid in the UAE', 'Marriage certificate, attested, if your spouse joins you']),
    table('Retirement visa or Golden Visa?', ['Point', 'Retirement visa', 'Golden Visa'], [
      ['Age', '55 or older', 'No age limit'],
      ['Length', '5 years, renewable', 'Up to 10 years, renewable'],
      ['Property threshold', 'AED 1 million', 'AED 2 million'],
      ['Income route', 'AED 180,000 a year', 'Not available on its own'],
      ['Family', 'Spouse and children', 'Spouse, children and parents'],
    ], 'If you hold AED 2 million in property, the Golden Visa usually gives more. We show you both in the free check.'),
    ticks('Living in Abu Dhabi as a retiree', ['No income tax on your pension or savings', 'Access to private hospitals with UAE health insurance', 'Sponsor your spouse and children', 'Open UAE bank accounts and buy property in designated areas', 'Renew every 5 years while you still qualify']),
  ],
  faq: [
    { q: 'Can I apply from outside the UAE?', a: 'Yes. You receive an entry permit and complete the medical and Emirates ID after arrival.' },
    { q: 'Can I use a mortgaged property?', a: 'The property route normally expects the property to be fully owned. If yours is mortgaged, the savings or income route may fit better.' },
    { q: 'Does my spouse need to be 55 too?', a: 'No. Your spouse joins as your dependant under your retirement visa.' },
    { q: 'Can I work on a retirement visa?', a: 'The visa is designed for people who are retired. If you plan to keep working, we check whether a different visa suits you.' },
  ],
};

const GREEN: Extra = {
  top: [tabs('Who the Green Visa is for', 'A self-sponsored 5-year residence. No employer or UAE sponsor is needed. Tap a group.', [
    { label: 'Skilled employees', sub: 'AED 15,000+', items: ['Valid employment contract in the UAE', 'Occupation in level 1, 2 or 3 of the MOHRE classification', 'Bachelor’s degree or equivalent', 'Monthly salary of at least AED 15,000'] },
    { label: 'Freelancers', sub: 'Self-employed', items: ['Freelance or self-employment permit from MOHRE', 'Bachelor’s degree or specialised diploma', 'Annual income of at least AED 360,000 over the past two years, or proof of financial solvency during the stay'] },
    { label: 'Investors & partners', sub: 'Company owners', items: ['Proof of investment in a UAE company', 'Approval from the local licensing authority', 'Multiple investments can be combined'] },
  ])],
  add: [
    ticks('What a Green Visa gives you', ['5 years of residence, renewable', 'No employer or sponsor needed', 'Sponsor your spouse, children and first-degree relatives', 'Sons up to age 25 and unmarried daughters of any age', 'A grace period of up to six months after the visa is cancelled or expires']),
    docs('Documents for a Green Visa', ['Passport and photo', 'Attested degree certificate', 'Employment contract and salary certificate, or freelance permit', 'Bank statements or income evidence for the last two years (freelancers)', 'Health insurance', 'Emirates ID and current visa, if in the UAE']),
    steps('How we file it', [
      { title: 'Route check', text: 'We match your salary, degree and permit to the right Green Visa group.' },
      { title: 'Documents', text: 'Degree attestation and income evidence prepared.' },
      { title: 'ICP application', text: 'Entry permit or change of status filed through ICP.' },
      { title: 'Medical and Emirates ID', text: 'Medical test, biometrics and Emirates ID, then the residence is issued.' },
    ]),
  ],
  faq: [
    { q: 'Is the Green Visa the same as the Golden Visa?', a: 'No. The Green Visa is 5 years with lower thresholds. The Golden Visa is up to 10 years with higher thresholds and more family benefits.' },
    { q: 'Can I switch from a Green Visa to a Golden Visa later?', a: 'Yes, once you meet a Golden Visa route, for example a salary of AED 30,000 or property of AED 2 million.' },
    { q: 'Does my employer have to agree?', a: 'No. The Green Visa is self-sponsored.' },
  ],
};

const COMPANY: Extra = {
  top: [tabs('Choose where to set up', 'Each setup type has different rules for activities, offices and visas. Tap one.', [
    { label: 'Mainland', sub: 'ADDED', items: ['Licensed by the Abu Dhabi Department of Economic Development (ADDED) through TAMM', 'Trade anywhere in the UAE, including government contracts', 'Office lease (Tawtheeq) needed for most activities', 'Visa quota linked to office size'] },
    { label: 'Free zone', sub: 'ADGM, KEZAD, Masdar, twofour54', items: ['Licensed by the free zone authority', 'Full foreign ownership', 'Flexi-desk options in many zones', 'Trade within the zone and abroad; mainland trade through a distributor or extra permit'] },
    { label: 'Offshore', sub: 'Holding', items: ['Holding assets and international trade', 'No UAE office or residence visas', 'Useful for asset protection and structuring'] },
  ])],
  add: [
    steps('Company setup, step by step', [
      { title: 'Activity and legal form', text: 'We choose the business activity and legal form (LLC, sole establishment, branch) that fit your plan.' },
      { title: 'Trade name and initial approval', text: 'Trade name reserved and initial approval obtained from the licensing authority.' },
      { title: 'Memorandum and office', text: 'Memorandum of association signed and office lease registered.' },
      { title: 'Trade licence', text: 'The licence is issued once fees are paid and any external approvals are in place.' },
      { title: 'Establishment and immigration cards', text: 'Labour (MOHRE) and immigration establishment cards opened so the company can sponsor visas.' },
      { title: 'Visas and bank account', text: 'Investor and employee visas processed, and support for the corporate bank account.' },
    ]),
    ticks('Corporate PRO services we handle', ['Trade licence renewal and amendments', 'Establishment card renewals', 'Employee visas, work permits and cancellations', 'Emirates ID and medical appointments', 'Document attestation and legal translation', 'Chamber of commerce and certificate of origin', 'WPS and MOHRE quota requests']),
    docs('Documents to start a company', ['Passport copies of all shareholders and managers', 'Photos on a white background', 'Current UAE visa or entry stamp, if in the UAE', 'Proposed trade names (three choices)', 'Business activity description', 'Corporate documents, attested, if a company is a shareholder']),
    table('Mainland or free zone?', ['Point', 'Mainland', 'Free zone'], [
      ['Where you can trade', 'Anywhere in the UAE', 'Inside the zone and abroad'],
      ['Government contracts', 'Yes', 'Usually not directly'],
      ['Office', 'Physical office for most activities', 'Flexi-desk often allowed'],
      ['Visas', 'Linked to office size', 'Linked to package'],
      ['Golden Visa route', 'Capital or tax paid', 'Capital or tax paid'],
    ]),
  ],
  faq: [
    { q: 'Can a company owner get a Golden Visa?', a: 'Yes, through company capital of AED 2 million or more, or through the entrepreneur route. We check your figures first.' },
    { q: 'Do I need a local partner?', a: 'Most activities on the mainland allow full foreign ownership. A few strategic activities still have conditions; we check yours.' },
    { q: 'How long does a licence take?', a: 'Many licences are issued within days once documents and approvals are ready. Activities needing outside approvals take longer.' },
  ],
};

const VALUATION: Extra = {
  top: [tabs('Why you may need a valuation certificate', 'A valuation certificate from the Abu Dhabi land authority confirms the value of your property. Tap a use.', [
    { label: 'Golden Visa', items: ['Proves the property is worth AED 2 million or more', 'Required for the real estate investor route', 'Must be recent when you file'] },
    { label: 'Retirement visa', items: ['Proves property of AED 1 million or more', 'Used with your title deed'] },
    { label: 'Banking and sale', items: ['Used by banks for mortgages and refinancing', 'Helps buyers and sellers agree a price'] },
  ])],
  add: [
    ticks('What the certificate shows', ['Owner name and property details', 'Plot, unit and area', 'Assessed market value in dirhams', 'Date of valuation and reference number']),
  ],
  faq: [
    { q: 'Can I use a valuation from a private company?', a: 'For the Golden Visa we use the certificate issued through the Abu Dhabi authority, which is what the nomination expects.' },
    { q: 'How long is the certificate valid?', a: 'It reflects value on its date. For visa files we request a recent one so it is accepted without questions.' },
  ],
};

const WHY: Extra = {
  add: [
    OUR_PROCESS,
    table('With us or on your own?', ['Task', 'On your own', 'With us'], [
      ['Finding your route', 'Read rules on several portals', 'One free check, in writing'],
      ['Attestation and translation', 'Arrange each stage yourself', 'Handled in the right order'],
      ['Portal filing', 'Learn TAMM, ICP and ADIO', 'Filed by our team'],
      ['Requests for more information', 'Answer alone', 'We reply with you'],
      ['Government fees', 'Paid directly', 'Paid at cost, with receipts'],
    ]),
    ticks('Our promises', ['We never promise approval: the authorities decide', 'No hidden fees: every dirham is listed before you pay', 'Your documents are used only for your application', 'Honest advice if another visa suits you better']),
  ],
  faq: [
    { q: 'Are you a government office?', a: 'No. We are a private licensed consultancy. Applications are decided by the UAE authorities.' },
    { q: 'Which languages do you speak?', a: 'English, Arabic, Urdu, Hindi and more. Ask on WhatsApp and we connect you with the right advisor.' },
    { q: 'Can I pay in instalments?', a: 'For larger files we can split our professional fee by stage. Government fees are paid when each stage is filed.' },
  ],
};

const CONSULT: Extra = {
  add: [
    docs('Useful to have ready', ['Passport copy', 'Current UAE visa and Emirates ID, if you live here', 'Title deed, salary certificate or company licence: whichever applies', 'List of family members who will join you']),
    cards('What we can cover in one call', ['Golden Visa: which of the eight categories fits you', 'Family: who you can sponsor and their documents', 'Property: whether your property qualifies', 'Business: company capital, licence and investor routes', 'Other visas: Green, retirement, remote work and employment', 'Costs: government fees and our fee, itemised']),
    OUR_PROCESS,
  ],
  faq: [
    { q: 'Is the consultation really free?', a: 'Yes. There is no charge and no obligation to start.' },
    { q: 'Can it be on WhatsApp?', a: 'Yes. Most consultations happen on WhatsApp chat or call, or by video.' },
    { q: 'How soon will someone reply?', a: 'During working hours we usually reply the same day.' },
  ],
};

const TIME: Extra = {
  top: [CAT_TABS],
  add: [
    ticks('How we keep your file moving', ['Documents checked twice before filing', 'Attestation started early, while other steps run', 'Medical booked as soon as the permit is issued', 'Daily follow-up on requests for more information', 'VIP fast track where the authority offers it']),
    HOW_NOMINATION,
  ],
  faq: [
    { q: 'Can I travel while the application is processing?', a: 'It depends on the stage. During a change of status you should usually stay in the UAE; we tell you when travel is safe.' },
    { q: 'Does VIP guarantee a faster approval?', a: 'No. VIP speeds up appointments and handling where offered. The decision time is set by the authority.' },
  ],
};

const BENEFITS: Extra = {
  top: [CAT_TABS],
  add: [
    cards('Benefits for your family', ['Spouse: residence linked to your Golden Visa', 'Children: sons and daughters of any age', 'Parents: sponsor with health insurance', 'Domestic workers: no fixed limit', 'If you pass away: family keeps residence until expiry']),
  ],
  faq: [
    { q: 'Do I get the Esaad card automatically?', a: 'Golden Visa holders can register for the Esaad card, which gives discounts at many shops, hotels and services.' },
  ],
};

const COST: Extra = {
  add: [
    cards('What changes your total', ['Number of family members on the file', 'Inside the UAE (status change) or outside (entry permit)', 'Medical: normal or express', 'Attestation and translation needed', 'Health insurance plan', 'Normal or VIP handling']),
    steps('How we quote', [
      { title: 'Tell us your route and family', text: 'A short message is enough to start.' },
      { title: 'Itemised quote', text: 'Each government fee listed at cost, plus our fixed fee.' },
      { title: 'Pay by stage', text: 'Government fees are paid when each stage is filed, with official receipts.' },
    ]),
  ],
};

const REQS: Extra = { add: [ATTEST_CHAIN, ticks('Photo requirements', ['Recent colour photo with a white background', 'Face fully visible, looking straight ahead', 'No glasses or headwear except for religious reasons', 'Digital file in good resolution for online portals'])] };
const HOWTO: Extra = { top: [CAT_TABS], add: [HOW_NOMINATION, GV_BENEFITS] };

const kid = (label: string, items: string[], faq: { q: string; a: string }[]): Extra => ({ add: [FAMILY_STEPS, ticks(label, items), GV_BENEFITS], faq });
const CHILDREN = kid('Good to know about children', ['Sons and daughters of any age can be sponsored by a Golden Visa holder', 'Children under 18 do not take the medical test', 'Each child needs health insurance', 'Children born abroad need attested birth certificates'], [{ q: 'Can I sponsor my son over 25?', a: 'Yes. Golden Visa holders can sponsor sons and daughters of any age.' }, { q: 'Do stepchildren qualify?', a: 'Stepchildren may need extra documents such as consent or custody papers. We check each case.' }]);
const PARENTS = kid('Good to know about parents', ['Both parents can be sponsored', 'Each parent needs health insurance valid in the UAE', 'Relationship is proven with your birth certificate', 'Parents take the medical test and give biometrics'], [{ q: 'Is there a separate income rule for parents?', a: 'On the Golden Visa your own residence supports theirs. We still check that insurance and documents are complete.' }]);
const SPOUSE = kid('Good to know about spouses', ['Marriage certificate must be attested and translated into Arabic', 'One spouse can be added at a time with separate documents', 'Spouse can work with a work permit from their employer'], [{ q: 'Can my wife or husband work?', a: 'Yes, with a work permit issued through their employer.' }]);
const RENEW = kid('Good to know about renewal', ['Renew while you still meet your Golden Visa route', 'Family renewals follow the main holder', 'Update health insurance before renewal', 'Emirates ID is renewed with the residence'], [{ q: 'When should I start renewal?', a: 'Up to six months before expiry is a safe window. Fines can apply after expiry.' }]);

const COUNTRY: Extra = {
  top: [CAT_TABS],
  add: [ATTEST_CHAIN, docs('Documents to prepare first', [...GV_DOCS_BASE, 'Attested degree or marriage and birth certificates where needed', 'Proof for your route: title deed, company licence or salary certificate']), GV_BENEFITS],
  faq: GV_FAQ_COMMON,
};

export const EXTRA2: Record<string, Extra> = {
  '/retirement-visa/': RETIRE,
  '/services/green-visa/': GREEN,
  '/services/company-setup-pro/': COMPANY,
  '/document-services/valuation-certificate/': VALUATION,
  '/why-choose-us/': WHY,
  '/free-consultation/': CONSULT,
  '/processing-time/': TIME,
  '/golden-visa-benefits/': BENEFITS,
  '/golden-visa-cost/': COST,
  '/requirements-documents/': REQS,
  '/how-to-apply/': HOWTO,
  '/family-golden-visa/children/': CHILDREN,
  '/family-golden-visa/parents/': PARENTS,
  '/family-golden-visa/spouse/': SPOUSE,
  '/family-golden-visa/renewal/': RENEW,
  '/family-golden-visa/newborn/': { add: [FAMILY_STEPS, GV_BENEFITS] },
  '/golden-visa/students-graduates/': { add: [GV_BENEFITS] },
  ...Object.fromEntries(COUNTRIES.map((c) => [c.path, COUNTRY])),
};

/** Joins two extras for the same page. */
export function joinExtra(a?: Extra, b?: Extra): Extra | undefined {
  if (!a) return b;
  if (!b) return a;
  return { top: [...(a.top ?? []), ...(b.top ?? [])], add: [...(a.add ?? []), ...(b.add ?? [])], faq: [...(a.faq ?? []), ...(b.faq ?? [])] };
}
