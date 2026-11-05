import type { Page, Section } from './types';
import { FAQS } from './faqs';
import { FEE_SCHEDULE } from '@/lib/fees';
import { BLOG } from './blog';
import { COUNTRIES } from './countries';
import { SERVICE_CATALOG } from './services-catalog';

const CONTACT_CTA = { label: 'Get a Free Consultation', href: '/free-consultation/' };

function service(path: string, name: string, meta: string, intro: string, handle: string[], docs: string[], extra: Section[] = []): Page {
  return {
    path,
    seoTitle: `${name} | Abu Dhabi Golden Visa`,
    meta,
    eyebrow: path.startsWith('/document-services/') ? 'Document services' : 'Visa services',
    h1: name,
    intro,
    cta: CONTACT_CTA,
    sections: [
      { type: 'list', title: 'What we handle', items: handle },
      { type: 'list', title: 'What to send us', items: docs },
      ...extra,
      { type: 'tool', tool: 'lead', title: `Ask about ${name.toLowerCase()}` },
    ],
    related: ['/services/', '/how-to-apply/'],
  };
}

const FAMILY_ROWS = [
  ['Spouse', '/family-golden-visa/spouse/'],
  ['Children', '/family-golden-visa/children/'],
  ['Parents', '/family-golden-visa/parents/'],
  ['Newborn', '/family-golden-visa/newborn/'],
  ['Renewal', '/family-golden-visa/renewal/'],
  ['Marriage attestation', '/document-services/marriage-certificate/'],
  ['Birth attestation', '/document-services/birth-certificate/'],
];

function familyPage(slug: string, who: string, intro: string, items: string[]): Page {
  return {
    path: `/family-golden-visa/${slug}/`,
    seoTitle: `${who} Golden Visa Sponsorship in Abu Dhabi`,
    meta: `Sponsor your ${who.toLowerCase()} under your Abu Dhabi Golden Visa: eligibility, documents, medical and Emirates ID.`,
    eyebrow: 'Family & residency',
    h1: `${who} Golden Visa sponsorship`,
    intro,
    cta: { label: 'Add Family to My Cost', href: '/golden-visa-cost/' },
    sections: [
      { type: 'list', title: 'What you need', items },
      { type: 'tool', tool: 'calculator', title: 'Family cost estimate' },
    ],
    related: ['/family-golden-visa/', '/document-services/marriage-certificate/'],
  };
}

export const OTHER_PAGES: Page[] = [
  // ---------------- Family & residency ----------------
  {
    path: '/family-golden-visa/',
    seoTitle: 'Family Golden Visa Abu Dhabi | Spouse, Children & Parents',
    meta: 'Bring your spouse, children and parents to Abu Dhabi on a long-term residence visa. Documents, attestation, medical, Emirates ID and costs.',
    eyebrow: 'Family Golden Visa',
    h1: 'Bring Your Family to Abu Dhabi With a Long-Term Residence Visa',
    intro:
      'Your UAE residency journey should include the people who matter most. We help Golden Visa holders sponsor their spouse, children and other qualifying dependants, from document attestation to medical and Emirates ID.',
    cta: { label: 'Add Family to My Cost', href: '/golden-visa-cost/' },
    sections: [
      { type: 'table', title: 'Family services', head: ['Service', 'Page'], rows: FAMILY_ROWS.map(([a, b]) => [a, b]) },
      {
        type: 'list',
        title: 'Good to know',
        items: [
          'Spouses and children can be sponsored regardless of age, including sons over 25 and married daughters',
          'Parents can be sponsored with health insurance and proof of the relationship',
          'Children under 18 do not need a medical test',
          'Dependants outside the UAE receive an entry permit to complete their residency here',
          'The sponsor file is opened once for the whole family',
          'Family residency stays valid for its term if the main holder passes away',
        ],
      },
      { type: 'tool', tool: 'calculator', title: 'Family cost estimate' },
    ],
  },
  familyPage('spouse', 'Spouse', 'Add your husband or wife to your Golden Visa on the same long-term terms.', ['Attested marriage certificate', 'Passport copy and photo', 'Health insurance', 'Medical test (18+) and Emirates ID biometrics']),
  familyPage('children', 'Children', 'Sponsor your children of any age, including sons over 25 and married daughters.', ['Attested birth certificate', 'Passport copy and photo', 'Health insurance', 'No medical test for children under 18']),
  familyPage('parents', 'Parents', 'Bring your parents to live with you in the UAE.', ['Proof of relationship (your attested birth certificate)', 'Health insurance for each parent', 'Passport copies and photos', 'Medical test and Emirates ID biometrics']),
  familyPage('newborn', 'Newborn', 'Register residency for a baby born in the UAE under your Golden Visa.', ['Birth certificate issued in the UAE', 'Baby’s passport', 'Parents’ passports and Emirates IDs', 'Health insurance']),
  familyPage('renewal', 'Family Renewal', 'Renew your family’s residency together with your Golden Visa.', ['Current passports and Emirates IDs', 'Valid health insurance', 'Proof the main Golden Visa is still eligible']),
  {
    path: '/retirement-visa/',
    seoTitle: 'Abu Dhabi Retirement Visa | 5-Year Renewable Residency',
    meta: 'Retire in the UAE with a renewable 5-year Retirement Visa for eligible foreign nationals. Eligibility, documents and support.',
    eyebrow: 'Retirement visa',
    h1: 'Retire in the UAE With a Renewable 5-Year Visa',
    intro: 'Eligible foreign nationals can retire in the UAE on a renewable 5-year residence visa, based on savings, property or retirement income.',
    cta: CONTACT_CTA,
    sections: [
      {
        type: 'table',
        title: 'Who can apply',
        intro: 'You need to be 55 or older and meet one of these, as set by the authorities:',
        head: ['Route', 'Usual benchmark'],
        rows: [
          ['Property', 'Property in the UAE worth about AED 1 million, owned outright'],
          ['Savings', 'Financial savings of about AED 1 million'],
          ['Income', 'A steady monthly retirement income (the benchmark differs by emirate)'],
          ['Work history', 'Having worked in the UAE or abroad for many years, combined with the financial conditions'],
        ],
        note: 'Benchmarks change and differ between emirates. We confirm the current rules for Abu Dhabi before you apply.',
      },
      { type: 'list', title: 'What we handle', items: ['Eligibility review of property, savings or income', 'Bank and property documents', 'Entry permit or change of status', 'Medical, Emirates ID and residence', 'Spouse and family sponsorship', 'Renewal every 5 years'] },
      { type: 'list', title: 'What to send us', items: ['Passport copy and photo', 'Proof of property, savings or pension income', 'Health insurance valid in the UAE', 'Marriage certificate if your spouse joins you'] },
      { type: 'tool', tool: 'lead', title: 'Check your retirement options' },
    ],
    related: ['/blog/golden-visa-vs-retirement-visa/', '/golden-visa/property-investment/', '/services/health-insurance/'],
  },
  {
    path: '/remote-work-visa/',
    seoTitle: 'UAE Remote Work Visa | Live in Abu Dhabi, Work Abroad',
    meta: 'The UAE virtual work residency lets eligible remote employees and self-employed professionals live in the UAE while working for companies abroad.',
    eyebrow: 'Remote work visa',
    h1: 'Live in Abu Dhabi While You Work for a Company Abroad',
    intro: 'The virtual work residency is a 1-year visa for eligible remote employees and self-employed professionals whose clients or employers are outside the UAE.',
    cta: CONTACT_CTA,
    sections: [
      {
        type: 'table',
        title: 'Who can apply',
        head: ['Requirement', 'Usual benchmark'],
        rows: [
          ['Employment', 'A contract with a company outside the UAE, or proof you own a business abroad'],
          ['Income', 'A minimum monthly income set by the authorities (around USD 3,500 or the equivalent)'],
          ['Passport', 'Valid for at least 6 months'],
          ['Insurance', 'Health insurance valid in the UAE'],
        ],
        note: 'Benchmarks change. We confirm them before you apply.',
      },
      { type: 'list', title: 'What we handle', items: ['Eligibility and document check', 'Visa application and entry permit', 'Medical, Emirates ID and residence', 'Family sponsorship', 'Renewal'] },
      { type: 'tool', tool: 'lead', title: 'Ask about remote work residency' },
    ],
    related: ['/services/freelancer-visa/', '/services/green-visa/'],
  },

  // ---------------- Services hub ----------------
  {
    path: '/services/',
    seoTitle: 'Golden Visa & Residency Services | Abu Dhabi Golden Visa',
    meta: 'Every service around your Golden Visa: renewal, cancellation, Emirates ID, medical, entry permits, insurance, attestation, translation and property documents.',
    eyebrow: 'Our services',
    h1: 'Everything around your residency, in one place',
    intro: 'From the first entry permit to renewal years later, we handle the government steps and paperwork so you do not have to.',
    cta: CONTACT_CTA,
    sections: [
      {
        type: 'table',
        title: 'Supporting services',
        head: ['Category', 'Services'],
        rows: [
          ['Golden Visa management', 'New application, nomination, renewal, cancellation, status amendment'],
          ['Entry & immigration', 'Entry permits, status change, inside and outside UAE processing'],
          ['Emirates ID', 'New, renewal, replacement, biometrics, delivery'],
          ['Medical & insurance', 'Medical fitness, VIP appointments, insurance coordination'],
          ['Attestation', 'MOFA UAE, embassy, marriage, birth and educational documents'],
          ['Legal translation', 'Arabic legal translation of immigration documents'],
          ['Education', 'Degree attestation, recognition and equivalency'],
          ['Property', 'Title deed, valuation certificate, developer NOC, bank NOC'],
          ['Family', 'Spouse, children, parents, newborn, cancellations'],
          ['Corporate', 'Company setup, trade licence, shareholder documents, PRO'],
          ['Other residency', 'Retirement, virtual work, employment and Green Visa guidance'],
        ],
      },
      ...SERVICE_CATALOG.map((g): Section => ({ type: 'cards', title: g.title, items: g.items.map((i) => ({ title: i.label, text: i.note ?? 'See what we handle, the documents and the steps.', href: i.href })) })),
    ],
  },
  service('/services/golden-visa-renewal/', 'Golden Visa Renewal', 'Renew your Abu Dhabi Golden Visa and your family’s residency on time.', 'Your Golden Visa renews as long as you still meet the conditions. We check your eligibility early and renew your family at the same time.', ['Eligibility review before expiry', 'Renewal application', 'Medical and Emirates ID renewal', 'Family renewals'], ['Passport and current Emirates ID', 'Proof you still meet your route’s conditions', 'Valid health insurance']),
  service('/services/visa-cancellation/', 'Visa Cancellation', 'Golden Visa and dependant visa cancellation in the UAE.', 'Cancelling a residence visa, for yourself or a family member, done correctly so nothing is left open.', ['Golden Visa cancellation', 'Dependant cancellations', 'Cancelling an old visa before a new Golden Visa'], ['Passport and Emirates ID', 'Sponsor documents for dependants']),
  service('/services/emirates-id/', 'Emirates ID Services', 'New, renewal and replacement Emirates ID with biometrics and delivery.', 'We book biometrics and follow your Emirates ID until it is delivered.', ['New Emirates ID', 'Renewal', 'Replacement for lost or damaged cards', 'Biometrics appointment', 'Delivery'], ['Passport copy', 'Residence visa', 'Photo']),
  service('/services/medical-biometrics/', 'Medical & Biometrics', 'Medical fitness tests and biometrics for your Golden Visa.', 'Every applicant aged 18 and over needs a medical fitness test. We book normal or VIP appointments and your biometrics.', ['Normal and VIP medical bookings', 'Emirates ID biometrics', 'Result follow-up'], ['Passport copy', 'Entry permit or visa', 'Photo']),
  service('/services/entry-permit-status-change/', 'Entry Permit & Status Change', 'Golden Visa entry permits from abroad and change of status inside the UAE.', 'From abroad, you receive an entry permit to come in and finish your residency. Inside the UAE, we change your status so you do not need to leave.', ['Golden Visa entry permit', 'Change of status inside the UAE', 'Six-month multiple-entry visa to complete the process where applicable'], ['Passport copy and photo', 'Current visa, if inside the UAE'], [{ type: 'text', title: 'Fee', body: [`The government change of status fee is AED ${FEE_SCHEDULE.perPerson.changeOfStatus.aed.toLocaleString('en-US', { minimumFractionDigits: 2 })} per person (schedule dated ${FEE_SCHEDULE.date}).`] }]),
  service('/services/health-insurance/', 'Health Insurance', 'Health insurance for Golden Visa holders and their families.', 'Valid health insurance is required for you and every family member. We arrange suitable cover and quote it separately.', ['Insurance quotes for you and your family', 'Coverage for parents', 'Renewal reminders'], ['Passport copies', 'Ages of each person']),
  service('/document-services/mofa-attestation/', 'MOFA Attestation', 'MOFA UAE and embassy attestation for personal, educational and commercial documents.', 'Documents from abroad need attestation before UAE authorities accept them. We handle the embassy and MOFA stages.', ['Educational certificates', 'Marriage and birth certificates', 'Commercial documents'], ['Original documents', 'Passport copy']),
  service('/document-services/legal-translation/', 'Legal Translation', 'Certified Arabic legal translation for immigration documents.', 'Certified translation of personal, family, educational, business and immigration documents.', ['Arabic and English legal translation', 'Translation of attested documents'], ['Clear copy of each document']),
  service('/document-services/degree-attestation/', 'Degree Attestation', 'Degree attestation, recognition and Ministry of Education equivalency.', 'Professionals and graduates need attested degrees, and degrees from abroad need an equivalency certificate.', ['Degree attestation', 'Ministry of Education equivalency', 'Transcript attestation'], ['Degree and transcript', 'Passport copy']),
  service('/document-services/marriage-certificate/', 'Marriage & Birth Certificates', 'Marriage and birth certificate attestation for family sponsorship.', 'Family sponsorship needs attested proof of the relationship. We attest your marriage and birth certificates.', ['Marriage certificate attestation', 'Birth certificate attestation', 'Translation where needed'], ['Original certificates', 'Passport copies']),
  service('/document-services/birth-certificate/', 'Birth Certificate Attestation', 'Birth certificate attestation for children and parents sponsorship.', 'Attested birth certificates prove the relationship for children and parent sponsorship.', ['Birth certificate attestation', 'Translation where needed'], ['Original birth certificate', 'Passport copies']),
  service('/document-services/document-legalisation/', 'Document Legalisation', 'Legalisation of documents for use in the UAE.', 'We legalise documents so they are accepted by UAE authorities and banks.', ['Consulate legalisation', 'MOFA UAE stage', 'Translation where needed'], ['Original documents']),
  service('/document-services/property-documentation/', 'Property Documentation', 'Title deeds, valuation, developer and bank NOCs for the property Golden Visa.', 'The property route depends on clean ownership documents. We gather and check everything before submission.', ['Title deed and purchase agreement review', 'Valuation certificate', 'Developer NOC for off-plan property', 'Bank NOC for mortgaged property'], ['Title deed or purchase agreement', 'Mortgage documents, if any']),
  {
    path: '/document-services/valuation-certificate/',
    seoTitle: 'Issuing Valuation Certificate Abu Dhabi | Fees & Documents',
    meta: 'Request an official valuation certificate for Abu Dhabi land or property from the Department of Municipalities and Transport. Fees, documents and steps.',
    eyebrow: 'Document services',
    h1: 'Issuing a Valuation Certificate in Abu Dhabi',
    intro:
      'A valuation certificate states the approximate value of your land or property. It can also show restrictions such as a registered mortgage, or how the land was acquired. It is issued by the Department of Municipalities and Transport through TAMM, and a representative with power of attorney can request it for you.',
    cta: CONTACT_CTA,
    sections: [
      {
        type: 'table',
        title: 'Government fees',
        head: ['Land type', 'Fee (AED)'],
        rows: [['Investment', '2,700.00'], ['Commercial', '4,500.00'], ['Agricultural', '900.00']],
        note: 'Source: TAMM, checked 5 November 2026. The service takes about 3 working days.',
      },
      { type: 'list', title: 'Documents', items: ['Proof of income certificate', 'Clear photos of the building from every side', 'Site plan'] },
      {
        type: 'steps',
        title: 'Steps',
        items: [
          { title: 'Sign in or visit', text: 'Log in with UAE PASS, or we file it for you with a power of attorney.' },
          { title: 'Submit', text: 'Upload the application and documents.' },
          { title: 'Pay', text: 'Pay the government fee and receive the certificate.' },
        ],
      },
      { type: 'tool', tool: 'lead', title: 'Request your valuation certificate' },
    ],
    related: ['/golden-visa/property-investment/', '/document-services/property-documentation/'],
  },

  // ---------------- Resources ----------------
  {
    path: '/visa-check/',
    seoTitle: 'Abu Dhabi Golden Visa Eligibility Checker | Free Visa Check',
    meta: 'Answer a few questions to see which Abu Dhabi Golden Visa route may suit you. Free, quick and followed up by a consultant.',
    eyebrow: 'Eligibility checker',
    h1: 'Check your Golden Visa eligibility',
    intro: 'A quick first check. It does not replace a full review, and the authorities make the final decision.',
    sections: [{ type: 'tool', tool: 'eligibility' }],
  },
  {
    path: '/golden-visa-cost/',
    seoTitle: 'Abu Dhabi Golden Visa Cost | Government Fees & Family Packages',
    meta: 'Calculate Abu Dhabi Golden Visa government fees for you and your family: visa, Emirates ID, medical, change of status and valuation. Dated fee schedule.',
    eyebrow: 'Golden Visa cost',
    h1: 'Abu Dhabi Golden Visa Cost – Government Fees, Service Charges & Family Packages',
    intro: 'See every government fee for you and your family, person by person. Our consultancy packages are quoted in writing.',
    sections: [
      { type: 'tool', tool: 'calculator' },
      {
        type: 'table',
        title: 'Service packages',
        head: ['Feature', 'VIP Fast Track', 'Normal'],
        rows: [
          ['Eligibility and document review', 'Included', 'Included'],
          ['Government filing', 'Included', 'Included'],
          ['Medical appointment coordination', 'Priority', 'Standard'],
          ['Emirates ID assistance', 'Included', 'Included'],
          ['Pick-up and drop-off', 'Where offered', 'Optional'],
          ['Case updates', 'Priority', 'Standard'],
          ['Immigration approval', 'Subject to authority', 'Subject to authority'],
        ],
        note: 'Consultancy fees are quoted in writing; VAT applies to consultancy services.',
      },
      { type: 'list', title: 'Fee assumptions', items: [...FEE_SCHEDULE.assumptions, `Fee schedule dated ${FEE_SCHEDULE.date}.`] },
    ],
  },
  {
    path: '/how-to-apply/',
    seoTitle: 'How to Apply for Abu Dhabi Golden Visa – Step-by-Step Guide',
    meta: 'The 10 steps to an Abu Dhabi Golden Visa, from eligibility to Emirates ID delivery, for applicants inside and outside the UAE.',
    eyebrow: 'Application process',
    h1: 'How to Apply for Abu Dhabi Golden Visa – Step-by-Step Guide',
    intro: 'The order changes with your route and whether you are already in the UAE. Here is the full path.',
    cta: { label: 'Start With a Free Check', href: '/visa-check/' },
    sections: [
      { type: 'tool', tool: 'flight', title: 'Your flight to a Golden Visa', intro: 'Scroll and follow the plane: each stop is a stage we handle for you.' },
      {
        type: 'steps',
        title: 'The 10 steps',
        items: [
          { title: 'Free eligibility assessment', text: 'We check your route and documents.' },
          { title: 'Document verification and attestation', text: 'Certificates attested and translated where needed.' },
          { title: 'Lawful entry arrangements', text: 'If you are outside the UAE and need to travel in.' },
          { title: 'Nomination or pre-approval', text: 'Submitted through the Abu Dhabi Residents Office channel.' },
          { title: 'Golden Visa entry permit', text: 'Issued for applicants coming from abroad.' },
          { title: 'Change of status', text: 'For applicants already inside the UAE.' },
          { title: 'Medical fitness', text: 'Required for everyone 18 and over.' },
          { title: 'Emirates ID application and biometrics', text: 'We book the appointment.' },
          { title: 'Health insurance', text: 'Valid cover for you and your family.' },
          { title: 'Residence issuance and Emirates ID delivery', text: 'Your 10-year residency is issued.' },
        ],
        note: 'The sequence varies by visa route and by whether you are already inside the UAE.',
      },
    ],
  },
  {
    path: '/requirements-documents/',
    seoTitle: 'Abu Dhabi Golden Visa Requirements & Documents Checklist',
    meta: 'Documents you need for each Abu Dhabi Golden Visa route: property, investor, entrepreneur, professional, student and family.',
    eyebrow: 'Requirements & documents',
    h1: 'Golden Visa requirements and documents',
    intro: 'Everyone needs a valid passport, a photo and health insurance. The rest depends on your route.',
    sections: [
      {
        type: 'table',
        title: 'By route',
        head: ['Route', 'Main documents'],
        rows: [
          ['Property investor', 'Registered purchase agreement or Real Estate Unit Value Certificate; mortgage or off-plan papers if relevant'],
          ['Company owner / investor', 'Trade licence, commercial registration, bank or fund letter, or tax returns'],
          ['Entrepreneur', 'Incubator nomination, trade licence, financial statements or proof of sale'],
          ['Skilled professional', 'Employment contract, salary certificate, attested degree, work permit'],
          ['Outstanding student', 'Transcript, attested certificate, equivalency for degrees from abroad'],
          ['Family member', 'Attested marriage or birth certificate, passport, health insurance'],
        ],
      },
    ],
  },
  {
    path: '/processing-time/',
    seoTitle: 'Abu Dhabi Golden Visa Processing Time',
    meta: 'What affects Abu Dhabi Golden Visa processing time and how we keep your file moving.',
    eyebrow: 'Processing time',
    h1: 'How long does the Golden Visa take?',
    intro: 'Timing depends on your route, how complete your documents are and the nomination step. We give you a dated plan once we have reviewed your file.',
    sections: [
      {
        type: 'list',
        title: 'What affects the timeline',
        items: [
          'Whether you apply from inside or outside the UAE',
          'Document attestation and translation',
          'Nomination by the relevant authority',
          'Medical and biometrics appointments',
          'Valuation certificate for property investors, about 3 working days',
        ],
      },
    ],
  },
  {
    path: '/golden-visa-benefits/',
    seoTitle: 'Abu Dhabi Golden Visa Benefits',
    meta: 'The benefits of the Abu Dhabi Golden Visa: 10-year residency, no sponsor, family sponsorship, no six-month rule and more.',
    eyebrow: 'Golden Visa benefits',
    h1: 'Why a Golden Visa changes your life in the UAE',
    intro: 'Long-term security for you and your family, with the freedom to live, work and invest.',
    sections: [
      {
        type: 'list',
        title: 'Benefits',
        items: [
          'Residency of up to 10 years, renewable while you qualify',
          'No local sponsor needed: change jobs or start a business freely',
          'Sponsor your spouse, children of any age and parents',
          'Stay outside the UAE for more than six months without losing residency',
          'Sponsor domestic workers, subject to UAE rules',
          'Family residency remains valid for its term if the holder passes away',
        ],
      },
    ],
  },
  {
    path: '/faqs/',
    seoTitle: 'Abu Dhabi Golden Visa FAQs',
    meta: 'Answers to the most common Abu Dhabi Golden Visa questions: eligibility, property, family, costs and timing.',
    eyebrow: 'FAQs',
    h1: 'Golden Visa questions, answered',
    intro: 'Can’t find your answer? Ask us on WhatsApp.',
    sections: [{ type: 'faq', title: 'Frequently asked questions', items: FAQS }],
  },
  {
    path: '/blog/',
    seoTitle: 'Golden Visa Guides & Insights | Abu Dhabi Golden Visa',
    meta: 'Guides on the Abu Dhabi Golden Visa: property, professionals, family, costs and renewals.',
    eyebrow: 'Blog & guides',
    h1: 'Guides and insights',
    intro: 'Plain-language guides to the Abu Dhabi Golden Visa, written and reviewed by our advisors.',
    sections: [
      { type: 'cards', title: 'Golden Visa by country', items: COUNTRIES.map((c) => ({ title: c.menu, text: `Documents and process for ${c.people}.`, href: c.path })) },
    ],
  },

  // ---------------- Company ----------------
  {
    path: '/about/',
    seoTitle: 'About Us | Abu Dhabi Golden Visa',
    meta: 'Abu Dhabi Golden Visa is an independent residency consultancy managed by Brightlink Management Consultancy LLC, UAE.',
    eyebrow: 'About us',
    h1: 'Independent Golden Visa advisors',
    intro:
      'Abu Dhabi Golden Visa is an independent residency consultancy website managed by Brightlink Management Consultancy LLC, UAE (Trade Licence No. 1053387). We are not a government body; the authorities decide every application.',
    cta: CONTACT_CTA,
    sections: [{ type: 'tool', tool: 'about-hub' }],
  },
  {
    path: '/why-choose-us/',
    seoTitle: 'Why Choose Us | Abu Dhabi Golden Visa',
    meta: 'Why clients choose Abu Dhabi Golden Visa: clear pricing, one advisor, 20 languages and complete document support.',
    eyebrow: 'Why choose us',
    h1: 'Clear advice. Complete files. No surprises.',
    intro: 'We prepare your file properly the first time, so it moves without avoidable delays.',
    sections: [
      {
        type: 'cards',
        title: 'What you get',
        items: [
          { title: 'Free initial consultation', text: 'We tell you which route fits before you spend anything.', href: '/free-consultation/' },
          { title: 'Family applications', text: 'Spouse, children and parents handled in one file.', href: '/family-golden-visa/' },
          { title: 'VIP assistance', text: 'Priority appointments and pick-up where offered.', href: '/golden-visa-cost/' },
          { title: 'Your language', text: 'The site and your updates in 20 languages.', href: '/contact/' },
        ],
      },
    ],
  },
  {
    path: '/contact/',
    seoTitle: 'Contact Us | Abu Dhabi Golden Visa',
    meta: 'Contact Abu Dhabi Golden Visa on WhatsApp, by email or at our office in Business Bay, Dubai.',
    eyebrow: 'Contact',
    h1: 'Talk to a Golden Visa advisor',
    intro: 'Send us a message and an advisor replies in your language, or book a time to meet.',
    sections: [{ type: 'tool', tool: 'contact-hub' }],
  },
  {
    path: '/free-consultation/',
    seoTitle: 'Free Golden Visa Consultation | Abu Dhabi Golden Visa',
    meta: 'Book a free Golden Visa consultation. We review your route and documents and give you a written plan.',
    eyebrow: 'Free consultation',
    h1: 'Book your free consultation',
    intro: 'Pick a time for a free call, video meeting or office visit. We review your route and give you a clear plan.',
    sections: [{ type: 'tool', tool: 'booking', title: 'Book your free consultation' }, { type: 'tool', tool: 'lead', title: 'Prefer to write?' }],
  },

  // ---------------- Legal ----------------
  {
    path: '/privacy/',
    seoTitle: 'Privacy Policy | Abu Dhabi Golden Visa',
    meta: 'How Abu Dhabi Golden Visa collects and uses your personal information.',
    eyebrow: 'Legal',
    h1: 'Privacy policy',
    intro: 'We collect only what we need to answer your enquiry and handle your application.',
    sections: [
      {
        type: 'text',
        title: 'Your information',
        body: [
          'When you send an enquiry, we store your name, phone number, email and message so an advisor can reply. We use it only for your enquiry and application, and we do not sell it.',
          'You can ask us to see, correct or delete your information at any time by writing to info@brightlinkconsulting.ae.',
        ],
      },
    ],
  },
  {
    path: '/terms/',
    seoTitle: 'Terms of Use | Abu Dhabi Golden Visa',
    meta: 'Terms of use for the Abu Dhabi Golden Visa website.',
    eyebrow: 'Legal',
    h1: 'Terms of use',
    intro: 'Information on this website is general guidance, not legal advice.',
    sections: [
      {
        type: 'text',
        title: 'Using this website',
        body: [
          'Eligibility, fees and processing rules are set by the UAE authorities and can change. Calculator results are estimates based on a dated fee schedule. We confirm every figure in writing before you pay.',
        ],
      },
    ],
  },
  {
    path: '/disclaimer/',
    seoTitle: 'Disclaimer | Abu Dhabi Golden Visa',
    meta: 'Abu Dhabi Golden Visa is not an official UAE government website.',
    eyebrow: 'Legal',
    h1: 'Disclaimer',
    intro: 'Not an official UAE government website. Visa issuance and eligibility are subject to the competent authorities.',
    sections: [
      {
        type: 'text',
        title: 'Independent consultancy',
        body: [
          'Abu Dhabi Golden Visa is an independent residency consultancy website managed by Brightlink Management Consultancy LLC, UAE, Trade Licence No. 1053387. We do not guarantee approval or processing times.',
        ],
      },
    ],
  },
];
