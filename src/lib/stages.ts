import { FEE_SCHEDULE, ROUTES } from './fees';

export const STAGES = [
  'Enquiry received',
  'Eligibility confirmed',
  'Quote accepted and paid',
  'Documents and attestation',
  'Nomination or valuation certificate',
  'Application submitted',
  'Entry permit or change of status',
  'Medical and biometrics',
  'Emirates ID and residence issued',
];

/** Default "next step" text the client sees for each stage (the team can change these in admin). */
export const STAGE_NEXT_DEFAULT = [
  'We have received your enquiry. An advisor will review it and contact you with your eligibility and the next steps.',
  'You are eligible for the route we discussed. We will send you a written quote to review and accept.',
  'Thank you for your payment. Please upload the documents on your checklist so we can start preparing your file.',
  'We are checking your documents and arranging attestation and translation where needed.',
  'We are requesting your nomination or property valuation certificate from the relevant authority.',
  'Your application has been submitted to the authorities. We will update you as soon as there is a response.',
  'We are arranging your entry permit or change of status. We will share the details with you.',
  'Please attend your medical test and biometrics appointment. We will send you the date, time and place.',
  'Your Emirates ID and residence are being issued. We will tell you when they are ready to collect or delivered.',
];

export const ROUTE_LABELS = ROUTES.map((r) => r.label);

type Fees = typeof FEE_SCHEDULE;

/** Government fee lines for a file, the same rules as the public calculator. */
export function governmentLines(f: Fees, o: { route: string; location: 'in' | 'out'; adults: number; kids: number; vip: boolean; newFile: boolean }) {
  const lines: { label: string; amount: number }[] = [];
  const person = (who: string, adult: boolean, main: boolean) => {
    lines.push({ label: `${who}: ${f.perPerson.visa.label}`, amount: f.perPerson.visa.aed });
    if (adult) lines.push({ label: `${who}: ${o.vip ? f.medical.vip.label : f.medical.normal.label}`, amount: o.vip ? f.medical.vip.aed : f.medical.normal.aed });
    lines.push({ label: `${who}: ${f.perPerson.emiratesId.label}`, amount: f.perPerson.emiratesId.aed });
    if (o.location === 'in') lines.push({ label: `${who}: ${f.perPerson.changeOfStatus.label}`, amount: f.perPerson.changeOfStatus.aed });
    if (main && ROUTES.find((r) => r.label === o.route)?.valuation) lines.push({ label: f.propertyValuation.label, amount: f.propertyValuation.aed });
  };
  person('Main applicant', true, true);
  for (let i = 1; i <= o.adults; i++) person(`Adult ${i}`, true, false);
  for (let i = 1; i <= o.kids; i++) person(`Child ${i}`, false, false);
  if ((o.adults || o.kids) && o.newFile) lines.push({ label: f.sponsorFile.label, amount: f.sponsorFile.aed });
  return lines;
}

export const money = (n: number) => 'AED ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const when = (iso?: string) => (iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai' }) : '');
export const day = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' }) : '');
