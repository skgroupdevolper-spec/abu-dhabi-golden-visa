// Extra sections for the full service pages, so every page carries the complete set:
// benefits, who can apply, costs, steps, documents, a practical table and at least six questions.
// Merged into each page by full() in pages-services-full.ts. Our own wording; checked November 2026.
import type { Section } from './types';

type Row = string[];
export type More = {
  gives?: { title?: string; items: string[] };
  who?: { title?: string; intro?: string; items: string[] };
  fees?: { title?: string; intro?: string; head: string[]; rows: Row[]; note?: string };
  steps?: { title?: string; intro?: string; items: { title: string; text: string }[]; note?: string };
  docs?: { title?: string; intro?: string; items: string[] };
  extra?: Section[];
  faq?: { q: string; a: string }[];
};

const T = (title: string, head: string[], rows: Row[], note?: string): Section => ({ type: 'table', title, head, rows, note });
const COST = (rows: Row[], intro = 'There is no single price: the total depends on these points. You get an itemised quote before you pay.') =>
  ({ title: 'What the cost depends on', intro, head: ['Item', 'What decides it'], rows });

export const MORE: Record<string, More> = {
  /* ---------- Visas ---------- */
  '/services/family-visa/': {
    gives: { title: 'What a family visa gives your relatives', items: ['Legal residence in the UAE for the same period as your visa', 'An Emirates ID for each family member', 'School enrolment for children', 'Access to healthcare through their insurance', 'Bank accounts, driving licences and tenancy in their own name (adults)', 'Freedom to work with a work permit, without changing their residence'] },
    faq: [{ q: 'How long does a family visa last?', a: 'Normally for the same period as the sponsor’s own residence, and it is renewed with it.' }],
  },
  '/services/newborn-visa/': {
    gives: { items: ['Legal residence for your baby from birth', 'An Emirates ID in the baby’s name', 'Access to healthcare and vaccinations under insurance', 'No fines when done inside the 120 days', 'A clean file for school enrolment later'] },
    extra: [T('Who does what, stage by stage', ['Stage', 'Handled by', 'What you do'], [
      ['Documents before the birth', 'You', 'Keep passports, Emirates IDs and the attested marriage certificate ready'],
      ['Birth certificate', 'Hospital and health authority', 'Collect the notification; we follow the certificate'],
      ['MOFA attestation', 'MOFA (we submit)', 'Nothing, unless an original is needed'],
      ['Baby’s passport', 'Your embassy or consulate', 'Attend if your embassy asks for the parents in person'],
      ['Residence and Emirates ID', 'ICP or GDRFA (we submit)', 'Nothing: no medical and no fingerprints for babies'],
    ])],
  },
  '/services/maid-visa/': {
    gives: { title: 'What a legal domestic worker visa protects', items: ['Your household from fines for illegal employment', 'The worker’s right to residence, insurance and healthcare', 'A registered MOHRE contract with clear duties and salary', 'A clean exit through proper cancellation when employment ends'] },
    extra: [T('Your duties as a sponsor', ['Duty', 'What it means'], [
      ['Salary', 'Pay the agreed wage on time; many families pay through the Wage Protection System'],
      ['Rest and leave', 'Daily rest, a weekly day off and paid annual leave under the domestic worker law'],
      ['Housing and food', 'Suitable accommodation and meals, or an allowance'],
      ['Health insurance', 'A valid policy for the whole visa period'],
      ['Documents', 'The passport stays with the worker, not the sponsor'],
      ['Ending the job', 'Cancel the visa properly and pay end-of-service dues'],
    ])],
  },
  '/services/tourist-visa/': {
    gives: { items: ['Entry to all seven emirates for the length of the visa', 'Single or multiple entries, to match your trip', 'An official e-visa you can show at any airport', 'A simple route to a residence visa later, through change of status'] },
    who: { title: 'Who usually applies through us', items: ['Parents and relatives visiting UAE residents', 'Friends and family coming for a holiday', 'Business visitors on a short trip', 'Travellers on a stopover who want to see the city', 'People planning to apply for residence after arriving'] },
    fees: COST([
      ['Visa type', '14, 30 or 60 days; single or multiple entry; transit or 5-year'],
      ['Nationality', 'Some passports get a visa on arrival and need nothing'],
      ['Speed', 'Standard or express handling'],
      ['Extensions', 'Only if you extend inside the UAE'],
    ]),
  },
  '/services/investor-visa/': {
    extra: [
      T('All-in cost by emirate (mainland, approximate)', ['Emirate', 'Approx. AED', 'Validity'], [
        ['Dubai', '4,500 – 6,000', '2 years'], ['Abu Dhabi', '3,500 – 5,500', '2 years'], ['Sharjah', '3,000 – 4,500', '2 years'],
        ['Ajman', '3,000 – 4,000', '2 years'], ['Ras Al Khaimah', '3,000 – 4,000', '2 years'], ['Fujairah', '3,000 – 4,000', '2 years'], ['Umm Al Quwain', '3,000 – 4,000', '2 years'],
      ], 'Includes processing, medical, Emirates ID and stamping; excludes the licence and office rent.'),
      T('All-in cost in major free zones (approximate)', ['Free zone', 'Approx. AED', 'Validity'], [
        ['DMCC (Dubai)', '5,000 – 6,500', '2 years'], ['IFZA (Dubai)', '3,750 – 5,000', '2 years'], ['SHAMS (Sharjah)', '3,500 – 4,500', '2 years'],
        ['RAKEZ (Ras Al Khaimah)', '3,500 – 4,500', '2 years'], ['Ajman Free Zone', '3,500 – 4,500', '2 years'], ['Fujairah Creative City', '3,500 – 4,500', '2 years'], ['UAQ Free Trade Zone', '3,500 – 4,500', '2 years'],
      ], 'Many free zones bundle visas with the licence package.'),
      T('Important rules to know', ['Rule', 'What it means'], [
        ['Residency', 'Enter the UAE at least once every 180 days to keep the visa'],
        ['No other job', 'The visa does not allow salaried work for another company'],
        ['Linked to the licence', 'If the licence is cancelled, the visa is cancelled too'],
        ['Office', 'A valid business address or flexi-desk is needed'],
        ['Family and staff', 'Sponsor spouse, children, parents and domestic workers'],
      ]),
      T('Documents by company type', ['Mainland company', 'Free-zone company'], [
        ['Trade licence (DED)', 'Free-zone licence'], ['Memorandum of association', 'Share certificate'], ['Partners list', 'Certificate of incorporation'],
        ['Establishment card', 'Establishment card'], ['Office lease (Ejari / Tawtheeq)', 'Flexi-desk or office lease'],
      ]),
    ],
    faq: [
      { q: 'What happens if I close my company or sell my shares?', a: 'The visa is linked to the company, so it must be cancelled. We plan a new visa or a Golden Visa before you close.' },
      { q: 'Is a local sponsor required?', a: 'No local sponsor is needed for most activities; free zones and many mainland sectors allow 100% foreign ownership.' },
      { q: 'Can I apply while outside the UAE?', a: 'Yes. We apply for the entry permit; you then enter for the medical and Emirates ID.' },
    ],
  },
  '/remote-work-visa/': {
    extra: [T('Remote work visa or another route?', ['Visa', 'Valid for', 'Income or condition', 'Best for'], [
      ['Virtual work visa', '1 year', 'USD 3,500+ a month from abroad', 'Remote employees and owners of foreign businesses'],
      ['Freelance visa', '1–2 years', 'Activity accepted by the authority', 'Working for UAE clients'],
      ['Golden Visa', '10 years', 'Investment, salary, talent or other category', 'Long-term residence'],
      ['Employment visa', '2 years', 'A UAE employer', 'People hired by a UAE company'],
    ])],
  },

  /* ---------- Attestation ---------- */
  '/document-services/mofa-attestation/': {
    gives: { title: 'What a correctly attested document lets you do', items: ['Sponsor your spouse and children', 'Get a work permit in the right skilled category', 'Apply for the skilled-professional Golden Visa', 'Enrol children in UAE schools and universities', 'Register foreign company documents with UAE authorities'] },
    fees: COST([
      ['Issuing country', 'Each country has its own home-country and embassy steps and fees'],
      ['Document type', 'Personal, educational or commercial documents are charged differently by MOFA'],
      ['Stamps already done', 'Fewer missing stamps means a lower cost and a faster result'],
      ['Translation', 'Added only when the receiving authority asks for Arabic'],
      ['Urgency', 'Priority handling where the authorities allow it'],
    ]),
    faq: [{ q: 'Can MOFA attestation be done without the original?', a: 'For most documents the original is needed for the stamp. We collect and return it by courier.' }],
  },
  '/services/notary-power-of-attorney/': {
    gives: { items: ['Someone you trust can act for you when you are away', 'Property can be sold, bought or managed without your presence', 'Declarations accepted by courts, banks and embassies', 'Company decisions recorded in a form authorities accept'] },
    extra: [T('Which document do you need?', ['Situation', 'Document'], [
      ['A relative will sell or buy property for you', 'Special power of attorney for property'],
      ['Someone will handle all your affairs', 'General power of attorney'],
      ['An authority asks you to confirm a fact', 'Affidavit or declaration'],
      ['Your sponsor or employer must agree', 'No-objection certificate (NOC)'],
      ['Your company appoints a manager or signatory', 'Board resolution, notarised'],
      ['A copy must be certified as true', 'True copy certification'],
    ])],
    faq: [{ q: 'Can a power of attorney be cancelled?', a: 'Yes. You can revoke it before a notary at any time, and the person acting for you should be informed.' }],
  },
  '/document-services/legal-translation/': {
    gives: { items: ['Documents accepted by ministries, courts and immigration', 'Names and numbers that match your passport exactly', 'A stamped, signed copy plus a scan for online filing', 'One translation you can use for several applications'] },
    fees: COST([
      ['Language pair', 'Arabic–English is the most common; other pairs cost more'],
      ['Length', 'Charged per page or per document'],
      ['Type', 'Certificates are simple; contracts and judgments are longer'],
      ['Speed', 'Same-day handling on request'],
    ]),
    extra: [T('Turnaround by document type', ['Type', 'Examples', 'Usual time'], [
      ['Personal', 'Birth, marriage and death certificates', '24–48 hours'], ['Immigration', 'Visa, labour and sponsorship documents', '24–72 hours'],
      ['Business', 'MOA, POA and agreements', '2–4 working days'], ['Legal', 'Contracts and court documents', '2–5 working days'],
    ]), T('Translation mistakes that cause rejection', ['Mistake', 'How we prevent it'], [
      ['Name spelled differently from the passport', 'Names and dates cross-checked against your passport'],
      ['Wrong date format', 'Dates written in the format the authority expects'],
      ['Missing legal terms or clauses', 'Word-for-word legal translation, then a second check'],
      ['No certified stamp', 'MOJ licensed translator’s stamp and signature on every page'],
    ]), T('Common translations we prepare', ['Document', 'Usually needed for'], [
      ['Marriage certificate', 'Spouse visa, newborn birth registration'],
      ['Birth certificate', 'Children’s visas, schools'],
      ['Degree and transcripts', 'Work permits, Golden Visa, equivalency'],
      ['Driving licence', 'Licence exchange'],
      ['Company documents', 'Licensing, banks, courts'],
      ['Court judgments and POA', 'Legal proceedings, property'],
    ])],
    faq: [{ q: 'How fast is a legal translation?', a: 'Personal and immigration documents usually take 24–72 hours; business and legal documents 2–5 working days.' }, { q: 'Can you translate a document that is already attested?', a: 'Yes, and that is usually the best order: the translation then includes every stamp.' }, { q: 'Do you keep my documents private?', a: 'Yes. They are used only for your translation and returned or deleted afterwards.' }],
  },

  /* ---------- Employment ---------- */
  '/services/employment-visas-permits/': {
    extra: [
      T('Government fees from (Dubai sheet)', ['Service', 'Time', 'Gov. fees from (AED)'], [
        ['New employee visa', '7–10 working days', '2,820.58'], ['Visa renewal', '3–5 working days', '2,947.79'],
        ['Work permit, relative visa', '2–4 working days', '718.42'], ['Work permit, Golden Visa holder', '2–4 working days', '718.42'],
        ['Part-time or intern permit', '2–4 working days', '467.56'], ['Visa cancellation', '1–3 working days', '377.93'],
      ], 'Government and service-centre charges only; service fee, VAT, deposits and bank guarantees are quoted separately.'),
      T('MOHRE labour fee per new hire, by company category', ['Category', 'AED per hire'], [['Category 1', '328'], ['Category 2', '1,284'], ['Category 3', '3,550.35']]),
      T('Four typical files', ['File', 'Gov. fees (AED)'], [
        ['Skilled hire from abroad, category 2, standard medical', '4,559.16'], ['Unskilled hire already in the UAE, category 3, status change', '7,368.58'],
        ['Renewal, skilled employee, category 2', '3,087.79'], ['Cancellation for a leaver who has left the UAE', '478.28'],
      ]),
      T('Onboarding timeline', ['Day', 'What happens'], [
        ['Day 0', 'Itemised quote, MOHRE category confirmed, documents listed'], ['Day 1–3', 'Offer letter typed, signed and approved; labour fee paid'],
        ['Day 3–5', 'Entry permit, or status change if already in the UAE'], ['Day 5–8', 'Medical, biometrics, Tawjeeh and ILOE'], ['Day 7–10', 'Residence stamped, labour card and contract delivered'],
      ]),
      T('Dates we track so they never become fines', ['Window', 'Meaning'], [
        ['60 days from the entry permit', 'Employee must enter, or change status if already here'], ['60 days after entry', 'Finish medical, Emirates ID and stamping'],
        ['Contract end', 'Renewal raised before the labour card and residence lapse'], ['After cancellation', 'Labour and immigration cancelled in the right order so the grace period starts cleanly'],
      ]),
    ],
    gives: { title: 'What your company gains', items: ['One PRO contact for every hire, renewal and exit', 'Deadlines tracked, so no fines for late renewals or status changes', 'MOHRE, WPS, Tawjeeh and ILOE compliance kept up to date', 'Clear fees for each hire before you commit'] },
    fees: COST([
      ['Skill level', 'Unskilled, diploma, graduate, postgraduate or PhD offer letters are priced differently'],
      ['Company category', 'MOHRE category 1, 2 or 3 sets the labour payment'],
      ['Inside or outside the UAE', 'Change of status is added for staff already here'],
      ['Medical', 'Normal or VIP'],
      ['Insurance and deposits', 'Labour insurance and any refundable guarantees'],
    ]),
    faq: [{ q: 'Do you offer monthly PRO packages?', a: 'Yes. A retainer covers routine hires, renewals and cancellations at agreed rates.' }],
  },
  '/services/employment-visa/': {
    gives: { items: ['Two years of UAE residence, renewable', 'An Emirates ID, bank account and driving licence', 'Family sponsorship once the salary rules are met', 'Protection under UAE labour law and WPS'] },
    who: { items: ['Anyone offered a job by a UAE mainland or free-zone company', 'Employees moving from another UAE employer', 'Golden Visa or family-visa holders take a work permit instead of a new visa'] },
    fees: COST([
      ['Who pays', 'By law, the employer pays visa and permit costs'],
      ['Skill level and company category', 'Set the MOHRE fees'],
      ['Inside or outside the UAE', 'Change of status is added inside'],
      ['Medical type', 'Normal or VIP'],
    ]),
    faq: [{ q: 'Can I change employer later?', a: 'Yes. Under the current labour law you can move jobs following the notice and transfer rules; the new employer files a transfer.' }, { q: 'What is the probation period?', a: 'Up to six months, as stated in your contract.' }],
  },
  '/services/work-permit/': {
    gives: { items: ['The legal right to work for a named employer', 'Protection of your salary and rights under MOHRE', 'A clean labour record for future jobs', 'Golden Visa and family-visa holders can work without changing residence'] },
    who: { items: ['Employers hiring new staff', 'Residents changing jobs', 'Family-visa and Golden Visa holders taking a job', 'Students and juveniles in permitted roles', 'Companies needing short-term or project staff'] },
    faq: [{ q: 'How long is a work permit valid?', a: 'Most permits run for two years; temporary and mission permits are shorter.' }, { q: 'Who pays for the work permit?', a: 'The employer.' }],
  },
  '/services/visa-cancellation/': {
    gives: { items: ['Clean labour and immigration records', 'No absconding reports or bans', 'Your grace period confirmed in writing', 'A smooth next visa, job or exit'] },
    who: { items: ['Employees leaving a job', 'Employers closing a staff file', 'Sponsors cancelling family or domestic worker visas', 'Investors closing a company visa', 'Visitors who overstayed'] },
    fees: COST([
      ['Type of case', 'Mutual cancellation is simplest; disputes take more steps'],
      ['Emirate', 'ICP or GDRFA fees'],
      ['Fines', 'Overstay at AED 50 a day, plus any labour fines'],
      ['Inside or outside the UAE', 'Cancellation from abroad needs extra documents'],
    ]),
  },
  '/services/emirates-id/': {
    gives: { items: ['Access to banks, salaries and payments', 'Healthcare and insurance claims', 'Government and municipality services', 'Tenancy contracts and utilities', 'Faster passport control with smart gates'] },
    fees: COST([
      ['Validity', 'Fees follow the length of your residence (up to 10 years for Golden Visa)'],
      ['Type', 'New, renewal or replacement'],
      ['Late renewal', 'AED 20 a day after the 30-day grace period, up to AED 1,000'],
      ['Speed', 'Urgent printing where available'],
    ]),
    extra: [T('Lost or damaged card?', ['Situation', 'What to do'], [
      ['Lost card', 'Apply for a replacement; a police report may be required'],
      ['Damaged card', 'Apply for a replacement and return the old card if asked'],
      ['New passport', 'Update your details on the ICP file'],
      ['Name or data error', 'Request a correction with supporting documents'],
    ])],
    faq: [{ q: 'Can children get an Emirates ID?', a: 'Yes. Every resident, including newborns, needs one.' }],
  },
  '/services/medical-biometrics/': {
    gives: { items: ['A medical certificate linked to your visa file', 'One trip for medical and biometrics where possible', 'VIP options with less waiting', 'Guidance before the test if you have a health concern'] },
    fees: { title: 'Medical test fees (Abu Dhabi, ICP schedule)', head: ['Type', 'AED', 'Typical result time'], rows: [['Normal medical test', '300', '1–3 working days'], ['VIP medical test', '750', 'Often the same day']], note: 'Dubai DHA and northern emirates EHS fees differ slightly. Government fees are charged at cost.' },
    faq: [{ q: 'Do I need to fast before the test?', a: 'No, fasting is not normally required.' }, { q: 'Can I do the test while pregnant?', a: 'The chest X-ray is deferred; a deferral process lets the visa continue. We guide you through it.' }],
  },
  '/services/iloe-insurance/': {
    gives: { items: ['Up to three months of income if you lose your job involuntarily', 'No fines on your record', 'No delays when you change jobs or renew a permit', 'Low premiums from AED 5 a month'] },
    who: { title: 'Who must subscribe', items: ['Private-sector employees on the mainland and in free zones', 'Federal government employees', 'Exempt: business owners and investors, domestic workers, temporary contract workers, under-18s, and pensioners in new jobs'] },
    faq: [{ q: 'Can I pay the premium yearly?', a: 'Yes. Monthly, quarterly, half-yearly and yearly payments are accepted.' }, { q: 'How do I check whether I have a fine?', a: 'Send us your Emirates ID number; we check the subscription and any fine for free.' }],
  },
  '/services/freelancer-visa/': {
    extra: [T('Freelance options compared', ['Option', 'Residence included', 'Best for'], [
      ['Freelance permit only', 'No (you already have residence)', 'Spouses on a family visa, Golden Visa holders'],
      ['Freelance package with residence', 'Yes, 1–2 years', 'Professionals moving to the UAE'],
      ['MOHRE self-employment permit', 'Linked to your existing residence', 'Residents working independently'],
      ['Company licence', 'Investor visa', 'Growing businesses with staff'],
    ])],
    faq: [{ q: 'How long does it take?', a: 'Usually two to four weeks for the permit and residence, depending on the authority and approvals.' }, { q: 'Do I need an office?', a: 'Most freelance permits do not require a physical office; some authorities provide a shared desk.' }],
  },

  /* ---------- Property & business ---------- */
  '/services/document-clearing/': {
    gives: { items: ['No queues at typing centres or ministries', 'Files right the first time', 'One record of every document and expiry date', 'More time for your work and family'] },
    fees: COST([
      ['Service', 'Each transaction has its own government fee'],
      ['Volume', 'Monthly retainers for companies with regular files'],
      ['Speed', 'Same-day handling where the authority allows'],
      ['Courier', 'Collection and delivery of originals'],
    ]),
    extra: [T('Why files get rejected', ['Cause', 'How we prevent it'], [
      ['Broken attestation chain', 'Sequence checked before submission'],
      ['Wrong submission route', 'Right authority and channel chosen first'],
      ['Missing legal translation', 'Translation added where required'],
      ['Wrong visa category', 'Category confirmed with you'],
      ['Expired documents', 'Validity checked on day one'],
      ['Names that do not match', 'Spellings matched to the passport'],
    ])],
    faq: [{ q: 'Do I need to come to your office?', a: 'No. Most files start on WhatsApp, and originals are collected by courier.' }, { q: 'Which emirates do you cover?', a: 'All seven.' }, { q: 'Can you track our staff document expiries?', a: 'Yes. We keep a schedule and remind you before each renewal.' }],
  },
  '/services/tasheel/': {
    gives: { items: ['Work permits issued quickly when the file is compliant', 'No late fines on labour cards and establishment cards', 'WPS kept in order so new permits are not blocked', 'One PRO contact for every MOHRE transaction'] },
    fees: COST([
      ['Transaction type', 'Government fees range from about AED 76 to AED 5,000'],
      ['Company classification', 'MOHRE category changes the fee'],
      ['Skill level', 'Affects work permit fees'],
      ['Late renewal', 'Fines apply after expiry'],
    ]),
    extra: [T('Tasheel or Amer?', ['Centre', 'Handles'], [
      ['Tasheel (MOHRE)', 'Work permits, labour contracts, establishment cards, quotas, WPS, complaints'],
      ['Amer / ICP channels', 'Entry permits, residence, change of status, cancellations'],
    ])],
    faq: [{ q: 'What is an establishment card?', a: 'The company’s immigration and labour registration. Without a valid one, no new visas or permits can be issued.' }, { q: 'Can you register WPS for us?', a: 'Yes, and we help keep salary files compliant.' }, { q: 'Do free-zone companies use Tasheel?', a: 'Free zones have their own systems; Tasheel is for mainland companies.' }],
  },
  '/services/tawjeeh/': {
    gives: { items: ['Employees who know their rights and duties', 'Fewer disputes and complaints', 'A certificate that keeps the permit moving', 'Group sessions for several hires at once'] },
    fees: COST([['Session type', 'Individual or group'], ['Language', 'Most common languages available'], ['Number of employees', 'Corporate rates for groups']]),
    faq: [{ q: 'How long is the session?', a: 'About 30 minutes.' }, { q: 'Which languages are offered?', a: 'Arabic and English, plus Urdu, Hindi and other common languages at many centres.' }, { q: 'Is it done online?', a: 'This depends on the centre; many run in-person sessions. We book what is available.' }, { q: 'Does a job changer need it again?', a: 'Often yes, when the new employment requires it.' }],
  },
  '/services/driving-licence/': {
    gives: { items: ['Drive legally as a resident', 'Rent and register cars in your name', 'A licence accepted in many other countries', 'An extra photo ID if you lose your Emirates ID'] },
  },
  '/services/bank-account-opening/': {
    gives: { items: ['Salary and business payments into a UAE account', 'Local cards and online banking', 'Multi-currency options for international work', 'Merchant and payroll services for companies'] },
    fees: COST([['Account type', 'Personal, corporate or multi-currency'], ['Minimum balance', 'Set by each bank'], ['Company profile', 'Activity and jurisdiction affect the bank’s checks'], ['Extra services', 'Merchant, payroll and trade finance']]),
    extra: [T('Why bank applications stall', ['Cause', 'How we prevent it'], [
      ['Bank does not fit the profile', 'Shortlist of banks that accept your activity and nationality'],
      ['Inconsistent documents', 'Every document cross-checked first'],
      ['Unclear source of funds', 'Clear turnover and counterparties explained in the file'],
      ['Slow answers to compliance questions', 'We reply quickly on your behalf'],
    ])],
    faq: [{ q: 'Do I need to visit the bank?', a: 'Most banks need at least one meeting or video call with the account holder or signatories.' }, { q: 'Can a freelancer open a business account?', a: 'Yes, with the freelance permit and supporting documents; some banks specialise in this.' }, { q: 'Is there a minimum balance?', a: 'Each bank sets its own; we tell you before applying.' }],
  },

  /* ---------- Wills ---------- */
  '/services/difc-wills/': {
    gives: { items: ['Your assets go to the people you choose', 'A guardian of your choice for your children', 'Probate in English, with a simpler process', 'Worldwide assets can be included, subject to advice'] },
    extra: [T('DIFC will or ADJD will?', ['Point', 'DIFC will', 'ADJD will'], [
      ['Who can register', 'Non-Muslims', 'Muslims and non-Muslims'],
      ['Assets covered', 'UAE, and abroad subject to advice', 'UAE only'],
      ['Language', 'English', 'Arabic translation required'],
      ['Witnesses', 'Two at signing', 'Identity verified by video'],
      ['Typical cost', 'Higher', 'Lower'],
    ])],
  },
  '/services/adjd-wills/': {
    who: { items: ['Non-Muslims and Muslims aged 18 or over', 'UAE residents and non-residents with UAE assets', 'Property owners, account holders and company shareholders', 'Parents who want to name a guardian'] },
    extra: [T('What an ADJD will can cover', ['Asset', 'Covered?'], [
      ['Property in any emirate', 'Yes'], ['UAE bank accounts', 'Yes'], ['UAE company shares', 'Yes'], ['Vehicles and belongings in the UAE', 'Yes'], ['Assets outside the UAE', 'No']])],
  },
  '/services/muslim-wills/': {
    who: { items: ['Muslim expats aged 18 or over', 'Residents and non-residents with UAE assets', 'No Emirates ID required'] },
    fees: { title: 'Typical costs', head: ['Item', 'Typical range'], rows: [['Drafting, translation and registration assistance', 'from about AED 1,800'], ['ADJD registration fee', 'set by ADJD']] },
    extra: [T('What can be included', ['Asset', 'Included?'], [['Real estate', 'Yes'], ['Bank accounts', 'Yes'], ['Business shares', 'Yes'], ['Vehicles and belongings', 'Yes'], ['Assets abroad', 'No, use a will in that country']])],
    faq: [{ q: 'Can I update my will later?', a: 'Yes, by registering a new will.' }, { q: 'Is the registration remote?', a: 'Yes, by video call with the ADJD.' }],
  },

  /* ---------- Quick access ---------- */
  '/services/medical-emirates-id-centres/': {
    gives: { items: ['The nearest approved centre for your visa', 'The earliest available slot', 'Medical and biometrics combined where possible', 'No wasted visits'] },
    who: { items: ['New residents doing their first medical and biometrics', 'Residents renewing a visa', 'Domestic workers and new employees', 'Golden Visa applicants and their families'] },
    fees: { title: 'Medical fees (Abu Dhabi, ICP schedule)', head: ['Type', 'AED'], rows: [['Normal medical', '300'], ['VIP medical', '750']], note: 'Emirates ID fees follow your residence period.' },
    faq: [{ q: 'Do children go for biometrics?', a: 'Children under 15 usually do not. Children under 18 do not take the medical.' }, { q: 'What should I bring?', a: 'Your passport, Emirates ID or entry permit, and the appointment message.' }, { q: 'Can I walk in without a booking?', a: 'Some centres accept walk-ins, but a booking saves a lot of time.' }],
  },
  '/services/visa-validity-check/': {
    gives: { items: ['The exact last legal day of your stay', 'Any fines, before they grow', 'Confirmation that a cancellation went through', 'Peace of mind before you fly'] },
    who: { items: ['Visitors counting the days of a tourist visa', 'Residents after a visa cancellation', 'Sponsors checking family or domestic worker visas', 'Employers checking a new hire’s status'] },
    fees: { title: 'Cost', head: ['Item', 'Cost'], rows: [['Status check by us', 'Free'], ['Overstay fine, if any', 'AED 50 a day, paid at cost']] },
    extra: [T('Common results and what they mean', ['Status', 'Meaning', 'Next step'], [
      ['Active', 'The visa is valid', 'Note the expiry date'],
      ['Cancelled', 'Grace period running', 'Change visa, find a job or exit before it ends'],
      ['Expired', 'Overstay fines may apply', 'Settle fines and renew or exit'],
      ['Not found', 'Details may not match', 'Check passport details or the issuing emirate'],
    ])],
    faq: [{ q: 'Is my data safe?', a: 'We use the details only for the check.' }, { q: 'Can you check a visa for a family member abroad?', a: 'Yes, with their passport details.' }, { q: 'How quickly do I get the answer?', a: 'Usually within minutes during office hours.' }],
  },

  /* ---------- Menu items that had no page ---------- */
  '/services/golden-visa-renewal/': {
    gives: { items: ['Another full term of residence for you and your family', 'No six-month limit on time outside the UAE', 'Continued sponsorship of family and domestic workers', 'New Emirates IDs for everyone'] },
    who: { items: ['Golden Visa holders still meeting their category', 'Property investors who still own AED 2M+ in property', 'Professionals still meeting salary and profession rules', 'Family members renewing with the main holder'] },
    extra: [T('When to start', ['Time before expiry', 'What we do'], [
      ['3–6 months', 'Review your category documents and family details'],
      ['1–3 months', 'Collect updated proof: valuation, salary, licence'],
      ['Before expiry', 'File the renewal, medical and Emirates ID'],
      ['After expiry', 'Grace period rules and fines apply; file immediately'],
    ])],
    faq: [{ q: 'Do I need a new property valuation?', a: 'Often yes, to show the property still meets the value. We request it for you.' }, { q: 'Is the medical test needed again?', a: 'Adults usually complete it on renewal.' }, { q: 'Can my sons over 25 stay on my Golden Visa?', a: 'Sons up to 25 can be sponsored; older sons need their own residence route. We review this before renewal.' }, { q: 'How long does a renewal take?', a: 'Usually a few weeks, depending on approvals and appointments.' }],
  },
  '/services/entry-permit-status-change/': {
    gives: { items: ['Switch to residence without leaving the UAE', 'No flight costs for a visa run', 'Family arriving on visit visas can stay while their residence is done', 'Golden Visa applicants already here can apply directly'] },
    who: { items: ['Family members in the UAE on visit visas', 'Golden Visa applicants already in the UAE', 'New employees on visit or another visa', 'Residents moving to a new sponsor'] },
    fees: { title: 'Government fees (ICP)', head: ['Item', 'AED'], rows: [['Change of status', '656.05'], ['Entry permit', 'Depends on the residence type']] },
    extra: [T('Entry permit or change of status?', ['Where you are', 'What you need'], [['Outside the UAE', 'Entry permit, then travel in'], ['Inside on a visit visa', 'Change of status'], ['Inside on another residence', 'Cancellation and transfer, or change of status']])],
    faq: [{ q: 'How long is an entry permit valid?', a: 'Usually 60 days to enter or complete the residence, depending on the type.' }, { q: 'What if my visit visa expires during the change?', a: 'Once the change of status is approved, you are covered. File before your visit visa ends.' }, { q: 'Does everyone pay the change of status fee?', a: 'Only people already inside the UAE.' }, { q: 'Can a newborn need a change of status?', a: 'No. Babies born in the UAE go straight to residence.' }],
  },
  '/services/health-insurance/': {
    gives: { items: ['A residence application that is not held up', 'Cover for doctors, hospitals and emergencies', 'Maternity and chronic cover on suitable plans', 'Renewals timed with your visa'] },
    who: { items: ['Golden Visa holders and their families', 'Investors and self-sponsored residents', 'Sponsors of spouses, children and parents', 'Sponsors of domestic workers', 'Remote workers on the virtual work visa'] },
    fees: COST([['Age', 'Premiums rise with age, especially for parents'], ['Level of cover', 'Basic compliant plans or wider networks'], ['Emirate', 'Abu Dhabi and Dubai each set minimum benefits'], ['Health history', 'Declared conditions can affect the plan']]),
    steps: { items: [{ title: 'Tell us who needs cover', text: 'Ages, emirate and the level of cover you want.' }, { title: 'Compare plans', text: 'Compliant options from licensed insurers.' }, { title: 'Policy issued', text: 'Linked to the visa file before the residence application.' }, { title: 'Renewals', text: 'Renewed with your visa so cover never lapses.' }] },
    extra: [T('Who pays for insurance', ['Person', 'Usually insured by'], [['Employee', 'Employer'], ['Spouse and children', 'Sponsor (sometimes employer)'], ['Parents', 'Sponsor'], ['Domestic worker', 'Sponsor'], ['Golden Visa holder', 'Themselves']])],
    faq: [{ q: 'Is insurance required in every emirate?', a: 'Abu Dhabi and Dubai require it for residents, and other emirates increasingly do. We check for your visa.' }, { q: 'Can I keep my international policy?', a: 'Sometimes, if it meets the emirate’s minimum benefits and is accepted by the system. We check it.' }, { q: 'Are parents expensive to insure?', a: 'Older parents cost more. We compare plans so you get compliant cover at a fair price.' }, { q: 'When must the policy start?', a: 'Before the residence application is filed.' }, { q: 'Does my baby need insurance?', a: 'Yes, every resident needs cover, including newborns.' }],
  },
  '/document-services/degree-attestation/': {
    gives: { items: ['Work permits in the right skilled category', 'Eligibility for the skilled-professional Golden Visa', 'Equivalency and licensing for regulated jobs', 'Admission to postgraduate study in the UAE'] },
    who: { items: ['Graduates taking a UAE job', 'Golden Visa applicants in the skilled-professional category', 'Doctors, engineers and teachers seeking a licence', 'Parents enrolling in university programmes'] },
    fees: COST([['Country and university', 'Different verification steps and fees'], ['Number of documents', 'Degree, transcripts and diplomas'], ['Stamps already done', 'Fewer missing steps cost less'], ['Speed', 'Priority where possible']]),
    steps: { items: [{ title: 'Free check', text: 'We confirm the route for your country and university.' }, { title: 'Home-country verification', text: 'University or education authority, then the foreign ministry or apostille.' }, { title: 'UAE embassy', text: 'Attestation by the UAE embassy in that country.' }, { title: 'MOFA', text: 'Final attestation in the UAE.' }, { title: 'Returned to you', text: 'Originals returned by courier, with scans.' }] },
    extra: [T('Typical route by country type', ['Country', 'Usual steps before MOFA'], [['Apostille countries', 'Apostille, then UAE embassy where required'], ['Non-apostille countries', 'Education authority, foreign ministry, UAE embassy'], ['UAE-issued degrees', 'Ministry of Higher Education, then MOFA']])],
    faq: [{ q: 'Do I need to attest my transcripts too?', a: 'Some employers and licensing bodies ask for them. We tell you before starting.' }, { q: 'How long does it take?', a: 'From a few days to several weeks, depending on the country.' }, { q: 'Can you attest a diploma from an online university?', a: 'It depends on recognition by the issuing country and the UAE. We check first.' }, { q: 'Is equivalency the same as attestation?', a: 'No. Equivalency is a separate certificate some professions need; attestation comes first.' }, { q: 'Can I start the job before attestation?', a: 'The permit category may depend on it, so attest early.' }],
  },
  '/document-services/marriage-certificate/': {
    gives: { items: ['Spouse visa approval', 'Birth registration for a baby born in the UAE', 'Family Golden Visa applications', 'Joint bank or property matters'] },
    who: { items: ['Residents sponsoring a husband or wife', 'Parents expecting a baby in the UAE', 'Golden Visa holders adding a spouse', 'Couples married abroad or in the UAE'] },
    fees: COST([['Issuing country', 'Home-country and embassy steps differ'], ['Translation', 'Arabic translation for non-Arabic certificates'], ['Speed', 'Priority where possible']]),
    steps: { items: [{ title: 'Free check', text: 'We confirm the route for the country of marriage.' }, { title: 'Home-country attestation', text: 'Local registry and foreign ministry.' }, { title: 'UAE embassy', text: 'Attestation in the country of marriage.' }, { title: 'MOFA and translation', text: 'Final UAE attestation and Arabic translation.' }] },
    extra: [T('Common problems', ['Problem', 'Fix'], [['Names differ from passports', 'Corrected certificate or affidavit'], ['Religious certificate only', 'Civil registration may be needed first'], ['Old or damaged certificate', 'Fresh copy from the registry']])],
    faq: [{ q: 'We married in the UAE. What is needed?', a: 'UAE marriage certificates usually need MOFA attestation only, plus translation if not in Arabic.' }, { q: 'Is a nikah certificate enough?', a: 'Often it must be registered with the civil authority first. We check your country’s rule.' }, { q: 'How long does it take?', a: 'From a few days to a few weeks, depending on the country.' }, { q: 'Do I need the original?', a: 'Yes, for the stamps. We collect and return it.' }, { q: 'Can you do it while I am abroad?', a: 'Yes, with an authorisation letter.' }],
  },
  '/document-services/birth-certificate/': {
    gives: { items: ['Children’s residence visas', 'School and nursery enrolment', 'Passports from your embassy', 'Family Golden Visa applications'] },
    who: { items: ['Parents of children born abroad', 'Parents of newborns born in the UAE', 'Families moving to the UAE with children', 'Golden Visa holders adding children'] },
    fees: COST([['Born in the UAE or abroad', 'MOFA only, or the full chain'], ['Issuing country', 'Different steps and fees'], ['Translation', 'When required']]),
    steps: { items: [{ title: 'Free check', text: 'Route for the country of birth.' }, { title: 'Home-country attestation', text: 'For certificates issued abroad.' }, { title: 'UAE embassy and MOFA', text: 'Embassy, then MOFA in the UAE.' }, { title: 'Translation', text: 'Arabic translation if required.' }] },
    extra: [T('Born in the UAE or abroad?', ['Where born', 'What is needed'], [['In the UAE', 'MOFA attestation of the UAE certificate, inside the newborn 120 days'], ['Abroad', 'Home-country attestation, UAE embassy, MOFA'], ['Abroad, apostille country', 'Apostille, then UAE steps as required']])],
    faq: [{ q: 'Is the hospital notification enough?', a: 'No. The official birth certificate is issued after the notification and then attested.' }, { q: 'Do schools need an attested certificate?', a: 'Most UAE schools ask for it at enrolment.' }, { q: 'How long does it take?', a: 'A few days for UAE certificates; longer for those issued abroad.' }, { q: 'Can you translate it too?', a: 'Yes, by a licensed legal translator.' }, { q: 'My child’s name is spelled differently on the passport. What now?', a: 'We advise on an amendment or affidavit before attestation.' }],
  },
  '/document-services/document-legalisation/': {
    gives: { items: ['UAE documents accepted abroad', 'Foreign documents accepted in the UAE', 'Company papers recognised in other countries', 'One coordinated route through every office'] },
    who: { items: ['Residents moving abroad who need UAE documents recognised', 'Companies using UAE papers in other countries', 'Students and professionals with UAE degrees', 'Anyone using foreign documents in the UAE'] },
    fees: COST([['Destination country', 'Embassy fees and rules differ'], ['Document type', 'Personal or commercial'], ['Chamber stamps', 'Needed for many commercial documents'], ['Translation', 'Into the destination language']]),
    steps: { items: [{ title: 'Route check', text: 'For the destination country and document.' }, { title: 'Issuing authority', text: 'Ministry, court, school or chamber stamp.' }, { title: 'MOFA', text: 'UAE Ministry of Foreign Affairs.' }, { title: 'Embassy or consulate', text: 'Of the destination country in the UAE.' }, { title: 'Translation', text: 'If the destination requires it.' }] },
    extra: [T('Common documents we legalise', ['Document', 'Typical use'], [['Police clearance certificate', 'Immigration abroad'], ['UAE degree', 'Jobs and study abroad'], ['Certificate of incorporation', 'Branches and banks abroad'], ['Power of attorney', 'Property and legal matters abroad'], ['Commercial invoices', 'Export and trade']])],
    faq: [{ q: 'Is the UAE part of the apostille convention?', a: 'Rules differ by destination. We confirm which route the destination country accepts.' }, { q: 'How long does it take?', a: 'Usually one to three weeks, depending on the embassy.' }, { q: 'Do I need to be in the UAE?', a: 'No, with an authorisation letter.' }, { q: 'Can you legalise company documents?', a: 'Yes, including chamber of commerce stamps.' }, { q: 'Do you translate into other languages?', a: 'Yes, through licensed translators.' }],
  },
  '/document-services/property-documentation/': {
    gives: { items: ['A property Golden Visa file that is complete first time', 'Smoother sales, purchases and transfers', 'Someone you trust can act for you with a POA', 'Clear proof of value for banks and authorities'] },
    who: { items: ['Owners applying for the property Golden Visa', 'Off-plan buyers', 'Owners with a mortgage', 'Sellers and buyers using a representative', 'Heirs and executors'] },
    fees: COST([['Valuation', `AED 1,050 for the Abu Dhabi certificate`], ['Land department copies', 'Per document'], ['Developer and bank letters', 'Set by the developer or bank'], ['Power of attorney', 'Notary fees']]),
    steps: { items: [{ title: 'Tell us your goal', text: 'Golden Visa, sale, purchase or management.' }, { title: 'Collect documents', text: 'Title deed, developer statement, bank letter.' }, { title: 'Valuation', text: 'Requested where the value must be proven.' }, { title: 'POA if needed', text: 'Drafted and notarised.' }, { title: 'File ready', text: 'Checked and handed over or submitted.' }] },
    extra: [T('Documents by property type', ['Property', 'Documents usually needed'], [['Ready, fully paid', 'Title deed and valuation'], ['Ready, with mortgage', 'Title deed, valuation and bank letter'], ['Off-plan', 'Sale agreement and developer payment statement'], ['Jointly owned', 'Not accepted on the property route; one owner applies, the other joins as family']])],
    faq: [{ q: 'Does a mortgaged property qualify for the Golden Visa?', a: 'Yes, when your own equity meets the threshold. A bank letter shows the paid amount.' }, { q: 'Does off-plan qualify?', a: 'Often yes, from approved developers with enough paid. We check the developer statement.' }, { q: 'Who issues the valuation?', a: 'In Abu Dhabi, the real estate authority’s valuation certificate.' }, { q: 'Can I give someone power to sell my property?', a: 'Yes, with a specific property POA, notarised.' }, { q: 'Can joint owners apply?', a: 'Not on the Abu Dhabi property route: it is for sole owners, even between spouses. One owner can sponsor the other as family. We check alternatives for your case.' }, { q: 'Is a sales contract (SPA) enough on its own?', a: 'No. The application needs a title deed or a pre-registration certificate; the SPA supports it.' }],
  },
};

/** Shared section on every service page. */
export const WHY_US: Section = {
  type: 'list', title: 'Why clients use us for this', style: 'cards',
  items: [
    'Written quote first: government fees at cost with official receipts, and our fee fixed in writing',
    'Checked before filing: we check every document against the current rules before any fee is paid',
    'One advisor: a single person follows your file and replies on WhatsApp in your language',
    'Licensed company: Brightlink Management Consultancy, licensed by Dubai DET, office in Business Bay',
    'All seven emirates: ICP, GDRFA, MOHRE, MOFA and the courts, from one team',
    'Honest advice: if a route will not work for you, we tell you before you pay',
  ],
};
