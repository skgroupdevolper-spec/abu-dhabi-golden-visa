// The initial 20 blog articles (developer specification, section 11). Own wording; every article has
// a service CTA, FAQs, author/reviewer, last-reviewed date and internal links.
import type { Page, Section } from './types';
import { coverUrl } from '@/lib/cover';

const AUTHOR = 'Abu Dhabi Golden Visa editorial team';
const REVIEWER = 'Senior residency advisor, Brightlink Management Consultancy';
const REVIEWED = '5 November 2026';

type A = {
  slug: string; title: string; meta: string; summary: string; minutes: number;
  body: [string, string | string[]][]; faq: [string, string][]; links: string[]; cta?: { label: string; href: string };
};

// Blog categories for the starting articles (admins can add more in the dashboard).
export const BLOG_CATEGORIES = [
  { slug: 'getting-started', name: 'Getting started', description: 'How the Abu Dhabi Golden Visa works, what it costs and how to apply.' },
  { slug: 'property-investors', name: 'Property investors', description: 'Golden Visa through Abu Dhabi property: off-plan, mortgages and selling.' },
  { slug: 'professionals-business', name: 'Professionals & business', description: 'Routes for professionals, doctors, teachers, engineers and business owners.' },
  { slug: 'family-renewal', name: 'Family & renewal', description: 'Sponsoring your family, medical, Emirates ID and renewals.' },
  { slug: 'comparisons', name: 'Comparisons', description: 'Golden Visa compared with other UAE residency options.' },
];
const CAT_OF: Record<string, string> = {
  'abu-dhabi-golden-visa-complete-guide': 'getting-started', 'how-to-apply-abu-dhabi-golden-visa': 'getting-started', 'abu-dhabi-golden-visa-cost': 'getting-started', 'golden-visa-from-outside-uae': 'getting-started', 'golden-visa-application-mistakes': 'getting-started',
  'golden-visa-through-property-investment': 'property-investors', 'off-plan-property-golden-visa': 'property-investors', 'mortgaged-property-golden-visa': 'property-investors', 'selling-golden-visa-property': 'property-investors',
  'golden-visa-skilled-professionals': 'professionals-business', 'golden-visa-aed-30000-salary': 'professionals-business', 'golden-visa-doctors-healthcare': 'professionals-business', 'golden-visa-teachers-engineers': 'professionals-business', 'golden-visa-business-owners-shareholders': 'professionals-business',
  'golden-visa-family-members': 'family-renewal', 'sponsor-parents-golden-visa': 'family-renewal', 'golden-visa-medical-emirates-id': 'family-renewal', 'golden-visa-renewal-requirements': 'family-renewal',
  'abu-dhabi-vs-dubai-golden-visa': 'comparisons', 'golden-visa-vs-retirement-visa': 'comparisons',
};

function art(a: A): Page {
  const sections: Section[] = a.body.map(([title, b]) => (Array.isArray(b) ? { type: 'list', title, items: b } : { type: 'text', title, body: b.split('\n\n') }));
  sections.push({ type: 'faq', title: 'Frequently asked questions', items: a.faq.map(([q, ans]) => ({ q, a: ans })) });
  sections.push({ type: 'tool', tool: 'lead', title: 'Talk to an advisor', intro: 'Free first consultation. We reply on WhatsApp in your language.' });
  return {
    path: `/blog/${a.slug}/`,
    seoTitle: `${a.title} | Abu Dhabi Golden Visa`,
    meta: a.meta,
    eyebrow: BLOG_CATEGORIES.find((c) => c.slug === CAT_OF[a.slug])?.name ?? 'Guide',
    category: CAT_OF[a.slug],
    image: coverUrl(a.title, BLOG_CATEGORIES.find((c) => c.slug === CAT_OF[a.slug])?.name),
    imageAlt: a.title,
    h1: a.title,
    intro: a.summary,
    cta: a.cta ?? { label: 'Check My Eligibility', href: '/visa-check/' },
    sections,
    related: a.links,
    article: { author: AUTHOR, reviewer: REVIEWER, reviewed: REVIEWED, minutes: a.minutes, summary: a.summary },
  };
}

const NOTE = 'Rules and fees change. Treat this guide as general information and confirm your own case with us or the competent authority before you act.';

export const BLOG: Page[] = [
  art({
    slug: 'abu-dhabi-golden-visa-complete-guide', minutes: 9,
    title: 'Abu Dhabi Golden Visa 2026: Complete Guide',
    meta: 'Everything about the Abu Dhabi Golden Visa in 2026: who qualifies, routes, documents, costs, family sponsorship and the application steps.',
    summary: 'The Golden Visa is a long-term UAE residence of up to 10 years that renews while you still qualify. This guide walks through every route, what it costs and how the application runs in Abu Dhabi.',
    body: [
      ['What the Golden Visa is', 'A self-sponsored UAE residence of up to 10 years. You do not need an employer or a local sponsor, you can stay outside the UAE for long periods, and you can sponsor your family.\n\nThe visa is federal, but each emirate runs its own nomination channel. In Abu Dhabi, nominations go through the local framework before the federal immigration authority issues the residence.'],
      ['The main routes', ['Property investors: Abu Dhabi property worth AED 2 million or more', 'Investors: AED 2 million in deposits, funds or company capital, or AED 250,000 tax paid a year', 'Entrepreneurs: an approved project, AED 1 million yearly revenue, or a business sold for AED 7 million', 'Skilled professionals: a degree, a UAE work permit and AED 30,000 a month', 'Exceptional talents, scientists, outstanding students and humanitarian pioneers through recommendations']],
      ['What it costs', 'Government fees for a property investor applying inside the UAE start at about AED 4,728 for the main applicant, with family members added per person. Our calculator shows every line, and we confirm the final amount in writing before you pay.'],
      ['How the application runs', ['Eligibility check and document list', 'Attestation and translation of documents', 'Nomination through the Abu Dhabi channel', 'Entry permit or change of status', 'Medical, Emirates ID and residence']],
      ['Before you start', NOTE],
    ],
    faq: [['Is the Golden Visa permanent?', 'No. It lasts up to 10 years and renews while you still meet the conditions.'], ['Can I work on a Golden Visa?', 'Yes. You can work for an employer (with a work permit) or run your own business.']],
    links: ['/golden-visa/', '/golden-visa-cost/', '/how-to-apply/'],
  }),
  art({
    slug: 'how-to-apply-abu-dhabi-golden-visa', minutes: 7,
    title: 'How to Apply for Abu Dhabi Golden Visa',
    meta: 'Step-by-step: how to apply for the Abu Dhabi Golden Visa, from eligibility and attestation to nomination, entry permit, medical and Emirates ID.',
    summary: 'Ten practical steps take you from the first eligibility check to your Emirates ID. The order changes slightly depending on your route and whether you are already in the UAE.',
    body: [
      ['The ten steps', ['Free eligibility assessment', 'Document verification and attestation', 'Initial lawful entry arrangements, if needed', 'Golden Visa nomination or pre-approval', 'Golden Visa entry permit', 'Change of status, where applicable', 'Medical fitness test', 'Emirates ID application and biometrics', 'Health insurance, where required', 'Residence issue and Emirates ID delivery']],
      ['Inside or outside the UAE', 'From abroad, you receive an entry permit and finish the process after arriving. Inside the UAE on another visa, we change your status, which adds a government fee but saves a trip.'],
      ['Where people lose time', 'Unattested documents, mismatched names between passports and certificates, and valuation or ownership papers that do not show the full AED 2 million. We check these first.'],
      ['Good to know', NOTE],
    ],
    faq: [['Can I apply myself?', 'Yes. A consultant is optional; we save time by getting the file right the first time and following every step.'], ['How long does it take?', 'It depends on the route and the authorities. We give you a realistic estimate after reviewing your documents.']],
    links: ['/how-to-apply/', '/requirements-documents/', '/visa-check/'],
  }),
  art({
    slug: 'abu-dhabi-golden-visa-cost', minutes: 6,
    title: 'Abu Dhabi Golden Visa Cost and Government Fees',
    meta: 'Abu Dhabi Golden Visa government fees per person, family costs, change of status, medical and Emirates ID, with worked examples.',
    summary: 'Government fees are charged per person, with a few one-off items. Here is how the total is built, with an example for a property investor and family.',
    body: [
      ['Per-person government fees', ['Immigration and residence visa: AED 1,614.25', 'Emirates ID, 10 years: AED 1,107.85', 'Change of status (inside the UAE only): AED 656.05', 'Medical test for adults: AED 300 normal or AED 750 VIP']],
      ['One-off items', ['Sponsor file opening for family: AED 353.91, once', 'Property value certificate for the property route: about AED 1,050']],
      ['Worked example', 'A property investor inside the UAE pays about AED 4,728.15 in government fees. Add a spouse (AED 3,678.15), a child (AED 3,378.15) and the sponsor file (AED 353.91): about AED 12,138.36 for the family. Health insurance and our service fee are quoted separately, with VAT on our fee.'],
      ['Before you pay', NOTE],
    ],
    faq: [['Are prices the same in Dubai?', 'No. Do not use Dubai fees for an Abu Dhabi application; the channels and some charges differ.'], ['Do children need a medical?', 'Children under 18 do not need the medical test.']],
    links: ['/golden-visa-cost/', '/golden-visa/property-investment/', '/family-golden-visa/'],
    cta: { label: 'Calculate Visa Cost', href: '/golden-visa-cost/' },
  }),
  art({
    slug: 'golden-visa-through-property-investment', minutes: 7,
    title: 'Abu Dhabi Golden Visa Through Property Investment',
    meta: 'How to get the Abu Dhabi Golden Visa through property: AED 2 million rule, completed, off-plan and mortgaged homes, documents and valuation.',
    summary: 'Owning AED 2 million or more of Abu Dhabi property is the most common route. What matters is how the value and your ownership are proven.',
    body: [
      ['The AED 2 million benchmark', 'Your property, or several properties together, must be worth AED 2 million or more. The value is shown by a registered purchase agreement or a Real Estate Unit Value Certificate.'],
      ['Ways to own it', ['Completed property, fully paid', 'Off-plan property from an approved developer with at least AED 2 million paid', 'Mortgaged property with a UAE bank where your own equity is at least AED 2 million', 'Several properties combined']],
      ['Documents', ['Title deed or registered purchase agreement', 'Valuation certificate if the agreement does not show AED 2 million', 'Bank letter for mortgaged homes, developer letter for off-plan', 'Passport, photo, health insurance']],
      ['Keep in mind', NOTE],
    ],
    faq: [['Can jointly owned property count?', 'It is assessed case by case. Send us the title deed and we check it.'], ['Do I need to live in the property?', 'No. It can be rented out.']],
    links: ['/golden-visa/property-investment/', '/document-services/valuation-certificate/', '/golden-visa-cost/'],
    cta: { label: 'Check My Property Eligibility', href: '/visa-check/' },
  }),
  art({
    slug: 'off-plan-property-golden-visa', minutes: 5,
    title: 'Can Off-Plan Property Qualify for Abu Dhabi Golden Visa?',
    meta: 'Off-plan property and the Abu Dhabi Golden Visa: developer approval, amount paid, documents and common mistakes.',
    summary: 'Yes, off-plan property can qualify, but the amount already paid and the developer’s status matter more than the full purchase price.',
    body: [
      ['What usually needs to be true', ['The developer and project are approved', 'You have paid at least AED 2 million to the developer', 'The purchase agreement is registered']],
      ['Documents', ['Registered purchase agreement', 'Statement of payments from the developer', 'Developer letter where required']],
      ['Common mistakes', 'Counting the full contract value rather than the amount paid, and applying before the payment plan reaches AED 2 million. We check the statement first.'],
      ['Note', NOTE],
    ],
    faq: [['Can I add a completed property to reach AED 2 million?', 'Combining properties is often possible. We check how each is valued.'], ['What if I am still paying instalments?', 'You may need to wait until the amount paid reaches the benchmark.']],
    links: ['/golden-visa/property-investment/', '/document-services/property-documentation/'],
  }),
  art({
    slug: 'mortgaged-property-golden-visa', minutes: 5,
    title: 'Can You Get a Golden Visa With a Mortgaged Property?',
    meta: 'Mortgaged property and the Abu Dhabi Golden Visa: equity rule, bank letters and how the value is calculated.',
    summary: 'A mortgage does not rule you out. Your own equity, the value minus what you still owe, needs to reach AED 2 million.',
    body: [
      ['How the equity is worked out', 'Example: a home valued at AED 5 million with AED 2.5 million still owed gives AED 2.5 million equity, which can qualify. A home valued at AED 3 million with AED 1.5 million owed gives AED 1.5 million, which does not.'],
      ['Documents', ['Real Estate Unit Value Certificate', 'Bank letter showing the outstanding amount', 'Search certificate showing the property is not under seizure']],
      ['Note', NOTE],
    ],
    faq: [['Does the bank need to be in the UAE?', 'Mortgages are generally with UAE banks; we check your lender’s documents.'], ['Can I refinance later?', 'Speak to us first: a new mortgage changes your equity.']],
    links: ['/golden-visa/property-investment/', '/document-services/valuation-certificate/'],
  }),
  art({
    slug: 'golden-visa-skilled-professionals', minutes: 6,
    title: 'Abu Dhabi Golden Visa for Skilled Professionals',
    meta: 'How skilled professionals qualify for the Abu Dhabi Golden Visa without property: salary, degree, work permit and classification.',
    summary: 'Experienced professionals in the UAE can qualify without buying property. Salary, education and job classification are what count.',
    body: [
      ['The usual conditions', ['A valid UAE employment contract and work permit', 'A job in an eligible professional classification', 'At least a bachelor’s degree, attested or with equivalency', 'A monthly salary of AED 30,000 or more']],
      ['Documents', ['Passport and Emirates ID', 'Employment contract and salary certificate', 'Attested degree and equivalency', 'Employer documents']],
      ['Note', NOTE],
    ],
    faq: [['Does the salary include allowances?', 'Usually the total monthly salary on the contract counts. We check your salary certificate.'], ['Do I need to stay with my employer?', 'If you change jobs, speak to us; your eligibility is reviewed at renewal.']],
    links: ['/golden-visa/skilled-professionals/', '/document-services/degree-attestation/'],
  }),
  art({
    slug: 'golden-visa-aed-30000-salary', minutes: 5,
    title: 'Golden Visa With AED 30,000 Salary: Eligibility Explained',
    meta: 'The AED 30,000 salary Golden Visa route explained: what counts as salary, degree requirements and classification.',
    summary: 'AED 30,000 a month is the key number for the professional route, but it is not the only condition.',
    body: [
      ['What counts', 'Your monthly salary as shown in your contract and salary certificate. Bank statements help show it is actually paid.'],
      ['Other conditions', ['Bachelor’s degree or higher', 'Eligible professional classification (skill level)', 'Valid UAE work permit']],
      ['Note', NOTE],
    ],
    faq: [['What if my salary is AED 28,000?', 'The professional route is unlikely; we check other routes such as the Green Visa.'], ['Can self-employed people use this route?', 'This route is for employees; business owners use the investor or entrepreneur routes.']],
    links: ['/golden-visa/skilled-professionals/', '/services/green-visa/'],
  }),
  art({
    slug: 'golden-visa-doctors-healthcare', minutes: 5,
    title: 'Abu Dhabi Golden Visa for Doctors and Healthcare Professionals',
    meta: 'Golden Visa for doctors, nurses and healthcare professionals in Abu Dhabi: licences, recommendations and salary routes.',
    summary: 'Doctors and many healthcare professionals have their own tracks, through health authority licensing or the professional route.',
    body: [
      ['Routes', ['Doctors with a valid UAE health licence, through specialist tracks', 'Healthcare professionals through the AED 30,000 professional route', 'Frontline healthcare workers through nominations, when open']],
      ['Documents', ['Health licence', 'Employment contract and salary certificate', 'Attested degree']],
      ['Note', NOTE],
    ],
    faq: [['Do I need a DoH licence?', 'In Abu Dhabi, healthcare professionals are licensed by the health authority; we check your licence category.'], ['Can my family join?', 'Yes, on the same terms as other Golden Visa holders.']],
    links: ['/golden-visa/doctors/', '/golden-visa/healthcare-professionals/'],
  }),
  art({
    slug: 'golden-visa-teachers-engineers', minutes: 5,
    title: 'Abu Dhabi Golden Visa for Teachers and Engineers',
    meta: 'How teachers, educators and engineers can qualify for the Abu Dhabi Golden Visa.',
    summary: 'Teachers and engineers usually qualify through the professional route, with some education professionals eligible through recommendations.',
    body: [
      ['Engineers', 'Eligible engineering roles with a degree and AED 30,000 monthly salary usually fit the professional route.'],
      ['Teachers and educators', 'School leaders and outstanding teachers may be recommended by the education authority; others use the professional route.'],
      ['Note', NOTE],
    ],
    faq: [['Do I need an equivalency certificate?', 'Degrees from abroad usually need one for the professional route.'], ['Can part-time teaching count?', 'The route generally needs a full employment contract.']],
    links: ['/golden-visa/teachers/', '/golden-visa/engineers/'],
  }),
  art({
    slug: 'golden-visa-business-owners-shareholders', minutes: 6,
    title: 'Golden Visa for Business Owners and Company Shareholders',
    meta: 'Golden Visa for business owners and shareholders: AED 2 million capital, tax route, documents and mainland vs free zone.',
    summary: 'Company owners can qualify through capital, deposits or the tax their company pays. Clean ownership documents are the key.',
    body: [
      ['Routes', ['AED 2 million company capital or your share in it', 'AED 2 million deposit with a UAE bank or fund', 'AED 250,000 tax paid a year for two years']],
      ['Documents', ['Trade licence and memorandum', 'Commercial register showing your share', 'Bank or fund letters', 'Tax returns for the tax route']],
      ['Note', NOTE],
    ],
    faq: [['Can borrowed money count?', 'No, the capital must be your own.'], ['Can I add an executive director?', 'The investor route may cover one advisor and one executive director, where allowed.']],
    links: ['/golden-visa/business-investors/', '/services/company-setup-pro/'],
  }),
  art({
    slug: 'golden-visa-family-members', minutes: 6,
    title: 'Abu Dhabi Golden Visa for Family Members',
    meta: 'Who you can sponsor on a Golden Visa: spouse, children of any age, parents, newborns and domestic workers.',
    summary: 'Golden Visa holders can bring their spouse, children of any age and parents. Each person pays their own government fees.',
    body: [
      ['Who you can sponsor', ['Spouse', 'Sons and daughters of any age', 'Parents with health insurance', 'Newborns born in the UAE', 'Domestic workers, subject to the rules']],
      ['Documents', ['Attested marriage certificate', 'Attested birth certificates', 'Passports and photos', 'Health insurance']],
      ['Note', NOTE],
    ],
    faq: [['Does my family get 10 years too?', 'Family residency usually follows the holder’s validity.'], ['What if the holder passes away?', 'Family members can stay until their residency expires.']],
    links: ['/family-golden-visa/', '/document-services/marriage-certificate/'],
  }),
  art({
    slug: 'sponsor-parents-golden-visa', minutes: 5,
    title: 'How to Sponsor Parents Under a Golden Visa',
    meta: 'Sponsoring your parents on an Abu Dhabi Golden Visa: insurance, relationship proof, medical and costs.',
    summary: 'Parents can join you with health insurance and proof of the relationship. Older parents need suitable insurance cover.',
    body: [
      ['What you need', ['Your attested birth certificate showing your parents', 'Parents’ passports and photos', 'Health insurance for each parent', 'Medical test for each parent']],
      ['Costs', 'Each parent pays the per-person government fees for an adult, plus insurance.'],
      ['Note', NOTE],
    ],
    faq: [['Can I sponsor parents-in-law?', 'This depends on current rules; ask us for your case.'], ['Do parents need to live with me?', 'Proof of suitable housing may be requested.']],
    links: ['/family-golden-visa/parents/', '/services/health-insurance/'],
  }),
  art({
    slug: 'golden-visa-from-outside-uae', minutes: 5,
    title: 'Golden Visa Application From Outside the UAE',
    meta: 'Applying for the Abu Dhabi Golden Visa from abroad: entry permit, travel, medical and Emirates ID.',
    summary: 'You can start from abroad. After approval you enter on a Golden Visa entry permit and finish the steps in the UAE.',
    body: [
      ['How it works', ['We prepare and submit your file', 'You receive an entry permit', 'You travel to the UAE', 'Medical, biometrics and residence are completed here']],
      ['Attestation first', 'Documents from abroad are attested before you travel, so you do not need a second trip.'],
      ['Note', NOTE],
    ],
    faq: [['Do I save money applying from abroad?', 'There is no change of status fee, but plan for travel.'], ['How long do I stay for the steps?', 'Usually long enough for the medical and biometrics; we plan the dates with you.']],
    links: ['/services/entry-permit-status-change/', '/how-to-apply/'],
  }),
  art({
    slug: 'golden-visa-medical-emirates-id', minutes: 4,
    title: 'Abu Dhabi Golden Visa Medical and Emirates ID Process',
    meta: 'The medical fitness test and Emirates ID biometrics for your Golden Visa: who needs them, normal vs VIP, what to bring.',
    summary: 'Adults take a medical fitness test; everyone gives biometrics for the Emirates ID. Here is what to expect.',
    body: [
      ['Medical test', ['Needed for applicants 18 and over', 'Normal (AED 300) or VIP (AED 750)', 'Bring your passport and application details']],
      ['Emirates ID', ['10-year card for Golden Visa holders', 'Biometrics at an approved centre', 'Card delivered after issue']],
      ['Note', NOTE],
    ],
    faq: [['What does VIP medical change?', 'Faster service and results; the test itself is the same.'], ['Can children skip biometrics?', 'Young children may be exempt from fingerprints; we confirm.']],
    links: ['/services/medical-biometrics/', '/services/medical-emirates-id-centres/'],
  }),
  art({
    slug: 'golden-visa-renewal-requirements', minutes: 4,
    title: 'Abu Dhabi Golden Visa Renewal Requirements',
    meta: 'Renewing your Abu Dhabi Golden Visa: when to start, what to prove, and renewing your family at the same time.',
    summary: 'Renewal is straightforward when you still meet your route’s conditions. Start early and renew your family together.',
    body: [
      ['When to start', 'Plan a review a few months before expiry so any changes, such as a sold property, can be handled.'],
      ['What to prove', ['You still meet the route conditions', 'Valid health insurance', 'Medical and Emirates ID renewal']],
      ['Note', NOTE],
    ],
    faq: [['Can I renew on a different route?', 'Yes, if you now qualify differently.'], ['What if I no longer qualify?', 'We look at other residence options, such as the Green Visa.']],
    links: ['/services/golden-visa-renewal/', '/family-golden-visa/renewal/'],
  }),
  art({
    slug: 'selling-golden-visa-property', minutes: 4,
    title: 'What Happens if You Sell Your Golden Visa Property?',
    meta: 'Selling the property behind your Golden Visa: what changes, replacing the property, and protecting your family’s residency.',
    summary: 'Your visa depends on continuing to meet the conditions. Selling can affect it, so plan before you sign.',
    body: [
      ['Before you sell', ['Check whether other assets still meet the benchmark', 'Consider buying a replacement property first', 'Ask how the change will be handled at renewal']],
      ['Family members', 'Your family’s residency is linked to yours, so plan their status too.'],
      ['Note', NOTE],
    ],
    faq: [['Is my visa cancelled straight away?', 'Speak to us: the effect depends on the rules and your situation.'], ['Can I switch to another route?', 'Possibly, if you qualify through investment, business or profession.']],
    links: ['/golden-visa/property-investment/', '/services/golden-visa-renewal/'],
  }),
  art({
    slug: 'abu-dhabi-vs-dubai-golden-visa', minutes: 5,
    title: 'Abu Dhabi Golden Visa vs Dubai Golden Visa',
    meta: 'Abu Dhabi and Dubai Golden Visa compared: same federal visa, different application channels, property rules and fees.',
    summary: 'It is the same federal visa, but the application channel, property registration and some fees differ between emirates.',
    body: [
      ['What is the same', ['Up to 10 years, renewable', 'Self-sponsored with family sponsorship', 'Similar main benchmarks']],
      ['What differs', ['Nomination channel and authority', 'Where property is registered and valued', 'Some government and service fees']],
      ['Which to choose', 'Usually the emirate where your property, company or job is. Ask us if you have assets in both.'],
      ['Note', NOTE],
    ],
    faq: [['Can I live in Dubai on an Abu Dhabi Golden Visa?', 'The residence is UAE-wide; your file is managed through the emirate that issued it.'], ['Are fees the same?', 'No; do not use Dubai fees for Abu Dhabi.']],
    links: ['/golden-visa/', '/golden-visa-cost/'],
  }),
  art({
    slug: 'golden-visa-vs-retirement-visa', minutes: 5,
    title: 'UAE Golden Visa vs Retirement Visa',
    meta: 'Golden Visa or Retirement Visa? Compare length, conditions and who each suits.',
    summary: 'Both give long-term stability. The Golden Visa lasts longer; the Retirement Visa has different financial conditions for people aged 55 and over.',
    body: [
      ['Golden Visa', ['Up to 10 years', 'Property, investment, business, profession or talent routes']],
      ['Retirement Visa', ['5 years, renewable', 'For people aged 55 and over', 'Based on savings, property or retirement income']],
      ['Which suits you', 'If you own AED 2 million of property, the Golden Visa usually wins. Otherwise compare your savings and income against the retirement conditions.'],
      ['Note', NOTE],
    ],
    faq: [['Can retirees get a Golden Visa?', 'Yes, if they meet a Golden Visa route such as property.'], ['Can I sponsor family on a Retirement Visa?', 'Yes, subject to the rules.']],
    links: ['/retirement-visa/', '/golden-visa/'],
  }),
  art({
    slug: 'golden-visa-application-mistakes', minutes: 5,
    title: 'Common Golden Visa Application Mistakes and How to Avoid Them',
    meta: 'The most common Golden Visa application mistakes, from unattested documents to wrong property values, and how to avoid them.',
    summary: 'Most delays come from a handful of avoidable problems. Check these before you submit anything.',
    body: [
      ['Mistakes we see most', ['Documents not attested or translated', 'Names spelled differently across documents', 'Off-plan applications before AED 2 million is paid', 'Counting mortgaged value instead of equity', 'Expired health insurance', 'Using fees from another emirate']],
      ['How to avoid them', 'Get a document check first, keep copies of everything, and confirm fees in writing before you pay.'],
      ['Note', NOTE],
    ],
    faq: [['Can a rejected application be resubmitted?', 'Often yes, once the issue is fixed.'], ['Does a consultant guarantee approval?', 'No one can guarantee approval; the authorities decide.']],
    links: ['/requirements-documents/', '/visa-check/'],
  }),
];
