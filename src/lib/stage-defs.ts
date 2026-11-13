// Application steps: the list is edited in Admin > Application steps (add, remove, rename, reorder,
// change the message the client sees). These are the defaults.
export type StageDef = { id: string; name: string; group: string; next: string };
export type StageState = 'done' | 'progress' | 'pending' | 'hold' | 'action' | 'na';

export const STATE_LABEL: Record<StageState, string> = {
  done: 'Completed', progress: 'In progress', pending: 'Pending', hold: 'On hold', action: 'Action required', na: 'Not applicable',
};

const G1 = 'Enquiry, quotation & payment', G2 = 'Immigration & residency processing', G3 = 'Emirates ID & completion';
export const STAGES0: StageDef[] = [
  { id: 'enquiry', group: G1, name: 'Enquiry received', next: 'Thank you for your enquiry. Our team has received your request and will contact you to review your Golden Visa eligibility and required documents.' },
  { id: 'elig-check', group: G1, name: 'Eligibility check', next: 'Our team is reviewing your documents, investment details and eligibility against the applicable Abu Dhabi Golden Visa requirements.' },
  { id: 'elig-ok', group: G1, name: 'Eligibility confirmed', next: 'Your initial eligibility assessment has been completed successfully. Our team will now prepare a detailed quotation and explain the next steps. Final approval remains subject to immigration.' },
  { id: 'quote-sent', group: G1, name: 'Quote sent', next: 'Your Golden Visa quotation has been prepared and shared. Please review the package details, government fees, service charges and estimated processing timeline.' },
  { id: 'quote-ok', group: G1, name: 'Quote accepted', next: 'Thank you for accepting our quotation. We will now arrange payment and prepare your application for submission.' },
  { id: 'pay-wait', group: G1, name: 'Waiting for payment', next: 'Your application is awaiting payment confirmation. Kindly complete the payment using the provided payment instructions so we can proceed.' },
  { id: 'paid', group: G1, name: 'Payment received', next: 'Your payment has been received and recorded. Our processing team will now complete the application preparation and arrange submission to the relevant authority.' },
  { id: 'submitted', group: G2, name: 'Application submitted', next: 'Your Golden Visa application has been submitted to the relevant Abu Dhabi immigration authority. We are monitoring the application and will update you when a decision or additional request is received.' },
  { id: 'entry-permit', group: G2, name: 'Entry permit (pre-approval)', next: 'Your entry permit or initial immigration approval has been issued. Our team will now coordinate the next applicable step, including entry into the UAE or change of status.' },
  { id: 'cos', group: G2, name: 'Change of status', next: 'Your immigration status is being updated to the appropriate residency application status. Once completed, we will coordinate the remaining residency procedures.' },
  { id: 'medical', group: G2, name: 'Health screening (medical test)', next: 'Your medical fitness examination is the next required step. Our team will coordinate the appointment and provide the necessary instructions. We will proceed once the medical results are available.' },
  { id: 'insurance', group: G2, name: 'Health insurance', next: 'We are coordinating the required health insurance coverage and verification for your Abu Dhabi Golden Visa application. Please provide any additional information requested by the insurer.' },
  { id: 'eid-app', group: G2, name: 'Emirates ID application', next: 'Your Emirates ID application is being prepared or submitted. We will share the registration details and coordinate biometrics if required.' },
  { id: 'biometrics', group: G2, name: 'Emirates ID biometrics', next: 'Your Emirates ID biometrics appointment is the next step, where applicable. Please attend at the scheduled time with the required identification documents.' },
  { id: 'approved', group: G2, name: 'Residence approved', next: 'Congratulations! Your Golden Residency application has been approved. We will now monitor the Emirates ID production and delivery process.' },
  { id: 'eid-printed', group: G3, name: 'Emirates ID printed', next: 'Your Emirates ID card has been printed and is awaiting dispatch or courier delivery. Our team will share the delivery arrangements once available.' },
  { id: 'eid-delivered', group: G3, name: 'Emirates ID delivered', next: 'Congratulations! Your Emirates ID has been successfully delivered, and your Golden Visa application is now complete. Thank you for choosing us.' },
];

/** Old 9-step list (position) -> new step id, used once to move existing files over. */
export const LEGACY_IDS = ['enquiry', 'elig-ok', 'paid', 'paid', 'paid', 'submitted', 'entry-permit', 'medical', 'approved'];

/** State of one step in a file: a hand-set state wins. Otherwise the chosen step and all before it are
 *  Completed and the next step is In progress (choosing "Payment received" ticks it and moves the file on). */
export function stageState(i: number, cur: number, id: string, overrides?: Record<string, StageState>, total = Infinity): StageState {
  const o = overrides?.[id];
  if (o) return o;
  if (i <= cur) return 'done';
  return i === cur + 1 && i < total ? 'progress' : 'pending';
}
