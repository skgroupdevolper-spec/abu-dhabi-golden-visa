// Customer dashboard and login text in all 20 website languages.
// English is the source; other languages are in portal-i18n-langs.ts. Native-speaker review is recommended.
import { OTHER } from './portal-i18n-langs';

export const EN = {
  signIn: 'Sign in', welcomeBack: 'Welcome back', enterDetails: 'Enter your email and password to continue.',
  email: 'Email', phone: 'WhatsApp number', password: 'Password', forgot: 'Forgot password?',
  newHere: 'New here?', createAccount: 'Create an account', haveAccount: 'Already have an account?', name: 'Full name', register: 'Create my account',
  orRef: 'Have a reference number?', reference: 'Reference', openFile: 'Open my file', needHelp: 'Need help? Chat on WhatsApp',
  leftEyebrow: 'Welcome to Abu Dhabi Golden Visa', leftTitle: 'Sign in to continue.', leftText: 'One place for your residency: quotes, documents, payments and every status update, in your language.',
  tick1: 'Real-time progress and dates', tick2: 'Secure documents and payments', tick3: 'Updates on WhatsApp',
  resetTitle: 'Reset your password', resetText: 'Enter your email. We send a 6-digit code to your WhatsApp or email.', sendCode: 'Send code', code: '6-digit code', newPassword: 'New password', setPassword: 'Set new password', backToLogin: 'Back to sign in',
  myFiles: 'My applications', newRequest: 'Request a new service', chooseService: 'Choose a service', details: 'Anything we should know?', sendRequest: 'Send request',
  requestSent: 'Request sent. An advisor will contact you on WhatsApp.', myRequests: 'My requests', noFiles: 'No applications yet. Request a service to get started.',
  signOut: 'Sign out', hello: 'Hello', step: 'Step', of: 'of', next: 'Next', expected: 'expected',
  status: 'Status', quote: 'Quote', payments: 'Payments', documents: 'Documents', messages: 'Messages', progress: 'Progress',
  yourQuote: 'Your quote', quotePreparing: 'Your advisor is preparing your written quote.', total: 'Total', serviceFee: 'Service fee', vat: 'VAT 5% on service fee', insurance: 'Health insurance',
  feesNote: 'Government fees are paid in AED and can change; we confirm any change before you pay.', accept: 'Accept quote', accepted: 'Accepted', downloadQuote: 'Download quote (PDF)',
  noPayments: 'No payments yet.', payNow: 'Pay now', getPayLink: 'Get payment link', requested: 'requested', paid: 'paid', receipt: 'Receipt',
  pleaseUpload: 'Please upload:', whichDoc: 'Which document?', other: 'Other', fileHint: 'File (PDF or photo, up to 15 MB)', upload: 'Upload', fromAdvisor: 'From your advisor', byYou: 'Uploaded by you', download: 'Download',
  advisorPosts: 'Your advisor will post updates here.', writeAdvisor: 'Write to your advisor', send: 'Send', you: 'You', yourAdvisor: 'Your advisor',
  yourDetails: 'Your details', route: 'Route', applyingFrom: 'Applying from', inside: 'Inside the UAE', outside: 'Outside the UAE', people: 'People in this file',
  issued: 'your residency is issued.', whereStand: 'here is where things stand.', yourFile: 'Your Golden Visa file',
  profile: 'My profile', language: 'Language', save: 'Save', saved: 'Saved.', currentPassword: 'Current password',
  wrongLogin: 'Email or password is not correct.', exists: 'An account with this email already exists. Please sign in.', weak: 'Use at least 8 characters.', invalid: 'Please check the details.',
  codeSent: 'If the account exists, we sent a code to its WhatsApp or email.', badCode: 'The code is not correct or has expired.', passwordChanged: 'Password changed. Please sign in.', tooMany: 'Too many attempts. Please try again later.',
  open: 'Open', received: 'Received', inProgress: 'In progress', back: 'Back',
  stages: ['Enquiry received', 'Eligibility confirmed', 'Quote accepted and paid', 'Documents and attestation', 'Nomination or valuation certificate', 'Application submitted', 'Entry permit or change of status', 'Medical and biometrics', 'Emirates ID and residence issued'],
};

export type Dict = typeof EN;

export const PORTAL_LANGS: { code: string; native: string; dir: 'ltr' | 'rtl'; html: string }[] = [
  { code: 'en', native: 'English', dir: 'ltr', html: 'en' }, { code: 'ar', native: 'العربية', dir: 'rtl', html: 'ar' },
  { code: 'ru', native: 'Русский', dir: 'ltr', html: 'ru' }, { code: 'tr', native: 'Türkçe', dir: 'ltr', html: 'tr' },
  { code: 'zh', native: '中文', dir: 'ltr', html: 'zh' }, { code: 'fr', native: 'Français', dir: 'ltr', html: 'fr' },
  { code: 'de', native: 'Deutsch', dir: 'ltr', html: 'de' }, { code: 'it', native: 'Italiano', dir: 'ltr', html: 'it' },
  { code: 'es', native: 'Español', dir: 'ltr', html: 'es' }, { code: 'ro', native: 'Română', dir: 'ltr', html: 'ro' },
  { code: 'pt', native: 'Português', dir: 'ltr', html: 'pt' }, { code: 'at', native: 'Deutsch (Österreich)', dir: 'ltr', html: 'de-AT' },
  { code: 'pl', native: 'Polski', dir: 'ltr', html: 'pl' }, { code: 'hu', native: 'Magyar', dir: 'ltr', html: 'hu' },
  { code: 'hr', native: 'Hrvatski', dir: 'ltr', html: 'hr' }, { code: 'sk', native: 'Slovenčina', dir: 'ltr', html: 'sk' },
  { code: 'cs', native: 'Čeština', dir: 'ltr', html: 'cs' }, { code: 'hi', native: 'हिन्दी', dir: 'ltr', html: 'hi' },
  { code: 'id', native: 'Bahasa Indonesia', dir: 'ltr', html: 'id' }, { code: 'ur', native: 'اردو', dir: 'rtl', html: 'ur' },
];

export function dict(code?: string | null): Dict {
  const c = code === 'at' ? 'de' : code || 'en';
  const o = OTHER[c];
  return o ? { ...EN, ...o, stages: o.stages ?? EN.stages } : EN;
}
export function langInfo(code?: string | null) {
  return PORTAL_LANGS.find((l) => l.code === code) ?? PORTAL_LANGS[0];
}
