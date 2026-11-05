// Service pages from the "Services Menu Page Link & Content Guide" (our own wording).
// Government rules and fees change: every page tells the reader we confirm current requirements.
import type { Page, Section } from './types';

const CTA = { label: 'Get a Free Consultation', href: '/free-consultation/' };
const FEES_NOTE = 'Government fees and our professional charges are quoted separately, in writing, before you pay.';

type S = {
  path: string; name: string; group: string; meta: string; intro: string;
  handle: string[]; docs?: string[]; steps?: { title: string; text: string }[];
  extra?: Section[]; faq?: { q: string; a: string }[]; related?: string[]; seo?: string;
};

function svc(s: S): Page {
  const sections: Section[] = [
    { type: 'list', title: 'What we handle', items: s.handle },
  ];
  if (s.steps) sections.push({ type: 'steps', title: 'How it works', items: s.steps, note: FEES_NOTE });
  if (s.docs) sections.push({ type: 'list', title: 'What to send us', items: s.docs });
  if (s.extra) sections.push(...s.extra);
  if (s.faq) sections.push({ type: 'faq', title: 'Questions', items: s.faq });
  sections.push({ type: 'tool', tool: 'lead', title: `Ask about ${s.name.toLowerCase()}`, intro: 'Tell us what you need. An advisor replies on WhatsApp in your language.' });
  return { path: s.path, seoTitle: s.seo ?? `${s.name} | Abu Dhabi Golden Visa`, meta: s.meta, eyebrow: s.group, h1: s.name, intro: s.intro, cta: CTA, sections, related: s.related ?? ['/services/', '/contact/'] };
}

export const SERVICE_PAGES: Page[] = [
  /* ---------------- Visas ---------------- */
  svc({
    path: '/services/investor-visa/', name: 'Investor & Partner Visa', group: 'Visas',
    meta: 'UAE residence visa for company owners, partners and investors setting up or running a business. Documents, steps and support.',
    intro: 'Own or co-own a UAE company? You can sponsor your own residence as an investor or partner, then sponsor your family. If your investment reaches AED 2 million, we also check whether the 10-year Golden Visa suits you better.',
    handle: ['Investor and partner residence visas for mainland and free-zone companies', 'Establishment card and immigration file for the company', 'Entry permit or change of status, medical, Emirates ID and residence', 'Family sponsorship once your visa is issued', 'Comparison with the Golden Visa investor route'],
    steps: [
      { title: 'Check your company documents', text: 'Trade licence, memorandum and share structure.' },
      { title: 'Company immigration file', text: 'We open or update the establishment card.' },
      { title: 'Entry permit or status change', text: 'From abroad or inside the UAE.' },
      { title: 'Medical, Emirates ID and residence', text: 'We book appointments and follow your file to issue.' },
    ],
    docs: ['Passport copy and photo', 'Trade licence and memorandum of association', 'Establishment card, if the company has one', 'Current visa, if you are in the UAE'],
    related: ['/golden-visa/business-investors/', '/services/company-setup-pro/', '/services/employment-visas-permits/'],
  }),
  svc({
    path: '/services/maid-visa/', name: 'Maid & Domestic Worker Visa', group: 'Visas',
    meta: 'Domestic worker visa in the UAE: sponsorship eligibility, contract, medical, Emirates ID and residence for nannies, housemaids and drivers.',
    intro: 'Sponsor a housemaid, nanny, cook or private driver for your household. We check that you meet the sponsor conditions, prepare the contract and follow the visa through medical, Emirates ID and residence.',
    handle: ['Sponsor eligibility check (income, accommodation and family status)', 'Domestic worker contract and work permit', 'Entry permit or change of status', 'Medical fitness, Emirates ID and residence', 'Renewals and cancellations'],
    docs: ['Sponsor passport, Emirates ID and residence', 'Proof of income and tenancy contract', 'Worker passport copy and photo', 'Golden Visa holders: your Golden Visa details'],
    faq: [
      { q: 'Can Golden Visa holders sponsor domestic workers?', a: 'Yes. Sponsoring domestic workers is one of the Golden Visa benefits, subject to the current rules.' },
      { q: 'Is there a minimum salary for the sponsor?', a: 'The authorities set income and accommodation conditions, and they change from time to time. We check your case before you pay any fees.' },
    ],
    related: ['/services/medical-biometrics/', '/services/emirates-id/', '/golden-visa-benefits/'],
  }),
  svc({
    path: '/services/tourist-visa/', name: 'Tourist & Visit Visa', group: 'Visas',
    meta: 'UAE tourist and visit visas for you or visiting family: single and multiple entry options, documents and processing.',
    intro: 'Visiting the UAE, or inviting family to see you? We arrange the right tourist or visit visa, and if you plan to stay and apply for residency, we plan the visit so the change of status is simple.',
    handle: ['Single and multiple-entry tourist visas', 'Visit visas for relatives of UAE residents', 'Extensions where allowed', 'Planning a visit before a Golden Visa application'],
    docs: ['Passport copy (valid at least 6 months) and photo', 'Return ticket and hotel booking, or the host’s residence and tenancy', 'Relationship proof for family visit visas'],
    faq: [{ q: 'Can I apply for the Golden Visa while on a tourist visa?', a: 'Often yes. Inside the UAE we can change your status to the Golden Visa without you leaving, which adds a change of status fee.' }],
    related: ['/services/entry-permit-status-change/', '/how-to-apply/'],
  }),

  /* ---------------- Attestation ---------------- */
  svc({
    path: '/services/notary-power-of-attorney/', name: 'Notary Services & Power of Attorney', group: 'Attestation & legalisation',
    meta: 'Power of attorney and notary support in the UAE for property sale, purchase, management and Golden Visa applications.',
    intro: 'A power of attorney lets a trusted person act for you, for example to request a valuation certificate, sell or manage a property, or follow a government application while you are abroad. We draft it, arrange notarisation and, for documents signed abroad, the legalisation.',
    handle: ['General and special powers of attorney', 'Property sale, purchase and management authorisations', 'Authorisations for valuation certificates and Golden Visa files', 'Legal translation into Arabic', 'Legalisation of a POA signed outside the UAE'],
    docs: ['Passport and Emirates ID of the person giving the power', 'Details of the attorney', 'Property details (title deed) if the POA is for property'],
    related: ['/document-services/valuation-certificate/', '/document-services/legal-translation/', '/document-services/mofa-attestation/'],
  }),

  /* ---------------- Employment ---------------- */
  svc({
    path: '/services/employment-visas-permits/', name: 'Employment Visas & Permits', group: 'Employment visas & permits',
    seo: 'Employment Visas, Work Permits & PRO Services UAE | Abu Dhabi Golden Visa',
    meta: 'Employee visas and renewals, MOHRE work permits, part-time permits, labour insurance, medical, Emirates ID, Tawjeeh, ILOE, stamping and cancellations.',
    intro: 'One team for your workforce paperwork: new hires, renewals, permits for Golden Visa holders and dependants, and cancellations. Government fees and our professional charges are always quoted separately.',
    handle: ['Employee residence visas and renewals', 'Work permits for Golden Visa holders and family members', 'Part-time, temporary and one-mission permits', 'MOHRE contracts and approvals', 'Labour insurance and ILOE subscription', 'Medical fitness, Emirates ID, Tawjeeh and visa stamping', 'Labour and immigration cancellations'],
    extra: [{
      type: 'cards', title: 'Services in this group', items: [
        { title: 'Employment Visa', text: 'New-hire residence from offer letter to Emirates ID.', href: '/services/employment-visa/' },
        { title: 'Investor & Partner Visa', text: 'Residence for company owners and partners.', href: '/services/investor-visa/' },
        { title: 'Freelancer Visa', text: 'Self-sponsored residence for professionals.', href: '/services/freelancer-visa/' },
        { title: 'Work Permits', text: 'MOHRE permits for residents and employers.', href: '/services/work-permit/' },
        { title: 'Visa Cancellation', text: 'Labour and immigration cancellation.', href: '/services/visa-cancellation/' },
        { title: 'ILOE Insurance', text: 'Subscription and status checks.', href: '/services/iloe-insurance/' },
        { title: 'Emirates ID', text: 'New, renewal and replacement.', href: '/services/emirates-id/' },
        { title: 'Medical Fitness', text: 'Normal and VIP medical tests.', href: '/services/medical-biometrics/' },
      ],
    }],
    related: ['/services/tasheel/', '/services/tawjeeh/', '/services/document-clearing/'],
  }),
  svc({
    path: '/services/employment-visa/', name: 'Employment Visa', group: 'Employment visas & permits',
    meta: 'UAE employment visa processing: offer letter, work permit, entry permit, medical, Emirates ID and residence stamping.',
    intro: 'For employers and new employees: we take the hire from signed offer letter and work permit to medical, Emirates ID and residence, and renew it on time.',
    handle: ['Offer letter and MOHRE work permit', 'Entry permit or change of status', 'Medical fitness and Emirates ID biometrics', 'Labour contract and residence issue', 'Renewals and cancellations'],
    steps: [
      { title: 'Offer letter and work permit', text: 'Signed offer and MOHRE approval.' },
      { title: 'Entry permit', text: 'Or change of status if the employee is already in the UAE.' },
      { title: 'Medical and biometrics', text: 'We book both appointments.' },
      { title: 'Contract and residence', text: 'Labour contract signed, residence issued.' },
    ],
    docs: ['Employee passport copy and photo', 'Attested degree for skilled roles', 'Company trade licence and establishment card'],
    related: ['/services/employment-visas-permits/', '/services/work-permit/', '/golden-visa/skilled-professionals/'],
  }),
  svc({
    path: '/services/freelancer-visa/', name: 'Freelancer & Self-Employment Visa', group: 'Employment visas & permits',
    meta: 'Self-sponsored freelance residence in the UAE: freelance permits, the Green Visa route, documents and steps.',
    intro: 'Work for yourself and sponsor your own residence. We compare a free-zone freelance permit with the federal Green Visa route for freelancers, and pick the one that fits your work and income.',
    handle: ['Freelance permit applications', 'Green Visa for freelancers (self-sponsored, up to 5 years)', 'Medical, Emirates ID and residence', 'Family sponsorship after your visa is issued'],
    docs: ['Passport copy and photo', 'Degree or specialised diploma', 'Portfolio or proof of your activity', 'Bank statements or proof of income'],
    related: ['/services/green-visa/', '/remote-work-visa/', '/services/employment-visas-permits/'],
  }),
  svc({
    path: '/services/work-permit/', name: 'Work Permit Services', group: 'Employment visas & permits',
    meta: 'MOHRE work permits in the UAE: new permits, Golden Visa holder permits, family members, part-time and temporary permits.',
    intro: 'Golden Visa holders, sponsored family members and many residents need a MOHRE work permit before they start a job. We prepare the application with your employer and follow it to approval.',
    handle: ['Work permits for Golden Visa holders', 'Permits for family-sponsored residents', 'Part-time, temporary and one-mission permits', 'Permit renewals and cancellations'],
    docs: ['Passport, residence and Emirates ID', 'Employer trade licence and establishment details', 'Job offer or contract'],
    related: ['/services/employment-visas-permits/', '/services/tasheel/'],
  }),
  svc({
    path: '/services/iloe-insurance/', name: 'ILOE Insurance', group: 'Employment visas & permits',
    meta: 'Involuntary Loss of Employment (ILOE) insurance in the UAE: who must subscribe, how to check your status and how to claim.',
    intro: 'Involuntary Loss of Employment (ILOE) insurance pays part of your salary for a limited time if you lose your job for reasons outside your control. Most private-sector and federal government employees must subscribe. We subscribe you, check your status and help with claims.',
    handle: ['New ILOE subscriptions', 'Status checks and certificate download', 'Clearing unpaid premiums or fines', 'Help with claims after losing a job'],
    faq: [
      { q: 'Do Golden Visa holders need ILOE?', a: 'If you are employed in the private sector or federal government, the subscription usually applies whatever your visa type. Investors and some other groups are exempt. We confirm your case.' },
      { q: 'How much does it cost?', a: 'Premiums are small monthly or yearly amounts based on your basic salary. We confirm the current rate before subscribing.' },
    ],
    related: ['/services/employment-visas-permits/'],
  }),

  /* ---------------- Property & business ---------------- */
  svc({
    path: '/services/document-clearing/', name: 'Document Clearing & PRO Services', group: 'Property & business',
    meta: 'Government documentation, typing, filing and PRO coordination for individuals and companies in Abu Dhabi and across the UAE.',
    intro: 'We handle the government paperwork so you do not have to queue: typing, submissions, follow-ups and collection, for individuals and companies.',
    handle: ['Government typing and submissions', 'Immigration, labour and municipality transactions', 'Company document renewals and amendments', 'Collection and delivery of approved documents'],
    related: ['/services/company-setup-pro/', '/services/tasheel/', '/services/employment-visas-permits/'],
  }),
  svc({
    path: '/services/tasheel/', name: 'Tasheel Services', group: 'Property & business',
    meta: 'Labour and employment transactions through Tasheel (MOHRE) service centres: work permits, contracts, amendments and cancellations.',
    intro: 'Tasheel centres process Ministry of Human Resources and Emiratisation (MOHRE) transactions. We prepare and submit them for you and your company.',
    handle: ['Work permit applications and renewals', 'Labour contracts and amendments', 'Company labour file updates', 'Labour cancellations'],
    related: ['/services/work-permit/', '/services/tawjeeh/', '/services/employment-visas-permits/'],
  }),
  svc({
    path: '/services/tawjeeh/', name: 'Tawjeeh Services', group: 'Property & business',
    meta: 'Tawjeeh worker guidance and orientation sessions required by MOHRE for certain employees, booked and completed for you.',
    intro: 'Tawjeeh centres give new workers in certain categories a short orientation on their rights and duties under UAE labour law. We book the session and make sure it is recorded on the employee’s file.',
    handle: ['Booking Tawjeeh orientation sessions', 'Contract signing support at the centre', 'Follow-up so the work permit can continue'],
    related: ['/services/tasheel/', '/services/employment-visas-permits/'],
  }),
  svc({
    path: '/services/company-setup-pro/', name: 'Company Setup & Corporate PRO', group: 'Property & business',
    meta: 'Company setup in Abu Dhabi and the UAE: trade licence, shareholder documents, establishment card and ongoing PRO support.',
    intro: 'Setting up or restructuring a company, perhaps for the Golden Visa investor route? We coordinate the trade licence, shareholder documents and immigration file, then handle the ongoing PRO work.',
    handle: ['Mainland and free-zone setup coordination', 'Trade licence issue, renewal and amendments', 'Shareholder and memorandum documents', 'Establishment card and immigration file', 'Ongoing PRO services'],
    related: ['/golden-visa/business-investors/', '/services/investor-visa/', '/services/document-clearing/'],
  }),

  /* ---------------- Other ---------------- */
  svc({
    path: '/services/driving-licence/', name: 'UAE Driving Licence', group: 'Other services',
    meta: 'Getting or converting a UAE driving licence: eligibility, licence conversion for listed countries, eye test and steps.',
    intro: 'Residents of some countries can convert their home licence directly; others take lessons and tests. We tell you which applies to you and arrange the paperwork.',
    handle: ['Checking if your licence can be converted', 'Eye test and file opening', 'Driving school registration where needed', 'Licence renewal'],
    docs: ['Passport, residence and Emirates ID', 'Your current driving licence', 'Legal translation of the licence if required'],
    related: ['/document-services/legal-translation/', '/services/emirates-id/'],
  }),
  svc({
    path: '/services/bank-account-opening/', name: 'Bank Account Opening Assistance', group: 'Other services',
    meta: 'Help opening personal and business bank accounts in the UAE: choosing a bank, documents and the onboarding process.',
    intro: 'New residents and new companies often find bank onboarding the slowest step. We help you choose a suitable bank and prepare a complete file so it moves faster.',
    handle: ['Personal current and savings accounts', 'Business accounts for new companies', 'Document checklist and source-of-funds pack', 'Introductions and follow-up'],
    docs: ['Passport, residence and Emirates ID', 'Proof of address and income', 'For companies: trade licence, memorandum and shareholder documents'],
    related: ['/services/company-setup-pro/'],
  }),
  svc({
    path: '/services/green-visa/', name: 'Green Visa Guidance', group: 'Other services',
    meta: 'UAE Green Visa: the 5-year self-sponsored residence for skilled employees, freelancers and investors. How it compares with the Golden Visa.',
    intro: 'The Green Visa is a self-sponsored residence of up to 5 years for skilled employees, freelancers and some investors and partners. If you do not yet meet the Golden Visa benchmarks, it can be a strong first step.',
    handle: ['Checking Green Visa against Golden Visa for your profile', 'Skilled employee and freelancer applications', 'Family sponsorship', 'Planning a later move to the Golden Visa'],
    extra: [{ type: 'table', title: 'Green Visa or Golden Visa?', head: ['', 'Green Visa', 'Golden Visa'], rows: [['Length', 'Up to 5 years', 'Up to 10 years'], ['Sponsor', 'Self-sponsored', 'Self-sponsored'], ['Typical route', 'Skilled employee, freelancer, investor or partner', 'Property, investment, business, professional, talent, students'], ['Family', 'Can sponsor family', 'Can sponsor family, children of any age']], note: 'Benchmarks such as salary or income are set by the authorities and change. We confirm them for your case.' }],
    related: ['/golden-visa/', '/services/freelancer-visa/'],
  }),

  /* ---------------- Wills ---------------- */
  svc({
    path: '/services/difc-wills/', name: 'DIFC Wills', group: 'Wills & estate planning',
    meta: 'DIFC wills for non-Muslim UAE residents and asset owners: what they cover, who can register and how we help.',
    intro: 'A DIFC will lets eligible non-Muslims decide who inherits their UAE assets and who becomes guardian of their children, registered with the DIFC Wills Service Centre.',
    handle: ['Choosing the right will type for your assets', 'Preparing the will and guardianship wishes', 'Registration appointment', 'Updating an existing will'],
    related: ['/services/adjd-wills/', '/services/muslim-wills/'],
  }),
  svc({
    path: '/services/adjd-wills/', name: 'ADJD Wills (Abu Dhabi)', group: 'Wills & estate planning',
    meta: 'Register a will with the Abu Dhabi Judicial Department non-Muslim wills route: who it suits and how we help.',
    intro: 'Abu Dhabi offers its own registration route for non-Muslim wills through the Abu Dhabi Judicial Department. It suits many Abu Dhabi residents and property owners.',
    handle: ['Checking if the ADJD route suits you', 'Drafting your will and translation', 'Registration with the court', 'Updates after major life changes'],
    related: ['/services/difc-wills/', '/services/muslim-wills/'],
  }),
  svc({
    path: '/services/muslim-wills/', name: 'Muslim Wills', group: 'Wills & estate planning',
    meta: 'Sharia-compliant wills and estate planning for Muslims in the UAE.',
    intro: 'A Sharia-compliant will records your wishes within Islamic inheritance rules, such as bequests to people who are not fixed heirs and guardianship of your children.',
    handle: ['Sharia-compliant will drafting', 'Bequests within the permitted share', 'Guardianship wishes', 'Registration and safe keeping'],
    related: ['/services/difc-wills/', '/services/adjd-wills/'],
  }),

  /* ---------------- Quick access ---------------- */
  svc({
    path: '/services/medical-emirates-id-centres/', name: 'Medical & Emirates ID Centres', group: 'Quick access',
    meta: 'Where to do your residence medical test and Emirates ID biometrics in Abu Dhabi and the UAE, and how we book them for you.',
    intro: 'Your residence medical test is done at an approved government screening centre, and Emirates ID biometrics at an ICP customer happiness centre or approved service centre. We book the nearest slots and tell you exactly what to bring.',
    handle: ['Booking normal or VIP medical tests', 'Booking Emirates ID biometrics', 'Choosing the nearest centre to your home or office', 'Result and card delivery follow-up'],
    docs: ['Original passport', 'Entry permit or visa application', 'Emirates ID application receipt (for biometrics)'],
    related: ['/services/medical-biometrics/', '/services/emirates-id/'],
  }),
  svc({
    path: '/services/visa-validity-check/', name: 'Visa Validity Check', group: 'Quick access',
    meta: 'Check UAE visa status and validity on the official ICP service, or let us check your file and family visas for you.',
    intro: 'You can check the validity of a UAE residence or visit visa on the official ICP smart services portal. If anything looks wrong, or you want us to review your whole family’s visas before applying for a Golden Visa, send us the details.',
    handle: ['Visa and residence validity checks', 'Overstay and fine checks', 'Family visa expiry overview before renewals'],
    extra: [{ type: 'cards', title: 'Official services', items: [{ title: 'ICP smart services', text: 'Official visa and residency services (opens the government site).', href: 'https://smartservices.icp.gov.ae/' }] }],
    related: ['/services/golden-visa-renewal/', '/services/visa-cancellation/'],
  }),
];
