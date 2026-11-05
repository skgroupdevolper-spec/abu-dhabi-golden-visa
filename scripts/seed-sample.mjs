// Adds one clearly marked sample client and enquiry so the dashboards can be previewed.
// Only runs when no applications exist yet. Usage: node scripts/seed-sample.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dir = path.resolve(process.env.DATA_DIR || './data');
await mkdir(dir, { recursive: true });
const appsFile = path.join(dir, 'applications.json');
let apps = [];
try { apps = JSON.parse(await readFile(appsFile, 'utf8')); } catch {}
if (apps.length) { console.log('Data already present, nothing added.'); process.exit(0); }

const t = (d) => new Date(Date.now() - d * 864e5).toISOString();
const token = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
apps.push({
  id: 'sample1', ref: 'ADGV-0001', token, createdAt: t(9), updatedAt: t(0),
  client: { name: 'Sample Client', phone: '+971500000000', email: 'sample@example.com', nationality: 'Sample', language: 'English' },
  route: 'Property investor', location: 'in', adults: 1, kids: 1,
  stage: 4, stageDates: { 0: t(9), 1: t(8), 2: t(7), 3: t(5), 4: t(1) },
  nextStep: 'We submit your Golden Visa application to the authority.', expected: 'within 5 working days', notes: 'SAMPLE DATA for preview only.',
  quote: { lines: [
    { label: 'Main applicant: Immigration & residence visa', amount: 1614.25 }, { label: 'Main applicant: Normal medical test', amount: 300 },
    { label: 'Main applicant: Emirates ID, 10 years', amount: 1107.85 }, { label: 'Main applicant: Change of status (inside the UAE)', amount: 656.05 },
    { label: 'Property value certificate', amount: 1050 },
    { label: 'Adult 1: Immigration & residence visa', amount: 1614.25 }, { label: 'Adult 1: Normal medical test', amount: 300 }, { label: 'Adult 1: Emirates ID, 10 years', amount: 1107.85 }, { label: 'Adult 1: Change of status (inside the UAE)', amount: 656.05 },
    { label: 'Child 1: Immigration & residence visa', amount: 1614.25 }, { label: 'Child 1: Emirates ID, 10 years', amount: 1107.85 }, { label: 'Child 1: Change of status (inside the UAE)', amount: 656.05 },
    { label: 'Sponsor file opening (once)', amount: 353.91 },
  ], serviceFee: 4500, vat: 225, insurance: 'Quoted separately', sentAt: t(8), acceptedAt: t(7) },
  payments: [
    { id: 'p1', label: 'Government fees and service fee', amount: 16863.36, status: 'paid', link: '', createdAt: t(8), paidAt: t(7), method: 'Card', receiptNo: 'ADGV-0001-R1' },
    { id: 'p2', label: 'Health insurance (3 people)', amount: 2850, status: 'due', link: '', createdAt: t(1) },
  ],
  documents: [], requests: ['Passport copy', 'Passport photo', 'Title deed'],
  messages: [
    { id: 'm1', by: 'team', at: t(8), text: 'Your quote is ready. Please review and accept it in your portal.' },
    { id: 'm2', by: 'client', at: t(7), text: 'I accept the quote.', read: true },
    { id: 'm3', by: 'team', at: t(7), text: 'Payment received: Government fees and service fee. Your receipt ADGV-0001-R1 is in your portal.' },
    { id: 'm4', by: 'team', at: t(1), text: 'Status update: Nomination or valuation certificate.\nNext: We submit your Golden Visa application to the authority.' },
    { id: 'm5', by: 'client', at: t(0), text: 'Thank you. Do you need anything else from me?' },
  ],
});
await writeFile(appsFile, JSON.stringify(apps, null, 1));
const leadsFile = path.join(dir, 'leads.json');
let leads = [];
try { leads = JSON.parse(await readFile(leadsFile, 'utf8')); } catch {}
leads.unshift({ id: 'lead01', at: t(0), name: 'Sample Enquiry', phone: '+971500000001', email: '', service: 'Real-estate investor', message: 'I own an apartment on Saadiyat worth AED 2.4M. Can I apply?', source: 'home', details: '{"language":"English"}', status: 'new', note: '' });
await writeFile(leadsFile, JSON.stringify(leads, null, 1));
console.log(`Sample data added in ${dir}. Client portal: /portal/t/${token}/`);
