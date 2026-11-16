// Emails sent automatically, one per event. Text is edited in Admin > Emails & PDFs.
// Lines written as "Label: value" show as a neat table; a line with only a link becomes a button.
export type MailEvent = 'welcome' | 'status' | 'quote' | 'confirmed' | 'payment' | 'paid' | 'message' | 'document' | 'decision' | 'reset' | 'account' | 'teamLead' | 'bookingNew' | 'bookingConfirmed' | 'bookingMoved' | 'bookingCancelled';
export type MailTpl = { on: boolean; subject: string; badge: string; body: string };

export const MAIL_EVENTS: { key: MailEvent; label: string; to: 'client' | 'team'; vars: string }[] = [
  { key: 'welcome', label: 'Application received', to: 'client', vars: '{name} {ref} {service} {link}' },
  { key: 'account', label: 'Client account created', to: 'client', vars: '{name} {email} {link}' },
  { key: 'status', label: 'Status update', to: 'client', vars: '{name} {ref} {status} {next} {expected} {link}' },
  { key: 'quote', label: 'Quote ready', to: 'client', vars: '{name} {ref} {route} {total} {link}' },
  { key: 'confirmed', label: 'Order confirmed (quote accepted)', to: 'client', vars: '{name} {ref} {route} {total} {date} {link}' },
  { key: 'payment', label: 'Payment request', to: 'client', vars: '{name} {ref} {item} {amount} {link}' },
  { key: 'paid', label: 'Payment received', to: 'client', vars: '{name} {ref} {item} {amount} {receipt} {link}' },
  { key: 'message', label: 'New message from the advisor', to: 'client', vars: '{name} {ref} {text} {link}' },
  { key: 'document', label: 'New document shared', to: 'client', vars: '{name} {ref} {document} {link}' },
  { key: 'decision', label: 'Authority decision', to: 'client', vars: '{name} {ref} {status} {text} {reason} {next} {link}' },
  { key: 'reset', label: 'Password reset code', to: 'client', vars: '{name} {code}' },
  { key: 'bookingNew', label: 'Appointment booked (received)', to: 'client', vars: '{name} {ref} {date} {time} {type} {place} {service}' },
  { key: 'bookingConfirmed', label: 'Appointment confirmed', to: 'client', vars: '{name} {ref} {date} {time} {type} {place} {service}' },
  { key: 'bookingMoved', label: 'Appointment moved to a new time', to: 'client', vars: '{name} {ref} {date} {time} {old} {type} {place} {service}' },
  { key: 'bookingCancelled', label: 'Appointment cancelled', to: 'client', vars: '{name} {ref} {date} {time} {type} {service}' },
  { key: 'teamLead', label: 'New enquiry or application (to your team)', to: 'team', vars: '{name} {phone} {email} {service} {message} {link}' },
];

export const MAIL_TPL0: Record<MailEvent, MailTpl> = {
  welcome: { on: true, subject: 'We received your application {ref}', badge: 'Application received',
    body: 'Hello {name},\n\nThank you for choosing us. We have received your application and your advisor will review it shortly.\n\nReference: {ref}\nService: {service}\nNext step: Your advisor reviews your documents and sends the written quote.\n\nFollow your application, upload documents and message your advisor here:\n{link}' },
  account: { on: true, subject: 'Your client account is ready', badge: 'Account created',
    body: 'Hello {name},\n\nYour client account is ready. Sign in any time to follow your application, pay securely and download your documents.\n\nLogin email: {email}\n\nOpen your dashboard:\n{link}' },
  status: { on: true, subject: 'Status update {ref}: {status}', badge: '{status}',
    body: 'Hello {name},\n\nYour application has moved to the next step.\n\nReference: {ref}\nCurrent step: {status}\nNext step: {next}\nExpected: {expected}\n\nSee the full progress here:\n{link}' },
  quote: { on: true, subject: 'Your quote {ref} is ready', badge: 'Quote ready',
    body: 'Hello {name},\n\nYour written quote is ready to review.\n\nReference: {ref}\nService: {route}\nTotal: {total}\n\nReview, accept and download it as a PDF here:\n{link}' },
  confirmed: { on: true, subject: 'Order confirmed {ref}', badge: 'Order confirmed',
    body: 'Hello {name},\n\nThank you, your order is confirmed. We are starting work on your file.\n\nReference: {ref}\nService: {route}\nTotal: {total}\nConfirmed on: {date}\n\nFollow every step here:\n{link}' },
  payment: { on: true, subject: 'Payment request {ref}: {amount}', badge: 'Payment request',
    body: 'Hello {name},\n\nA payment is due for your application.\n\nReference: {ref}\nFor: {item}\nAmount: {amount}\n\nPay securely by card:\n{link}' },
  paid: { on: true, subject: 'Payment received {receipt}', badge: 'Payment received',
    body: 'Hello {name},\n\nWe received your payment, thank you.\n\nReference: {ref}\nFor: {item}\nAmount: {amount}\nReceipt: {receipt}\n\nDownload your receipt here:\n{link}' },
  message: { on: true, subject: 'New message about {ref}', badge: 'New message',
    body: 'Hello {name},\n\nYour advisor sent you a message:\n\n"{text}"\n\nReply in your dashboard:\n{link}' },
  document: { on: true, subject: 'New document for {ref}', badge: 'New document',
    body: 'Hello {name},\n\nWe shared a new document with you.\n\nReference: {ref}\nDocument: {document}\n\nView and download it here:\n{link}' },
  decision: { on: true, subject: 'Application {ref}: {status}', badge: '{status}',
    body: 'Hello {name},\n\n{text}\n\nReference: {ref}\nDecision: {status}\nReason: {reason}\nNext step: {next}\n\nSee the details here:\n{link}' },
  reset: { on: true, subject: 'Your login code', badge: 'Login code',
    body: 'Hello {name},\n\nUse this code to set a new password. It expires in 15 minutes.\n\nCode: {code}\n\nIf you did not ask for this, you can ignore this email.' },
  bookingNew: { on: true, subject: 'We received your appointment request {ref}', badge: 'Appointment booked',
    body: 'Hello {name},\n\nThank you, we received your appointment request. Your advisor will confirm it shortly.\n\nReference: {ref}\nDate: {date}\nTime: {time} (UAE time)\nType: {type}\nWhere: {place}\nService: {service}\n\nNeed to change the time? Just reply to this email or message us on WhatsApp.' },
  bookingConfirmed: { on: true, subject: 'Your appointment {ref} is confirmed', badge: 'Appointment confirmed',
    body: 'Hello {name},\n\nYour appointment is confirmed. We look forward to speaking with you.\n\nReference: {ref}\nDate: {date}\nTime: {time} (UAE time)\nType: {type}\nWhere: {place}\nService: {service}\n\nNeed to change the time? Just reply to this email or message us on WhatsApp.' },
  bookingMoved: { on: true, subject: 'New time for your appointment {ref}', badge: 'Appointment moved',
    body: 'Hello {name},\n\nYour appointment has been moved to a new time.\n\nReference: {ref}\nNew date: {date}\nNew time: {time} (UAE time)\nBefore: {old}\nType: {type}\nWhere: {place}\n\nIf this time does not suit you, reply to this email or message us on WhatsApp.' },
  bookingCancelled: { on: true, subject: 'Your appointment {ref} is cancelled', badge: 'Appointment cancelled',
    body: 'Hello {name},\n\nYour appointment has been cancelled.\n\nReference: {ref}\nDate: {date}\nTime: {time} (UAE time)\n\nWould you like a new time? Reply to this email or message us on WhatsApp and we will book it for you.' },
  teamLead: { on: true, subject: 'New enquiry: {name} ({service})', badge: 'New enquiry',
    body: 'A new enquiry arrived on the website.\n\nName: {name}\nPhone: {phone}\nEmail: {email}\nService: {service}\n\n{message}\n\nOpen it in the admin:\n{link}' },
};

/** Fills {vars}; a "Label: {var}" line whose value is empty is left out. */
export function fillTpl(text: string, vars: Record<string, string | number | undefined>) {
  return text
    .split('\n')
    .filter((l) => { const m = l.match(/^[A-Z][^:]{1,32}:\s*\{(\w+)\}\s*$/); return !m || String(vars[m[1]] ?? '').trim() !== ''; })
    .join('\n')
    .replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
