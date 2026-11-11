// Extra sections for the Golden Visa, profession, family, resource and company pages.
// Facts from the official sources in the owner's guide (ADDED, ICP, ADIO / Invest Abu Dhabi, Ministry of Culture,
// ADRO) rewritten in our own words. Merged into each page by enrich(). Checked 11 November 2026.
// Nothing here promises approval: nomination and visas are decided by the competent authorities.
import type { Section } from './types';

type Tab = { label: string; sub?: string; text?: string; items?: string[]; facts?: { label: string; value: string }[] };
const tabs = (title: string, intro: string, list: Tab[]): Section => ({ type: 'tabs', title, intro, tabs: list });
const table = (title: string, head: string[], rows: string[][], note?: string): Section => ({ type: 'table', title, head, rows, note });
const ticks = (title: string, items: string[], intro?: string): Section => ({ type: 'list', title, intro, items, style: 'ticks' });
const cards = (title: string, items: string[], intro?: string): Section => ({ type: 'list', title, intro, items, style: 'cards' });
const docs = (title: string, items: string[], intro?: string): Section => ({ type: 'list', title, intro, items, style: 'docs' });
const steps = (title: string, items: { title: string; text: string }[], note?: string): Section => ({ type: 'steps', title, items, note });

export type Extra = { top?: Section[]; add?: Section[]; faq?: { q: string; a: string }[] };

/* ---------------- shared blocks ---------------- */
const HOW_NOMINATION = steps('How nomination works in Abu Dhabi', [
  { title: 'Free eligibility check', text: 'We review your documents against the official criteria for your category before anything is filed.' },
  { title: 'Nomination request', text: 'UAE residents apply for Golden Visa nomination through the Abu Dhabi Residents Office on TAMM. Applicants outside the UAE apply to the Abu Dhabi Investment Office (ADIO). We prepare and submit the file with you.' },
  { title: 'Recommendation where required', text: 'Some categories need a recommending body: a business incubator for entrepreneurs, a ministry for specialists, the Ministry of Culture for creatives.' },
  { title: 'Entry permit or change of status', text: 'After nomination, ICP issues the Golden Visa entry permit. From outside the UAE you can receive a six-month multiple-entry visa to complete the process.' },
  { title: 'Medical, Emirates ID, insurance', text: 'Adults complete the medical test, Emirates ID is filed, and health insurance is issued.' },
  { title: 'Residence issued', text: 'The 10-year residence is issued and the Emirates ID delivered. Family follows in the same file.' },
], 'Nomination is decided by the competent authority; we prepare a complete file so it is reviewed without delay.');

const GV_BENEFITS = ticks('What every Golden Visa holder gets', [
  'Up to 10 years of residence, renewed while you still qualify',
  'No sponsor or employer needed: change jobs or start a business freely',
  'No six-month rule: long periods abroad do not cancel the visa',
  'Sponsor your spouse, children of any age and parents',
  'Sponsor domestic workers, with no fixed limit',
  'Family members keep their residence until expiry if the holder passes away',
  'Esaad privilege card with discounts across the UAE and abroad',
]);

const GV_DOCS_BASE = ['Passport valid for at least six months', 'Recent colour photo on a white background', 'Emirates ID and current visa, if you live in the UAE', 'Health insurance for you and your family'];

const GV_FAQ_COMMON = [
  { q: 'Can I apply from outside the UAE?', a: 'Yes. Non-residents apply for nomination through the Abu Dhabi Investment Office, then receive an entry permit to complete the medical and Emirates ID in the UAE.' },
  { q: 'Is health insurance required?', a: 'Yes. ICP requires valid health insurance for the holder and the family for the residence period.' },
  { q: 'Do I lose the visa if I stay abroad for more than six months?', a: 'No. The Golden Visa is not cancelled by long stays abroad.' },
  { q: 'Can I sponsor my parents?', a: 'Yes, Golden Visa holders can sponsor parents, subject to sponsor evidence and medical insurance.' },
];

/* ---------------- category data (official criteria) ---------------- */
const CAT_TABS = tabs('The eight Golden Visa categories', 'Tap a category to see the official criteria in our own words. Each route is 10 years and renewable.', [
  { label: 'Real estate investors', sub: 'AED 2M+ property', items: ['Property worth AED 2 million or more in total, in the investor’s name', 'Mortgage from an approved UAE bank allowed: your own equity must be AED 2M+', 'Off-plan units from an approved developer, with AED 2M+ paid', 'Sole ownership on the Abu Dhabi route'] },
  { label: 'Investors', sub: 'AED 2M deposit or capital', items: ['AED 2 million deposit with an investment fund or national bank', 'Or company capital or partnership share of AED 2M+', 'Or a company paying AED 250,000+ a year in federal taxes (or your share of it) for two years', 'Capital must be your own, not loan-financed, with proof of source'] },
  { label: 'Entrepreneurs', sub: 'Approved or proven ventures', items: ['Owner or partner of an approved SME with AED 1M+ annual revenue', 'Or an approved pioneering idea from an accredited incubator or authority', 'Or founder of ventures sold for AED 7M+ in total'] },
  { label: 'Skilled professionals', sub: 'AED 30,000+ salary', items: ['Valid UAE work permit and contract', 'Bachelor’s degree or equivalent', 'Monthly salary of AED 30,000 or more', 'Occupational level 1 (executives) or level 2 (specialists)'] },
  { label: 'Specialists & scientists', sub: 'Recommended by an authority', items: ['Scientists and researchers: Emirates Scientists Council', 'Healthcare: Ministry of Health and Prevention or local authority', 'Education: Ministry of Education or local authority', 'Industry and advanced technology: Ministry of Industry or local authority'] },
  { label: 'Exceptional talents', sub: 'Culture, sport, innovation', items: ['Culture and arts: awards, recognised works or prestigious memberships, recommended by the Ministry of Culture', 'Sport: outstanding achievement or international leadership role', 'Innovators, inventors and digital talents, as set by the authorities'] },
  { label: 'Outstanding students', sub: 'Top grades', items: ['School: Grade 12 with 95%+, attested by the Ministry of Education', 'UAE university: GPA 3.5+ (category A) or 3.8+ (category B), graduated within 2 years', 'Top-100 world university: bachelor’s GPA 3.5+, graduated within 2 years'] },
  { label: 'Humanitarian & frontline', sub: 'Pioneers and heroes', items: ['5+ years with an international, regional or non-profit organisation, with a degree', 'Or supporter of humanitarian work with AED 2M+ in contributions', 'Frontline heroes and award recipients as nominated by the authorities'] },
]);

/* ---------------- professions ---------------- */
function profession(name: string, recommender: string, licence: string): Extra {
  return {
    top: [tabs(`Two routes for ${name.toLowerCase()}`, 'Most professionals qualify through one of these. We check which fits you best.', [
      { label: 'Salary route', sub: 'AED 30,000+', items: ['Valid UAE work permit and contract', 'Bachelor’s degree or higher, attested', 'Monthly salary AED 30,000+ (basic and allowances as shown on the contract)', 'Occupational level 1 or 2 on the work permit'] },
      { label: 'Specialist route', sub: 'Recommended', items: [`Recommendation from ${recommender}`, 'Proof of experience and standing in your field', licence] },
      { label: 'Another route', sub: 'Investment or talent', text: 'If your salary or role does not fit, property, investment or talent routes may still work. We review all of them in the free check.' },
    ])],
    add: [
      docs('Documents to send us', [...GV_DOCS_BASE, 'Employment contract and salary certificate', 'Attested degree (equivalency where required)', licence]),
      HOW_NOMINATION,
      table('Common reasons professional files are delayed', ['Problem', 'How we prevent it'], [
        ['Salary below AED 30,000 on the contract', 'We check the contract figures before filing'],
        ['Work permit shows a lower occupational level', 'We review the classification and options first'],
        ['Degree not attested', 'Attestation and equivalency arranged in advance'],
        ['Missing professional licence', 'Licence status checked with you'],
      ]),
    ],
    faq: [
      { q: 'Does my employer need to apply for me?', a: 'No. The Golden Visa is self-sponsored. Your employer only provides the contract and salary documents.' },
      { q: 'Do allowances count towards AED 30,000?', a: 'The total monthly salary on the contract is assessed. We check how your contract is read before filing.' },
      { q: 'Can I change jobs after I get the visa?', a: 'Yes. The residence is not tied to your employer.' },
      ...GV_FAQ_COMMON,
    ],
  };
}

/* ---------------- family ---------------- */
const FAMILY_TABS = tabs('Who can join your Golden Visa', 'Each family member has its own documents. Tap one.', [
  { label: 'Spouse', items: ['Attested marriage certificate with Arabic translation', 'Spouse’s passport and photo', 'Health insurance', 'Medical test (18+) and Emirates ID'] },
  { label: 'Children', sub: 'Any age', items: ['Sons and daughters of any age can be sponsored', 'Attested birth certificates', 'Medical test only for 18+', 'Health insurance for each child'] },
  { label: 'Parents', items: ['Sponsor evidence and relationship proof', 'Health insurance for each parent', 'Medical test and Emirates ID'] },
  { label: 'Newborn', sub: '120 days', items: ['Birth certificate attested by MOFA', 'Baby’s passport', 'No medical or fingerprints for babies'] },
  { label: 'Domestic workers', items: ['Golden Visa holders can sponsor domestic workers', 'Contract, medical, Emirates ID and insurance'] },
]);

/* ---------------- pages ---------------- */
export const EXTRA: Record<string, Extra> = {
  '/golden-visa/': {
    top: [CAT_TABS],
    add: [
      GV_BENEFITS,
      table('Golden Visa, retirement visa or a standard visa?', ['Visa', 'Valid for', 'Sponsor', 'Time abroad', 'Family'], [
        ['Golden Visa', 'Up to 10 years', 'Self', 'No limit', 'Spouse, children of any age, parents'],
        ['Retirement visa', '5 years', 'Self', 'Standard rules', 'Spouse and children'],
        ['Employment or investor visa', '2–3 years', 'Employer or company', 'Cancelled after 6 months abroad', 'With salary rules'],
      ]),
      HOW_NOMINATION,
      table('Where to apply', ['Your situation', 'Nomination channel'], [
        ['Living in the UAE', 'Abu Dhabi Residents Office on TAMM'],
        ['Living outside the UAE', 'Abu Dhabi Investment Office (ADIO) online application'],
        ['Graduates', 'Abu Dhabi Residents Office or ICP'],
        ['Creatives', 'Ministry of Culture recommendation, then nomination'],
      ]),
    ],
    faq: GV_FAQ_COMMON,
  },
  '/golden-visa/business-investors/': {
    top: [tabs('Which investor route fits you?', 'Three ways to qualify without real estate.', [
      { label: 'Deposit', sub: 'AED 2M', items: ['AED 2,000,000 deposited with an investment fund or national bank', 'Bank or fund letter confirming the amount', 'Funds fully owned, not borrowed'] },
      { label: 'Company capital', sub: 'AED 2M share', items: ['Company capital or your partnership share of AED 2M+', 'Trade licence and commercial registration showing paid-in capital and your share', 'Register showing no attachments on the company or your share'] },
      { label: 'Taxes paid', sub: 'AED 250,000/year', items: ['Your company pays AED 250,000+ a year in federal taxes, or your share equals that', 'Tax return forms for the two previous years', 'Tax payment receipts'] },
    ])],
    add: [docs('Documents to send us', [...GV_DOCS_BASE, 'Valid trade licence', 'Commercial registration certificate with paid-in capital and shares', 'Bank or investment fund letter (AED 2M+)', 'Tax returns and receipts (tax route)', 'Commercial register extract with no attachments']), HOW_NOMINATION, GV_BENEFITS],
    faq: [{ q: 'Can borrowed money count?', a: 'No. Invested capital must be fully owned by you, with proof of where it came from.' }, { q: 'Does my family get visas too?', a: 'Yes, and the investor route also allows sponsoring one advisor and one executive director.' }, ...GV_FAQ_COMMON],
  },
  '/golden-visa/entrepreneurs/': {
    top: [tabs('Three entrepreneur routes', 'You need one of these, approved by an incubator or authority.', [
      { label: 'Operating SME', sub: 'AED 1M+ revenue', items: ['Owner or partner of a UAE SME in an approved sector', 'Annual revenue of AED 1,000,000 or more', 'Trade licence, two years of audited accounts, company profile', 'Nomination from a UAE business incubator'] },
      { label: 'Approved idea', sub: 'Incubator approval', items: ['Approval for a pioneering concept from an accredited incubator, the Ministry of Economy or ICP', 'Business concept deck and founders’ profiles', 'Acceptance letter from an incubator, venture studio or accelerator'] },
      { label: 'Previous exit', sub: 'AED 7M+ sold', items: ['Founder or co-founder of ventures sold for AED 7,000,000+ in total', 'Trade licence of the previous project', 'Proof of the sale and buyer details', 'Nomination from a UAE business incubator'] },
    ])],
    add: [HOW_NOMINATION, GV_BENEFITS],
    faq: [{ q: 'Can I sponsor my employees?', a: 'The entrepreneur route lets you sponsor yourself, your family and employees on long-term visas.' }, { q: 'Which incubators nominate?', a: 'Accredited UAE incubators such as Hub71 in Abu Dhabi. Applications on TAMM are sent to the relevant incubator automatically.' }, ...GV_FAQ_COMMON],
  },
  '/golden-visa/skilled-professionals/': profession('Skilled professionals', 'the relevant ministry or local authority', 'Professional licence, for regulated jobs'),
  '/golden-visa/scientists-researchers/': {
    top: [tabs('Recommendation by field', 'Specialists qualify through a recommendation from the competent body.', [
      { label: 'Scientists & researchers', items: ['Recommendation from the Emirates Scientists Council', 'Research record, publications and citations'] },
      { label: 'Healthcare specialists', items: ['Recommendation from the Ministry of Health and Prevention or local health authority', 'UAE health licence'] },
      { label: 'Education specialists', items: ['Recommendation from the Ministry of Education or local authority'] },
      { label: 'Industry & advanced technology', items: ['Recommendation from the Ministry of Industry and Advanced Technology or local authority', 'Often a PhD and 5+ years’ experience in priority fields'] },
      { label: 'Senior scholars', items: ['Recommendation from the Ministry of Culture or local authorities'] },
    ])],
    add: [docs('Documents to send us', [...GV_DOCS_BASE, 'CV with publications or achievements', 'Degree certificates, attested', 'Recommendation or support letters']), HOW_NOMINATION, GV_BENEFITS],
    faq: GV_FAQ_COMMON,
  },
  '/golden-visa/exceptional-talents/': {
    top: [tabs('Talent fields', 'Recommended by the relevant authority.', [
      { label: 'Culture & arts', items: ['Heritage, literature and publishing, visual arts and design, performing arts and film, music', 'Evidence: awards or nominations, honorary positions, prestigious memberships, recognised works or major festivals', 'Recommendation from the Ministry of Culture (free service)'] },
      { label: 'Sport', items: ['Outstanding sporting achievement', 'Or a leadership role in an international sports body', 'Or a notable sports medicine specialist'] },
      { label: 'Innovation & digital', items: ['Inventors and innovators, digital technology talents', 'Criteria set by the relevant government authority'] },
    ])],
    add: [docs('Documents for a Ministry of Culture recommendation', ['Colour personal photo', 'Passport copy', 'Emirates ID and current visa, if available', 'CV with biography, main works and achievements', 'Evidence of awards, memberships or recognised works']), HOW_NOMINATION, GV_BENEFITS],
    faq: [{ q: 'Is the Ministry of Culture recommendation free?', a: 'Yes, the recommendation service is free. If it is declined you can reapply after six months.' }, ...GV_FAQ_COMMON],
  },
  '/golden-visa/students-graduates/': {
    top: [tabs('Student and graduate routes', 'Grades and timing are what count.', [
      { label: 'School students', sub: 'Grade 12', items: ['Grade 12 certificate from a licensed school', '95% or more (or equivalent)', 'Certificate attested by the Ministry of Education'] },
      { label: 'UAE university graduates', items: ['Bachelor’s, master’s or PhD from an accredited UAE university', 'Category A university: GPA 3.5+; category B: GPA 3.8+', 'Graduated within the last two years', 'Degree attested by the Ministry of Education'] },
      { label: 'Top-100 university graduates', items: ['Bachelor’s from a world top-100 university on the Ministry list', 'GPA 3.5 or more', 'Graduated within the last two years', 'Equivalency certificate from the Ministry of Education'] },
    ])],
    add: [docs('Documents to send us', [...GV_DOCS_BASE, 'Official transcripts showing the final GPA', 'Degree or Grade 12 certificate, attested', 'Equivalency certificate (graduates from abroad)']), HOW_NOMINATION],
    faq: [{ q: 'I graduated three years ago. Can I apply?', a: 'The graduate route requires graduation within the last two years. We check other routes for you.' }, ...GV_FAQ_COMMON],
  },
  '/golden-visa/humanitarian-other/': {
    top: [tabs('Humanitarian and other categories', 'Nominated by the competent authorities.', [
      { label: 'Humanitarian pioneers', items: ['5+ years as a member or outstanding employee of an international, regional, public-benefit or non-profit organisation', 'Or contributions of AED 2,000,000+ to humanitarian work', 'University degree required'] },
      { label: 'Award recipients & volunteers', items: ['Recipients of recognised awards and outstanding volunteers, as nominated by the authorities'] },
      { label: 'Frontline heroes', items: ['Frontline professionals nominated by the competent authorities'] },
    ])],
    add: [HOW_NOMINATION, GV_BENEFITS],
    faq: GV_FAQ_COMMON,
  },
  '/golden-visa/doctors/': profession('Doctors', 'the Ministry of Health and Prevention or the Department of Health', 'UAE medical licence (DoH, DHA or MOHAP)'),
  '/golden-visa/healthcare-professionals/': profession('Healthcare professionals', 'the Ministry of Health and Prevention or the Department of Health', 'UAE health professional licence'),
  '/golden-visa/engineers/': profession('Engineers', 'the Ministry of Industry and Advanced Technology or the local authority', 'Engineering registration, where your role requires it'),
  '/golden-visa/technology-specialists/': profession('Technology specialists', 'the Ministry of Industry and Advanced Technology or the local authority', 'Certifications or portfolio in your technology field'),
  '/golden-visa/teachers/': profession('Teachers & educators', 'the Ministry of Education or the local education authority', 'Teaching licence (ADEK, KHDA or MOE)'),
  '/golden-visa/executives/': profession('Executive directors', 'the relevant local authority', 'Company documents showing your executive role'),
  '/golden-visa/artists-creatives/': {
    top: [tabs('Creative fields recognised by the Ministry of Culture', 'Show evidence of at least one achievement.', [
      { label: 'Heritage', items: ['Crafts, Arabic language, heritage preservation, research and exhibitions'] },
      { label: 'Literature & publishing', items: ['Books, poetry, novels and publishing'] },
      { label: 'Visual arts & design', items: ['Fine arts, graphic and digital design, photography, architecture, fashion'] },
      { label: 'Performing arts', items: ['Theatre, opera, live shows, film and television'] },
      { label: 'Music', items: ['Production, distribution, shows and concerts'] },
    ])],
    add: [docs('Documents for the recommendation', ['Colour photo', 'Passport copy', 'Emirates ID and visa, if available', 'CV with biography, works and achievements', 'Evidence: awards, nominations, memberships, festivals, press']), HOW_NOMINATION, GV_BENEFITS],
    faq: [{ q: 'Do I need to live in the UAE first?', a: 'No. Non-residents can apply; the Ministry may ask you to complete a six-month visa step first.' }, ...GV_FAQ_COMMON],
  },
  '/golden-visa/frontline-heroes/': { add: [HOW_NOMINATION, GV_BENEFITS], faq: GV_FAQ_COMMON },

  /* family */
  '/family-golden-visa/': { top: [FAMILY_TABS], add: [GV_BENEFITS], faq: GV_FAQ_COMMON },
  '/family-golden-visa/spouse/': {
    top: [FAMILY_TABS],
    add: [docs('Spouse documents', ['Attested marriage certificate with Arabic translation', 'Spouse’s passport and photo', 'Sponsor’s Golden Visa and Emirates ID', 'Health insurance', 'Current visa, if the spouse is already in the UAE']),
      table('Common questions about spouse files', ['Situation', 'What happens'], [['Married abroad', 'Home-country, UAE embassy and MOFA attestation'], ['Married in the UAE', 'MOFA attestation only'], ['Spouse on a visit visa', 'Change of status, no exit needed'], ['Spouse working', 'Work permit from the employer; residence stays on your Golden Visa']])],
    faq: [{ q: 'Can my spouse work?', a: 'Yes, with a work permit from the employer. The residence stays under your Golden Visa.' }, ...GV_FAQ_COMMON],
  },
  '/family-golden-visa/children/': {
    top: [FAMILY_TABS],
    add: [docs('Children’s documents', ['Attested birth certificate', 'Child’s passport and photo', 'Sponsor’s Golden Visa and Emirates ID', 'Health insurance', 'Medical test only for children aged 18+'])],
    faq: [{ q: 'Is there an age limit for sons?', a: 'Golden Visa holders can sponsor children of any age.' }, { q: 'Do children need fingerprints?', a: 'Young children usually do not; older children may be asked by ICP.' }, ...GV_FAQ_COMMON],
  },
  '/family-golden-visa/parents/': {
    top: [FAMILY_TABS],
    add: [docs('Parents’ documents', ['Parents’ passports and photos', 'Your birth certificate naming the parents, attested', 'Sponsor’s Golden Visa and Emirates ID', 'Health insurance for each parent', 'Medical test and Emirates ID'])],
    faq: [{ q: 'Is there an income requirement for parents?', a: 'Golden Visa holders sponsor parents subject to sponsor evidence and insurance; we confirm what ICP asks for your file.' }, ...GV_FAQ_COMMON],
  },
  '/family-golden-visa/renewal/': {
    top: [FAMILY_TABS],
    add: [steps('Renewing your family together', [{ title: 'Check eligibility', text: 'Your own category still qualifies, and each family member’s documents are current.' }, { title: 'File the renewals', text: 'Your residence and your family’s are renewed in the same file.' }, { title: 'Medical and Emirates ID', text: 'Adults complete the medical; new Emirates IDs are issued.' }]),
      docs('Renewal documents', ['Current Golden Visas and Emirates IDs', 'Updated proof for your category', 'Passports valid for 6+ months', 'Health insurance renewals'])],
    faq: GV_FAQ_COMMON,
  },
  '/family-golden-visa/newborn/': { add: [docs('Newborn documents', ['Birth certificate attested by MOFA', 'Baby’s passport and photo', 'Parents’ passports, Golden Visa and Emirates IDs', 'Health insurance'])], faq: [{ q: 'How long do I have?', a: '120 days from birth before fines begin.' }, ...GV_FAQ_COMMON] },

  /* resources */
  '/requirements-documents/': {
    top: [tabs('Documents by route', 'Pick your route to see the official documents.', [
      { label: 'Property', items: ['Title deed or registered purchase agreement (AED 2M+), or a unit value certificate', 'Mortgaged: value certificate and a search certificate showing no seizure', 'Off-plan: approved developer agreement and proof AED 2M+ paid'] },
      { label: 'Investor', items: ['Trade licence and commercial registration with paid-in capital', 'Bank or fund letter for AED 2M+', 'Or tax returns and receipts showing AED 250,000+ a year'] },
      { label: 'Entrepreneur', items: ['Incubator nomination', 'Trade licence, audited accounts, company deck', 'Or proof of a previous AED 7M+ exit'] },
      { label: 'Professional', items: ['Work permit and contract', 'Salary certificate (AED 30,000+)', 'Attested degree'] },
      { label: 'Graduate', items: ['Transcripts with final GPA', 'Attested degree or equivalency', 'Proof of university ranking (top 100) for degrees from abroad'] },
      { label: 'Family', items: ['Attested marriage and birth certificates', 'Passports and photos', 'Health insurance'] },
    ])],
    add: [docs('Everyone needs', GV_DOCS_BASE), table('Document mistakes we fix before filing', ['Mistake', 'Fix'], [['Passport under 6 months', 'Renew first'], ['Certificates not attested', 'Attestation arranged'], ['Names spelled differently', 'Matched to the passport'], ['SPA without a title deed', 'Title deed or pre-registration certificate obtained']])],
    faq: GV_FAQ_COMMON,
  },
  '/processing-time/': {
    top: [table('How long each stage takes', ['Stage', 'Usual time'], [['Free eligibility check', 'Same day'], ['Valuation certificate (property)', '1–3 working days'], ['Nomination and pre-approval', 'A few working days, longer for recommended categories'], ['Entry permit / change of status', '1–3 working days'], ['Medical test', 'Normal 1–3 days; VIP often same day'], ['Emirates ID and residence', '2–5 working days'], ['Total, standard', 'Usually 7–14 working days'], ['Total, VIP', 'Often 4–5 working days']], 'Times depend on approvals and appointment slots. They are not guaranteed.')],
    add: [table('What makes a file faster or slower', ['Faster', 'Slower'], [['Complete documents on day one', 'Missing attestation'], ['VIP medical and biometrics', 'Peak seasons and holidays'], ['Already inside the UAE', 'Recommendation categories'], ['Clear ownership papers', 'Joint or unclear ownership']])],
    faq: GV_FAQ_COMMON,
  },
  '/golden-visa-benefits/': { top: [GV_BENEFITS], add: [table('Golden Visa versus a standard residence', ['Point', 'Golden Visa', 'Standard visa'], [['Length', 'Up to 10 years', '2–3 years'], ['Sponsor', 'Self', 'Employer or company'], ['Time abroad', 'No limit', 'Cancelled after 6 months'], ['Children', 'Any age', 'Sons up to 25'], ['Domestic workers', 'No fixed limit', 'With income rules'], ['If the holder dies', 'Family keeps residence until expiry', 'Family must transfer']])], faq: GV_FAQ_COMMON },
  '/why-choose-us/': { add: [cards('What working with us looks like', ['Free check: we tell you honestly whether you qualify before you pay', 'Written quote: government fees at cost with receipts, our fee fixed', 'One advisor: a named person on WhatsApp in your language', 'All emirates: ICP, GDRFA, MOHRE, MOFA and the courts from one team', 'Licensed: Brightlink Management Consultancy LLC, licence 1053387', 'Office: Crystal Tower, Business Bay, Dubai']), table('Normal or VIP?', ['Feature', 'Normal', 'VIP Fast Track'], [['Eligibility and document review', 'Included', 'Included'], ['Government filing', 'Included', 'Included'], ['Medical appointment', 'Standard', 'Priority'], ['Pick-up and drop-off', 'Optional', 'Where offered'], ['Case updates', 'Standard', 'Priority'], ['Approval', 'Subject to authority', 'Subject to authority']])] },
  '/how-to-apply/': { add: [table('Where your application goes', ['Your situation', 'Channel'], [['Living in the UAE', 'Abu Dhabi Residents Office on TAMM'], ['Living abroad', 'Abu Dhabi Investment Office (ADIO)'], ['Graduates', 'Residents Office or ICP'], ['Creatives', 'Ministry of Culture recommendation first']]), docs('Have these ready', GV_DOCS_BASE)], faq: GV_FAQ_COMMON },
  '/golden-visa-cost/': { add: [table('Normal or VIP package', ['Feature', 'Normal', 'VIP Fast Track'], [['Eligibility and document review', 'Included', 'Included'], ['Government filing', 'Included', 'Included'], ['Medical appointment', 'Standard', 'Priority'], ['Emirates ID assistance', 'Included', 'Included'], ['Pick-up and drop-off', 'Optional', 'Where offered'], ['Case updates', 'Standard', 'Priority'], ['Immigration approval', 'Subject to authority', 'Subject to authority']])], faq: GV_FAQ_COMMON },
  '/free-consultation/': { add: [ticks('What happens in the free consultation', ['We ask about your goal, family and documents', 'We tell you which Golden Visa route fits, or which other visa', 'You get a document list and an itemised quote in writing', 'No obligation: you decide when to start'])] },
};
