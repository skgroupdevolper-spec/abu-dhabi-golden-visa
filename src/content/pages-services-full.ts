// Full service pages, one per item in the "Services Menu Page Link & Content Guide".
// Facts come from each supplied source page and the official UAE authorities, rewritten in our own words
// and laid out in our own section order. Government rules and fees change, so every page says we confirm
// the current figures in writing before anything is paid. Checked November 2026.
import type { Page, Section } from './types';
import { FEE_SCHEDULE as F } from '@/lib/fees';

type Fact = { label: string; value: string };
type Row = string[];
export type Full = {
  path: string; name: string; group: string; meta: string; intro: string; seo?: string; apply?: string;
  facts?: Fact[];
  /** Plain explanation: what the service is and when it is the right choice. */
  about?: { title: string; body: string[] };
  /** What the visa or service gives you. */
  gives?: { title?: string; items: string[] };
  /** Who qualifies (cards). */
  who?: { title?: string; intro?: string; items: string[] };
  /** What our team does for you. */
  handle: string[];
  fees?: { title?: string; intro?: string; head: string[]; rows: Row[]; note?: string };
  steps?: { title?: string; intro?: string; items: { title: string; text: string }[]; note?: string };
  docs?: { title?: string; intro?: string; items: string[] };
  /** Extra tables or lists: deadlines, comparisons, common mistakes. */
  extra?: Section[];
  faq?: { q: string; a: string }[];
  related?: string[];
};

const CTA = { label: 'Get a Free Consultation', href: '/free-consultation/' };
export const FEES_NOTE = 'Government fees are charged at cost with official receipts. Our professional fee is quoted separately, in writing, before you pay.';

export function full(s: Full): Page {
  const sec: Section[] = [];
  if (s.about) sec.push({ type: 'text', title: s.about.title, body: s.about.body });
  if (s.gives) sec.push({ type: 'list', title: s.gives.title ?? 'What it gives you', items: s.gives.items, style: 'ticks' });
  if (s.who) sec.push({ type: 'list', title: s.who.title ?? 'Who can apply', intro: s.who.intro, items: s.who.items, style: 'cards' });
  sec.push({ type: 'list', title: 'What we handle for you', items: s.handle, style: 'ticks' });
  if (s.fees) sec.push({ type: 'table', title: s.fees.title ?? 'Government fees', intro: s.fees.intro, head: s.fees.head, rows: s.fees.rows, note: s.fees.note ?? FEES_NOTE });
  if (s.steps) sec.push({ type: 'steps', title: s.steps.title ?? 'How it works, step by step', intro: s.steps.intro, items: s.steps.items, note: s.steps.note });
  if (s.docs) sec.push({ type: 'list', title: s.docs.title ?? 'Documents to send us', intro: s.docs.intro, items: s.docs.items, style: 'docs' });
  if (s.extra) sec.push(...s.extra);
  if (s.faq?.length) sec.push({ type: 'faq', title: 'Questions we answer every day', items: s.faq });
  sec.push({ type: 'tool', tool: 'lead', title: `Ask about ${s.name.replace(/^The /, '').toLowerCase()}`, intro: 'Send your details. An advisor checks your case and replies on WhatsApp with the documents list and an itemised quote.' });
  return {
    path: s.path, seoTitle: s.seo ?? `${s.name} in the UAE | Requirements, Documents & Fees`, meta: s.meta, eyebrow: s.group, h1: s.name, intro: s.intro,
    cta: CTA, sections: sec, related: s.related ?? ['/services/', '/contact/'], facts: s.facts, apply: s.apply,
  };
}

export const FULL_PAGES: Page[] = [
  /* ================= Visas ================= */
  full({
    path: '/services/family-visa/', name: 'Family Visa', group: 'Visas', apply: 'family-visa',
    seo: 'UAE Family Visa | Sponsor Your Spouse, Children & Parents',
    meta: 'Sponsor your spouse, children or parents on a UAE family residence visa: salary rules, attested certificates, entry permit or change of status, medical, Emirates ID and stamping.',
    intro: 'Bring your family to live with you in the UAE. We check that you meet the sponsor rules, get your certificates attested and translated, and follow the file through entry permit, medical, Emirates ID and residence, so you only attend one appointment.',
    facts: [
      { label: 'New visa', value: '5–10 working days' },
      { label: 'Renewal', value: '3–5 working days' },
      { label: 'Sponsor salary', value: 'AED 4,000+ a month' },
      { label: 'Valid for', value: 'Same as the sponsor’s visa' },
    ],
    about: {
      title: 'One file for your whole family',
      body: [
        'A family visa is a UAE residence visa for the close relatives of someone who already lives here. The sponsor can be an employee, a company partner or investor, or a Golden Visa holder, and the family member’s visa normally runs for the same period as the sponsor’s.',
        'The first visa opens a family file with the immigration authority: ICP in Abu Dhabi and the northern emirates, GDRFA in Dubai. After that, each new family member is added to the same file. Golden Visa holders follow their own, more generous family rules, explained on our Family Golden Visa page.',
      ],
    },
    who: {
      title: 'Who you can sponsor',
      intro: 'The rules depend on the relative. We confirm your case before anything is filed.',
      items: [
        'Spouse: sponsor earns AED 4,000 a month, or AED 3,000 with accommodation from the employer. Marriage certificate attested and translated into Arabic.',
        'Children: sons up to 25, unmarried daughters at any age, and children of determination at any age. Birth certificates attested.',
        'Parents: a much higher income (around AED 20,000 a month), a home with at least two bedrooms and health insurance for each parent.',
        'Newborns: residence must be applied for within 120 days of birth to avoid fines.',
        'Mothers: a woman on her own residence visa can sponsor her children, and in some cases her husband, when she meets the income and profession conditions.',
      ],
    },
    handle: [
      'Eligibility check against the current ICP and GDRFA rules before you pay anything',
      'Attestation and Arabic legal translation of marriage and birth certificates',
      'Opening the family file and applying for the entry permit',
      'Change of status if your relative is already in the UAE on a visit visa',
      'Medical fitness and fingerprint bookings at the nearest centre, standard or VIP',
      'Health insurance that meets the emirate’s rules, where required',
      'Residence application, Emirates ID and visa issue',
      'Collection and return of original documents, and reminders before expiry',
    ],
    fees: {
      title: 'Estimated government fees, per person',
      intro: 'Starting figures for a new two-year family visa, from our current rate sheet. Your exact list depends on the emirate, age and whether the person is inside or outside the UAE.',
      head: ['Family member', 'Abu Dhabi and other emirates (ICP)', 'Dubai (GDRFA)'],
      rows: [
        ['Spouse, arriving from abroad', 'from AED 1,469.25', 'from AED 1,591'],
        ['Child', 'from AED 1,169.25', 'from AED 1,103'],
        ['Parent', 'from AED 2,938.50', 'from AED 2,979'],
        ['Newborn born in the UAE', 'from AED 965.34', 'from AED 1,099'],
      ],
      note: 'Health insurance, attestation and a change of status (for relatives already in the UAE) are added where they apply. ' + FEES_NOTE,
    },
    steps: {
      items: [
        { title: 'Send photos of your documents', text: 'Passports, certificates, salary letter and tenancy contract on WhatsApp. We reply with what is missing and an itemised quote.' },
        { title: 'Attestation and translation', text: 'Certificates issued abroad are attested in the home country, by the UAE embassy and by MOFA, then translated into Arabic.' },
        { title: 'Family file and entry permit', text: 'We open the family file and apply for the entry permit, or a change of status if your relative is already here.' },
        { title: 'Medical and Emirates ID', text: 'One appointment for the medical test (age 18 and over) and fingerprints, booked close to you.' },
        { title: 'Health insurance', text: 'A policy that meets the emirate’s rules is issued before the residence application.' },
        { title: 'Residence issued', text: 'The visa is issued electronically and the Emirates ID card is delivered.' },
      ],
      note: 'Renewals skip the entry permit and usually take 3–5 working days.',
    },
    docs: {
      intro: 'Copies are enough to open the file. Originals are only needed for attestation.',
      items: [
        'Sponsor’s passport, residence visa and Emirates ID',
        'Family member’s passport (6+ months valid) and a photo on a white background',
        'Marriage certificate for a spouse, birth certificates for children, both attested and translated',
        'Salary certificate dated within the last month, or labour contract',
        'Registered tenancy contract in the sponsor’s name (Tawtheeq in Abu Dhabi, Ejari in Dubai)',
        'Health insurance for each family member, or we arrange it',
        'Current visa of the family member, if already in the UAE',
      ],
    },
    extra: [
      {
        type: 'table', title: 'Deadlines that cost money if you miss them', head: ['Deadline', 'What it means'],
        rows: [
          ['60 days', 'From the entry permit issue date to finish the residence, for relatives arriving from abroad.'],
          ['120 days', 'From birth to put a newborn on a residence visa. Fines apply after that.'],
          ['30 days', 'Grace period after a family visa expires to renew without an entry permit.'],
          ['6 months', 'Away from the UAE and a standard residence visa is cancelled. Golden Visa holders are not affected.'],
        ],
      },
      {
        type: 'table', title: 'Why family visa files get rejected, and how we prevent it', head: ['What goes wrong', 'How we prevent it'],
        rows: [
          ['A mistake on the application form', 'Every form is checked before filing, in the exact format the authority expects.'],
          ['Certificates not attested', 'We arrange home-country, embassy and MOFA attestation for you.'],
          ['Names spelled differently', 'We match names and relationships across every document first.'],
          ['Passport valid for less than 6 months', 'Validity is checked on day one, before any fee is paid.'],
          ['Salary or contract does not match', 'We compare the contract with the salary certificate and flag gaps early.'],
          ['Wrong visa category', 'A few quick questions, then the right route from the start.'],
        ],
      },
    ],
    faq: [
      { q: 'What salary do I need to sponsor my wife or husband?', a: 'Usually AED 4,000 a month, or AED 3,000 if your employer gives you accommodation. The figure comes from your contract or salary certificate. Parents need a much higher income, around AED 20,000.' },
      { q: 'My relative is already in the UAE on a visit visa. Do they need to leave?', a: 'No. We apply for a change of status so they can switch to residence without leaving. A change of status fee is added.' },
      { q: 'Which certificates need attestation?', a: 'Marriage and birth certificates issued outside the UAE. They are attested in the issuing country, by the UAE embassy there and by MOFA, then translated into Arabic. We handle all of it.' },
      { q: 'Can a woman sponsor her husband and children?', a: 'Yes, in many cases. A mother on her own residence visa can sponsor her children, and her husband when she meets the income and profession conditions. We check your situation first.' },
      { q: 'Do I need to visit your office?', a: 'No. Everything starts on WhatsApp. Your family member attends one appointment for the medical test and fingerprints.' },
      { q: 'Should I choose a family visa or a Golden Visa?', a: 'If you qualify for the Golden Visa, your family gets 10-year residence and sons can stay on it up to 25 with no salary test. If not, the standard family visa is the right route. We check both for you.' },
    ],
    related: ['/family-golden-visa/', '/family-golden-visa/newborn/', '/document-services/mofa-attestation/', '/document-services/legal-translation/', '/services/medical-biometrics/', '/services/emirates-id/'],
  }),

  full({
    path: '/services/investor-visa/', name: 'Investor & Partner Visa', group: 'Visas', apply: 'investor-visa',
    seo: 'UAE Investor & Partner Visa | Residence Through Your Own Company',
    meta: 'UAE investor and partner visa for shareholders of mainland and free-zone companies: eligibility, share capital, government fees, documents and the five steps to Emirates ID.',
    intro: 'Own shares in a UAE company, on the mainland or in a free zone? Your company can sponsor your own residence. You can then live and work here, open bank accounts and sponsor your family. Mainland companies call it a partner visa, free zones an investor visa: it is the same residence.',
    facts: [
      { label: 'Valid for', value: '2 years (3 in some free zones)' },
      { label: 'Processing', value: '10–15 working days' },
      { label: 'Sponsor', value: 'Your own company' },
      { label: 'Gov. fees from', value: 'AED 2,346' },
    ],
    about: {
      title: 'Residence through the company you own',
      body: [
        'The investor or partner visa is UAE residence for people who own shares in, or direct, a licensed UAE company. It is issued for two years on the mainland and up to three years in some free zones, and can be renewed for as long as you keep your share.',
        'It is quicker and cheaper than a Golden Visa because there is no AED 2 million threshold, but it lasts for a shorter time. If your investment or share capital reaches AED 2 million, we also check whether the 10-year Golden Visa suits you better.',
      ],
    },
    gives: { items: ['Live and work in the UAE', 'Open personal and company bank accounts', 'Sponsor your spouse, children and parents', 'Convert your licence and drive in the UAE', 'Apply for UAE tax residence'] },
    who: {
      title: 'Six things you need before you apply',
      items: [
        'A share in a company registered in the UAE, or a director role',
        'An active trade licence from a free zone or mainland authority',
        'Your name on the memorandum of association (MOA)',
        'Share capital that meets the licensing authority’s rules (often AED 50,000–300,000, frequently declared rather than paid in)',
        'A medical fitness test at an approved centre',
        'A clean UAE visa record, with no violations or absconding cases',
      ],
    },
    handle: [
      'Free check of your trade licence, MOA and visa quota',
      'Establishment card and immigration file for the company, if it has none',
      'Entry permit from abroad, or change of status inside the UAE',
      'Medical fitness test, standard or VIP, booked for you',
      'Emirates ID biometrics and residence issue',
      'Family visas once your own visa is issued, and later renewals',
    ],
    fees: {
      title: 'Government fees, line by line (Dubai mainland partner visa)',
      intro: 'Official fees for the main applicant on a two-year mainland partner visa. Free zones set their own packages, so we send yours on request.',
      head: ['Item', 'AED', 'When it applies'],
      rows: [
        ['Establishment card', '575', 'Only for a company applying for its first visa'],
        ['Entry permit', '1,126', 'Every applicant'],
        ['Change of status', '675', 'Only if you are already in the UAE'],
        ['Medical test, standard', '285', 'Every applicant (VIP with fast report: 720)'],
        ['Visa stamping', '550', 'Every applicant'],
        ['Emirates ID, 2 years', '385', 'Every applicant'],
        ['Total from abroad, company already has a card', '2,346', ''],
        ['Total inside the UAE, new company', '3,596', ''],
        ['Each family member', 'adult from 1,532 · child from 1,247', 'From abroad. A one-time family file costs 203.'],
      ],
      note: 'Partner and investor sponsors also pay a refundable immigration deposit of AED 3,000 per family member, returned when the visa is cancelled. Health insurance and attestation are not included. ' + FEES_NOTE,
    },
    steps: {
      items: [
        { title: 'Company setup or activation', text: 'You need an active UAE trade licence that names you as a shareholder or director. We can set this up with you.' },
        { title: 'Entry permit (3–7 days)', text: 'We apply for your entry permit through the company’s immigration file.' },
        { title: 'Change of status or entry (1–2 days)', text: 'Inside the UAE we change your status; from abroad you fly in on the permit.' },
        { title: 'Medical fitness test (2–3 days)', text: 'About an hour at an approved centre for a blood test and chest X-ray.' },
        { title: 'Emirates ID and visa (5–10 days)', text: 'Biometrics take about 30 minutes; the visa is issued electronically and the card is delivered.' },
      ],
      note: 'Around 10–15 working days inside the UAE. Add 3–7 days if you are abroad. A company bank account runs separately and takes 2–4 weeks.',
    },
    docs: {
      items: [
        'Passport copy (6+ months valid) and a photo on a white background',
        'Entry permit or current UAE visa',
        'Emirates ID, if you already live in the UAE',
        'Trade licence copy',
        'Memorandum of association naming you as a shareholder',
        'Establishment card, if the company has one',
        'Signed application form (we prepare it)',
      ],
    },
    extra: [{
      type: 'table', title: 'Investor visa or another UAE visa?', head: ['Visa', 'Valid for', 'Who sponsors you', 'Best for'],
      rows: [
        ['Investor / partner visa', '2–3 years', 'Your own company', 'Shareholders of a UAE company'],
        ['Golden Visa', '10 years', 'Self-sponsored', 'AED 2M+ investors and top talent'],
        ['Employment visa', '2 years', 'Your employer', 'People employed by a UAE company'],
        ['Freelance visa', '2–3 years', 'A free-zone freelance permit', 'Self-employed professionals'],
      ],
    }],
    faq: [
      { q: 'What share capital does my company need?', a: 'It depends on the licensing authority. Many free zones look for AED 50,000–100,000 declared in the company documents, and a mainland LLC often declares AED 300,000. We confirm the current figure for your licence before you apply.' },
      { q: 'Can my family join me?', a: 'Yes. Once your visa is issued you can sponsor your spouse, children and parents. A refundable deposit applies per family member.' },
      { q: 'Do I need to live in the UAE to keep it?', a: 'A standard residence visa is cancelled after six months outside the UAE, so plan regular visits. The Golden Visa does not have this rule.' },
      { q: 'Can I hold investor visas from more than one company?', a: 'No. You hold one residence visa at a time, sponsored by one company.' },
      { q: 'Is a partner visa different from an investor visa?', a: 'No. Mainland companies call it a partner visa and free zones an investor visa. The residence is the same.' },
    ],
    related: ['/golden-visa/business-investors/', '/services/company-setup-pro/', '/services/family-visa/', '/services/bank-account-opening/', '/services/emirates-id/', '/services/medical-biometrics/'],
  }),

  full({
    path: '/services/newborn-visa/', name: 'Newborn Visa', group: 'Visas', apply: 'newborn',
    seo: 'UAE Newborn Visa | Baby Residence Within 120 Days',
    meta: 'Residence visa for a baby born in the UAE: the 120-day deadline, birth certificate, MOFA attestation, passport, Emirates ID and residence, with documents for each stage.',
    intro: 'A baby born in the UAE needs a passport and a residence visa within 120 days of birth. There are five stages and each depends on the one before, so starting early matters. We take the paperwork off your hands while you look after your baby.',
    facts: [
      { label: 'Deadline', value: '120 days from birth' },
      { label: 'Best time to start', value: 'Within 14 days' },
      { label: 'Sponsor salary', value: 'AED 4,000+ a month' },
      { label: 'Gov. fees from', value: 'AED 965.34' },
    ],
    about: {
      title: 'One deadline, five stages',
      body: [
        'UAE immigration gives parents 120 days from the date of birth to get the baby a passport and a residence visa. The clock starts on the birth date, not when you collect the first paper, and a fine is added for every day after day 120.',
        'The chain is always the same: birth certificate, MOFA attestation, the baby’s passport from your embassy, then the residence visa and Emirates ID. Taken in that order, it fits comfortably inside the window.',
      ],
    },
    who: {
      title: 'Who can sponsor the baby',
      items: [
        'The father, on an employment, partner, investor or Golden Visa, earning AED 4,000 a month (or AED 3,000 with employer accommodation)',
        'The mother, when she meets the rules for female sponsors. No objection letter from the father is needed in that case',
        'Golden Visa holders: the baby is added to the 10-year family residence',
      ],
    },
    handle: [
      'A checklist for each stage before your due date',
      'Birth certificate in Arabic and English after the hospital notification',
      'MOFA attestation of the birth certificate',
      'Guidance and forms for the baby’s passport at your embassy',
      'Residence visa application and Emirates ID',
      'Health insurance for the baby where the emirate requires it',
      'Fine calculation and settlement if the 120 days have already passed',
    ],
    fees: {
      title: 'Estimated government fees for your baby',
      intro: 'Totals by the sponsoring parent’s visa, from our current rate sheet. Your embassy sets the passport fee.',
      head: ['Sponsoring parent’s visa', 'Abu Dhabi and other emirates', 'Dubai'],
      rows: [
        ['Employment visa, 2 years', 'AED 965.34', 'AED 1,029'],
        ['Partner or investor visa, 2 years', 'AED 965.34 (a deposit may apply)', 'AED 1,029'],
        ['Golden Visa, 10 years', 'AED 2,518.19', 'AED 2,945'],
      ],
      note: 'Example for a parent on a 2-year employment visa outside Dubai: MOFA attestation AED 150, Emirates ID AED 355, residence visa AED 460.34. Dubai totals are for the Arabic birth certificate; add AED 70 for the English one. Partner and investor sponsors may pay a refundable AED 3,000 deposit. ' + FEES_NOTE,
    },
    steps: {
      title: 'The newborn visa in five stages',
      items: [
        { title: 'Before the birth (you)', text: 'Have both parents’ passports and Emirates IDs and the attested marriage certificate ready. The hospital asks for them within hours of the birth.' },
        { title: 'Birth certificate (hospital and health authority)', text: 'The hospital issues the birth notification, then the official birth certificate is issued.' },
        { title: 'MOFA attestation', text: 'The birth certificate is attested by the UAE Ministry of Foreign Affairs.' },
        { title: 'Baby’s passport (your embassy)', text: 'Your embassy or consulate issues the passport. Some take several weeks, which is why starting early helps.' },
        { title: 'Residence visa and Emirates ID (ICP or GDRFA)', text: 'We file the residence and Emirates ID. Babies do not need a medical test or fingerprints.' },
      ],
      note: 'Day 0 birth · day 14 best time to start · day 120 last day · day 121 fines start.',
    },
    docs: {
      title: 'Documents for each stage',
      items: [
        'Birth certificate stage: both parents’ passport and Emirates ID copies, attested marriage certificate',
        'Passport stage: both parents’ passport copies, the baby’s photo on a white background, attested birth certificate',
        'Residence stage: sponsor’s passport, Emirates ID and labour contract (or salary certificate)',
        'Residence stage: the baby’s passport copy, photo and attested birth certificate',
        'Health insurance for the baby, where required',
      ],
    },
    faq: [
      { q: 'What if we miss the 120-day deadline?', a: 'A daily fine is added from day 121 until the visa is issued. We calculate it, settle it with the application and finish the residence as quickly as possible.' },
      { q: 'Does my baby need a medical test?', a: 'No. The medical fitness test is only for residents aged 18 and over.' },
      { q: 'Will my baby get an Emirates ID?', a: 'Yes. Every resident, including newborns, gets an Emirates ID. Babies are not fingerprinted.' },
      { q: 'Can the mother sponsor the baby?', a: 'Yes, when she meets the female sponsor rules. The father does not need to give a no-objection letter.' },
      { q: 'What if my baby was born abroad?', a: 'Then the baby enters on an entry permit like any other family member. The birth certificate must be attested in the country of birth, by the UAE embassy there and by MOFA.' },
      { q: 'The embassy is slow with the passport. Will I be fined?', a: 'The 120 days still run. Tell us early: we prepare every other stage so the visa can be filed the day the passport arrives.' },
    ],
    related: ['/services/family-visa/', '/family-golden-visa/', '/document-services/mofa-attestation/', '/document-services/birth-certificate/', '/services/emirates-id/', '/document-services/legal-translation/'],
  }),

  full({
    path: '/services/maid-visa/', name: 'Maid & Domestic Worker Visa', group: 'Visas', apply: 'maid-visa',
    seo: 'Maid Visa UAE | Sponsor a Nanny, Housemaid or Driver',
    meta: 'Sponsor a housemaid, nanny, cook or private driver on a two-year UAE domestic worker visa: sponsor salary and housing rules, Tadbeer or direct sponsorship, steps, documents and costs.',
    intro: 'Sponsor a housemaid, nanny, cook or private driver on a two-year residence visa. We check that your household meets the sponsor rules, then prepare and file every immigration and MOHRE document online, from entry permit to Emirates ID, with no trip to a typing centre.',
    facts: [
      { label: 'Visa length', value: '2 years' },
      { label: 'To stamping', value: '5–7 working days' },
      { label: 'Sponsor salary', value: 'about AED 25,000' },
      { label: 'Tadbeer package', value: 'from AED 8,500' },
    ],
    about: {
      title: 'A residence visa for the people who help run your home',
      body: [
        'A domestic worker visa lets a UAE resident family employ a housemaid, nanny, cook, gardener or private driver legally. The worker gets a two-year residence visa, an Emirates ID and an official domestic worker contract registered with the Ministry of Human Resources and Emiratisation (MOHRE).',
        'There are two ways to do it: through a MOHRE-licensed Tadbeer centre, which sells one package, or on your own sponsorship, with us filing each step for you. Golden Visa holders can sponsor domestic workers as one of their benefits.',
      ],
    },
    who: {
      title: 'Check these three things first',
      intro: 'The rules are meant for families. We review your case before you look for a worker or pay any fee.',
      items: [
        'Income: usually around AED 25,000 a month, or about AED 22,000 when your employer provides your housing',
        'Family: your family must live with you in the UAE. Single residents living alone cannot normally sponsor',
        'Home: at least two bedrooms, shown on your registered tenancy contract',
      ],
    },
    handle: [
      'Sponsor eligibility check: income, family and housing',
      'Employment entry permit, or change of status if the worker is already in the UAE',
      'Medical fitness test and Emirates ID biometrics',
      'MOHRE domestic worker contract, drafted and submitted',
      'Residence visa issue and Emirates ID delivery',
      'Health insurance for the worker',
      'Renewals every two years and cancellation when employment ends',
    ],
    fees: {
      title: 'Two routes, and what each costs',
      intro: 'Typical figures for budgeting. Both routes lead to the same two-year residence visa.',
      head: ['Route', 'Typical cost', 'What is included'],
      rows: [
        ['Through a Tadbeer centre', 'from AED 8,500 for 2 years (centres quote 8,500–9,000)', 'Contract, permit, visa, medical, Emirates ID and basic health insurance in one package'],
        ['Sponsor directly', 'from AED 17,925, including the refundable deposit', 'You are the sponsor on the immigration and MOHRE records; we file every step. A refundable AED 2,000 deposit is paid up front'],
      ],
      note: 'A Tadbeer price is the centre’s own package price, not a government fee. ' + FEES_NOTE,
    },
    steps: {
      items: [
        { title: 'Entry permit', text: 'We apply for the employment entry permit so the worker can travel, or start the change of status if they are already here.' },
        { title: 'Change of status', text: 'A worker on a visit visa is switched to residence without leaving the UAE.' },
        { title: 'Medical fitness test', text: 'A blood test and chest X-ray at an approved medical centre.' },
        { title: 'Emirates ID and biometrics', text: 'We submit the application; first-time applicants attend once for fingerprints.' },
        { title: 'MOHRE contract', text: 'The official domestic worker contract is drafted and submitted.' },
        { title: 'Visa issued', text: 'The residence visa is issued digitally and the Emirates ID card is delivered.' },
      ],
      note: 'Filed online from start to finish. Stamping usually takes 5–7 working days.',
    },
    docs: {
      intro: 'Sharp colour copies avoid most delays: blurred scans are the most common reason a file comes back.',
      items: [
        'Sponsor: passport and residence visa copy',
        'Sponsor: Emirates ID copy',
        'Sponsor: salary certificate or labour contract',
        'Sponsor: registered tenancy contract showing at least two bedrooms',
        'Worker: passport copy and a recent photo on a white background',
        'Worker already in the UAE: visit visa copy and entry stamp',
      ],
    },
    faq: [
      { q: 'How much do I need to earn to sponsor a maid?', a: 'Families usually need to show around AED 25,000 a month. The exact bar depends on your situation and where you apply, so we check your figures first.' },
      { q: 'Can a single person sponsor a domestic worker?', a: 'Normally not. Sponsorship is meant for families living together in the UAE. Some cases are assessed individually, so ask us.' },
      { q: 'Is hiring through a Tadbeer centre compulsory?', a: 'No. You can use a Tadbeer centre or sponsor the worker yourself. Each route has its own costs and responsibilities.' },
      { q: 'How long does the visa last?', a: 'Two years. We remind you before it expires so the renewal is filed in time.' },
      { q: 'Is health insurance compulsory?', a: 'Yes. Domestic workers must have health insurance. Tadbeer packages include a basic policy; on direct sponsorship we arrange one.' },
      { q: 'What happens if a worker is employed without a visa?', a: 'Employing a domestic worker without the correct visa and contract leads to heavy fines for the household. We keep your file legal from day one.' },
    ],
    related: ['/services/family-visa/', '/services/medical-biometrics/', '/services/emirates-id/', '/services/visa-cancellation/', '/golden-visa-benefits/', '/services/visa-validity-check/'],
  }),

  full({
    path: '/services/tourist-visa/', name: 'Tourist & Visit Visa', group: 'Visas', apply: 'tourist-visa',
    seo: 'UAE Tourist Visa | 14, 30, 60-Day, Multiple Entry & Transit Visas',
    meta: 'UAE tourist, visit and transit visas: 14, 30 and 60-day single entry, multiple entry, 48 and 96-hour transit and the 5-year multiple-entry visa. Documents, timing and what the quote includes.',
    intro: 'Visiting the UAE, or inviting family to stay? Tell us who is travelling, for how long and whether they will leave and come back. We pick the right visa for that passport, check the photo and details before filing, and send the e-visa to you on WhatsApp.',
    facts: [
      { label: 'Decision', value: 'usually 24–48 hours' },
      { label: 'Express', value: 'about 12–24 hours' },
      { label: 'Stays', value: '48 hours to 60 days' },
      { label: 'Covers', value: 'All seven emirates' },
    ],
    about: {
      title: 'The right visa for the trip, not the longest one',
      body: [
        'Choose by how long the visit really is and whether the traveller will leave the UAE and come back during it. A visa that is longer than the trip costs more for nothing, and one that is too short leads to overstay fines.',
        'One UAE tourist visa covers all seven emirates, so visitors can travel between Abu Dhabi, Dubai and the others freely. Some passports get a visa on arrival and need nothing in advance; we check this first so you never pay for a visa you do not need.',
      ],
    },
    extra: [
      {
        type: 'table', title: 'Visa options at a glance', head: ['Visa', 'Stay', 'Entries', 'Best for'],
        rows: [
          ['14-day tourist visa', 'Up to 14 days', 'Single', 'Long weekends and short visits'],
          ['30-day tourist visa', 'Up to 30 days', 'Single', 'Most holidays and family visits'],
          ['60-day tourist visa', 'Up to 60 days', 'Single', 'Long family stays, for example after a birth'],
          ['30-day multiple entry', 'Up to 30 days', 'Multiple', 'A trip with a hop abroad, such as Oman'],
          ['60-day multiple entry', 'Up to 60 days', 'Multiple', 'Long stays with travel in between'],
          ['48-hour transit visa', 'Up to 48 hours', 'Single', 'A night or two on a stopover'],
          ['96-hour transit visa', 'Up to 96 hours', 'Single', 'A longer stopover to see the city'],
          ['5-year multiple entry', 'Set per visit', 'Multiple', 'Frequent visitors, with its own eligibility rules'],
        ],
        note: 'Which visas a traveller can get depends on nationality and the rules at the time. We confirm it before you pay.',
      },
      {
        type: 'list', title: 'What your quote includes', style: 'cards',
        items: [
          'Government visa charge: the amount set by the UAE authorities, shown on its own line',
          'Our service fee: fixed and written before you pay, for checking, filing and following the application',
          'Express handling, only if you ask for it, shown separately',
          'Nothing hidden: if anything changes before filing, we tell you first',
        ],
      },
    ],
    handle: [
      'Checking whether the passport needs a visa before travel at all',
      'Choosing the visa type that matches the length of stay and entries',
      'Checking the passport scan and photo against the rules before filing',
      'Filing through the official channels and following the application',
      'Sending the official e-visa to you on WhatsApp',
      'Extensions where the rules allow them',
      'Planning a visit that will become a residence or Golden Visa application',
    ],
    steps: {
      items: [
        { title: 'Send the trip details', text: 'Nationality, travel dates and number of travellers. Each traveller, children included, needs their own visa.' },
        { title: 'We suggest the visa and quote', text: 'You agree the written quote before anything is filed.' },
        { title: 'Documents checked', text: 'Passport page and photo checked so the application matches the passport exactly.' },
        { title: 'Filed and followed', text: 'Most complete applications are decided within 24–48 hours, or about 12–24 hours with express handling.' },
        { title: 'E-visa sent to you', text: 'The official e-visa arrives on WhatsApp and email, ready to show at the airport.' },
      ],
      note: 'Apply at least a week before the flight if you can. Timings are estimates, not promises.',
    },
    docs: {
      items: [
        'Passport information page, valid for at least six months from arrival',
        'Recent colour photo on a plain white background',
        'Travel date, phone number and email address',
        'Sometimes: a residence permit, hotel booking or the host’s Emirates ID. We tell you before you pay',
      ],
    },
    faq: [
      { q: 'How long does a UAE tourist visa take?', a: 'Most complete applications are decided within 24–48 hours, or about 12–24 hours with express handling. Some nationalities and busy seasons take longer.' },
      { q: 'What is the difference between single and multiple entry?', a: 'A single-entry visa ends when the visitor leaves the UAE. A multiple-entry visa lets them leave and come back within its validity.' },
      { q: 'Do children need their own visa?', a: 'Yes. Every traveller, including babies, needs a separate visa.' },
      { q: 'Can a tourist visa be extended?', a: 'Many tourist visas can be extended inside the UAE when the rules allow. Ask us before the visa expires.' },
      { q: 'What happens if a visitor overstays?', a: 'A fine is charged for each day of overstay and is settled before leaving. Plan the length of the visa carefully.' },
      { q: 'Can a visitor work on a tourist visa?', a: 'No. A tourist visa does not allow work in the UAE.' },
      { q: 'Does a visa guarantee entry?', a: 'No. The final decision on entry is made by the UAE authorities at the border.' },
      { q: 'Can I apply for the Golden Visa while visiting?', a: 'Often yes. Inside the UAE we can change your status to the Golden Visa without you leaving, which adds a change of status fee.' },
    ],
    related: ['/services/family-visa/', '/golden-visa/', '/services/visa-validity-check/', '/services/newborn-visa/', '/document-services/legal-translation/', '/services/medical-biometrics/'],
  }),

  full({
    path: '/remote-work-visa/', name: 'Virtual Work (Remote Work) Visa', group: 'Visas', apply: 'virtual-work',
    seo: 'UAE Virtual Work Visa | Remote Work Residence, Income & Fees',
    meta: 'UAE virtual work visa for remote employees and business owners abroad: one-year renewable residence, USD 3,500 monthly income, documents, steps and official ICP and GDRFA fees.',
    intro: 'Keep your job or business abroad and live in the UAE legally. The virtual work visa is a one-year, renewable, self-sponsored residence with no UAE employer behind it. We check that you qualify, prepare your file and submit it to ICP for Abu Dhabi and the other emirates, or GDRFA for Dubai.',
    facts: [
      { label: 'Valid for', value: '1 year, renewable' },
      { label: 'Income', value: 'USD 3,500+ a month' },
      { label: 'Decision', value: 'about 48 hours' },
      { label: 'Gov. fees from', value: 'AED 1,278.91' },
    ],
    about: {
      title: 'A residence for people whose job stays outside the UAE',
      body: [
        'The virtual work visa lets remote employees, freelancers with clients abroad and owners of overseas businesses live in the UAE while their work continues abroad. You sponsor yourself, so no UAE employment contract or local sponsor is needed.',
        'It gives you residence and an Emirates ID, and you can sponsor your spouse and children for the same period. It does not give you a UAE work permit: if you later take a job with a UAE company, you move to an employment visa.',
      ],
    },
    gives: {
      items: [
        'One year of UAE residence, renewable while you still qualify',
        'An Emirates ID and access to services for residents',
        'Family sponsorship for the same period',
        'Rent a home, connect utilities and apply for a bank account, subject to each provider’s checks',
        'Keep working for your overseas employer or clients',
      ],
    },
    who: {
      items: [
        'A passport valid for at least six months',
        'Remote employment or a business based outside the UAE, shown by a contract, company letter or business licence',
        'Income of at least USD 3,500 a month, or the equivalent',
        'Health insurance valid in the UAE for the whole year',
        'You meet the normal UAE entry and residence rules',
      ],
    },
    handle: [
      'Eligibility check before anything is paid',
      'Preparing and reviewing every document',
      'Filing through the official ICP or GDRFA channels and paying the fees at cost',
      'Entry permit, or change of status if you are already in the UAE',
      'Medical test and Emirates ID biometrics booked for you',
      'Family visas added to the same file',
    ],
    fees: {
      title: 'Official government fees',
      intro: 'Two schedules: ICP for Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah and Fujairah, and GDRFA for Dubai.',
      head: ['Item', 'ICP from abroad', 'ICP inside the UAE', 'Dubai from abroad', 'Dubai inside the UAE'],
      rows: [
        ['Virtual work entry permit', '353.91', '353.91', '485', '1,035'],
        ['Change of status', '–', '656.05', '–', '675'],
        ['Medical fitness test, standard', '300', '300', '285', '285'],
        ['Emirates ID, 1 year', '275', '275', '275', '275'],
        ['Residence issue / stamping', '350', '350', '510', '510'],
        ['Total (AED)', '1,278.91', '1,934.96', '1,555', '2,780'],
      ],
      note: 'A VIP medical test (AED 750 at ICP) replaces the standard one if you want it faster. Health insurance, family members and our service fee are not included. ' + FEES_NOTE,
    },
    steps: {
      items: [
        { title: 'Get in touch', text: 'Message us on WhatsApp or call. No appointment needed.' },
        { title: 'Documents checked', text: 'Passport, photo, proof of remote work, proof of income and health insurance, each checked before filing.' },
        { title: 'Application filed', text: 'We submit through the official system, pay the government fees and track the file.' },
        { title: 'Entry permit, then the visa', text: 'Once you are in the UAE or your status is changed, you do the medical test and Emirates ID biometrics and the one-year visa is issued.' },
      ],
      note: 'Most complete applications are decided within about 48 hours.',
    },
    docs: {
      items: [
        'Passport (6+ months valid) and a recent colour photo on a white background',
        'Proof of remote work: employment contract, company letter or overseas business licence',
        'Proof of income: recent payslips or bank statements showing USD 3,500 a month or more',
        'Health insurance covering you in the UAE for the full year',
      ],
    },
    extra: [{
      type: 'table', title: 'What it gives you, and what it does not', head: ['It gives you', 'It does not give you'],
      rows: [
        ['One year of UAE residence, renewable', 'A UAE work permit'],
        ['An Emirates ID', 'The right to take a job with a UAE company'],
        ['Family sponsorship for the same period', 'A UAE labour contract'],
      ],
    }],
    faq: [
      { q: 'Can I sponsor my family?', a: 'Yes. Your spouse and children can be added to your file for as long as your own visa runs.' },
      { q: 'How is it different from an employment visa?', a: 'An employment visa is sponsored by a UAE employer and lets you work here. The virtual work visa is self-sponsored and is for work done for an employer or business abroad.' },
      { q: 'Can I move to a UAE employment visa later?', a: 'Yes. When you take a UAE job, your employer sponsors a new visa and the virtual work visa is cancelled. Your family’s visas move to the new sponsorship.' },
      { q: 'How long does it take?', a: 'Most complete applications are decided within about 48 hours, then the medical test and Emirates ID follow.' },
      { q: 'Can I open a bank account?', a: 'Yes, subject to the bank’s own checks. We can help with the introduction.' },
      { q: 'Is the Golden Visa better for me?', a: 'If you qualify, it gives 10 years instead of one. We check both routes for you.' },
    ],
    related: ['/golden-visa/', '/services/employment-visa/', '/services/freelancer-visa/', '/services/family-visa/', '/services/medical-biometrics/', '/services/emirates-id/'],
  }),

  /* ================= Attestation & legalisation ================= */
  full({
    path: '/document-services/mofa-attestation/', name: 'MOFA & Embassy Attestation', group: 'Attestation & legalisation',
    seo: 'MOFA & Embassy Attestation UAE | Degree, Marriage, Birth & Company Documents',
    meta: 'Document attestation for UAE use: home-country legalisation, UAE embassy and MOFA attestation for degrees, marriage and birth certificates and company documents. Steps, documents and common rejection reasons.',
    intro: 'A certificate issued outside the UAE is only accepted here once it has been attested in the right order: in the issuing country, by the UAE embassy there and finally by the UAE Ministry of Foreign Affairs (MOFA). We check the sequence for your country before anything is submitted, so the document is accepted the first time.',
    facts: [
      { label: 'Final stamp', value: 'UAE MOFA' },
      { label: 'With prior stamps', value: 'about 3–5 working days' },
      { label: 'Countries', value: '50+ procedures' },
      { label: 'Document check', value: 'Free, before filing' },
    ],
    about: {
      title: 'Why your documents need attestation',
      body: [
        'Attestation is the chain of official stamps that proves a foreign document is genuine. UAE authorities, employers, schools and courts rely on the final MOFA stamp, and they only accept it when the earlier stamps are in place.',
        'Without it, a degree cannot support a work permit or a Golden Visa, a marriage certificate cannot support a spouse visa, and a company cannot register documents from its parent abroad. With it, visa files, school admissions and business registrations move without delay.',
      ],
    },
    who: {
      title: 'Documents we attest',
      items: [
        'Educational: degrees, diplomas, transcripts, school leaving and transfer certificates',
        'Career: experience certificates, salary certificates and employment letters',
        'Family and personal: marriage, birth, divorce and death certificates, police clearance',
        'Commercial: certificates of incorporation, board resolutions, powers of attorney, invoices and certificates of origin',
        'Legal and other: court papers, affidavits and medical reports',
      ],
    },
    handle: [
      'Free check of the document, the issuing country and the correct sequence',
      'Home-country notarisation, authentication or apostille arranged where needed',
      'UAE embassy attestation in the issuing country',
      'MOFA attestation in the UAE, online or at the service centre',
      'Arabic legal translation when the receiving authority asks for it',
      'Courier collection and return of originals',
    ],
    steps: {
      title: 'The attestation route',
      items: [
        { title: 'Home-country attestation', text: 'Notarisation, the ministry of foreign affairs or the relevant authority in the country that issued the document. The steps vary by country.' },
        { title: 'UAE embassy attestation', text: 'The UAE embassy or consulate in that country approves the document for use in the UAE.' },
        { title: 'MOFA attestation in the UAE', text: 'The UAE Ministry of Foreign Affairs adds the final seal that makes it valid here.' },
        { title: 'Translation, if required', text: 'A certified Arabic translation is prepared when the authority receiving the document asks for one.' },
      ],
      note: 'Timelines depend on the document type, the issuing country and how many stamps are already in place.',
    },
    docs: {
      items: [
        'The original document (scans are enough for the free check)',
        'Passport copy of the document holder',
        'For degrees: transcripts and the degree certificate',
        'For commercial documents: chamber of commerce stamp where the country requires it',
        'Authorisation letter if we submit on your behalf',
      ],
    },
    extra: [{
      type: 'table', title: 'Why attestation gets delayed, and how we prevent it', head: ['Problem', 'How we prevent it'],
      rows: [
        ['Wrong sequence: going to MOFA before the home-country or embassy step', 'We confirm the correct order for your country first'],
        ['Missing embassy legalisation', 'Embassy step arranged before MOFA'],
        ['Damaged, faded or unclear stamps', 'Inspected before submission; re-issue arranged if needed'],
        ['Name differs from the passport', 'Names checked across every document'],
        ['Commercial document without a chamber stamp', 'Chamber step added where the country requires it'],
      ],
    }],
    faq: [
      { q: 'Is UAE embassy attestation needed before MOFA?', a: 'Yes, for documents issued abroad. MOFA attests the embassy’s stamp, so the embassy step must come first. Documents issued in the UAE go straight to MOFA.' },
      { q: 'Which documents need attestation for a family visa?', a: 'A marriage certificate for a spouse and birth certificates for children, when they were issued outside the UAE.' },
      { q: 'Is attestation needed for an employment visa?', a: 'For many skilled jobs, yes: the degree must be attested before the work permit category is approved.' },
      { q: 'Can someone submit on my behalf?', a: 'Yes. With an authorisation letter we submit and collect for you.' },
      { q: 'Can degrees be attested urgently?', a: 'Faster handling is often possible, depending on the country and the stamps already in place. We tell you the quickest realistic timeline.' },
    ],
    related: ['/document-services/legal-translation/', '/document-services/degree-attestation/', '/document-services/marriage-certificate/', '/document-services/birth-certificate/', '/services/family-visa/', '/services/notary-power-of-attorney/'],
  }),

  full({
    path: '/services/notary-power-of-attorney/', name: 'Notary & Power of Attorney', group: 'Attestation & legalisation',
    seo: 'Notary & Power of Attorney UAE | Property POA, Affidavits & Company Documents',
    meta: 'Notary services in the UAE: general and special powers of attorney, property POA, affidavits, NOCs, declarations, board resolutions and true copies. Standard or same-day, prepared to be accepted first time.',
    intro: 'Need to give someone authority to act for you, or a declaration certified for a court, bank or authority? We draft the document in the format the notary accepts, arrange the appointment (often online), and hand you a notarised document ready to use in the UAE or abroad.',
    facts: [
      { label: 'Standard', value: '2–3 working days' },
      { label: 'Priority', value: 'Same day, when eligible' },
      { label: 'Online', value: 'Available for many documents' },
      { label: 'Review', value: 'Free, before notarisation' },
    ],
    about: {
      title: 'What notarisation does',
      body: [
        'A notary certifies signatures, declarations and powers of attorney so that authorities, courts, banks and overseas bodies can rely on them. In the UAE this is done by the Ministry of Justice and the local judicial departments, through public notaries and licensed private notaries, many of them online.',
        'Most rejections come from small details: wording not in Arabic or badly translated, names that differ from the passport, or a format the notary no longer accepts. We fix these before the appointment.',
      ],
    },
    who: {
      title: 'Documents we notarise',
      items: [
        'Personal: general and special power of attorney, affidavits, NOCs, declarations and authorisation letters, true copies of passport and Emirates ID',
        'Property: POA to sell, buy, rent or manage property, sale and purchase agreements, tenancy documents',
        'Business: board resolutions, company agreements, MOA amendments and manager appointments',
        'Wills: Muslim and non-Muslim wills (see our wills pages)',
      ],
    },
    handle: [
      'Free review of your document and its purpose',
      'Drafting or correcting the POA or declaration, bilingual where required',
      'Legal translation into Arabic',
      'Notary appointment, online or in person, standard or same day',
      'Attestation of the notarised document for use abroad when needed',
      'Doorstep collection and delivery where available',
    ],
    fees: {
      title: 'Typical costs',
      intro: 'Notary fees depend on the document type, number of signatories, amounts involved and speed. Typical ranges in the market:',
      head: ['Category', 'Typical range (AED)', 'What changes the price'],
      rows: [
        ['Personal documents (POA, affidavit, NOC)', '500 – 1,500+', 'Complexity, signatories, notary type'],
        ['Real estate documents (property POA, sale agreements)', '300 – 1,500+', 'Property value, authority rules, speed'],
        ['Business documents (resolutions, agreements, MOA)', '1,500 – 3,000+', 'Number of partners, capital, residency status'],
      ],
      note: 'Ranges are a guide only. ' + FEES_NOTE,
    },
    steps: {
      items: [
        { title: 'Share the document', text: 'Send it on WhatsApp. We review the wording, names and format first.' },
        { title: 'Draft and translate', text: 'We prepare the final bilingual version.' },
        { title: 'Notary appointment', text: 'Online by video or in person, depending on the document. You sign with your Emirates ID or passport.' },
        { title: 'Ready to use', text: 'The notarised document is issued, and attested for use abroad if you need it.' },
      ],
    },
    docs: {
      items: [
        'Passport and Emirates ID (or entry stamp for visitors) of each signatory',
        'Details of the person receiving the authority, with their passport copy',
        'For property: title deed and property details',
        'For companies: trade licence, MOA and the resolution text',
        'The draft or the purpose of the document, in your own words',
      ],
    },
    faq: [
      { q: 'Can I notarise documents online?', a: 'Yes, many documents can be notarised online through the Ministry of Justice and judicial department platforms, with a video call to the notary.' },
      { q: 'Do I need my original passport?', a: 'You need a valid passport or Emirates ID at the appointment. Copies are enough for the review.' },
      { q: 'Is a power of attorney mandatory to sell property for me?', a: 'Yes. Someone acting for you at a land department needs a notarised, specific property POA.' },
      { q: 'What is the difference between a public and a private notary?', a: 'Both are authorised. Public notaries sit within the courts and judicial departments; licensed private notaries offer longer hours and faster appointments.' },
      { q: 'Can a document notarised abroad be used in the UAE?', a: 'Yes, after it is attested by the UAE embassy in that country and by MOFA, and translated into Arabic.' },
    ],
    related: ['/document-services/mofa-attestation/', '/document-services/legal-translation/', '/services/difc-wills/', '/services/adjd-wills/', '/document-services/property-documentation/', '/services/company-setup-pro/'],
  }),

  full({
    path: '/document-services/legal-translation/', name: 'Legal Translation', group: 'Attestation & legalisation',
    seo: 'Legal Translation UAE | Certified Arabic–English Translation for Visas & Courts',
    meta: 'Certified legal translation in the UAE by Ministry of Justice licensed translators: personal, educational, business, legal and immigration documents, Arabic and English and other languages.',
    intro: 'UAE authorities work in Arabic, so many documents must be translated by a translator licensed by the Ministry of Justice before they are accepted. We arrange certified translations of your personal, educational, business and legal papers, stamped and ready for visas, courts, banks and ministries.',
    facts: [
      { label: 'Translator', value: 'MOJ licensed' },
      { label: 'Usual time', value: '1–2 working days' },
      { label: 'Languages', value: 'Arabic, English + more' },
      { label: 'Format', value: 'Stamped, signed copy' },
    ],
    about: {
      title: 'When you need a legal translation',
      body: [
        'A legal translation carries the stamp and signature of a sworn translator, which makes it acceptable to UAE ministries, immigration, courts, land departments and banks. An ordinary translation, however accurate, is not.',
        'We usually translate after attestation, so the stamps on the original appear in the translation too. When a document will be used abroad, we arrange the translation into the language that country requires.',
      ],
    },
    who: {
      title: 'Documents we translate',
      items: [
        'Personal and family: marriage, birth, divorce and death certificates, passports, police clearance',
        'Educational: degrees, diplomas, transcripts and school certificates',
        'Business: trade licences, MOA, contracts, financial statements and board resolutions',
        'Legal: court judgments, powers of attorney, affidavits and wills',
        'Immigration and medical: salary certificates, bank letters, medical reports',
      ],
    },
    handle: [
      'Translation by a Ministry of Justice licensed legal translator',
      'Arabic to English, English to Arabic and other language pairs',
      'Matching names and numbers exactly to the passport',
      'Stamped, signed hard copy and a scanned copy',
      'Attestation before or after translation, in the right order',
      'Collection and delivery of originals',
    ],
    steps: {
      items: [
        { title: 'Send a clear scan', text: 'Tell us where the translation will be used. We confirm the language and price.' },
        { title: 'Translation', text: 'A licensed translator translates and checks names, dates and numbers against your passport.' },
        { title: 'Review', text: 'You see a draft for spellings of names before it is stamped.' },
        { title: 'Stamped and delivered', text: 'You receive the stamped translation, by courier and as a scan.' },
      ],
    },
    docs: {
      items: [
        'A clear scan of every page, including the back with stamps',
        'Passport copy, so names are spelled exactly as in the passport',
        'Where the translation will be used (visa, court, bank, school)',
      ],
    },
    faq: [
      { q: 'Is a legal translation the same as a certified translation?', a: 'In the UAE a legal translation is one made by a translator licensed by the Ministry of Justice, carrying their stamp and signature. That is what authorities accept.' },
      { q: 'Should I translate before or after attestation?', a: 'Usually after, so the attestation stamps are translated too. Some authorities ask the other way; we follow what the receiving office needs.' },
      { q: 'How long does it take?', a: 'Most single documents are ready in one to two working days. Long or technical files take longer.' },
      { q: 'Do you translate into languages other than Arabic and English?', a: 'Yes, through licensed translators for other language pairs, depending on where the document will be used.' },
    ],
    related: ['/document-services/mofa-attestation/', '/services/notary-power-of-attorney/', '/services/family-visa/', '/services/newborn-visa/', '/document-services/marriage-certificate/', '/document-services/degree-attestation/'],
  }),

  /* ================= Employment visas & permits ================= */
  full({
    path: '/services/employment-visas-permits/', name: 'Employment Visas & Work Permits', group: 'Employment visas & permits', apply: 'employment',
    seo: 'Employment Visas & Work Permits UAE | PRO Services for Companies',
    meta: 'One PRO team for your workforce: new employee visas, renewals, MOHRE work permits for Golden Visa and family-visa holders, part-time permits, Tawjeeh, ILOE, medical, Emirates ID and cancellations.',
    intro: 'Hand your visa paperwork to one team. From the offer letter to the labour card, we file every MOHRE and immigration step for new hires, renewals, part-timers and leavers, and we watch the deadlines so nothing lapses into fines. Government fees and our professional charges are always quoted separately.',
    facts: [
      { label: 'Single point of contact', value: 'One dedicated PRO' },
      { label: 'Change of status window', value: '60 days' },
      { label: 'Volume', value: 'One hire to hundreds' },
      { label: 'Fees', value: 'Itemised before you commit' },
    ],
    about: {
      title: 'Everything your HR team would otherwise chase',
      body: [
        'Employing someone in the UAE means two files running together: the MOHRE work permit and labour contract, and the immigration residence with medical, Emirates ID and insurance. Each has its own deadlines, fees and portals.',
        'We run both for you, for one hire or a hundred, and keep your company compliant with WPS, Tawjeeh orientation and ILOE insurance. Volume processing and monthly retainers are available.',
      ],
    },
    who: {
      title: 'Services in this hub',
      items: [
        'New employee visa: offer letter to labour card, the full residence file',
        'Employee visa renewal: no entry permit or change of status needed',
        'Golden Visa work permit: employ a 10-year Golden Visa holder without changing their residence',
        'Relative work permit: put a family-visa holder on your payroll',
        'Part-time and intern permits',
        'Visa cancellation: labour and immigration, inside or outside the UAE',
      ],
    },
    handle: [
      'MOHRE offer letter priced by skill level',
      'Labour insurance and the MOHRE labour payment by company category',
      'Entry permit, or change of status within 60 days for staff already in the UAE',
      'Medical fitness (normal or VIP) and Emirates ID',
      'Tawjeeh orientation and ILOE insurance',
      'Visa stamping and the final labour card',
      'Renewals, transfers and cancellations, with expiry reminders',
    ],
    steps: {
      title: 'How a new hire is onboarded',
      items: [
        { title: 'Offer letter', text: 'Issued through MOHRE, priced by skill level: unskilled, diploma or graduate, postgraduate or PhD.' },
        { title: 'Labour insurance', text: 'Mandatory worker insurance for skilled or unskilled staff.' },
        { title: 'Labour payment', text: 'The MOHRE fee set by your company category (1, 2 or 3).' },
        { title: 'Entry permit', text: 'Issued for an employee inside or outside the country.' },
        { title: 'Change of status', text: 'Only if the employee is already in the UAE, within 60 days.' },
        { title: 'Medical and Emirates ID', text: 'Fitness test, normal or VIP, and the Emirates ID application.' },
        { title: 'Tawjeeh and ILOE', text: 'Labour orientation and involuntary loss of employment insurance.' },
        { title: 'Stamping and labour card', text: 'Residence issued and the final labour card delivered.' },
      ],
      note: 'Renewals skip the entry permit and change of status.',
    },
    extra: [{
      type: 'table', title: 'What the MOHRE company category means', head: ['Category', 'Fee level', 'Typical company'],
      rows: [
        ['Category 1', 'Lowest labour payment', 'Skilled, diverse workforce and good working conditions'],
        ['Category 2', 'Standard', 'No more than half the staff from one nationality, other conditions met'],
        ['Category 3', 'Highest', 'Average conditions and over half the workforce from one nationality'],
      ],
    }],
    docs: {
      items: [
        'Employee passport (6+ months valid) and photo',
        'Attested degree or diploma for skilled roles',
        'Current visa or entry stamp if the employee is in the UAE',
        'Company trade licence, establishment card and MOHRE login access (or authorisation)',
        'Agreed job title and salary',
      ],
    },
    faq: [
      { q: 'What is included in your PRO service?', a: 'Everything from the offer letter to the labour card: labour insurance, MOHRE labour payment, entry permit, change of status, medical, Emirates ID, Tawjeeh, ILOE and stamping, plus renewals, work permits, part-time permits and cancellations.' },
      { q: 'How much does an employee visa cost?', a: 'It depends on the skill level, company category, whether the employee is inside the UAE, and the medical type. We send an itemised list before you commit.' },
      { q: 'Can a Golden Visa or family-visa holder work for us?', a: 'Yes. They work on a dedicated MOHRE work permit without changing their residence.' },
      { q: 'Do you handle bulk hiring?', a: 'Yes, from single hires to large batches, with monthly retainers for companies that onboard regularly.' },
      { q: 'Can an employer ask the employee to pay visa costs?', a: 'No. Under UAE labour law the employer pays the visa and work permit costs.' },
    ],
    related: ['/services/employment-visa/', '/services/work-permit/', '/services/visa-cancellation/', '/services/iloe-insurance/', '/services/tasheel/', '/services/tawjeeh/'],
  }),

  full({
    path: '/services/employment-visa/', name: 'Employment Visa', group: 'Employment visas & permits', apply: 'employment',
    seo: 'UAE Employment Visa | New Hire Residence, Work Permit, Medical & Emirates ID',
    meta: 'UAE employment visa for new hires: MOHRE offer letter and work permit, entry permit or change of status, medical, Emirates ID, Tawjeeh, ILOE and stamping. Steps, documents and timing.',
    intro: 'A UAE employment visa is a two-year residence sponsored by the company that hires you. It runs on two tracks, the MOHRE work permit and the immigration residence, and we handle both from the offer letter to the Emirates ID, for employers and for employees whose company wants help.',
    facts: [
      { label: 'Valid for', value: '2 years, renewable' },
      { label: 'Sponsor', value: 'Your employer' },
      { label: 'Change of status', value: 'within 60 days' },
      { label: 'Who pays', value: 'The employer, by law' },
    ],
    about: {
      title: 'Two files that run together',
      body: [
        'The work permit, issued by the Ministry of Human Resources and Emiratisation (MOHRE), allows the person to work for that employer. The residence visa, issued by ICP or GDRFA, allows them to live here. One cannot finish without the other.',
        'The order is fixed: offer letter, work permit approval, entry permit, change of status or entry, medical, Emirates ID, then stamping and the labour contract. Once the visa is issued, the employee can sponsor their family when the salary rules are met.',
      ],
    },
    handle: [
      'MOHRE offer letter with the right job title for the company’s licence',
      'Work permit approval and labour insurance',
      'Entry permit, or change of status inside the UAE',
      'Medical fitness test, normal or VIP',
      'Emirates ID biometrics and residence stamping',
      'Tawjeeh orientation and ILOE enrolment',
      'Labour contract signed and registered',
    ],
    steps: {
      items: [
        { title: 'Offer letter', text: 'The employer issues the MOHRE offer with salary, title and terms. Check the title matches your qualifications.' },
        { title: 'Work permit approval', text: 'MOHRE checks the company’s quota, category and the job classification.' },
        { title: 'Entry permit', text: 'Issued so the employee can enter, or for a change of status if already here.' },
        { title: 'Medical and Emirates ID', text: 'One visit for the medical and one for biometrics, booked for you.' },
        { title: 'Visa stamping and labour contract', text: 'Residence is issued, the contract is signed and the labour card follows.' },
      ],
    },
    docs: {
      items: [
        'Passport (6+ months valid) and photo on a white background',
        'Signed MOHRE offer letter',
        'Attested education certificate, if the job category requires it',
        'Professional licence, for regulated jobs (health, engineering, teaching)',
        'Current visa or entry stamp, if already in the UAE',
      ],
    },
    extra: [{
      type: 'list', title: 'Red flags in a job offer', style: 'cards',
      items: [
        'The employer asks you to pay the visa costs (illegal in the UAE)',
        'You are told to start work before the permit is issued',
        'The job title does not match your real role or qualifications',
        'There is no written offer letter',
      ],
    }],
    faq: [
      { q: 'Can I work on a visit visa while my employment visa is processed?', a: 'No. Working before the work permit is issued is illegal and can lead to fines and bans.' },
      { q: 'How long does it take?', a: 'Usually two to four weeks from offer letter to stamping, depending on approvals and appointments.' },
      { q: 'Do I need an attested degree?', a: 'For skilled job categories, yes. Without it the permit may be issued in a lower category.' },
      { q: 'Can I sponsor my family on an employment visa?', a: 'Yes, with a salary of AED 4,000 a month (or AED 3,000 plus housing). See our family visa page.' },
    ],
    related: ['/services/employment-visas-permits/', '/services/work-permit/', '/document-services/degree-attestation/', '/services/family-visa/', '/services/medical-biometrics/', '/services/iloe-insurance/'],
  }),

  full({
    path: '/services/work-permit/', name: 'Work Permit Services', group: 'Employment visas & permits',
    seo: 'UAE Work Permit Services | MOHRE Permits, Types, Documents & Fees',
    meta: 'MOHRE work permits in the UAE: new, transfer, renewal, part-time, temporary, mission, juvenile, student training, Golden Visa holder and private teacher permits. Types, documents, fees and rejection reasons.',
    intro: 'Every foreign worker in the UAE needs a MOHRE work permit for the job they do, even when their residence comes from somewhere else. Picking the wrong permit type means rejection and lost fees, so we match the permit to the situation and check the employer’s quota and job classification before anything is submitted.',
    facts: [
      { label: 'Issued by', value: 'MOHRE' },
      { label: 'Usual time', value: 'about 2 working days' },
      { label: 'Permit types', value: '13' },
      { label: 'Eligibility check', value: 'Free' },
    ],
    about: {
      title: 'One permit for each way of working',
      body: [
        'A work permit is the Ministry of Human Resources and Emiratisation’s authorisation for a person to work for a specific employer. It is separate from the residence visa: a Golden Visa holder or a family-visa holder still needs one to take a job.',
        'Most delays come from a job title that does not fit the company’s licence, an employer with quota or WPS problems, or certificates that are not attested. We check all three first.',
      ],
    },
    extra: [
      {
        type: 'table', title: 'Work permit types', head: ['Permit', 'For', 'Validity'],
        rows: [
          ['New work permit', 'Hiring someone from abroad or inside the UAE', '2 years'],
          ['Transfer permit', 'Moving from one employer to another', '2 years'],
          ['Family-sponsored permit', 'Residents on a family visa taking a job', '2 years'],
          ['Golden Visa holder permit', 'Golden Visa holders joining a company', '2 years'],
          ['Part-time permit', 'Working for more than one employer', '2 years'],
          ['Temporary permit', 'Short-term or seasonal jobs', 'Up to 6 months'],
          ['Mission permit', 'Project-based work brought in from abroad', '3 months, renewable once'],
          ['Juvenile permit', 'Workers aged 15–18, with restrictions', '1 year'],
          ['Student training permit', 'Students gaining work experience', '3 months'],
          ['National trainee permit', 'UAE nationals in training roles', '12 months'],
          ['GCC national permit', 'GCC citizens', '2 years'],
          ['Private teacher permit', 'Tutors and home educators', '2 years'],
          ['Freelance / self-employed permit', 'Independent professionals', 'Per permit'],
        ],
      },
      {
        type: 'table', title: 'Government fee ranges', head: ['Permit', 'Typical government fee (AED)'],
        rows: [
          ['New permit', '250 – 3,500'],
          ['Renewal', '250 – 3,450'],
          ['Transfer', '250 – 3,450'],
          ['Part-time', '250 – 1,500'],
          ['Temporary / mission', '250 – 1,500'],
          ['Golden Visa holder, juvenile, training', 'Reduced fees'],
        ],
        note: 'The fee depends on the company category and skill level. ' + FEES_NOTE,
      },
      {
        type: 'table', title: 'Common reasons for rejection', head: ['Reason', 'What it means'],
        rows: [
          ['Job title does not match the company activity', 'MOHRE rejects roles that do not fit the trade licence'],
          ['Employer quota, WPS or licence problems', 'An expired licence or unpaid salaries in WPS blocks new permits'],
          ['Certificates not attested', 'Education or experience certificates are returned unprocessed'],
          ['Wrong permit type', 'For example mission instead of standard: full re-submission and lost fees'],
          ['Past visit-visa work or overstay', 'Compliance flags delay or block the new permit'],
        ],
      },
    ],
    handle: [
      'Matching the right permit type to your situation',
      'Checking the employer’s quota, category, licence and WPS standing',
      'Job title mapping against the trade licence activity',
      'Offer letter, permit application and labour contract',
      'Attestation of degrees and experience letters',
      'Renewals, transfers and cancellations',
    ],
    steps: {
      items: [
        { title: 'Job offer', text: 'The employer issues the MOHRE offer with salary, title and terms, which you review and sign.' },
        { title: 'MOHRE approval', text: 'The ministry checks the company, the quota and the job classification.' },
        { title: 'Work permit issued', text: 'Usually within about two working days of a complete submission.' },
        { title: 'Medical and biometrics', text: 'Where a new residence is also needed.' },
        { title: 'Residence or permit card', text: 'The employment is registered and the contract takes effect.' },
      ],
    },
    docs: {
      items: [
        'Passport (6+ months valid) and photo',
        'Signed MOHRE job offer',
        'Education certificate, attested, if required for the job',
        'Professional licence, if the job is regulated',
        'Current residence (family or Golden Visa) for permits without a new visa',
        'Employer documents: handled by the company or by us with authorisation',
      ],
    },
    faq: [
      { q: 'Can I work without a work permit?', a: 'No. Working without a valid MOHRE permit is illegal and can lead to fines, cancellation and labour bans.' },
      { q: 'Does a job offer guarantee a permit?', a: 'No. MOHRE still checks the company and the job classification. That is why we pre-check before submission.' },
      { q: 'Can I get a work permit without a degree?', a: 'Yes, in non-graduate job categories. The category affects the permit and sometimes the fee.' },
      { q: 'I am on my husband’s visa. Can I work?', a: 'Yes, with a family-sponsored work permit from your employer. Your residence stays the same.' },
    ],
    related: ['/services/employment-visas-permits/', '/services/employment-visa/', '/services/freelancer-visa/', '/services/tasheel/', '/document-services/degree-attestation/', '/services/visa-cancellation/'],
  }),

  full({
    path: '/services/visa-cancellation/', name: 'Visa Cancellation', group: 'Visa services', apply: 'cancellation',
    seo: 'UAE Visa Cancellation | Employment, Family & Investor Visas, Overstay Fines',
    meta: 'Cancel a UAE residence visa properly: mutual, resignation, unilateral, contract expiry, employer unreachable, absconding, family and investor visas. Grace period, overstay fines, documents and timing.',
    intro: 'Cancelling a visa the right way clears your labour and immigration records, avoids fines and keeps your next job or visa unblocked. We handle labour and immigration cancellation for employees, family members and company owners, whether you are staying in the UAE or leaving.',
    facts: [
      { label: 'Straightforward cases', value: '1–3 working days' },
      { label: 'Disputed cases', value: '3–10 working days' },
      { label: 'Overstay fine', value: 'AED 50 a day' },
      { label: 'Records', value: 'Labour + immigration cleared' },
    ],
    about: {
      title: 'Two records to close, in the right order',
      body: [
        'An employment visa is cancelled in two parts: the MOHRE labour contract first, then the residence with ICP or GDRFA. A family visa or an investor visa only needs the immigration part, but family members must be cancelled before the sponsor’s own visa.',
        'Once the visa is cancelled, a grace period starts to find a new job, change visa or leave. Overstaying after that costs AED 50 a day, so the timing matters.',
      ],
    },
    extra: [
      {
        type: 'table', title: 'Which path fits your case', head: ['Situation', 'What it means', 'Usual time'],
        rows: [
          ['Mutual cancellation', 'You and the employer agree to cancel', '1–3 working days'],
          ['Resignation with employer support', 'You resigned and the employer cancels', '1–3 working days'],
          ['Employer refusing or delaying', 'The employer will not cancel, or asks for money', '3–5 working days'],
          ['Unilateral cancellation', 'Cancelled through MOHRE without the employer’s approval', '3–5 working days'],
          ['Employer unreachable', 'Company closed or not responding', '5–7 working days'],
          ['Absconding case', 'The employer filed an absconding report', '5–10 working days'],
          ['Contract expired', 'Contract ended but the visa is still active', '3–7 working days'],
          ['Family or dependent visa', 'Cancelled by the sponsor, inside or outside the UAE', '3–7 working days'],
          ['Leaving the UAE', 'Cancel and exit properly', '1–3 working days'],
          ['Overstay', 'Visa expired and fines are running', '24–72 hours to settle'],
        ],
      },
      {
        type: 'table', title: 'Grace period after cancellation', head: ['Visa', 'Grace period', 'Use it to'],
        rows: [
          ['Employment visa', 'Usually 60 days, longer for some skilled categories', 'Find a new job or change visa'],
          ['Investor / partner visa', 'Depends on the category', 'Stay active or switch visa'],
          ['Family visa', 'Linked to the sponsor’s visa', 'Stay or move to a new sponsor'],
        ],
        note: 'The exact grace period appears on your cancellation paper. We confirm it for your case.',
      },
    ],
    handle: [
      'Choosing the right cancellation path for your situation',
      'MOHRE labour cancellation and final settlement paperwork',
      'Immigration cancellation inside or outside the UAE',
      'Cancelling family members before the sponsor',
      'Unilateral cases, unreachable employers and absconding reports',
      'Calculating and paying overstay fines at cost',
      'New visa or change of status straight after, if you are staying',
    ],
    steps: {
      items: [
        { title: 'Tell us your situation', text: 'Visa type, employer status and whether you are staying or leaving.' },
        { title: 'Documents and signatures', text: 'Cancellation form signed by both parties where needed. We prepare it.' },
        { title: 'Labour cancellation', text: 'For employees: the MOHRE contract is closed.' },
        { title: 'Immigration cancellation', text: 'The residence is cancelled with ICP or GDRFA.' },
        { title: 'Your next step', text: 'Grace period confirmed, fines settled, and a new visa started if you need one.' },
      ],
    },
    docs: {
      items: [
        'Emirates ID, front and back',
        'Passport copy and current visa copy',
        'Signed cancellation form (we prepare it)',
        'Resignation or termination letter, where relevant',
        'For family members: the sponsor’s passport and Emirates ID',
      ],
    },
    faq: [
      { q: 'How much is the overstay fine?', a: 'AED 50 for each day after the visa or grace period ends, plus exit or renewal fees. Paying early stops it growing.' },
      { q: 'My employer will not cancel my visa. What can I do?', a: 'MOHRE allows unilateral cancellation in many cases, for example after the contract ends or when salaries are unpaid. We file it for you.' },
      { q: 'Do I need to cancel my family’s visas first?', a: 'Yes. Dependants are cancelled before the sponsor’s own visa, unless they are moving to a new sponsor.' },
      { q: 'Can I cancel from outside the UAE?', a: 'Yes. Immigration cancellation can be done while you are abroad, with the right documents.' },
      { q: 'Will cancellation give me a ban?', a: 'Not when it is done properly. Bans come from absconding reports, unpaid fines or breaches, which is why the right path matters.' },
    ],
    related: ['/services/employment-visas-permits/', '/services/visa-validity-check/', '/services/family-visa/', '/services/iloe-insurance/', '/services/work-permit/', '/services/tourist-visa/'],
  }),

  full({
    path: '/services/emirates-id/', name: 'Emirates ID Services', group: 'Visa services', apply: 'emirates-id',
    seo: 'Emirates ID Services UAE | New, Renewal, Replacement & Biometrics',
    meta: 'Emirates ID applications in the UAE: new cards, renewals, lost or damaged replacements, data updates and biometrics appointments for employees, families, investors, domestic workers and Golden Visa holders.',
    intro: 'Everyone who lives in the UAE must hold a valid Emirates ID. Without it, salaries, bank accounts, tenancy contracts, healthcare and school places stop. We file new cards, renewals and replacements with ICP, book the biometrics appointment when it is needed, and deliver the card to your door.',
    facts: [
      { label: 'Issued by', value: 'ICP' },
      { label: 'Late renewal fine', value: 'AED 20 a day' },
      { label: 'Grace period', value: '30 days after expiry' },
      { label: 'Delivery', value: 'Courier to your address' },
    ],
    about: {
      title: 'Your ID for every service in the UAE',
      body: [
        'The Emirates ID is the identity card for every UAE resident and citizen. It is issued by the Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) for the same period as your residence: two or three years on most visas, up to ten years on the Golden Visa.',
        'If it expires, a 30-day grace period applies, then a late fine of AED 20 a day up to a maximum of AED 1,000. A lost or damaged card can be replaced, and details such as a new passport number can be updated.',
      ],
    },
    who: {
      title: 'Who needs an Emirates ID',
      items: [
        'Employees in the private sector, free zones and government',
        'New hires: the first card is applied for with the residence visa',
        'Investors, partners and self-sponsored residents',
        'Dependants: spouses, children (including newborns) and parents',
        'Domestic workers: housemaids, nannies, drivers and gardeners',
        'Golden Visa holders, with a card valid for up to ten years',
      ],
    },
    handle: [
      'New Emirates ID applications with a residence visa',
      'Renewals, before or after expiry',
      'Replacement of lost, stolen or damaged cards',
      'Updates after a new passport or a change of details',
      'Biometrics appointment booking when fingerprints are needed',
      'Fine calculation and payment at cost',
      'Card collection and delivery',
    ],
    steps: {
      items: [
        { title: 'Send your details', text: 'Passport, visa and current Emirates ID if you have one.' },
        { title: 'Application filed', text: 'We submit to ICP and pay the government fees.' },
        { title: 'Biometrics if needed', text: 'First-time adult applicants and some renewals attend once for fingerprints. Children under 15 usually do not.' },
        { title: 'Card printed and delivered', text: 'The card is printed and couriered to your address.' },
      ],
    },
    docs: {
      items: [
        'Passport copy (valid) and a recent photo',
        'Residence visa or entry permit',
        'Current or expired Emirates ID, for renewals and replacements',
        'Police report, for a stolen card where required',
        'For children: the sponsor’s Emirates ID',
      ],
    },
    faq: [
      { q: 'What happens if my Emirates ID expires?', a: 'After a 30-day grace period a late fine of AED 20 a day applies, up to AED 1,000. Banks and government services may also stop accepting it.' },
      { q: 'Do I need fingerprints for a renewal?', a: 'Not always. ICP tells us when biometrics are needed; we book the appointment if so.' },
      { q: 'How long does a new card take?', a: 'Usually a few working days after approval and biometrics, then courier delivery.' },
      { q: 'Can I travel without my Emirates ID?', a: 'Your passport is your travel document, but you need a valid ID for most services here, and for GCC travel where it is accepted.' },
    ],
    related: ['/services/medical-biometrics/', '/services/medical-emirates-id-centres/', '/services/family-visa/', '/services/visa-validity-check/', '/golden-visa/', '/services/employment-visa/'],
  }),

  full({
    path: '/services/medical-biometrics/', name: 'Medical Fitness Test & Biometrics', group: 'Visa services', apply: 'medical',
    seo: 'UAE Visa Medical Fitness Test | Normal & VIP, SEHA, DHA & EHS Centres',
    meta: 'The residence visa medical fitness test in the UAE: blood test and chest X-ray at SEHA (Abu Dhabi), DHA (Dubai) or EHS (northern emirates), normal or VIP, results, documents and what happens if a result is flagged.',
    intro: 'Every residence visa applicant aged 18 or over completes a medical fitness test: a blood test and a chest X-ray at a government-approved centre. We choose the right centre for your emirate, book a normal or VIP slot, track the result to your visa file and book the Emirates ID fingerprints in the same trip where possible.',
    facts: [
      { label: 'Who', value: 'Applicants aged 18+' },
      { label: 'Tests', value: 'Blood test + chest X-ray' },
      { label: 'Normal (Abu Dhabi)', value: `AED ${F.medical.normal.aed}` },
      { label: 'VIP (Abu Dhabi)', value: `AED ${F.medical.vip.aed}` },
    ],
    about: {
      title: 'One short visit, booked for you',
      body: [
        'The medical fitness test screens for conditions such as tuberculosis and certain infections. It is done by SEHA-approved centres in Abu Dhabi, DHA centres in Dubai and EHS centres in the northern emirates, and the result goes straight to your visa file.',
        'Normal appointments report in about a day or more depending on the centre; VIP appointments are faster, with less waiting and results often the same day. Domestic workers and some job categories have extra tests.',
      ],
    },
    who: {
      title: 'Which test you need',
      items: [
        'Employment visa: blood test and chest X-ray',
        'Family visa: spouses and adult dependants aged 18+, children under 18 are exempt',
        'Golden Visa and long-term residence: the same test, normal or VIP',
        'Domestic workers: the standard test plus additional screening',
        'Students aged 18 and over',
      ],
    },
    handle: [
      'Choosing an approved centre near you (SEHA, DHA or EHS)',
      'Booking normal, priority or VIP appointments',
      'Pre-test document check so the visit is not wasted',
      'Tracking the result until it links to your visa file',
      'Emirates ID biometrics booked alongside where possible',
      'Guidance and next steps if a result needs further review',
    ],
    steps: {
      items: [
        { title: 'Book', text: 'We pick the approved centre and the slot that suits you, normal or VIP.' },
        { title: 'Visit', text: 'Bring your passport and Emirates ID or entry permit. Allow 30–60 minutes.' },
        { title: 'Test', text: 'A blood sample and a chest X-ray. Pregnant applicants follow a deferral process.' },
        { title: 'Results', text: 'Sent to the visa system. VIP results are usually fastest.' },
        { title: 'Cleared', text: 'The medical is linked to your file and the residence continues.' },
      ],
    },
    docs: {
      items: [
        'Passport (6+ months valid)',
        'Entry permit, residence application or current visa',
        'Emirates ID, if you have one',
        'Recent photo, for some centres',
      ],
    },
    extra: [{
      type: 'table', title: 'What delays a medical, and how we prevent it', head: ['Problem', 'Our solution'],
      rows: [
        ['Booked at a centre that is not approved for visas', 'We book approved centres only'],
        ['Passport or entry permit missing on the day', 'Document checklist before the visit'],
        ['Previous unfit result', 'We guide the review and retest process'],
        ['Pregnancy (X-ray deferred)', 'Deferral request so the file can continue'],
        ['Result not linked to the visa file', 'We follow up with the centre and ICP'],
        ['Results expire before the visa is filed', 'We watch the timeline and keep the file moving'],
      ],
    }],
    faq: [
      { q: 'Do children need a medical test?', a: 'No. Children under 18 are exempt.' },
      { q: 'How long do results take?', a: 'Normal results usually take one to three working days; VIP results are often ready the same day.' },
      { q: 'What happens if I fail the test?', a: 'Some conditions lead to a further review or treatment before a decision. We explain the options for your case privately.' },
      { q: 'Is the medical needed for a renewal?', a: 'Usually yes for adults renewing a residence visa, with some exceptions. We confirm when filing.' },
    ],
    related: ['/services/emirates-id/', '/services/medical-emirates-id-centres/', '/services/family-visa/', '/services/employment-visa/', '/golden-visa/', '/services/maid-visa/'],
  }),

  full({
    path: '/services/iloe-insurance/', name: 'ILOE Insurance', group: 'Employment visas & permits', apply: 'iloe',
    seo: 'ILOE Insurance UAE | Subscription, Fines, Status Check & Claims',
    meta: 'UAE Involuntary Loss of Employment (ILOE) insurance: who must subscribe, Category A and B premiums, AED 400 and AED 200 fines, status checks and how to claim 60% of basic salary for up to three months.',
    intro: 'ILOE is the UAE’s compulsory unemployment insurance for most private-sector and federal employees. It pays a monthly benefit for a short time if you lose your job through no fault of your own. We check your subscription and any fines by Emirates ID, subscribe or renew for you, and help you file a claim.',
    facts: [
      { label: 'Category A premium', value: 'AED 5 a month' },
      { label: 'Category B premium', value: 'AED 10 a month' },
      { label: 'Benefit', value: '60% of basic salary' },
      { label: 'Not subscribed', value: 'AED 400 fine' },
    ],
    about: {
      title: 'Unemployment insurance, explained simply',
      body: [
        'Subscription has been compulsory since 2023 for most employees in the private sector and federal government. Some groups are exempt, including investors who own their business, domestic workers, temporary contract workers, people under 18 and retirees receiving a pension who have joined a new job.',
        'If you lose your job involuntarily after at least 12 months of continuous subscription, you can claim 60% of your average basic salary for up to three months per claim, within the category cap.',
      ],
    },
    extra: [
      {
        type: 'table', title: 'Categories, premiums and benefits', head: ['Category', 'Basic salary', 'Premium', 'Maximum monthly benefit'],
        rows: [
          ['Category A', 'Up to AED 16,000', 'AED 5 a month + VAT', 'AED 10,000'],
          ['Category B', 'Over AED 16,000', 'AED 10 a month + VAT', 'AED 20,000'],
        ],
        note: 'Premiums can be paid monthly, quarterly, every six months or yearly.',
      },
      {
        type: 'table', title: 'ILOE fines', head: ['Situation', 'Fine'],
        rows: [
          ['Not subscribing by the deadline', 'AED 400'],
          ['Premiums unpaid for more than three months', 'AED 200'],
        ],
        note: 'Unpaid amounts can be deducted from salary or end-of-service benefits and can block a new work permit until settled.',
      },
    ],
    handle: [
      'Free status and fine check with your Emirates ID',
      'New subscription in the right category',
      'Renewals and premium payments',
      'Fine settlement and payment plans where available',
      'Claim preparation within the 30-day window',
      'Clearing ILOE issues that block a new work permit',
    ],
    steps: {
      title: 'How to claim the benefit',
      items: [
        { title: 'Check eligibility', text: 'At least 12 consecutive months of subscription, and the job loss was not for disciplinary reasons or resignation.' },
        { title: 'Apply within 30 days', text: 'From your last working day, or from the date a labour complaint is settled.' },
        { title: 'Submit documents', text: 'Emirates ID, termination details and bank account (IBAN).' },
        { title: 'Receive the benefit', text: '60% of your average basic salary over the last six months, paid monthly for up to three months.' },
      ],
    },
    docs: {
      items: ['Emirates ID number', 'Mobile number registered with your ID', 'Termination letter or labour cancellation, for claims', 'Bank IBAN in your name, for claims'],
    },
    faq: [
      { q: 'Who must subscribe to ILOE?', a: 'Most UAE private-sector and federal government employees. Business owners, domestic workers, temporary workers, under-18s and pensioners in new jobs are exempt.' },
      { q: 'I did not know about ILOE and have a fine. What now?', a: 'We check the exact amount, settle it and subscribe you so the fine does not grow or block your next permit.' },
      { q: 'Can I claim if I resigned?', a: 'No. The benefit is only for involuntary job loss, not resignation or dismissal for disciplinary reasons.' },
      { q: 'Does ILOE stop if I leave the UAE?', a: 'Payments stop if you leave the UAE or start a new job during the benefit period.' },
    ],
    related: ['/services/employment-visas-permits/', '/services/visa-cancellation/', '/services/employment-visa/', '/services/work-permit/', '/services/tasheel/', '/services/visa-validity-check/'],
  }),

  full({
    path: '/services/freelancer-visa/', name: 'Freelancer & Self-Employment Visa', group: 'Employment visas & permits',
    seo: 'UAE Freelance Visa | Self-Sponsored Residence for Independent Professionals',
    meta: 'UAE freelance and self-employment visas: freelance permits with residence, permits for residents who already have a visa, eligible activities, documents, steps, typical costs and how it compares with other visas.',
    intro: 'Work for your own clients in the UAE without a single employer. A freelance permit lets independent professionals in fields such as media, design, technology, marketing, consulting, education and wellness work legally, and many packages include a self-sponsored residence visa. We compare the options for your activity and file it with you.',
    facts: [
      { label: 'Residence', value: '1–2 years, renewable' },
      { label: 'Sponsor', value: 'Free zone or authority permit' },
      { label: 'Activities', value: '100+ professions' },
      { label: 'Family', value: 'Sponsor when income allows' },
    ],
    about: {
      title: 'Two ways to go freelance',
      body: [
        'If you already hold suitable UAE residence (for example a family visa or a Golden Visa), you only need a freelance permit for your activity. If you do not, you choose a package that includes a residence visa for one or two years.',
        'Freelance permits come from free zones, media and tech authorities, and MOHRE’s self-employment permit. Each has its own list of activities, prices and rules on invoicing and office space. We compare them for your profession before you commit.',
      ],
    },
    gives: {
      items: [
        'Legal right to invoice your own clients in the UAE',
        'A self-sponsored residence visa, in packages that include it',
        'An Emirates ID and a personal bank account',
        'Family sponsorship once your income meets the rules',
        'A route to a company licence later if your business grows',
      ],
    },
    who: {
      title: 'Who it suits',
      items: [
        'Creative professionals: designers, photographers, writers, content creators',
        'Technology: developers, IT consultants, data specialists',
        'Marketing, consulting, training and coaching',
        'Education and tutoring (with the private teacher permit where required)',
        'Health and wellness professionals, where the activity is licensed',
      ],
    },
    handle: [
      'Checking that your activity is eligible and which authority fits best',
      'Comparing packages with and without residence',
      'Freelance permit application and activity approval',
      'Entry permit or change of status, medical, Emirates ID and residence',
      'Bank account introduction and family visas',
      'Renewals and upgrades to a company licence',
    ],
    fees: {
      title: 'Typical costs in the market',
      intro: 'Freelance packages are priced by the issuing authority or provider, not as one government fee. Typical yearly figures, before VAT:',
      head: ['Package', 'Typical range'],
      rows: [
        ['Freelance permit only (you already have residence)', 'about AED 6,500 a year'],
        ['Permit with one-year residence', 'about AED 9,500–10,500'],
        ['Permit with two-year residence', 'about AED 13,500–14,500 for two years'],
      ],
      note: 'Medical, Emirates ID and family visas may be extra depending on the package. ' + FEES_NOTE,
    },
    steps: {
      items: [
        { title: 'Tell us your activity and status', text: 'Your profession, current residence and whether you need a visa.' },
        { title: 'Choose the authority and package', text: 'We compare the options and confirm the activity is accepted.' },
        { title: 'Permit and onboarding', text: 'Documents submitted and the freelance permit issued.' },
        { title: 'Residence, if included', text: 'Entry permit or change of status, medical, Emirates ID and visa.' },
        { title: 'Start working', text: 'Bank account, invoicing and renewals managed with you.' },
      ],
    },
    docs: {
      items: [
        'Passport (6+ months valid) and photo',
        'CV or portfolio showing your activity',
        'Degree or professional certificate, attested where required',
        'Current visa, if you are in the UAE',
        'No-objection letter from your sponsor, if you are on a family or employment visa',
      ],
    },
    faq: [
      { q: 'Can I work for UAE companies as a freelancer?', a: 'Yes, as a contractor invoicing for your services within your licensed activity. You cannot be their employee on a freelance permit.' },
      { q: 'I am on my spouse’s visa. Can I freelance?', a: 'Yes. You need a freelance permit for your activity and usually a no-objection letter from your sponsor. Your residence stays the same.' },
      { q: 'Is the remote work visa better?', a: 'If all your clients and your employer are outside the UAE, the virtual work visa may suit you better. If you want UAE clients, the freelance permit is the right route.' },
      { q: 'Can I sponsor my family?', a: 'Yes, when your income meets the family sponsorship rules.' },
    ],
    related: ['/remote-work-visa/', '/services/work-permit/', '/services/company-setup-pro/', '/services/family-visa/', '/services/bank-account-opening/', '/services/employment-visas-permits/'],
  }),

  /* ================= Property & business ================= */
  full({
    path: '/services/document-clearing/', name: 'Document Clearing & PRO', group: 'Property & business',
    seo: 'Document Clearing & PRO Services UAE | Government Paperwork Done for You',
    meta: 'Document clearing and PRO services in the UAE for individuals and companies: visas, Emirates ID, labour and immigration files, attestation, translation, notary and government liaison across all emirates.',
    intro: 'One team for your government paperwork. Our PRO officers prepare, submit and follow your files with immigration, MOHRE, MOFA, the courts and licensing authorities, so you do not lose days in queues or have files returned for small mistakes.',
    facts: [
      { label: 'For', value: 'Individuals and companies' },
      { label: 'Pre-check', value: 'Free, before submission' },
      { label: 'Coverage', value: 'All seven emirates' },
      { label: 'Typical file', value: '2–7 working days' },
    ],
    about: {
      title: 'What document clearing means',
      body: [
        'Document clearing is the work a PRO (public relations officer) does between you and the government: typing applications, collecting approvals, paying fees, following up and returning the final document. For companies it also means keeping trade licences, establishment cards and staff files up to date.',
        'Most delays come from a broken attestation chain, the wrong submission route, a missing translation, the wrong visa category, expired documents or names that differ between papers. We check all of these before anything is submitted.',
      ],
    },
    who: {
      title: 'What we clear for you',
      items: [
        'Visas: employment, family, investor, freelance and work permits',
        'Emirates ID: new cards, renewals, replacements and biometrics',
        'Attestation: home country, embassy, consulate and MOFA',
        'Legal translation and notary, including powers of attorney',
        'Corporate PRO: trade licence renewals, amendments, establishment cards and MOHRE files',
        'Local sponsorship and government liaison for mainland companies',
      ],
    },
    handle: [
      'Free pre-check of your documents and the right route',
      'Typing, submission and fee payment at cost',
      'Follow-up with each authority until approval',
      'Collection and delivery of originals',
      'Expiry tracking for company and staff documents',
      'Monthly PRO retainers for companies',
    ],
    steps: {
      items: [
        { title: 'Submit', text: 'Send scans or let us collect the originals.' },
        { title: 'Verify', text: 'A PRO officer checks the documents and route, usually within a few hours.' },
        { title: 'Process', text: 'We submit and follow up. Most files take 2–7 working days.' },
        { title: 'Receive', text: 'The approved document is delivered to you.' },
      ],
    },
    docs: { items: ['Passport and visa copies', 'Emirates ID', 'The document to be cleared (originals where needed)', 'For companies: trade licence, MOA and establishment card'] },
    faq: [
      { q: 'What are PRO services?', a: 'Handling government paperwork and approvals: visas, Emirates ID, work permits, attestation and company documents.' },
      { q: 'Can one team handle my visa and my documents?', a: 'Yes. That is the point: one file, one contact, no repeated documents.' },
      { q: 'Do you offer monthly PRO for companies?', a: 'Yes. A retainer covers your routine renewals and new hires, with fees quoted in advance.' },
    ],
    related: ['/services/company-setup-pro/', '/services/tasheel/', '/document-services/mofa-attestation/', '/services/notary-power-of-attorney/', '/services/employment-visas-permits/', '/services/emirates-id/'],
  }),

  full({
    path: '/services/tasheel/', name: 'Tasheel Services', group: 'Property & business',
    seo: 'Tasheel Services UAE | MOHRE Work Permits, Labour Contracts & Establishment Cards',
    meta: 'Tasheel (MOHRE) transactions for UAE companies: establishment registration, work permits, labour contracts, labour card and establishment card renewals, quotas, WPS, transfers, mission cards and complaints.',
    intro: 'Tasheel is the Ministry of Human Resources and Emiratisation’s system for every private-sector labour transaction. We prepare and submit your MOHRE files, from your first establishment card to work permits, contracts, renewals and transfers, so your company stays compliant.',
    facts: [
      { label: 'Run by', value: 'MOHRE' },
      { label: 'Work permit', value: 'about 2 working days' },
      { label: 'Government fees', value: 'AED 76 – 5,000' },
      { label: 'Channels', value: 'Portal, app or centre' },
    ],
    about: {
      title: 'The front desk for MOHRE',
      body: [
        'Every mainland company that employs staff deals with MOHRE through Tasheel: registering the establishment, issuing work permits, registering contracts and keeping labour cards valid. Transactions can be submitted on the MOHRE portal or app, or at a licensed Tasheel centre.',
        'Government fees depend on the transaction and on your company’s classification. Tasheel deals with labour files; Amer centres deal with residence and immigration. A full new hire uses both.',
      ],
    },
    who: {
      title: 'Transactions we handle',
      items: [
        'New establishment registration and establishment card',
        'Work permit issuance and renewals',
        'Labour contract registration and updates (bilingual unified contracts)',
        'Labour card renewal, before late fines apply',
        'Visa quota applications',
        'WPS registration and compliance',
        'Employee transfers, including from free zone to mainland',
        'Mission cards, absence reports, complaints and e-signature cards',
      ],
    },
    handle: ['Document preparation and checks', 'Submission through MOHRE channels', 'Fee payment at cost', 'Follow-up to approval', 'Records updated and documents delivered', 'Reminders before expiry'],
    steps: {
      items: [
        { title: 'Document preparation', text: 'Passport, trade licence, establishment card and contract details gathered and checked.' },
        { title: 'MOHRE submission', text: 'Filed with accurate details through the official system.' },
        { title: 'Government processing', text: 'Compliant work permits typically take about two working days.' },
        { title: 'Approval and delivery', text: 'Documents delivered and records updated.' },
      ],
    },
    docs: { items: ['Trade licence and establishment card', 'Employee passport and photo', 'Signed offer letter or contract details', 'E-signature card or authorisation'] },
    faq: [
      { q: 'What is the difference between Tasheel and Amer?', a: 'Tasheel handles MOHRE labour transactions; Amer handles residence and immigration. Hiring someone needs both.' },
      { q: 'Can Tasheel transactions be done online?', a: 'Yes, through the MOHRE portal and app. We file online for you.' },
      { q: 'What if a labour card expires?', a: 'Late renewal brings fines for the company. We track expiry dates and renew in time.' },
    ],
    related: ['/services/tawjeeh/', '/services/work-permit/', '/services/employment-visas-permits/', '/services/document-clearing/', '/services/company-setup-pro/', '/services/iloe-insurance/'],
  }),

  full({
    path: '/services/tawjeeh/', name: 'Tawjeeh Services', group: 'Property & business',
    seo: 'Tawjeeh UAE | MOHRE Labour Law Orientation for Employees & Employers',
    meta: 'Tawjeeh, the mandatory MOHRE labour-law orientation for new employees and companies: who needs it, what it covers, how long it takes and how the certificate clears work-permit processing.',
    intro: 'Tawjeeh, Arabic for “guidance”, is the Ministry of Human Resources and Emiratisation’s labour-law orientation. New employees joining a mainland company, job changers and newly registered companies complete it. We book the session in the right language and make sure the certificate reaches the work permit file.',
    facts: [
      { label: 'Session', value: 'about 30 minutes' },
      { label: 'Languages', value: 'Arabic, English, Urdu +' },
      { label: 'Certificate', value: 'Issued on completion' },
      { label: 'Approved by', value: 'MOHRE' },
    ],
    about: {
      title: 'Your rights and duties in one short session',
      body: [
        'Tawjeeh explains UAE labour law to workers and employers: contract types, working hours, leave, the Wage Protection System, end-of-service gratuity, and how to raise a complaint. Completing it is part of onboarding for many job categories.',
        'Sessions run at MOHRE-approved Tawjeeh centres, and companies can book group sessions for several new hires at once.',
      ],
    },
    who: {
      title: 'Who needs Tawjeeh',
      items: [
        'New employees joining a UAE mainland company',
        'Employees transferring to a new employer',
        'Companies registering with MOHRE for the first time',
        'Companies updating their establishment, where required',
      ],
    },
    extra: [{
      type: 'table', title: 'What the session covers', head: ['Topic', 'Includes'],
      rows: [
        ['UAE labour law', 'Contracts, working hours and overtime, annual and sick leave, gratuity'],
        ['Worker rights', 'WPS salary protection, anti-discrimination, health and safety, changing employer'],
        ['Employer duties', 'Emiratisation, accommodation standards, medical insurance, complaint procedures'],
        ['Practical guidance', 'Checking contract and visa status, filing complaints on the MOHRE app'],
      ],
    }],
    handle: ['Booking individual or group sessions', 'Choosing the right language', 'Certificate linked to the work permit file', 'Corporate packages for several hires'],
    steps: {
      items: [
        { title: 'Book', text: 'We book a session at an approved centre.' },
        { title: 'Attend', text: 'About 30 minutes, in your language.' },
        { title: 'Certificate', text: 'Issued on completion and linked to the MOHRE file.' },
      ],
    },
    docs: { items: ['Passport or Emirates ID', 'Work permit or offer details', 'Company establishment details for group bookings'] },
    faq: [
      { q: 'Is Tawjeeh mandatory for everyone?', a: 'It is required for many new mainland employees and job categories, and for new companies. We confirm whether it applies to your hire.' },
      { q: 'What happens if it is not completed?', a: 'The work permit or contract steps can be held until the orientation is done.' },
    ],
    related: ['/services/tasheel/', '/services/employment-visas-permits/', '/services/work-permit/', '/services/employment-visa/', '/services/iloe-insurance/', '/services/document-clearing/'],
  }),

  /* ================= Other services ================= */
  full({
    path: '/services/driving-licence/', name: 'UAE Driving Licence', group: 'Other services',
    seo: 'UAE Driving Licence | Exchange Your Foreign Licence or Get a New One',
    meta: 'Getting a UAE driving licence as a new resident: who can drive on a foreign licence, which countries can exchange directly, documents, the full training route, renewals, black points and key traffic rules.',
    intro: 'Once you hold UAE residence, you need a UAE driving licence to keep driving. Citizens of a list of countries can exchange their home licence directly; everyone else follows the training and test route at an approved driving school. We tell you which applies to you and prepare the file in the emirate where you live.',
    facts: [
      { label: 'Direct exchange', value: 'About 30+ countries' },
      { label: 'Exchange cost (Dubai)', value: 'about AED 870' },
      { label: 'Apply in', value: 'Your home emirate' },
      { label: 'Black points limit', value: '24 a year' },
    ],
    about: {
      title: 'Which route applies to you',
      body: [
        'Visitors from some countries can drive on their home or international licence for a short stay. Residents cannot keep doing so: once you are a resident, you exchange your licence or get a new UAE one, in the emirate where your residence and Emirates ID are registered.',
        'If your country is on the licensing authority’s exchange list (for example the UK, the USA, Canada, GCC states and many European countries), you exchange your licence after an eye test, with no lessons. If not, you open a file at an approved driving school, take theory and practical training and pass the tests.',
      ],
    },
    who: {
      title: 'Who can do what',
      items: [
        'Residents from exchange-list countries: direct exchange with an eye test',
        'Residents from other countries: training and tests at an approved school',
        'Visitors from eligible countries: drive on the home or international licence for the visit',
        'Golden Visa and other residents: same rules, based on nationality of the licence',
      ],
    },
    handle: [
      'Checking whether your licence can be exchanged',
      'Legal translation of a foreign licence when needed',
      'Eye test booking and licensing file opening',
      'Driving school enrolment and test scheduling for the full route',
      'Renewals and replacement of lost licences',
      'International driving permit for UAE residents',
    ],
    fees: {
      title: 'Typical exchange cost (Dubai example)',
      head: ['Item', 'AED'],
      rows: [['Opening a traffic file', '200'], ['Handbook and file fees', '50'], ['Licence issue', '600'], ['Knowledge and innovation fee', '20'], ['Total, approximately', '870']],
      note: 'Abu Dhabi and the other emirates have their own fee schedules. Training routes cost more, depending on the number of lessons. ' + FEES_NOTE,
    },
    steps: {
      title: 'Exchange route, step by step',
      items: [
        { title: 'Check eligibility', text: 'We confirm your country is on the current exchange list.' },
        { title: 'Eye test', text: 'At an approved optician; the result is sent electronically.' },
        { title: 'Documents and translation', text: 'Original licence, Emirates ID and a legal translation if the licence is not in English or Arabic.' },
        { title: 'Licence issued', text: 'Applied for with the licensing authority and issued, often the same day.' },
      ],
    },
    docs: { items: ['Original foreign driving licence', 'Legal translation (if not in Arabic or English)', 'Emirates ID and residence visa', 'Eye test result', 'No-objection letter from the sponsor, where required'] },
    extra: [{
      type: 'list', title: 'Key traffic rules for new drivers', style: 'cards',
      items: [
        'Always carry your licence, Emirates ID and the vehicle registration',
        'Seat belts for everyone; young children in child seats in the back',
        'No hand-held phone use while driving',
        'Zero tolerance for driving after drinking alcohol',
        '24 black points in a year leads to suspension of the licence',
      ],
    }],
    faq: [
      { q: 'Can I drive in the UAE on my home licence as a resident?', a: 'No. Residents need a UAE licence. Visitors from eligible countries can drive on their own or an international licence during their visit.' },
      { q: 'How long does an exchange take?', a: 'Often the same day once the eye test and documents are ready.' },
      { q: 'My country is not on the list. What now?', a: 'You enrol at an approved driving school, complete the required lessons and pass the theory and road tests. Previous experience can shorten the course.' },
      { q: 'Can I rent a car on a UAE licence?', a: 'Yes. Rental companies set their own age and licence-age rules.' },
    ],
    related: ['/document-services/legal-translation/', '/services/emirates-id/', '/services/bank-account-opening/', '/golden-visa-benefits/', '/services/document-clearing/', '/services/family-visa/'],
  }),

  full({
    path: '/services/bank-account-opening/', name: 'Bank Account Opening Assistance', group: 'Other services',
    seo: 'Bank Account Opening UAE | Personal & Corporate Accounts for Residents and Companies',
    meta: 'Help opening personal, corporate and multi-currency bank accounts in the UAE: choosing the right bank, KYC documents, application, follow-up and activation for residents, Golden Visa holders and companies.',
    intro: 'UAE banks run strict compliance checks, and many applications stall because the wrong bank was chosen or the papers did not match. We match your profile to banks whose policies fit, prepare a consistent KYC file and follow the application until the account is open and usable.',
    facts: [
      { label: 'Accounts', value: 'Personal, corporate, multi-currency' },
      { label: 'Corporate accounts', value: 'usually 2–4 weeks' },
      { label: 'Banks', value: 'UAE local and international' },
      { label: 'Compliance', value: 'KYC and AML ready file' },
    ],
    about: {
      title: 'Why the choice of bank matters',
      body: [
        'Every UAE bank applies Central Bank rules, but each has its own appetite for nationalities, business activities, free zones and transaction patterns. Going to the bank that fits your profile is the single biggest factor in a quick approval.',
        'We look at whether you are banking as a person or a company, your currencies and the volume and origin of your transactions, then shortlist two or three banks and prepare the file to their standard.',
      ],
    },
    who: {
      title: 'Accounts we help with',
      items: [
        'Personal accounts for new residents and Golden Visa holders',
        'Corporate accounts for mainland, free-zone and offshore companies',
        'Multi-currency accounts for international clients and trade',
        'Additional services: merchant accounts, payroll, trade finance and cards',
      ],
    },
    handle: [
      'Profile review and a shortlist of suitable banks',
      'Document collection and consistency check',
      'Bank forms and KYC package',
      'Liaison with relationship managers and answers to compliance questions',
      'Activation: first deposit, online banking, cards and signatories',
      'Later upgrades: second accounts, currencies or switching banks',
    ],
    steps: {
      items: [
        { title: 'Profile discovery', text: 'Who you are, what will move through the account and which compliance questions will come up.' },
        { title: 'Bank shortlist', text: 'Two or three banks ranked by fit and likely speed.' },
        { title: 'Application preparation', text: 'Forms and evidence completed to the chosen bank’s standard.' },
        { title: 'Submission and tracking', text: 'Lodged and followed, with clarifications answered quickly.' },
        { title: 'Account handover', text: 'Credentials, cards and a short briefing so you can transact on day one.' },
      ],
    },
    docs: {
      items: [
        'Passport, residence visa and Emirates ID of each account holder or signatory',
        'For companies: trade licence, MOA and board resolution to open the account',
        'Proof of address for the company and the directors',
        'Business plan, expected turnover and main counterparties',
        'Bank reference letter or proof of financial standing',
      ],
    },
    faq: [
      { q: 'Can I open a personal account before my residence is issued?', a: 'Some banks offer non-resident accounts, but most need your Emirates ID or residence. We tell you which applies.' },
      { q: 'How long does a corporate account take?', a: 'Usually two to four weeks after a complete file, depending on the bank’s review.' },
      { q: 'Why was my account application declined?', a: 'Often a mismatch between the bank and the profile, or inconsistent documents. We review the file and approach a better-suited bank.' },
    ],
    related: ['/services/investor-visa/', '/services/company-setup-pro/', '/golden-visa/', '/services/freelancer-visa/', '/remote-work-visa/', '/services/document-clearing/'],
  }),

  /* ================= Wills & estate planning ================= */
  full({
    path: '/services/difc-wills/', name: 'DIFC Wills', group: 'Wills & estate planning',
    seo: 'DIFC Wills | Register a Will for Non-Muslims in the UAE',
    meta: 'DIFC wills for non-Muslims with assets in the UAE: full, property, guardianship, business owner and financial assets wills, who can register, what is covered, remote signing with two witnesses and typical costs.',
    intro: 'A DIFC will lets a non-Muslim aged 18 or over decide who inherits their UAE assets, appoint guardians for their children and choose executors, instead of leaving the estate to default inheritance rules. It is registered with the DIFC Courts’ Wills Service Centre, fully remotely, and probate is in English.',
    facts: [
      { label: 'For', value: 'Non-Muslims aged 18+' },
      { label: 'Drafting', value: 'about 3 working days' },
      { label: 'Registration', value: '100% remote' },
      { label: 'Probate', value: 'In English' },
    ],
    about: {
      title: 'Protecting your family and your UAE assets',
      body: [
        'Without a registered will, UAE assets can be frozen and distributed under default rules, which may not match your wishes, and guardianship of children may not go to the person you would choose. A DIFC will fixes both.',
        'You do not need to be a UAE resident or hold an Emirates ID. The will covers assets in all seven emirates and, subject to legal advice for each country, assets abroad.',
      ],
    },
    who: {
      title: 'Five types of DIFC will',
      items: [
        'Full will: all assets, guardianship and business interests',
        'Property will: UAE real estate only',
        'Guardianship will: guardians for minor children',
        'Business owners will: company shares',
        'Financial assets will: bank accounts, cash and investments',
      ],
    },
    handle: [
      'Advice on the right will type for your family and assets',
      'Drafting under the DIFC Wills Service Centre rules',
      'Upload to the DIFC portal and appointment booking',
      'Arranging two witnesses for the online signing',
      'Updates, replacements and revocations later',
    ],
    fees: {
      title: 'Typical costs',
      head: ['Item', 'Typical range'],
      rows: [['Preparation and registration assistance', 'from about AED 3,800'], ['Registration fee to the DIFC Wills Service Centre', 'set by the DIFC, depends on the will type']],
      note: FEES_NOTE,
    },
    steps: {
      items: [
        { title: 'Consultation', text: 'Your family, your assets and your wishes, including funeral wishes if you want them recorded.' },
        { title: 'Drafting', text: 'A draft in about three working days, faster on an urgent service.' },
        { title: 'Upload and appointment', text: 'The approved will is uploaded and an online appointment is booked.' },
        { title: 'Signing with witnesses', text: 'You and two witnesses sign electronically during the online meeting with a DIFC officer.' },
      ],
    },
    docs: { items: ['Passport of the testator (Emirates ID if you have one)', 'Details of beneficiaries, executors and guardians', 'List of assets: property, accounts, shares', 'Passports of the two witnesses'] },
    faq: [
      { q: 'Do I need to be a UAE resident?', a: 'No. Non-residents who own UAE property, accounts or other assets can register a DIFC will.' },
      { q: 'Can I register remotely?', a: 'Yes. The signing is done online with a DIFC officer and two witnesses.' },
      { q: 'Can I change it later?', a: 'Yes. You can update, replace or revoke it by registering a new will.' },
      { q: 'Can I appoint more than one executor?', a: 'Yes, one or more executors can manage your estate.' },
      { q: 'DIFC will or ADJD will?', a: 'Both are valid across the UAE. DIFC wills can also cover assets abroad and have English probate; ADJD wills are often cheaper and open to Muslims and non-Muslims. We help you choose.' },
    ],
    related: ['/services/adjd-wills/', '/services/muslim-wills/', '/services/notary-power-of-attorney/', '/golden-visa/property-investment/', '/document-services/legal-translation/', '/services/bank-account-opening/'],
  }),

  full({
    path: '/services/adjd-wills/', name: 'ADJD Wills (Abu Dhabi)', group: 'Wills & estate planning',
    seo: 'ADJD Wills | Register a Will in Abu Dhabi, Remotely',
    meta: 'Register a will with the Abu Dhabi Judicial Department (ADJD) Civil Wills Office: open to Muslims and non-Muslims, residents and non-residents, covering assets in all seven emirates, with remote registration.',
    intro: 'The Abu Dhabi Judicial Department’s Civil Wills Office registers wills for Muslims and non-Muslims, residents and non-residents. It is an affordable, streamlined way to direct how your UAE assets are shared and who looks after your children. We draft the will, arrange the Arabic translation and book the remote registration.',
    facts: [
      { label: 'Registered with', value: 'ADJD Civil Wills Office' },
      { label: 'Open to', value: 'Muslims and non-Muslims' },
      { label: 'Covers', value: 'Assets in all 7 emirates' },
      { label: 'Registration', value: 'Remote, by video call' },
    ],
    about: {
      title: 'A simple, cost-effective will for UAE assets',
      body: [
        'An ADJD will covers your assets in every emirate: property, bank accounts, vehicles, business shares and personal belongings. It cannot cover assets outside the UAE, so people with significant overseas assets often pair it with a will at home.',
        'The will is drafted, translated into Arabic and registered over a video call, where the ADJD verifies your identity and reads the will back to confirm your wishes. A digital copy is sent to you by email.',
      ],
    },
    gives: { title: 'Why choose an ADJD will', items: ['Low registration cost', 'Fully remote registration', 'Easy amendments after marriage, divorce or new children', 'Clear, quick procedure'] },
    handle: ['Tailored drafting to your wishes', 'Arabic legal translation', 'Upload to the ADJD portal', 'Remote registration appointment', 'Later amendments'],
    fees: { title: 'Typical costs', head: ['Item', 'Typical range'], rows: [['Drafting, translation and registration assistance', 'from about AED 1,800'], ['ADJD registration fee', 'set by ADJD']], note: FEES_NOTE },
    steps: {
      items: [
        { title: 'Quotation', text: 'Based on your family and the assets to be covered.' },
        { title: 'Drafting and translation', text: 'You approve the draft, then it is translated into Arabic.' },
        { title: 'Online registration', text: 'Signed copy uploaded; identity checked and will read back on a video call.' },
        { title: 'Registered copy', text: 'ADJD emails the digital registered will.' },
      ],
    },
    docs: { items: ['Passport (and Emirates ID if resident)', 'Beneficiary, executor and guardian details', 'Asset list in the UAE'] },
    faq: [
      { q: 'Can Muslims register an ADJD will?', a: 'Yes. The ADJD Civil Wills Office accepts wills from Muslims and non-Muslims.' },
      { q: 'Can I include business shares?', a: 'Yes, shares in UAE companies can be included.' },
      { q: 'Can I amend it later?', a: 'Yes, by registering an updated will.' },
      { q: 'Does it cover my property abroad?', a: 'No. ADJD wills cover UAE assets only. For overseas assets consider a DIFC will or a will in that country.' },
    ],
    related: ['/services/difc-wills/', '/services/muslim-wills/', '/services/notary-power-of-attorney/', '/document-services/legal-translation/', '/golden-visa/property-investment/', '/services/bank-account-opening/'],
  }),

  full({
    path: '/services/muslim-wills/', name: 'Muslim Wills', group: 'Wills & estate planning',
    seo: 'Muslim Wills UAE | Register a Will for Muslim Expats in Abu Dhabi',
    meta: 'Muslim expats can register a will with the Abu Dhabi Judicial Department to cover UAE assets, name beneficiaries and executors and appoint guardians for children. Who can register, what it covers and how.',
    intro: 'Muslim expats aged 18 or over can now register a will in the UAE with the Abu Dhabi Judicial Department. It records who inherits your UAE assets, names guardians for your children and makes probate faster for your family. We draft it with you, explain how inheritance rules apply to your case, and register it remotely.',
    facts: [
      { label: 'For', value: 'Muslim expats aged 18+' },
      { label: 'Registered with', value: 'ADJD Civil Wills Office' },
      { label: 'Residence', value: 'Not required' },
      { label: 'Registration', value: 'Remote' },
    ],
    about: {
      title: 'Why register a will in the UAE',
      body: [
        'Without a will, family members can face long court procedures before UAE accounts and property are released. A registered will names your executors and guardians and sets out your wishes clearly, which shortens probate.',
        'How far your will can change the default inheritance shares depends on the law that applies to your estate. We explain the options, including the choice of law available to expats, before the will is drafted.',
      ],
    },
    gives: { title: 'What a registered will lets you do', items: ['Decide how your UAE assets are managed and passed on', 'Name beneficiaries and executors', 'Appoint guardians for minor children', 'Make the inheritance process simpler and quicker for your family'] },
    handle: ['Consultation on inheritance rules for your nationality', 'Drafting and Arabic translation', 'Remote registration with ADJD', 'Updates when your family changes'],
    steps: {
      items: [
        { title: 'Quotation', text: 'Based on your family and assets.' },
        { title: 'Drafting', text: 'Your wishes drafted and finalised, then translated into Arabic.' },
        { title: 'Online registration', text: 'Registered remotely with the ADJD Civil Wills Office.' },
      ],
    },
    docs: { items: ['Passport (Emirates ID if resident)', 'Family details: spouse, children, parents', 'Beneficiary, executor and guardian details', 'UAE asset list'] },
    faq: [
      { q: 'Do I need to live in the UAE?', a: 'No. Non-residents with UAE assets can register too, without an Emirates ID.' },
      { q: 'What assets can be included?', a: 'Property, bank accounts, vehicles, business shares and other assets in any of the seven emirates.' },
      { q: 'Can I appoint a guardian for my children?', a: 'Yes. Naming a guardian is one of the main reasons to register a will.' },
      { q: 'At what age can I register?', a: 'From 18.' },
    ],
    related: ['/services/adjd-wills/', '/services/difc-wills/', '/services/notary-power-of-attorney/', '/document-services/legal-translation/', '/services/family-visa/', '/golden-visa/'],
  }),

  /* ================= Quick access ================= */
  full({
    path: '/services/medical-emirates-id-centres/', name: 'Medical & Emirates ID Centres', group: 'Quick access', apply: 'medical',
    seo: 'Visa Medical & Emirates ID Centres in the UAE | Where to Go and How to Book',
    meta: 'Where to do your visa medical test and Emirates ID biometrics in Abu Dhabi, Dubai and the northern emirates: which authority runs each centre, normal and VIP options, what to bring and how we book the nearest slot.',
    intro: 'Your medical test and Emirates ID fingerprints happen at government-approved centres, and which ones you can use depends on the emirate that issues your visa. Tell us where you live and work: we book the nearest approved centre and the earliest slot, normal or VIP, often for both appointments on the same day.',
    facts: [
      { label: 'Abu Dhabi medicals', value: 'SEHA-approved centres' },
      { label: 'Dubai medicals', value: 'DHA centres' },
      { label: 'Northern emirates', value: 'EHS centres' },
      { label: 'Emirates ID', value: 'ICP service centres' },
    ],
    about: {
      title: 'The right centre for your visa',
      body: [
        'Medical fitness centres are run by the health authority of each emirate: SEHA-approved screening centres in Abu Dhabi and Al Ain, Dubai Health Authority centres in Dubai, and Emirates Health Services centres in Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah and Fujairah. Biometrics for the Emirates ID are taken at ICP customer happiness centres and approved typing partners.',
        'A test at the wrong centre may not link to your visa file, so we always book through the right channel and confirm the appointment details with you.',
      ],
    },
    extra: [{
      type: 'table', title: 'Where to go, by emirate', head: ['Emirate', 'Medical test', 'Emirates ID biometrics'],
      rows: [
        ['Abu Dhabi and Al Ain', 'SEHA-approved disease prevention and screening centres', 'ICP centres in Abu Dhabi, Mussafah and Al Ain'],
        ['Dubai', 'DHA medical fitness centres, normal and VIP', 'ICP and GDRFA-linked centres'],
        ['Sharjah, Ajman, UAQ, RAK, Fujairah', 'EHS medical fitness centres', 'ICP centres in each emirate'],
      ],
      note: 'Centre lists and opening hours change. We confirm the nearest open centre when we book.',
    }],
    handle: ['Finding the nearest approved centre', 'Booking normal, priority or VIP slots', 'Combining medical and biometrics on one day where possible', 'Reminders with the address, time and what to bring', 'Following up until results and biometrics reach your file'],
    steps: {
      items: [
        { title: 'Tell us your area', text: 'Where you live or work, and the days that suit you.' },
        { title: 'We book', text: 'The nearest approved centre for your emirate.' },
        { title: 'Attend', text: 'Bring your passport, Emirates ID or entry permit and the appointment message.' },
        { title: 'We track the result', text: 'Until it appears on your visa file.' },
      ],
    },
    docs: { items: ['Passport', 'Entry permit or residence application', 'Emirates ID, if you have one', 'Appointment confirmation'] },
    faq: [
      { q: 'Can I do my medical in Dubai for an Abu Dhabi visa?', a: 'Usually the medical must be done with the health authority of the emirate issuing your visa. We confirm which centres you can use.' },
      { q: 'How long does the visit take?', a: 'Typically 30–60 minutes for a medical; VIP visits are shorter. Biometrics take about 15–30 minutes.' },
    ],
    related: ['/services/medical-biometrics/', '/services/emirates-id/', '/services/family-visa/', '/golden-visa/', '/services/visa-validity-check/', '/services/employment-visa/'],
  }),

  full({
    path: '/services/visa-validity-check/', name: 'Visa Validity & Status Check', group: 'Quick access',
    seo: 'UAE Visa Status Check | File Validity, Grace Period & Overstay Fines',
    meta: 'Check a UAE visa, entry permit or residence file: validity dates, grace period and any overstay fines, by passport details. How to check on ICP and GDRFA yourself, or let us check it free.',
    intro: 'Not sure whether a visa is still valid, how many grace days are left or whether fines are building up? Send us the passport details and we check the right government system, ICP for Abu Dhabi and the northern emirates or GDRFA for Dubai, and reply on WhatsApp with a clear answer, free.',
    facts: [
      { label: 'Check', value: 'Free' },
      { label: 'Abu Dhabi + 5 emirates', value: 'ICP file validity' },
      { label: 'Dubai', value: 'GDRFA status inquiry' },
      { label: 'Overstay fine', value: 'AED 50 a day' },
    ],
    about: {
      title: 'What a status check tells you',
      body: [
        'A file validity check confirms whether an entry permit or residence is active, cancelled or expired, the last legal day of stay, and whether there are fines or blocks on the file. It protects you from overstay fines, problems at the airport and delays when changing visa.',
        'Visitors often miscount the days of a 30 or 60-day visa from the entry date; residents often lose track of the grace period after cancellation. A quick check removes the guesswork.',
      ],
    },
    steps: {
      title: 'Check it yourself on ICP',
      items: [
        { title: 'Open ICP Smart Services', text: 'The official website or app of the Federal Authority for Identity, Citizenship, Customs and Port Security.' },
        { title: 'Choose Public Services, then File Validity', text: 'Select the search by passport information.' },
        { title: 'Enter the details', text: 'Passport number, nationality and date of birth, or the file number.' },
        { title: 'See the result', text: 'Status, validity and any fines. Dubai files are checked on the GDRFA status inquiry instead.' },
      ],
      note: 'Prefer not to? Send us the details and we check it for you, free.',
    },
    handle: ['Checking the right system for the emirate', 'Exact last legal day and grace period', 'Overstay fine amount, if any', 'Settling fines and arranging extension, renewal or exit', 'Advice on the next visa if you want to stay'],
    docs: { items: ['Passport number and expiry date', 'Nationality', 'Date of birth', 'File or UID number, if you have it'] },
    faq: [
      { q: 'Can I check with my passport number only?', a: 'For privacy, the systems also ask for nationality and date of birth. That is all we need.' },
      { q: 'How much is the overstay fine?', a: 'AED 50 for each day after the visa or grace period ends. Settling quickly stops it growing.' },
      { q: 'Which system holds my visa?', a: 'Visas issued in Dubai are with GDRFA. Visas from Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah and Fujairah are with ICP.' },
    ],
    related: ['/services/visa-cancellation/', '/services/tourist-visa/', '/services/family-visa/', '/services/emirates-id/', '/golden-visa/', '/services/golden-visa-renewal/'],
  }),

  /* ================= Menu items that had no page yet ================= */
  full({
    path: '/services/golden-visa-renewal/', name: 'Golden Visa Renewal', group: 'Visa services', apply: 'gv-renewal',
    seo: 'Golden Visa Renewal Abu Dhabi | Documents, Steps and Family Renewals',
    meta: 'Renew a UAE Golden Visa and the family’s residence: when to start, proof that you still qualify, medical, Emirates ID, health insurance and timeline.',
    intro: 'A Golden Visa is renewable as long as you still meet the conditions of your category. We check your eligibility well before expiry, update your documents, and renew your residence and Emirates ID together with your family’s, so nobody’s status lapses.',
    facts: [{ label: 'Validity', value: 'Up to 10 years' }, { label: 'Start', value: 'Before expiry' }, { label: 'Family', value: 'Renewed together' }, { label: 'Residence rule', value: 'No 6-month limit' }],
    about: {
      title: 'Renewing on the same conditions',
      body: [
        'Renewal follows the same route as your first Golden Visa: you show that you still meet your category, for example the property is still owned and worth AED 2 million or more, or the salary and profession still qualify. Then the residence and Emirates ID are re-issued.',
        'Family members sponsored on your Golden Visa are renewed in the same file. Sons over 25 and other changes in family circumstances are reviewed before filing.',
      ],
    },
    handle: ['Eligibility review months before expiry', 'Updated proof for your category (title deed, valuation, salary, licence)', 'Nomination and approval where required', 'Medical test for adults and Emirates ID renewal', 'Health insurance renewal', 'Family members renewed in the same file'],
    steps: { items: [
      { title: 'Review', text: 'We check your category documents and your family’s details.' },
      { title: 'Filing', text: 'Renewal application with updated proof.' },
      { title: 'Medical and Emirates ID', text: 'Adults complete the medical; biometrics only if requested.' },
      { title: 'Issued', text: 'New residence and Emirates ID for you and your family.' },
    ] },
    docs: { items: ['Passport and current Golden Visa', 'Updated proof for your category', 'Health insurance', 'Family passports and visas'] },
    faq: [
      { q: 'What if I no longer qualify?', a: 'We look at other Golden Visa categories or a standard residence so you and your family stay legal.' },
      { q: 'Can I renew while abroad?', a: 'Often the application can start while you are abroad; the medical and biometrics need you in the UAE.' },
    ],
    related: ['/golden-visa/', '/golden-visa/property-investment/', '/document-services/valuation-certificate/', '/family-golden-visa/', '/services/emirates-id/', '/services/medical-biometrics/'],
  }),

  full({
    path: '/services/entry-permit-status-change/', name: 'Entry Permit & Change of Status', group: 'Visa services',
    seo: 'UAE Entry Permit & Change of Status | Switch Visa Without Leaving',
    meta: 'UAE entry permits for new residents and change of status for people already in the UAE: when each is needed, the 60-day window, fees and documents.',
    intro: 'Every new residence starts with an entry permit. If you are abroad, you travel on it; if you are already in the UAE, a change of status switches you to the new visa without leaving the country. We file whichever applies and watch the deadlines.',
    facts: [{ label: 'Change of status (ICP)', value: `AED ${F.perPerson.changeOfStatus.aed}` }, { label: 'Window', value: '60 days' }, { label: 'Exit needed', value: 'No' }, { label: 'Applies to', value: 'All new residences' }],
    about: {
      title: 'Inside or outside the UAE',
      body: [
        'From abroad, the entry permit lets you enter for residence purposes; the medical, Emirates ID and residence must then be completed within its validity. Inside the UAE on a visit or another visa, a change of status moves you onto the new permit without an exit trip.',
        'Change of status is common for family members who arrive on visit visas and for Golden Visa applicants already in the country.',
      ],
    },
    handle: ['Entry permit applications for every residence type', 'Change of status inside the UAE', 'Tracking the 60-day window', 'Coordinating medical, Emirates ID and residence afterwards'],
    steps: { items: [
      { title: 'Entry permit', text: 'Issued for the new residence category.' },
      { title: 'Entry or change of status', text: 'Travel in on the permit, or switch status inside the UAE.' },
      { title: 'Residence completed', text: 'Medical, Emirates ID and residence finished in time.' },
    ] },
    docs: { items: ['Passport and photo', 'Current visa and entry stamp, for change of status', 'Documents for the new residence category'] },
    faq: [{ q: 'Do I need to leave the UAE to change visa?', a: 'No. A change of status lets you switch without leaving, for an extra government fee.' }],
    related: ['/services/family-visa/', '/golden-visa/', '/services/tourist-visa/', '/services/employment-visa/', '/services/medical-biometrics/', '/services/visa-validity-check/'],
  }),

  full({
    path: '/services/health-insurance/', name: 'Health Insurance for Residence', group: 'Visa services',
    seo: 'Health Insurance for UAE Residence Visas | Abu Dhabi & Dubai Requirements',
    meta: 'Health insurance that meets UAE residence rules for you, your family and domestic workers: Abu Dhabi and Dubai requirements, Golden Visa and visa renewals, and how we arrange a compliant policy.',
    intro: 'Residence visas in Abu Dhabi and Dubai require valid health insurance for every person on the file. We arrange a policy that meets the emirate’s rules, at the level of cover you want, and make sure it is issued before the residence application goes in.',
    facts: [{ label: 'Required for', value: 'Every resident' }, { label: 'Abu Dhabi', value: 'DoH-compliant cover' }, { label: 'Dubai', value: 'DHA-compliant cover' }, { label: 'Issued', value: 'Before residence' }],
    about: {
      title: 'Cover that keeps your visa moving',
      body: [
        'Abu Dhabi and Dubai make health insurance compulsory for residents, and other emirates increasingly require it. A residence application can stop if the policy is missing or does not meet the minimum benefits.',
        'Employers insure their staff; sponsors insure their family members and domestic workers. Golden Visa holders, investors and the self-employed arrange their own.',
      ],
    },
    handle: ['Comparing compliant plans from licensed insurers', 'Basic plans for visa compliance or broader cover', 'Policies for spouses, children, parents and domestic workers', 'Linking the policy to the visa file', 'Renewals with your visa'],
    docs: { items: ['Passport and visa or entry permit', 'Emirates ID, if available', 'Date of birth and any declarable conditions'] },
    faq: [{ q: 'Do children need their own policy?', a: 'Yes. Every person on a residence file needs cover.' }],
    related: ['/services/family-visa/', '/golden-visa/', '/services/maid-visa/', '/remote-work-visa/', '/services/medical-biometrics/', '/retirement-visa/'],
  }),

  full({
    path: '/document-services/degree-attestation/', name: 'Degree Certificate Attestation', group: 'Attestation & legalisation',
    seo: 'Degree Attestation UAE | For Jobs, Golden Visa & Equivalency',
    meta: 'Degree and diploma attestation for UAE jobs, the skilled-professional Golden Visa and equivalency: home-country steps, UAE embassy, MOFA, timelines and documents.',
    intro: 'A degree issued abroad must be attested before UAE employers, MOHRE or the Golden Visa authorities can rely on it. We check the route for your country and university, collect the stamps in order and return the attested certificate to you.',
    facts: [{ label: 'Final stamp', value: 'UAE MOFA' }, { label: 'Needed for', value: 'Skilled jobs, Golden Visa' }, { label: 'Route', value: 'Country specific' }, { label: 'Check', value: 'Free' }],
    about: { title: 'Why degrees are attested', body: ['MOHRE uses your attested degree to place a work permit in a skilled category, and the Golden Visa for skilled professionals requires a degree. Some regulated jobs also need an equivalency certificate from the Ministry of Higher Education.', 'The route usually runs through the university or education authority, the foreign ministry of the issuing country, the UAE embassy, then MOFA in the UAE.'] },
    handle: ['Route check for your country and university', 'University and education department verification', 'Home-country foreign ministry or apostille', 'UAE embassy and MOFA attestation', 'Equivalency guidance where required'],
    docs: { items: ['Original degree certificate', 'Transcripts or mark sheets', 'Passport copy'] },
    related: ['/document-services/mofa-attestation/', '/golden-visa/skilled-professionals/', '/services/employment-visa/', '/document-services/legal-translation/', '/services/work-permit/', '/golden-visa/students-graduates/'],
  }),

  full({
    path: '/document-services/marriage-certificate/', name: 'Marriage Certificate Attestation', group: 'Attestation & legalisation',
    seo: 'Marriage Certificate Attestation UAE | For Spouse and Family Visas',
    meta: 'Marriage certificate attestation and Arabic translation for UAE spouse visas, family Golden Visas and newborn residence: home country, UAE embassy, MOFA and translation.',
    intro: 'To sponsor your spouse, or to register your baby’s birth in the UAE, your marriage certificate must be attested and translated. We arrange every stamp in the right order and the Arabic legal translation.',
    facts: [{ label: 'Needed for', value: 'Spouse visa, newborn' }, { label: 'Stamps', value: 'Home, embassy, MOFA' }, { label: 'Translation', value: 'Arabic, MOJ licensed' }, { label: 'Check', value: 'Free' }],
    about: { title: 'The certificate behind every family file', body: ['Immigration uses the attested marriage certificate to prove the relationship for spouse visas, for children’s visas in some cases, and hospitals ask for it when a baby is born in the UAE.', 'Certificates issued in the UAE only need MOFA attestation; those issued abroad need the home-country and UAE embassy steps first.'] },
    handle: ['Home-country attestation', 'UAE embassy attestation', 'MOFA attestation', 'Arabic legal translation', 'Courier of originals'],
    docs: { items: ['Original marriage certificate', 'Passport copies of both spouses'] },
    related: ['/services/family-visa/', '/services/newborn-visa/', '/document-services/mofa-attestation/', '/document-services/legal-translation/', '/document-services/birth-certificate/', '/family-golden-visa/'],
  }),

  full({
    path: '/document-services/birth-certificate/', name: 'Birth Certificate Attestation', group: 'Attestation & legalisation',
    seo: 'Birth Certificate Attestation UAE | For Children’s Visas and Schools',
    meta: 'Birth certificate attestation for children’s residence visas, family Golden Visas and school admission in the UAE, and MOFA attestation of UAE-issued birth certificates for newborns.',
    intro: 'Children’s visas and school admissions need an attested birth certificate. For babies born abroad we arrange home-country, embassy and MOFA attestation; for babies born in the UAE, MOFA attestation of the local certificate is part of the newborn visa.',
    facts: [{ label: 'Needed for', value: 'Child visa, school' }, { label: 'UAE-born', value: 'MOFA only' }, { label: 'Foreign-born', value: 'Full chain' }, { label: 'Translation', value: 'When required' }],
    about: { title: 'One certificate, many uses', body: ['The attested birth certificate proves the parent–child relationship for residence visas, family Golden Visas, passports and school enrolment.', 'For a newborn born in the UAE, the certificate is attested by MOFA before the baby’s passport and visa, inside the 120-day window.'] },
    handle: ['Attestation of foreign birth certificates', 'MOFA attestation for UAE-issued certificates', 'Arabic translation where required', 'Coordination with the newborn visa'],
    docs: { items: ['Original birth certificate', 'Parents’ passport copies'] },
    related: ['/services/newborn-visa/', '/services/family-visa/', '/document-services/mofa-attestation/', '/document-services/marriage-certificate/', '/document-services/legal-translation/', '/family-golden-visa/children/'],
  }),

  full({
    path: '/document-services/document-legalisation/', name: 'Document Legalisation', group: 'Attestation & legalisation',
    seo: 'Document Legalisation UAE | Using UAE Documents Abroad and Foreign Documents Here',
    meta: 'Legalisation of personal and commercial documents in both directions: foreign documents for UAE use and UAE documents for use abroad, through MOFA, embassies, consulates and apostille.',
    intro: 'Legalisation works both ways. Documents from abroad are legalised for use in the UAE, and UAE documents, such as company papers, police clearances or degrees earned here, are legalised for use in another country. We map the route for the destination and handle each office.',
    facts: [{ label: 'Directions', value: 'Into and out of the UAE' }, { label: 'Offices', value: 'MOFA, embassies, consulates' }, { label: 'Documents', value: 'Personal and commercial' }, { label: 'Check', value: 'Free' }],
    about: { title: 'The right route for the destination', body: ['For a UAE document going abroad, the usual chain is the issuing authority, MOFA in the UAE, then the embassy of the destination country. For documents coming here, it is the reverse, ending with MOFA.', 'Commercial documents often also need a chamber of commerce stamp, and many countries require a translation into their language.'] },
    handle: ['Route mapping for the destination country', 'Issuing authority and chamber of commerce stamps', 'MOFA and embassy or consulate legalisation', 'Translations into the destination language'],
    docs: { items: ['Original document', 'Passport copy or company trade licence', 'Destination country and purpose'] },
    related: ['/document-services/mofa-attestation/', '/document-services/legal-translation/', '/services/notary-power-of-attorney/', '/services/document-clearing/', '/services/company-setup-pro/', '/document-services/degree-attestation/'],
  }),

  full({
    path: '/document-services/property-documentation/', name: 'Property Documentation', group: 'Property & business',
    seo: 'Property Documentation Abu Dhabi | Title Deeds, Valuations and POA for Golden Visa',
    meta: 'Property documents for Golden Visa and transactions in Abu Dhabi: title deed and ownership certificates, valuation certificates, off-plan contracts, mortgage letters and powers of attorney.',
    intro: 'A property Golden Visa and most property transactions depend on clean paperwork. We gather the title deed or ownership certificate, the valuation certificate, off-plan contracts and mortgage letters, and prepare powers of attorney when someone acts for you.',
    facts: [{ label: 'Valuation (ADREC)', value: `AED ${F.propertyValuation.aed}` }, { label: 'Golden Visa', value: 'AED 2M+ property' }, { label: 'Off-plan', value: 'Developer letters' }, { label: 'POA', value: 'Notarised' }],
    about: { title: 'The papers behind a property file', body: ['For the property Golden Visa, the authorities look at proof of ownership, the value of the property and, for mortgaged or off-plan units, how much has been paid. Each comes from a different office: the land department, the developer and the bank.', 'We collect them in the right form so the nomination is not held up by a missing letter.'] },
    handle: ['Title deed or ownership certificate copies', 'Valuation certificate requests', 'Developer statements for off-plan property', 'Bank letters for mortgaged property', 'Powers of attorney for sale, purchase or management'],
    docs: { items: ['Title deed or sale and purchase agreement', 'Owner’s passport and Emirates ID', 'Mortgage statement, if any', 'Developer payment statement, for off-plan'] },
    related: ['/golden-visa/property-investment/', '/document-services/valuation-certificate/', '/services/notary-power-of-attorney/', '/services/difc-wills/', '/services/adjd-wills/', '/services/bank-account-opening/'],
  }),
];
