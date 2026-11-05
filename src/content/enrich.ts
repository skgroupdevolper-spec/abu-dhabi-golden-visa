// Page data drawn from the official sources and service links in the owner's PDFs (ICP, ADRO, ADDED,
// TAMM/DMT, MOHRE and the owner's own FamilyVisaUAE price sheets), rewritten in our own words.
// Applied on top of the page text: quick facts for the hero, the online application link, and
// detailed sections (steps, fee tables, documents, comparisons). Checked 5 November 2026.
import type { Page, Section } from './types';
import { FEE_SCHEDULE } from '@/lib/fees';

type Fact = { label: string; value: string };
const n = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const F = FEE_SCHEDULE;
const VISA = F.perPerson.visa.aed, EID = F.perPerson.emiratesId.aed, COS = F.perPerson.changeOfStatus.aed;
const MED = F.medical.normal.aed, VIPMED = F.medical.vip.aed, VAL = F.propertyValuation.aed;
const MAIN_OUT = VISA + EID + MED; // from abroad, adult
const MAIN_IN = MAIN_OUT + COS; // inside the UAE
const CHILD_OUT = VISA + EID; // under 18, no medical

/* ---------------- shared Golden Visa blocks ---------------- */
export const GV_STEPS: Section = {
  type: 'steps',
  title: 'Ten steps from document check to Emirates ID',
  intro: 'We run every stage and only come back to you when we need a signature, a document or your attendance.',
  items: [
    { title: 'Document review', text: 'We check your passport, photo and route documents (title deed, contract, licence or certificates) so the file is complete before anything is filed.' },
    { title: 'Nomination and pre-approval', text: 'Your file is submitted for nomination and pre-approval with the competent Abu Dhabi entity and ICP.' },
    { title: 'Current visa cancelled (if any)', text: 'A UAE residence visa you already hold is cancelled before the Golden Visa is issued. Visitors skip this step.' },
    { title: 'Entry permit', text: 'A Golden Visa entry permit is issued, matched to whether you are inside or outside the UAE.' },
    { title: 'Change of status', text: 'Already in the UAE? Your status is switched without leaving the country.' },
    { title: 'Medical fitness test', text: 'Everyone aged 18 or over completes the medical screening. Standard or VIP appointments.' },
    { title: 'Emirates ID and biometrics', text: 'We file the Emirates ID application. Fingerprints are taken only if the system asks for them.' },
    { title: 'Health insurance', text: 'Abu Dhabi residence requires health insurance, issued before the residence application goes in.' },
    { title: 'Golden Visa issued', text: 'Your 10-year residence is issued digitally.' },
    { title: 'Emirates ID delivered', text: 'The card is printed and delivered by courier to your registered address.' },
  ],
  note: 'The order can change by route and by whether you apply from inside or outside the UAE.',
};

export const GV_FEES: Section = {
  type: 'table',
  title: 'Government fees, person by person',
  intro: 'Estimated government fees for a new 10-year Golden Visa. You see the full itemised list before you pay anything.',
  head: ['Item', 'Who pays it', 'AED'],
  rows: [
    ['Immigration and residence visa', 'Each person', n(VISA)],
    ['Emirates ID, 10 years', 'Each person', n(EID)],
    ['Change of status', 'Only if inside the UAE', n(COS)],
    ['Medical test, standard', 'Each person aged 18+', n(MED)],
    ['Medical test, VIP (instead of standard)', 'Optional', n(VIPMED)],
    ['Property value certificate', 'Property route only', n(VAL)],
    ['Sponsor file opening', 'Once per family', n(F.sponsorFile.aed)],
    ['Main applicant, from abroad', 'Total', n(MAIN_OUT)],
    ['Main applicant, inside the UAE', 'Total', n(MAIN_IN)],
    ['Property investor, inside the UAE (with valuation)', 'Total', n(MAIN_IN + VAL)],
    ['Child under 18, from abroad', 'Total', n(CHILD_OUT)],
    ['Health insurance', 'Each person', 'Separate quote'],
    ['Our service fee (Standard or VIP)', 'Per file', 'Quoted in writing + 5% VAT'],
  ],
  note: `Fee schedule dated ${F.date}. Government fees can change; we confirm the final amount in writing before you pay.`,
};

export const GV_SPEED: Section = {
  type: 'table',
  title: 'Standard or VIP Fast Track',
  head: ['', 'Standard', 'VIP Fast Track'],
  rows: [
    ['Usual time to issue', '7 to 14 working days', '4 to 5 working days'],
    ['Eligibility and document review', 'Included', 'Included'],
    ['Government filing', 'Included', 'Included'],
    ['Medical appointment', 'Standard', 'Priority (VIP)'],
    ['Emirates ID assistance', 'Included', 'Included'],
    ['Pick-up and drop-off', 'Optional', 'Included where offered'],
    ['Case updates', 'Standard', 'Priority'],
    ['Approval', 'Subject to the authority', 'Subject to the authority'],
  ],
  note: 'Times depend on approvals and appointment slots and are not guaranteed.',
};

const GV_COMPARE_RETIRE: Section = {
  type: 'table',
  title: 'Golden Visa or Retirement Visa?',
  intro: 'Both can come from Abu Dhabi property. This is how they differ.',
  head: ['', 'Golden Visa (property)', 'Retirement Visa (property)'],
  rows: [
    ['Length', '10 years, renewable', '5 years, renewable'],
    ['Lowest property value', 'AED 2 million', 'AED 1 million'],
    ['Property type', 'Ready, off-plan or mortgaged', 'Ready, completed home only'],
    ['Ownership', 'Sole owner', 'Sole owner'],
    ['Age', 'No age limit', '55 or older'],
    ['Several properties', 'Can be added together', 'Not usually relevant'],
    ['Family', 'Spouse, children and parents', 'Spouse and children'],
  ],
};

const GV_FACTS = (first: Fact): Fact[] => [
  first,
  { label: 'Government fees from', value: `AED ${n(MAIN_OUT)}` },
  { label: 'Processing', value: '7–14 working days · VIP 4–5' },
  { label: 'Validity', value: '10 years, renewable' },
];

const FAMILY_FACTS: Fact[] = [
  { label: 'Per family member from', value: `AED ${n(CHILD_OUT)}` },
  { label: 'Medical test', value: 'Only for ages 18+' },
  { label: 'Validity', value: 'Same as the sponsor’s Golden Visa' },
  { label: 'Processing', value: 'Usually alongside the sponsor' },
];

/* ---------------- page-specific data ---------------- */
type Rich = { facts?: Fact[]; apply?: string; add?: Section[]; patch?: (s: Section[]) => Section[] };

const without = (titles: RegExp) => (s: Section[]) => s.filter((x) => !('title' in x && x.title && titles.test(x.title)));

export const RICH: Record<string, Rich> = {
  '/golden-visa/': { facts: GV_FACTS({ label: 'Routes', value: '8 Golden Visa categories' }), apply: 'golden-visa', add: [GV_STEPS, GV_FEES, GV_SPEED] },
  '/golden-visa/property-investment/': {
    apply: 'gv-property',
    facts: [
      { label: 'Property value', value: 'AED 2M+ in Abu Dhabi, sole owner' },
      { label: 'Government fees from', value: `AED ${n(MAIN_OUT + VAL)}` },
      { label: 'Processing', value: '7–14 working days · VIP 4–5' },
      { label: 'Validity', value: '10 years, renewable' },
    ],
    patch: (s) => {
      const out = without(/Joint ownership|Documents and ownership|Application and nomination|Processing timelines/)(s);
      const at = Math.max(1, out.findIndex((x) => x.type === 'tool'));
      out.splice(at, 0,
        { type: 'list', style: 'cards', title: 'Does your property qualify?', items: ['AED 2 million or more in total: one property, or several in Abu Dhabi added together', 'Off-plan units can qualify with an approved developer and the required amount paid', 'Mortgaged homes can qualify once the bank issues its NOC and your equity meets the rules', 'Sole ownership only: a property shared with another person, even a spouse, is not accepted on this route'] },
        { type: 'list', style: 'docs', title: 'Documents to have ready', items: ['Title deed or pre-registration certificate (Abu Dhabi Real Estate Centre)', 'Passport copy, valid for at least six more months', 'Recent digital photo on a white background', 'Sales and purchase agreement (SPA)', 'Developer NOC in Arabic (off-plan)', 'Bank NOC (mortgaged property only)', 'Property valuation certificate'] },
        { type: 'text', title: 'A sales contract alone is not enough', body: ['The application needs a title deed or a pre-registration certificate from the Abu Dhabi Real Estate Centre. A signed SPA without one is not accepted, so we check this first.', 'Fully owned property is proven with a sale contract registered with the Department of Municipalities and Transport (DMT) showing AED 2,000,000 or more, or a Real Estate Unit Value Certificate from the DMT.'] },
        GV_STEPS,
      );
      return out;
    },
    add: [GV_FEES, GV_SPEED, GV_COMPARE_RETIRE],
  },
  '/golden-visa/business-investors/': { apply: 'gv-investor', facts: GV_FACTS({ label: 'Investment', value: 'AED 2M deposit or company capital' }), add: [GV_STEPS, GV_FEES, GV_SPEED] },
  '/golden-visa/entrepreneurs/': { apply: 'gv-entrepreneur', facts: GV_FACTS({ label: 'Who', value: 'Approved idea or AED 1M+ revenue' }), add: [GV_STEPS, GV_FEES, GV_SPEED] },
  '/golden-visa/skilled-professionals/': { apply: 'gv-professional', facts: GV_FACTS({ label: 'Salary', value: 'AED 30,000+ a month' }), add: [GV_STEPS, GV_FEES, GV_SPEED] },
  '/golden-visa/exceptional-talents/': { apply: 'gv-talent', facts: GV_FACTS({ label: 'Who', value: 'Recommended talents' }), add: [GV_STEPS, GV_FEES] },
  '/golden-visa/scientists-researchers/': { apply: 'gv-talent', facts: GV_FACTS({ label: 'Who', value: 'Recommended scientists' }), add: [GV_STEPS, GV_FEES] },
  '/golden-visa/students-graduates/': { apply: 'gv-student', facts: GV_FACTS({ label: 'Who', value: 'Top students and graduates' }), add: [GV_STEPS, GV_FEES] },
  '/golden-visa/humanitarian-other/': { apply: 'gv-other', facts: GV_FACTS({ label: 'Who', value: 'Humanitarian and frontline' }), add: [GV_STEPS, GV_FEES] },

  '/family-golden-visa/': {
    apply: 'gv-family',
    facts: FAMILY_FACTS,
    add: [
      { type: 'table', title: 'Who can join your Golden Visa', head: ['Family member', 'Key condition', 'Key document'], rows: [
        ['Spouse', 'Married to the Golden Visa holder', 'Marriage certificate, attested'],
        ['Children', 'No age limit for sons or daughters', 'Birth certificate, attested'],
        ['Parents', 'Proof of relationship and insurance', 'Your birth certificate, attested'],
        ['Newborn', 'Within 120 days of the birth', 'UAE birth certificate and passport'],
      ] },
      { type: 'table', title: 'Family government fees', head: ['Family member', 'From abroad (AED)', 'Inside the UAE (AED)'], rows: [
        ['Adult (18+), standard medical', n(MAIN_OUT), n(MAIN_IN)],
        ['Child under 18 (no medical)', n(CHILD_OUT), n(CHILD_OUT + COS)],
        ['Sponsor file opening (once)', n(F.sponsorFile.aed), n(F.sponsorFile.aed)],
      ], note: `Fee schedule dated ${F.date}. Health insurance and our service fee are quoted separately.` },
      { type: 'table', title: 'Deadlines that cost money if missed', head: ['Deadline', 'What it means'], rows: [
        ['60 days', 'From the entry permit date to complete residence when a family member arrives from abroad'],
        ['120 days', 'From birth to put a newborn on a residence visa before fines start'],
        ['30 days', 'Grace period after a family visa expires; renew before it ends'],
      ] },
    ],
  },
  '/family-golden-visa/spouse/': { apply: 'gv-family', facts: FAMILY_FACTS },
  '/family-golden-visa/children/': { apply: 'gv-family', facts: FAMILY_FACTS },
  '/family-golden-visa/parents/': { apply: 'gv-family', facts: [{ label: 'Per parent from', value: `AED ${n(MAIN_OUT)}` }, ...FAMILY_FACTS.slice(1)] },
  '/family-golden-visa/renewal/': { apply: 'gv-renewal', facts: FAMILY_FACTS },
  '/family-golden-visa/newborn/': {
    apply: 'newborn',
    facts: [
      { label: 'Deadline', value: '120 days from birth' },
      { label: 'Government fees from', value: 'AED 965.34 (2-year sponsor)' },
      { label: 'Golden Visa sponsor', value: 'From AED 2,518.19' },
      { label: 'Medical test', value: 'Not needed for babies' },
    ],
    patch: () => [
      { type: 'text', title: 'You have 120 days from the date of birth', body: ['A baby born in the UAE must have a passport and a residence visa within 120 days of birth. The clock starts on the birth date, and a daily fine applies from day 121, so the best time to start is in the first two weeks.', 'The sponsoring parent needs a monthly salary of at least AED 4,000 (or AED 3,000 with accommodation) on a standard visa. Golden Visa holders sponsor under their Golden Visa. A mother who meets the female-sponsor rules can sponsor in her own name.'] },
      { type: 'steps', title: 'Five stages, in this order', items: [
        { title: 'Documents ready before the birth', text: 'Both parents’ passports and Emirates IDs, and an attested marriage certificate.' },
        { title: 'Birth certificate', text: 'Issued by the hospital and the health authority within days of the birth.' },
        { title: 'MOFA attestation', text: 'The birth certificate is attested by the UAE Ministry of Foreign Affairs.' },
        { title: 'Baby’s passport', text: 'Issued by your embassy or consulate in the UAE.' },
        { title: 'Residence visa and Emirates ID', text: 'We file with ICP, and the visa is issued. No medical test is needed for babies.' },
      ] },
      { type: 'list', style: 'docs', title: 'Documents for the residence visa', items: ['Sponsor’s passport and Emirates ID copies', 'Sponsor’s labour contract or Golden Visa details', 'Baby’s passport copy', 'Recent passport photo of the baby on a white background', 'Attested birth certificate', 'Health insurance for the baby'] },
      { type: 'table', title: 'Government fees', head: ['Sponsoring parent’s visa', 'AED'], rows: [
        ['Employment or partner visa (2 years)', '965.34'],
        ['Golden Visa (10 years)', '2,518.19'],
        ['Example breakdown, 2-year sponsor: MOFA attestation 150.00 + Emirates ID 355.00 + residence 460.34', '965.34'],
      ], note: 'Outside Dubai, including the MOFA attestation of the birth certificate. Partner and investor sponsors may pay a refundable deposit. The passport fee is set by your embassy.' },
      { type: 'tool', tool: 'apply', title: 'Start your baby’s residence online' },
    ],
  },

  '/retirement-visa/': {
    apply: 'retirement',
    facts: [
      { label: 'Age', value: '55 or older' },
      { label: 'Property route', value: 'AED 1M+, ready home, sole owner' },
      { label: 'Validity', value: '5 years, renewable' },
      { label: 'Family', value: 'Spouse and children' },
    ],
  },
  '/remote-work-visa/': {
    apply: 'virtual-work',
    facts: [
      { label: 'Income', value: 'About USD 3,500 a month' },
      { label: 'Employer', value: 'Outside the UAE' },
      { label: 'Validity', value: '1 year, renewable' },
      { label: 'Insurance', value: 'UAE-valid health cover' },
    ],
  },

  '/services/investor-visa/': {
    apply: 'investor-visa',
    facts: [
      { label: 'Government fees from', value: 'AED 2,346 (mainland example)' },
      { label: 'Processing', value: '10–15 working days in the UAE' },
      { label: 'Validity', value: '2 years (3 in some free zones)' },
      { label: 'Family', value: 'Spouse, children and parents' },
    ],
    add: [
      { type: 'list', style: 'cards', title: 'What you need before you apply', items: ['A share in, or directorship of, a licensed UAE company', 'An active trade licence (mainland or free zone)', 'Your name on the memorandum of association', 'Share capital that meets the licensing authority’s rule', 'A medical fitness test', 'A clean UAE visa record'] },
      { type: 'table', title: 'Government fees, line by line (mainland example)', head: ['Item', 'AED'], rows: [
        ['Establishment card (new company only)', '575.00'], ['Entry permit', '1,126.00'], ['Change of status (inside the UAE only)', '675.00'],
        ['Medical test, standard (VIP 720)', '285.00'], ['Visa stamping', '550.00'], ['Emirates ID, 2 years', '385.00'],
        ['From abroad, company already has a card', '2,346.00'], ['Inside the UAE, new company', '3,596.00'],
        ['Each family member: adult / child, from', '1,532 / 1,247'],
      ], note: 'Example figures for a mainland company; Abu Dhabi and each free zone publish their own fees, so we quote yours. A refundable deposit can apply per family member.' },
      { type: 'table', title: 'Investor visa or Golden Visa?', head: ['', 'Investor / partner visa', 'Golden Visa'], rows: [
        ['Length', '2 years (3 in some free zones)', '10 years'], ['Sponsor', 'Your own company', 'Self-sponsored'], ['Minimum', 'Licensing authority capital', 'AED 2M investment'], ['Family', 'Spouse, children, parents', 'Spouse, children of any age, parents'],
      ] },
    ],
  },
  '/services/maid-visa/': {
    apply: 'maid-visa',
    facts: [
      { label: 'Sponsor salary', value: 'AED 25,000 a month (22,000 with housing)' },
      { label: 'Cost from', value: 'AED 8,500 (Tadbeer) · 17,925 direct' },
      { label: 'Processing', value: '5–7 working days to stamping' },
      { label: 'Validity', value: '2 years' },
    ],
    add: [
      { type: 'list', style: 'cards', title: 'Check these three conditions first', items: ['Income of around AED 25,000 a month (AED 22,000 is generally accepted with employer housing)', 'Your family lives with you in the UAE: single residents living alone cannot sponsor', 'A home with at least two bedrooms on a registered tenancy contract'] },
      { type: 'steps', title: 'Step by step', items: [
        { title: 'Entry permit', text: 'The employment entry permit lets the worker enter, or starts a change of status.' },
        { title: 'Change of status', text: 'If the worker is already here on a visit visa, the status is switched without exit.' },
        { title: 'Medical fitness test', text: 'Blood test and chest X-ray at an approved centre.' },
        { title: 'Emirates ID and biometrics', text: 'First-time applicants visit once for fingerprints.' },
        { title: 'MOHRE contract', text: 'The official domestic worker contract is drafted and submitted.' },
        { title: 'Visa stamping', text: 'The residence visa is issued and the Emirates ID card is delivered.' },
      ] },
      { type: 'table', title: 'Two ways to sponsor', head: ['', 'Through a Tadbeer centre', 'Sponsor directly'], rows: [
        ['Typical cost (2 years)', 'From AED 8,500 (centres quote 8,500–9,000)', 'From AED 17,925 including a refundable AED 2,000 deposit'],
        ['Who is the sponsor', 'The licensed centre', 'You, on your own file'],
        ['Health insurance', 'Basic cover in the package', 'Arranged separately'],
      ], note: 'Typical figures for budgeting. Our service fee is quoted before you pay.' },
    ],
  },
  '/services/tourist-visa/': {
    apply: 'tourist-visa',
    facts: [
      { label: 'Length', value: '30 or 60 days' },
      { label: 'Entries', value: 'Single or multiple' },
      { label: 'Passport', value: 'Valid 6+ months' },
      { label: 'Price', value: 'Quoted by nationality' },
    ],
  },
  '/services/iloe-insurance/': {
    apply: 'iloe',
    facts: [
      { label: 'Basic salary up to AED 16,000', value: 'AED 5 a month + VAT' },
      { label: 'Basic salary above AED 16,000', value: 'AED 10 a month + VAT' },
      { label: 'Fine for not subscribing', value: 'AED 400' },
      { label: 'Benefit', value: '60% of basic salary, up to 3 months' },
    ],
    add: [
      { type: 'table', title: 'Premiums and benefits', head: ['', 'Category A', 'Category B'], rows: [
        ['Basic salary', 'AED 16,000 or less', 'More than AED 16,000'],
        ['Premium', 'AED 5 a month (+VAT)', 'AED 10 a month (+VAT)'],
        ['Monthly benefit cap', 'AED 10,000', 'AED 20,000'],
      ], note: 'Benefits are 60% of the average basic salary for up to 3 months per claim.' },
      { type: 'list', style: 'cards', title: 'Claim rules', items: ['At least 12 months of continuous subscription', 'Claim within 30 days of losing the job', 'Not dismissed for disciplinary reasons and did not resign', 'Late premium for 3 months can cancel the policy, with an AED 200 fine for late payment'] },
    ],
  },
  '/services/employment-visas-permits/': {
    apply: 'employment',
    facts: [
      { label: 'New hire steps', value: 'About 8 stages' },
      { label: 'MOHRE category', value: '1, 2 or 3 sets the fee' },
      { label: 'Status change window', value: '60 days' },
      { label: 'Quote', value: 'Per employee, itemised' },
    ],
    add: [
      { type: 'steps', title: 'How a new hire is onboarded', items: [
        { title: 'Offer letter', text: 'Priced by skill level: unskilled, diploma, degree or doctorate.' },
        { title: 'Labour insurance', text: 'Mandatory worker insurance for the classification.' },
        { title: 'Labour payment', text: 'MOHRE fee by company category (1, 2 or 3).' },
        { title: 'Entry permit', text: 'Inside or outside the UAE.' },
        { title: 'Change of status', text: 'Only if the employee is already in the UAE, within 60 days.' },
        { title: 'Medical and Emirates ID', text: 'Fitness test (standard or VIP) and Emirates ID application.' },
        { title: 'Tawjeeh and ILOE', text: 'Labour orientation and job-loss insurance.' },
        { title: 'Visa stamping and labour card', text: 'Residence stamped and the final labour card issued.' },
      ] },
      { type: 'table', title: 'MOHRE company categories', head: ['Category', 'What it usually means'], rows: [
        ['Category 1', 'Lowest labour fee: skilled and diverse workforce with good conditions'],
        ['Category 2', 'Standard fee: other MOHRE conditions met, no more than half the staff from one nationality'],
        ['Category 3', 'Highest fee: average conditions and more than half from one nationality'],
      ] },
    ],
  },
  '/services/visa-validity-check/': {
    apply: 'visa-check',
    facts: [
      { label: 'Price', value: 'Free check' },
      { label: 'What you need', value: 'Passport no., nationality, date of birth' },
      { label: 'Overstay fine', value: 'AED 50 a day' },
      { label: 'Authority', value: 'ICP (Abu Dhabi and other emirates)' },
    ],
    add: [
      { type: 'steps', title: 'Check it yourself on the ICP portal', items: [
        { title: 'Open ICP smart services', text: 'Go to the official ICP smart services website.' },
        { title: 'Public services', text: 'Choose Public Services from the top menu.' },
        { title: 'File validity', text: 'Select File Validity, then search by passport information.' },
        { title: 'Enter your details', text: 'Passport number, nationality and date of birth, or your file number.' },
        { title: 'See the result', text: 'The status, expiry date and any grace period are shown.' },
      ], note: 'Visas issued in Dubai are held by GDRFA Dubai; visas from Abu Dhabi and the other emirates are held by ICP.' },
    ],
  },
  '/visa-check/': { apply: 'golden-visa', facts: [{ label: 'Price', value: 'Free' }, { label: 'Time', value: 'About 1 minute' }, { label: 'Result', value: 'Possible routes + next steps' }, { label: 'Follow-up', value: 'WhatsApp, in your language' }] },
  '/document-services/valuation-certificate/': {
    apply: 'valuation',
    facts: [
      { label: 'Fee (investment land)', value: 'AED 2,700' },
      { label: 'Commercial / agricultural', value: 'AED 4,500 / 900' },
      { label: 'Time', value: 'About 3 working days' },
      { label: 'Issued by', value: 'DMT, through TAMM' },
    ],
  },
  '/services/tasheel/': {
    apply: 'tasheel',
    facts: [
      { label: 'Authority', value: 'MOHRE (Ministry of Human Resources)' },
      { label: 'Government fees', value: 'About AED 76 to 5,000 per transaction' },
      { label: 'New work permit', value: 'Around 2 working days' },
      { label: 'Channels', value: 'Online, app or service centre' },
    ],
    add: [
      { type: 'list', style: 'cards', title: 'Tasheel transactions we file', items: ['New establishment registration and establishment card', 'Work permit issue and renewal', 'Unified labour contract registration and updates', 'Labour card and establishment card renewal', 'Visa quota applications', 'Wage Protection System (WPS) registration', 'Employee transfers, including free zone to mainland', 'Mission cards, absence reports and e-signature cards'] },
      { type: 'steps', title: 'How a Tasheel request runs', items: [
        { title: 'Documents', text: 'We collect and check the passport, trade licence and establishment card.' },
        { title: 'MOHRE submission', text: 'The transaction is typed and submitted through the official MOHRE channel.' },
        { title: 'Processing', text: 'MOHRE reviews it; a complete work permit request usually takes about 2 working days.' },
        { title: 'Approval and records', text: 'We send you the approved documents and confirm your MOHRE records are updated.' },
      ], note: 'The fee for each transaction depends on its type and your company’s MOHRE classification.' },
    ],
  },
  '/services/tawjeeh/': {
    apply: 'tawjeeh',
    facts: [
      { label: 'Who', value: 'New mainland employees and job changers' },
      { label: 'Session', value: 'About 30 minutes, in person or online' },
      { label: 'Languages', value: 'English, Arabic, Urdu and more' },
      { label: 'Certificate', value: 'Issued on completion' },
    ],
    add: [
      { type: 'list', style: 'cards', title: 'What the orientation covers', items: ['Contract types, working hours, overtime, leave and end-of-service gratuity under the UAE Labour Law (Federal Decree-Law 33 of 2021)', 'The Wage Protection System and how salaries are paid', 'Worker rights, health and safety and how to change employer', 'How to check a contract and file a complaint with MOHRE'] },
    ],
  },
  '/services/adjd-wills/': {
    apply: 'adjd-wills',
    facts: [
      { label: 'Registered with', value: 'Abu Dhabi Judicial Department' },
      { label: 'Who', value: 'Muslims and non-Muslims, residents or not' },
      { label: 'Covers', value: 'Assets in all seven emirates' },
      { label: 'Registration', value: 'Remote, by video call' },
    ],
    add: [
      { type: 'steps', title: 'From draft to registered will', items: [
        { title: 'Your wishes', text: 'Tell us your assets, heirs and guardianship wishes.' },
        { title: 'Draft for approval', text: 'We prepare the draft and send it to you to approve.' },
        { title: 'Arabic translation', text: 'The approved will is prepared in Arabic and English.' },
        { title: 'Remote registration', text: 'The signed will is uploaded to ADJD; your identity is verified and the will is read over by video call.' },
        { title: 'Digital copy', text: 'ADJD emails you the registered will.' },
      ], note: 'An ADJD will covers assets in the UAE only. Assets abroad need a will in that country.' },
      { type: 'list', style: 'docs', title: 'What to have ready', items: ['Passport or Emirates ID', 'List of UAE assets (property, bank accounts, shares, business ownership)', 'Names of beneficiaries, executor and guardians'] },
    ],
  },
  '/services/visa-cancellation/': { apply: 'cancellation', facts: [{ label: 'Covers', value: 'Golden, family and domestic visas' }, { label: 'Grace period', value: 'Checked before you exit' }, { label: 'Fines', value: 'Checked and cleared' }, { label: 'Quote', value: 'In writing first' }] },
  '/services/golden-visa-renewal/': { apply: 'gv-renewal', facts: GV_FACTS({ label: 'When', value: 'Start before expiry' }), add: [GV_FEES] },
  '/services/emirates-id/': { apply: 'emirates-id', facts: [{ label: 'Emirates ID, 10 years', value: `AED ${n(EID)}` }, { label: 'Biometrics', value: 'Only if the system asks' }, { label: 'Delivery', value: 'Courier to your address' }, { label: 'Services', value: 'New, renewal, replacement' }] },
  '/services/medical-biometrics/': { apply: 'medical', facts: [{ label: 'Standard medical', value: `AED ${n(MED)}` }, { label: 'VIP medical', value: `AED ${n(VIPMED)}` }, { label: 'Who', value: 'Everyone aged 18+' }, { label: 'Booking', value: 'Nearest centre, earliest slot' }] },
  '/services/entry-permit-status-change/': { apply: 'golden-visa', facts: [{ label: 'Change of status', value: `AED ${n(COS)}` }, { label: 'From abroad', value: 'Entry permit issued first' }, { label: 'Inside the UAE', value: 'No need to leave' }, { label: 'Arrival window', value: '60 days to complete residence' }] },
};

const DEFAULT_FACTS: Fact[] = [
  { label: 'Consultation', value: 'Free, no obligation' },
  { label: 'Quote', value: 'Itemised, in writing' },
  { label: 'Updates', value: 'WhatsApp at every step' },
  { label: 'Languages', value: '20 languages' },
];

const isGv = (p: string) => p.startsWith('/golden-visa/') || /^\/golden-visa-(for|from)-/.test(p);

/** Featured image by topic (owner's photos). */
function defaultImage(p: string) {
  if (/property|valuation|retirement|real-estate/.test(p)) return '/images/property.webp';
  if (/investor|business|entrepreneur|company|employment|work-permit|freelanc|executive|professional|tasheel|tawjeeh|clearing|bank|engineer|technology|doctor|healthcare|teacher|scientist|talent|artist|student|humanitarian|frontline/.test(p)) return '/images/investor.webp';
  if (/family|newborn|spouse|children|parent|maid|marriage|birth/.test(p)) return /newborn|children/.test(p) ? '/images/family-2.webp' : '/images/family.webp';
  if (/golden-visa|visa-check|benefits|how-to-apply|processing|requirements|cost|for-|from-/.test(p)) return '/images/skyline.webp';
  return '/images/skyline-2.webp';
}

/** Adds quick facts, the apply link and detailed sections to every page. */
export function enrich(page: Page): Page {
  if (page.article || ['/privacy/', '/terms/', '/disclaimer/', '/apply/'].includes(page.path)) return page;
  const r = RICH[page.path];
  let sections = page.sections;
  if (r?.patch) sections = r.patch(sections);
  let add = r?.add ?? [];
  // Profession and country Golden Visa pages share the route blocks.
  if (!r && isGv(page.path)) add = [GV_STEPS, GV_FEES, GV_SPEED];
  if (!r && page.path.startsWith('/family-golden-visa/')) add = [GV_STEPS];
  if (add.length) {
    const have = new Set(sections.map((s) => ('title' in s ? s.title : '')));
    const extra = add.filter((s) => !have.has('title' in s ? s.title ?? '' : ''));
    const tail = sections.findIndex((s) => s.type === 'tool' && s.tool === 'lead');
    sections = tail >= 0 ? [...sections.slice(0, tail), ...extra, ...sections.slice(tail)] : [...sections, ...extra];
  }
  const facts = page.facts ?? r?.facts ?? (isGv(page.path) ? GV_FACTS({ label: 'Route', value: page.eyebrow.replace(/^Golden Visa for /, '') }) : DEFAULT_FACTS);
  const image = page.image ?? defaultImage(page.path);
  const apply = page.apply ?? r?.apply ?? (isGv(page.path) ? 'golden-visa' : page.path.split('/').filter(Boolean).pop());
  return { ...page, sections, facts, apply, image, imageAlt: page.imageAlt ?? page.h1 };
}
