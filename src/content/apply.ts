// Services offered in the online application (/apply/). Golden Visa services use the calculator fee
// schedule; the others get an itemised quote from the advisor.
import { SERVICE_CATALOG } from './services-catalog';

export type ApplyService = { id: string; label: string; group: string; route?: string; docs: string[]; family?: boolean; note?: string };

const BASE = ['Passport copy (valid 6+ months)', 'Recent photo on a white background'];
const GV_DOCS = [...BASE, 'Current UAE visa and Emirates ID (if you have them)'];

export const APPLY_SERVICES: ApplyService[] = [
  { id: 'gv-property', label: 'Golden Visa: property investor', group: 'Golden Visa', note: 'AED 2M+ property · 10 years', route: 'property', family: true, docs: [...GV_DOCS, 'Title deed or pre-registration certificate', 'Sales and purchase agreement', 'Developer NOC (off-plan) or bank NOC (mortgage)'] },
  { id: 'gv-investor', label: 'Golden Visa: company owner or investor', group: 'Golden Visa', note: 'AED 2M deposit or company · 10 years', route: 'investor', family: true, docs: [...GV_DOCS, 'Trade licence and memorandum of association', 'Bank deposit letter or audited accounts'] },
  { id: 'gv-entrepreneur', label: 'Golden Visa: entrepreneur', group: 'Golden Visa', note: 'Approved project or AED 1M revenue', route: 'entrepreneur', family: true, docs: [...GV_DOCS, 'Approval letter or company revenue evidence'] },
  { id: 'gv-professional', label: 'Golden Visa: skilled professional', group: 'Golden Visa', note: 'AED 30,000+ salary and a degree', route: 'professional', family: true, docs: [...GV_DOCS, 'Employment contract and salary certificate (AED 30,000+)', 'Attested degree or equivalency'] },
  { id: 'gv-talent', label: 'Golden Visa: talent, scientist or researcher', group: 'Golden Visa', note: 'With a recommendation', route: 'professional', family: true, docs: [...GV_DOCS, 'Recommendation, awards or portfolio', 'CV'] },
  { id: 'gv-student', label: 'Golden Visa: outstanding student or graduate', group: 'Golden Visa', note: 'Top grades or GPA 3.5+', route: 'graduate', family: true, docs: [...GV_DOCS, 'Transcript and attested degree', 'Recommendation from the university (if available)'] },
  { id: 'gv-other', label: 'Golden Visa: humanitarian or frontline', group: 'Golden Visa', note: 'Nomination by an authority', route: 'professional', family: true, docs: [...GV_DOCS, 'Nomination or evidence of contribution'] },
  { id: 'golden-visa', label: 'Golden Visa: not sure which route', group: 'Golden Visa', note: 'We find the right route with you', route: 'property', family: true, docs: GV_DOCS },
  { id: 'gv-family', label: 'Add family to my Golden Visa', group: 'Family & residency', note: 'Spouse, children and parents', route: 'family', family: true, docs: [...BASE, 'Sponsor’s Golden Visa and Emirates ID', 'Attested marriage or birth certificates'] },
  { id: 'gv-renewal', label: 'Golden Visa renewal', group: 'Family & residency', note: 'You and your family', route: 'property', family: true, docs: [...GV_DOCS, 'Proof you still meet your route'] },
  { id: 'family-visa', label: 'Family visa (spouse, children, parents)', group: 'Family & residency', note: 'Sponsor on a UAE residence visa', family: true, docs: ['Sponsor passport, visa and Emirates ID', 'Family member passports and photos', 'Attested marriage or birth certificates', 'Salary certificate and tenancy contract'] },
  { id: 'newborn', label: 'Newborn residence visa', group: 'Family & residency', note: 'Within 120 days of birth', docs: ['Baby’s passport', 'Attested birth certificate', 'Parents’ passports and Emirates IDs'] },
  { id: 'retirement', label: 'Retirement visa (55+)', group: 'Family & residency', note: 'Age 55+ · 5 years', family: true, docs: [...BASE, 'Title deed, savings or pension evidence'] },
  { id: 'virtual-work', label: 'Virtual work (remote work) visa', group: 'Family & residency', note: 'Work for a company abroad · 1 year', family: true, docs: [...BASE, 'Employment contract or business ownership abroad', 'Proof of income (last 3 months)'] },
  { id: 'investor-visa', label: 'Investor / partner visa', group: 'Visas', note: 'Through your UAE company · 2 years', family: true, docs: [...BASE, 'Trade licence and memorandum of association'] },
  { id: 'maid-visa', label: 'Maid / domestic worker visa', group: 'Visas', note: 'Housemaid, nanny or driver · 2 years', docs: ['Sponsor passport, visa and Emirates ID', 'Salary certificate and tenancy contract', 'Worker passport and photo'] },
  { id: 'tourist-visa', label: 'Tourist / visit visa', group: 'Visas', note: '30 or 60 days', docs: [...BASE, 'Return ticket or host’s residence details'] },
  { id: 'employment', label: 'Employment visa or work permit', group: 'Employment', note: 'New hire, renewal or permit', docs: [...BASE, 'Offer letter or contract', 'Company trade licence'] },
  { id: 'iloe', label: 'ILOE insurance', group: 'Employment', note: 'From AED 5 a month', docs: ['Emirates ID', 'Salary details'] },
  { id: 'valuation', label: 'Valuation certificate (TAMM)', group: 'Property & documents', note: 'From AED 900 · about 3 days', docs: ['Title deed or site plan', 'Photos of the property', 'Power of attorney (if we apply for you)'] },
  { id: 'cancellation', label: 'Visa cancellation', group: 'Visa services', note: 'Golden, family or domestic', docs: ['Passport and Emirates ID'] },
  { id: 'emirates-id', label: 'Emirates ID (new, renewal, replacement)', group: 'Visa services', note: 'New, renewal or replacement', docs: ['Passport and residence visa', 'Photo'] },
  { id: 'medical', label: 'Medical test & biometrics booking', group: 'Visa services', note: 'Standard or VIP', docs: ['Passport', 'Entry permit or visa application'] },
  { id: 'visa-check', label: 'Visa status / validity check', group: 'Visa services', note: 'Free status check', docs: ['Passport details'] },
];

// Every other service in the catalogue can be requested too.
const COVERED = ['/golden-visa/', '/retirement-visa/', '/family-golden-visa/', '/family-golden-visa/newborn/', '/remote-work-visa/', '/services/investor-visa/', '/services/maid-visa/', '/services/tourist-visa/', '/services/golden-visa-renewal/', '/services/visa-cancellation/', '/services/emirates-id/', '/services/medical-biometrics/', '/document-services/valuation-certificate/', '/services/iloe-insurance/', '/services/employment-visas-permits/', '/services/employment-visa/', '/services/work-permit/', '/services/visa-validity-check/', '/services/medical-emirates-id-centres/', '/golden-visa-cost/', '/visa-check/'];
const known = new Set(APPLY_SERVICES.map((s) => s.id));
for (const g of SERVICE_CATALOG) {
  for (const i of g.items) {
    const id = i.href.split('/').filter(Boolean).pop() || '';
    if (!id || known.has(id) || COVERED.includes(i.href)) continue;
    known.add(id);
    APPLY_SERVICES.push({ id, label: i.label, group: g.title, docs: BASE });
  }
}

export const applyService = (id?: string | null) => APPLY_SERVICES.find((s) => s.id === id);
