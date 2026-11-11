// Tabbed sections for the service pages: one switchable panel per option, like a guided brochure.
// Our own wording from the supplied source pages and official UAE authority information. Checked November 2026.
import type { Section } from './types';

type Tab = { label: string; sub?: string; text?: string; items?: string[]; facts?: { label: string; value: string }[] };
const tabs = (title: string, intro: string, list: Tab[]): Section => ({ type: 'tabs', title, intro, tabs: list });

export const TABS: Record<string, Section[]> = {
  /* ---------------- Visas ---------------- */
  '/services/family-visa/': [tabs('Choose the family member', 'Each relative has its own rules and papers. Tap one to see what applies.', [
    { label: 'Spouse', sub: 'Husband or wife', text: 'The sponsor needs a valid residence and a salary of AED 4,000 a month, or AED 3,000 with employer housing. The key document is the attested marriage certificate.', facts: [{ label: 'Gov. fees from', value: 'AED 1,469.25' }, { label: 'Time', value: '5–10 working days' }], items: ['Sponsor’s passport, visa and Emirates ID', 'Spouse’s passport and photo', 'Marriage certificate, attested and translated', 'Salary certificate and tenancy contract', 'Health insurance'] },
    { label: 'Children', sub: 'Sons to 25, daughters any age', text: 'Same salary rule as for a spouse. Sons can be sponsored up to 25 and unmarried daughters at any age; children of determination at any age.', facts: [{ label: 'Gov. fees from', value: 'AED 1,169.25' }, { label: 'Medical', value: 'Not needed under 18' }], items: ['Child’s passport and photo', 'Birth certificate, attested and translated', 'Sponsor’s documents and salary proof', 'Health insurance'] },
    { label: 'Parents', sub: 'Higher income', text: 'Parents need a higher income (around AED 20,000 a month), a home with at least two bedrooms, and health insurance for each parent. A refundable deposit may apply.', facts: [{ label: 'Gov. fees from', value: 'AED 2,938.50' }, { label: 'Home', value: '2+ bedrooms' }], items: ['Parents’ passports and photos', 'Sponsor’s birth certificate showing the parents', 'Salary certificate and tenancy contract', 'Health insurance for each parent'] },
    { label: 'Newborn', sub: 'Within 120 days', text: 'A baby born in the UAE needs a passport and residence within 120 days of birth. Babies take no medical test and give no fingerprints.', facts: [{ label: 'Gov. fees from', value: 'AED 965.34' }, { label: 'Deadline', value: '120 days' }], items: ['Birth certificate, MOFA attested', 'Baby’s passport and photo', 'Sponsor’s passport, Emirates ID and contract'] },
    { label: 'Renewal', sub: '3–5 working days', text: 'Renew before the visa expires (a 30-day grace period applies). No entry permit is needed for a renewal.', items: ['Current visa and Emirates ID', 'Updated salary certificate and tenancy', 'Medical for adults', 'Health insurance renewal'] },
  ])],
  '/services/investor-visa/': [tabs('Mainland or free zone?', 'The same residence, but each licensing route has its own rules and fees.', [
    { label: 'Mainland partner visa', sub: 'DED licence', text: 'Issued for two years through the company’s immigration file. A mainland LLC often declares AED 300,000 share capital.', facts: [{ label: 'Valid for', value: '2 years' }, { label: 'Gov. fees from', value: 'AED 2,346' }], items: ['Trade licence and MOA naming you', 'Establishment card (or a new one, AED 575)', 'Medical, Emirates ID and stamping'] },
    { label: 'Free-zone investor visa', sub: 'Free-zone licence', text: 'Each free zone sets its own visa package and establishment card fee. Many accept declared share capital of AED 50,000–100,000; some ask for none.', facts: [{ label: 'Valid for', value: '2–3 years' }, { label: 'Fees', value: 'Set by the free zone' }], items: ['Free-zone licence and share certificate', 'Free-zone application forms', 'Medical, Emirates ID and residence'] },
    { label: 'Family of an investor', sub: 'Spouse, children, parents', text: 'Once your visa is issued, you can sponsor your family. A refundable deposit of AED 3,000 per family member applies to partner and investor sponsors.', facts: [{ label: 'Adult from', value: 'AED 1,532' }, { label: 'Child from', value: 'AED 1,247' }] },
    { label: 'Golden Visa upgrade', sub: 'AED 2M+', text: 'If your capital, deposits or company value reach AED 2 million, the 10-year Golden Visa may suit you better, with no six-month rule.', items: ['10-year residence', 'Self-sponsored, not tied to the company', 'Family included'] },
  ])],
  '/services/newborn-visa/': [tabs('Your baby’s visa depends on the sponsoring parent', 'Fees and steps change slightly with the parent’s own visa.', [
    { label: 'Employment visa parent', sub: '2 years', facts: [{ label: 'Gov. fees', value: 'AED 965.34' }, { label: 'Dubai', value: 'AED 1,029' }], text: 'MOFA attestation AED 150, Emirates ID AED 355 and residence AED 460.34 outside Dubai.' },
    { label: 'Partner or investor parent', sub: '2 years', facts: [{ label: 'Gov. fees', value: 'AED 965.34' }, { label: 'Deposit', value: 'AED 3,000 refundable' }], text: 'Same steps as an employee, with the immigration deposit where it applies.' },
    { label: 'Golden Visa parent', sub: '10 years', facts: [{ label: 'Gov. fees', value: 'AED 2,518.19' }, { label: 'Dubai', value: 'AED 2,945' }], text: 'The baby is added to the 10-year family residence.' },
    { label: 'Baby born abroad', sub: 'Entry permit', text: 'The baby enters on an entry permit like any family member. The foreign birth certificate needs home-country, UAE embassy and MOFA attestation.' },
  ])],
  '/services/maid-visa/': [tabs('Pick the worker and the route', 'Domestic worker visas cover several household roles and two ways of sponsoring.', [
    { label: 'Housemaid or nanny', text: 'The most common domestic worker visa: two years, with a MOHRE domestic worker contract.', items: ['Worker aged 21–60 in most cases', 'Medical and Emirates ID', 'Health insurance'] },
    { label: 'Private driver', text: 'A driver employed by the household. A UAE driving licence is needed before driving.', items: ['Licence exchange or training', 'Same visa steps as other domestic workers'] },
    { label: 'Cook, gardener, carer', text: 'Other household roles follow the same domestic worker route with the job title on the contract.' },
    { label: 'Tadbeer route', sub: 'from AED 8,500', text: 'A MOHRE-licensed Tadbeer centre handles contract, permit, visa, medical, Emirates ID and basic insurance in one package.' },
    { label: 'Direct sponsorship', sub: 'from AED 17,925', text: 'You are the sponsor on the records; we file every step online. Includes a refundable AED 2,000 deposit.' },
  ])],
  '/services/tourist-visa/': [tabs('Find the right visa for the trip', 'Pick by length of stay and whether the traveller will leave and come back.', [
    { label: 'Short stay', sub: '14 days', text: 'For a long weekend or a quick family visit. Single entry.', facts: [{ label: 'Stay', value: 'Up to 14 days' }, { label: 'Entries', value: 'Single' }] },
    { label: 'Holiday', sub: '30 days', text: 'The usual choice for a holiday or a stay with family.', facts: [{ label: 'Stay', value: 'Up to 30 days' }, { label: 'Entries', value: 'Single or multiple' }] },
    { label: 'Long stay', sub: '60 days', text: 'For longer family stays, for example a parent helping after a birth.', facts: [{ label: 'Stay', value: 'Up to 60 days' }, { label: 'Entries', value: 'Single or multiple' }] },
    { label: 'Transit', sub: '48 or 96 hours', text: 'For a stopover on the way to another country.', facts: [{ label: 'Stay', value: '48 or 96 hours' }, { label: 'Needs', value: 'Onward ticket' }] },
    { label: 'Frequent visitor', sub: '5 years', text: 'A long-term multiple-entry tourist visa with its own eligibility and document rules.', facts: [{ label: 'Validity', value: '5 years' }, { label: 'Stay', value: 'Set per visit' }] },
  ])],
  '/remote-work-visa/': [tabs('Which emirate will you live in?', 'Two fee schedules apply.', [
    { label: 'Abu Dhabi and 5 emirates', sub: 'ICP', facts: [{ label: 'From abroad', value: 'AED 1,278.91' }, { label: 'Inside the UAE', value: 'AED 1,934.96' }], text: 'Entry permit 353.91, medical 300, Emirates ID 275, residence 350, plus change of status 656.05 if inside.' },
    { label: 'Dubai', sub: 'GDRFA', facts: [{ label: 'From abroad', value: 'AED 1,555' }, { label: 'Inside the UAE', value: 'AED 2,780' }], text: 'Entry permit 485 (1,035 inside), medical 285, Emirates ID 275, stamping 510, plus change of status 675 if inside.' },
    { label: 'Remote employee', text: 'Employed by a company abroad: contract or employer letter, payslips showing USD 3,500+ a month.' },
    { label: 'Business owner abroad', text: 'Own a business outside the UAE: business licence and proof of income of USD 3,500+ a month.' },
  ])],

  /* ---------------- Attestation ---------------- */
  '/document-services/mofa-attestation/': [tabs('What kind of document?', 'Pick the category to see typical documents and where they are used.', [
    { label: 'Educational', items: ['Degree and diploma certificates', 'Transcripts and mark sheets', 'School leaving and transfer certificates'], text: 'Used for work permits, the skilled-professional Golden Visa, equivalency and school or university admission.' },
    { label: 'Family and personal', items: ['Marriage certificate', 'Birth certificate', 'Divorce and death certificates', 'Police clearance'], text: 'Used for spouse and children’s visas, newborn registration, schools and courts.' },
    { label: 'Commercial', items: ['Certificate of incorporation', 'Board resolutions and POA', 'Commercial invoices and certificates of origin'], text: 'Used for company registration, branches, banks and trade. Many countries require a chamber of commerce stamp first.' },
    { label: 'Career', items: ['Experience certificates', 'Salary certificates', 'Employment letters'], text: 'Used for licensing, work permits and some Golden Visa categories.' },
  ])],
  '/services/notary-power-of-attorney/': [tabs('Choose your notary need', 'Three categories cover almost every case.', [
    { label: 'Personal', sub: 'from about AED 500', items: ['General or special power of attorney', 'Affidavits and declarations', 'No-objection certificates', 'True copies of passport and Emirates ID'], text: 'For family matters, visas, courts and banks.' },
    { label: 'Real estate', sub: 'from about AED 300', items: ['POA to sell, buy, rent or manage property', 'Sale and purchase agreements', 'Tenancy documents'], text: 'For land department transactions when you cannot attend.' },
    { label: 'Business', sub: 'from about AED 1,500', items: ['Board resolutions', 'Company agreements and MOA amendments', 'Manager and signatory appointments'], text: 'For licensing authorities, banks and courts.' },
    { label: 'Speed', items: ['Standard: 2–3 working days', 'Priority: same day when the document and notary allow', 'Online video notarisation for many documents'] },
  ])],
  '/document-services/legal-translation/': [tabs('What are you translating?', 'Pick a category to see examples.', [
    { label: 'Personal and family', items: ['Marriage, birth, divorce and death certificates', 'Passports and IDs', 'Police clearance'] },
    { label: 'Educational', items: ['Degrees, diplomas and transcripts', 'School certificates'] },
    { label: 'Business', items: ['Trade licences and MOA', 'Contracts and agreements', 'Financial statements'] },
    { label: 'Legal', items: ['Court judgments', 'Powers of attorney', 'Affidavits and wills'] },
    { label: 'Immigration and medical', items: ['Salary certificates and bank letters', 'Medical reports'] },
  ])],

  /* ---------------- Employment ---------------- */
  '/services/employment-visas-permits/': [tabs('Pick the service you need', 'Six services cover most company needs.', [
    { label: 'New employee visa', text: 'Offer letter, labour insurance, MOHRE payment, entry permit, change of status, medical, Emirates ID, Tawjeeh, ILOE and stamping: the full residence file.' },
    { label: 'Visa renewal', text: 'Renewal typing, MOHRE submission, labour insurance, medical, Emirates ID, ILOE and stamping. No entry permit or change of status needed.' },
    { label: 'Golden Visa work permit', text: 'Employ a 10-year Golden Visa holder with a dedicated permit, without changing their residence.' },
    { label: 'Relative work permit', text: 'Put a family-visa holder on your payroll with a MOHRE work permit.' },
    { label: 'Part-time and intern', text: 'Hire part-time staff or interns compliantly with a MOHRE permit.' },
    { label: 'Cancellation', text: 'Labour cancellation and immigration cancellation, inside or outside the UAE, keeping your file clean.' },
  ])],
  '/services/employment-visa/': [tabs('Your offer letter category', 'The skill level on the MOHRE offer affects the permit and fees.', [
    { label: 'Unskilled', text: 'Roles without a required qualification. Lowest offer letter fee.' },
    { label: 'Diploma or graduate', text: 'Needs an attested diploma or degree for the skilled category.' },
    { label: 'Postgraduate', text: 'Master’s degree, attested.' },
    { label: 'PhD', text: 'Doctorate, attested. May also open Golden Visa routes.' },
  ])],
  '/services/work-permit/': [tabs('Work permit groups', 'Thirteen permits in five groups. Pick yours.', [
    { label: 'Standard employment', items: ['New work permit', 'Transfer permit', 'Family-sponsored permit'], facts: [{ label: 'Validity', value: '2 years' }, { label: 'Gov. fee', value: 'AED 250–3,500' }] },
    { label: 'Flexible and short-term', items: ['Temporary permit (up to 6 months)', 'Mission permit (3 months, renewable once)', 'Part-time permit (2 years)'], facts: [{ label: 'Gov. fee', value: 'AED 250–1,500' }] },
    { label: 'Youth and training', items: ['Juvenile permit, ages 15–18 (1 year)', 'Student training permit (3 months)', 'National trainee permit (12 months)'], facts: [{ label: 'Fees', value: 'Reduced' }] },
    { label: 'Special categories', items: ['Golden Visa holder permit (2 years, reduced fees)', 'GCC national permit (2 years)'] },
    { label: 'Niche', items: ['Private teacher permit (2 years)', 'Freelance and self-employment permits'] },
  ])],
  '/services/visa-cancellation/': [tabs('Choose your situation', 'Each path has its own documents and timing.', [
    { label: 'Mutual', sub: '1–3 days', text: 'You and the employer agree. Both sign the cancellation form.' },
    { label: 'Resigned', sub: '1–3 days', text: 'You resigned and the employer cancels. Notice period and final settlement apply.' },
    { label: 'Employer refusing', sub: '3–5 days', text: 'MOHRE can cancel without the employer in many cases, such as an ended contract or unpaid salary.' },
    { label: 'Employer unreachable', sub: '5–7 days', text: 'Company closed or not responding. We file through MOHRE and immigration.' },
    { label: 'Absconding report', sub: '5–10 days', text: 'We review the report and the options to challenge or settle it.' },
    { label: 'Family or domestic', sub: '3–7 days', text: 'Sponsor cancels dependants or a domestic worker, inside or outside the UAE.' },
    { label: 'Overstay', sub: '24–72 hours', text: 'Fines at AED 50 a day are calculated and settled, then renewal or exit.' },
  ])],
  '/services/emirates-id/': [tabs('Who is the card for?', 'Pick the applicant to see what is needed.', [
    { label: 'Employee or new hire', items: ['Passport and visa', 'Biometrics for first-time adults', 'Card issued with the residence'] },
    { label: 'Family member', items: ['Sponsor’s Emirates ID', 'Child’s passport and visa', 'No fingerprints for young children'] },
    { label: 'Investor or Golden Visa', items: ['Card valid for the residence period, up to 10 years', 'Passport and residence'] },
    { label: 'Domestic worker', items: ['Sponsor’s documents', 'Worker’s passport and visa', 'Biometrics'] },
    { label: 'Renewal or replacement', items: ['Current or expired card', 'Police report if stolen (where required)', 'Late fine AED 20 a day after 30 days, up to AED 1,000'] },
  ])],
  '/services/medical-biometrics/': [tabs('Which medical do you need?', 'Requirements differ slightly by visa.', [
    { label: 'Employment visa', items: ['Blood test and chest X-ray', 'Normal or VIP', 'Some job categories have extra tests'] },
    { label: 'Family visa', items: ['Adults 18+ only', 'Children are exempt', 'Normal or VIP'] },
    { label: 'Golden Visa', items: ['Same test for main applicant and adult family', 'VIP often chosen for speed'] },
    { label: 'Domestic worker', items: ['Standard test plus additional screening', 'Booked by the sponsor or Tadbeer'] },
    { label: 'Students', items: ['Students aged 18 and over', 'Normal appointment'] },
  ])],
  '/services/iloe-insurance/': [tabs('Your ILOE category', 'Two categories by basic salary.', [
    { label: 'Category A', sub: 'Basic up to AED 16,000', facts: [{ label: 'Premium', value: 'AED 5 a month + VAT' }, { label: 'Max benefit', value: 'AED 10,000 a month' }] },
    { label: 'Category B', sub: 'Basic over AED 16,000', facts: [{ label: 'Premium', value: 'AED 10 a month + VAT' }, { label: 'Max benefit', value: 'AED 20,000 a month' }] },
    { label: 'Claim rules', items: ['12 consecutive months of subscription', 'Job loss not by resignation or for disciplinary reasons', 'Apply within 30 days', '60% of average basic salary for up to 3 months'] },
    { label: 'Fines', items: ['AED 400 for not subscribing', 'AED 200 for premiums unpaid over 3 months'] },
  ])],
  '/services/freelancer-visa/': [tabs('Which freelance route fits you?', 'Your residence status decides the route.', [
    { label: 'I already have residence', sub: 'Permit only', text: 'On a family visa or Golden Visa: you need only a freelance permit for your activity, usually with a no-objection letter from your sponsor.', facts: [{ label: 'Typical cost', value: 'about AED 6,500 a year' }] },
    { label: 'I need a visa', sub: 'Permit + residence', text: 'A package with a one- or two-year self-sponsored residence.', facts: [{ label: '1 year', value: 'about AED 9,500–10,500' }, { label: '2 years', value: 'about AED 13,500–14,500' }] },
    { label: 'My clients are abroad', sub: 'Remote work visa', text: 'If all your work is for clients or an employer outside the UAE, the virtual work visa may be simpler.' },
  ])],

  /* ---------------- Property & business ---------------- */
  '/services/document-clearing/': [tabs('What do you need cleared?', 'Pick a service area.', [
    { label: 'Visas', items: ['Employment, family, investor and freelance visas', 'Work permits, renewals and cancellations'] },
    { label: 'Emirates ID', items: ['New cards and renewals', 'Replacements and biometrics'] },
    { label: 'Attestation', items: ['MOFA, embassy and consulate', 'Educational, personal and commercial documents'] },
    { label: 'Translation and notary', items: ['Legal Arabic translation', 'Powers of attorney and declarations'] },
    { label: 'Corporate PRO', items: ['Trade licence renewals and amendments', 'Establishment cards and MOHRE files', 'Local sponsorship support'] },
  ])],
  '/services/tasheel/': [tabs('Tasheel transactions', 'Grouped by what your company is doing.', [
    { label: 'Starting to hire', items: ['Establishment registration and card', 'Visa quota application', 'E-signature card'] },
    { label: 'Hiring', items: ['Work permit issuance', 'Labour contract registration', 'Mission cards'] },
    { label: 'Keeping compliant', items: ['Labour card renewal', 'Establishment card renewal', 'WPS registration'] },
    { label: 'Changes and disputes', items: ['Employee transfers', 'Absence reports', 'Labour complaints'] },
  ])],
  '/services/tawjeeh/': [tabs('Session modules', 'What each part of the orientation covers.', [
    { label: 'Labour law', items: ['Limited and unlimited contracts', 'Working hours and overtime', 'Annual, sick and public holiday leave', 'End-of-service gratuity'] },
    { label: 'Worker rights', items: ['Wage Protection System', 'Anti-discrimination and harassment rules', 'Health and safety', 'Changing employer'] },
    { label: 'Employer duties', items: ['Emiratisation', 'Accommodation standards', 'Medical insurance', 'Complaint procedures'] },
    { label: 'Practical', items: ['Checking contract status', 'Filing complaints on the MOHRE app', 'Checking visa and Emirates ID status'] },
  ])],
  '/document-services/property-documentation/': [tabs('Your property situation', 'The papers you need depend on the property.', [
    { label: 'Ready, fully paid', items: ['Title deed', 'Valuation certificate'] },
    { label: 'With a mortgage', items: ['Title deed', 'Valuation certificate', 'Bank letter showing the paid amount'] },
    { label: 'Off-plan', items: ['Sale and purchase agreement', 'Developer payment statement', 'Developer approval where needed'] },
    { label: 'Someone acting for you', items: ['Notarised property POA', 'Their passport and Emirates ID'] },
  ])],

  /* ---------------- Other ---------------- */
  '/services/driving-licence/': [tabs('Your situation', 'Pick the one that matches you.', [
    { label: 'Visiting the UAE', text: 'Visitors from eligible countries can drive on their home or international licence. Rental companies set their own rules.' },
    { label: 'New resident, exchange country', text: 'Exchange your licence after an eye test, with a legal translation if needed. Often the same day.', facts: [{ label: 'Dubai cost', value: 'about AED 870' }] },
    { label: 'New resident, other country', text: 'Open a file at an approved driving school, take the required lessons and pass the theory and road tests.' },
    { label: 'Renewal', text: 'Pay any outstanding fines first, then renew online in most emirates.' },
  ])],
  '/services/bank-account-opening/': [tabs('Which account do you need?', 'Each account type has its own checks.', [
    { label: 'Personal account', items: ['Passport, residence visa and Emirates ID', 'Salary certificate or proof of income', 'Usually opened within days'] },
    { label: 'Corporate account', items: ['Trade licence, MOA and board resolution', 'Shareholder and director passports', 'Business plan and expected turnover', 'Usually 2–4 weeks'] },
    { label: 'Multi-currency', items: ['For international clients and suppliers', 'Clear source of funds and counterparties'] },
    { label: 'Extra services', items: ['Merchant accounts', 'Payroll', 'Trade finance and guarantees'] },
  ])],

  /* ---------------- Wills ---------------- */
  '/services/difc-wills/': [tabs('Five DIFC will types', 'Pick the will that covers what you need.', [
    { label: 'Full will', text: 'All assets, guardianship of children and business interests in one will.' },
    { label: 'Property will', text: 'UAE real estate only.' },
    { label: 'Guardianship will', text: 'Appoints guardians for minor children.' },
    { label: 'Business owners will', text: 'Company shares and business interests.' },
    { label: 'Financial assets will', text: 'Bank accounts, cash and investments.' },
  ])],
  '/services/adjd-wills/': [tabs('How an ADJD will is registered', 'Three steps, all remote.', [
    { label: '1. Quotation', text: 'Based on your family, your wishes and the assets in the UAE.' },
    { label: '2. Draft and translate', text: 'You approve the draft; it is translated into Arabic.' },
    { label: '3. Remote registration', text: 'Signed copy uploaded; ADJD verifies your identity on a video call, reads the will back, and emails the registered copy.' },
  ])],
  '/services/muslim-wills/': [tabs('What a registered will lets you decide', 'The main choices Muslim expats make.', [
    { label: 'Beneficiaries', text: 'Who receives your UAE assets, within the law that applies to your estate.' },
    { label: 'Executors', text: 'Who manages the estate and deals with banks and authorities.' },
    { label: 'Guardians', text: 'Who cares for your minor children.' },
    { label: 'Faster probate', text: 'A registered will makes the process quicker and clearer for your family.' },
  ])],

  /* ---------------- Quick access ---------------- */
  '/services/medical-emirates-id-centres/': [tabs('Centres by emirate', 'Tap your emirate.', [
    { label: 'Abu Dhabi and Al Ain', items: ['Medical: SEHA-approved screening centres', 'Emirates ID: ICP centres in Abu Dhabi, Mussafah and Al Ain'] },
    { label: 'Dubai', items: ['Medical: DHA medical fitness centres, normal and VIP', 'Emirates ID: ICP and GDRFA-linked centres'] },
    { label: 'Northern emirates', items: ['Medical: EHS centres in Sharjah, Ajman, UAQ, RAK and Fujairah', 'Emirates ID: ICP centres in each emirate'] },
  ])],
  '/services/visa-validity-check/': [tabs('Where is your visa held?', 'The issuing emirate decides which system to check.', [
    { label: 'Abu Dhabi and 5 emirates', sub: 'ICP', text: 'Use ICP Smart Services: Public Services, File Validity, search by passport information.' },
    { label: 'Dubai', sub: 'GDRFA', text: 'Use the GDRFA status inquiry with your file number or passport details.' },
    { label: 'Not sure', sub: 'We check', text: 'Send us the passport details and we check the right system for free.' },
  ])],

  /* ---------------- Menu items ---------------- */
  '/services/golden-visa-renewal/': [tabs('Renewal by category', 'What you show again depends on how you qualified.', [
    { label: 'Property investor', items: ['Title deed still in your name', 'Fresh valuation of AED 2M+', 'Bank letter if mortgaged'] },
    { label: 'Business investor', items: ['Company licence and ownership', 'Capital, deposit or tax evidence'] },
    { label: 'Skilled professional', items: ['Salary certificate of AED 30,000+', 'Employment contract', 'Attested degree on file'] },
    { label: 'Family members', items: ['Passports and photos', 'Medical for adults', 'Health insurance'] },
  ])],
  '/services/entry-permit-status-change/': [tabs('Where are you now?', 'The route depends on where you are when you apply.', [
    { label: 'Outside the UAE', text: 'An entry permit is issued; you travel in and finish the residence within its validity.' },
    { label: 'Inside on a visit visa', text: 'A change of status switches you to the new permit without leaving.', facts: [{ label: 'ICP fee', value: 'AED 656.05' }] },
    { label: 'Inside on another residence', text: 'The old residence is cancelled or transferred, then the new one is issued.' },
  ])],
  '/services/health-insurance/': [tabs('Who needs cover?', 'Pick the person to see who usually pays and what to watch.', [
    { label: 'Yourself', text: 'Employees are insured by the employer; Golden Visa holders, investors and the self-employed arrange their own.' },
    { label: 'Spouse and children', text: 'Usually the sponsor’s responsibility; some employers include family.' },
    { label: 'Parents', text: 'Premiums rise with age, so compare compliant plans carefully.' },
    { label: 'Domestic worker', text: 'The sponsor provides cover for the whole visa period.' },
  ])],
  '/document-services/degree-attestation/': [tabs('Route by country type', 'The steps before MOFA depend on where the degree was issued.', [
    { label: 'Apostille countries', text: 'Apostille from the issuing country, then UAE steps as required.' },
    { label: 'Other countries', text: 'University or education authority, foreign ministry, UAE embassy, then MOFA.' },
    { label: 'UAE degree', text: 'Ministry of Higher Education, then MOFA.' },
  ])],
  '/document-services/marriage-certificate/': [tabs('Where did you marry?', 'The route depends on the country of marriage.', [
    { label: 'In the UAE', text: 'MOFA attestation, plus translation if the certificate is not in Arabic.' },
    { label: 'Abroad', text: 'Home-country registry and foreign ministry, UAE embassy, then MOFA and Arabic translation.' },
    { label: 'Religious ceremony only', text: 'Civil registration may be needed before attestation. We check your country’s rule.' },
  ])],
  '/document-services/birth-certificate/': [tabs('Where was the child born?', 'Two routes.', [
    { label: 'In the UAE', text: 'MOFA attestation of the UAE certificate, inside the newborn 120 days.' },
    { label: 'Abroad', text: 'Home-country attestation, UAE embassy, then MOFA; translation if needed.' },
  ])],
  '/document-services/document-legalisation/': [tabs('Which direction?', 'Legalisation works both ways.', [
    { label: 'Foreign document for the UAE', text: 'Issuing country authorities, UAE embassy there, then MOFA in the UAE.' },
    { label: 'UAE document for abroad', text: 'Issuing UAE authority, MOFA, then the destination country’s embassy in the UAE.' },
    { label: 'Commercial documents', text: 'Add the chamber of commerce stamp where the destination requires it.' },
  ])],
};
