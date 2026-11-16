import 'server-only';
// Creates the WhatsApp message templates in Meta for you (Utility, English) and copies the approved names back.
// Each template uses the same variable order the website sends ({{1}} = first variable of that event, and so on).
import { getSecrets, saveSecrets } from './settings';
import type { WaEvent } from '@/lib/settings-schema';

const GRAPH = 'https://graph.facebook.com/v21.0';

export const META_TPLS: { event: WaEvent; name: string; text: string; ex: string[]; header?: 'DOCUMENT'; buttons?: { text: string; url: string; ex: string }[] }[] = [
  // Company alert: {{1}} is your own edited text (Admin > WhatsApp), the buttons open a chat with the client and the file in the admin.
  { event: 'leadTeam', name: 'adgv_team_alert_v1', text: 'New alert from your website: {{1}} Please follow up with the client soon.', ex: ['New application ADGV-0001 · Ahmed · +971501234567 · Golden Visa property investor'],
    buttons: [{ text: 'Chat with client', url: 'https://www.abudhabigoldenvisa.com/chat/{{1}}', ex: 'https://www.abudhabigoldenvisa.com/chat/971501234567' }, { text: 'Open in admin', url: 'https://www.abudhabigoldenvisa.com/admin/{{1}}', ex: 'https://www.abudhabigoldenvisa.com/admin/leads/' }] },
  { event: 'leadTeam', name: 'adgv_new_enquiry', text: 'New website enquiry from {{1}} ({{2}}). Service: {{3}}. Message: {{4}}. Please reply soon.', ex: ['Ahmed', '+971501234567', 'Golden Visa property investor', 'I would like to know the fees'] },
  // Client messages with a button that opens the client's file (like the company alert). Listed first: used once approved.
  { event: 'welcome', name: 'adgv_file_opened_btn_v1', text: 'Hello {{1}}, your file {{2}} for {{3}} has been opened. Tap the button below to follow its status and upload your documents. Reply to this message if you have a question.', ex: ['Ahmed', 'ADGV-0001', 'Employment visa'], buttons: [{ text: 'Open my file', url: 'https://app.abudhabigoldenvisa.com/{{1}}', ex: 'https://app.abudhabigoldenvisa.com/t/abc123/' }] },
  { event: 'status', name: 'adgv_status_update_btn_v1', text: 'Hello {{1}}, the status of your application {{2}} has changed to: {{3}}. Next step: {{4}}. Tap the button below to view your application. This is an automatic service update.', ex: ['Ahmed', 'ADGV-0001', 'Eligibility confirmed', 'We send your written quote'], buttons: [{ text: 'View my application', url: 'https://app.abudhabigoldenvisa.com/{{1}}', ex: 'https://app.abudhabigoldenvisa.com/t/abc123/' }] },
  { event: 'quote', name: 'adgv_quote_ready_btn_v1', text: 'Hello {{1}}, your quote for file {{2}} is ready. Total: {{3}}. Tap the button below to review and accept it. Thank you.', ex: ['Ahmed', 'ADGV-0001', 'AED 6,795.00'], buttons: [{ text: 'View my quote', url: 'https://app.abudhabigoldenvisa.com/{{1}}', ex: 'https://app.abudhabigoldenvisa.com/t/abc123/' }] },
  { event: 'confirmed', name: 'adgv_order_confirmed_btn_v1', text: 'Hello {{1}}, your order {{2}} is confirmed. Service: {{3}}. Total: {{4}}. Date: {{5}}. Tap the button below to track your file. Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Golden Visa property investor', 'AED 6,795.00', '12 Nov 2026'], buttons: [{ text: 'Track my file', url: 'https://app.abudhabigoldenvisa.com/{{1}}', ex: 'https://app.abudhabigoldenvisa.com/t/abc123/' }] },
  { event: 'payment', name: 'adgv_payment_request_btn_v1', text: 'Hello {{1}}, a payment is due for file {{2}}. For: {{3}}. Amount: {{4}}. Tap the button below to pay securely. Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Government fees', 'AED 4,000.00'], buttons: [{ text: 'Pay now', url: 'https://app.abudhabigoldenvisa.com/{{1}}', ex: 'https://app.abudhabigoldenvisa.com/t/abc123/' }] },
  { event: 'paid', name: 'adgv_payment_received_btn_v1', text: 'Hello {{1}}, we received your payment for file {{2}}. For: {{3}}. Amount: {{4}}. Receipt: {{5}}. Tap the button below to track your file. Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Government fees', 'AED 4,000.00', 'RCPT-0001'], buttons: [{ text: 'Track my file', url: 'https://app.abudhabigoldenvisa.com/{{1}}', ex: 'https://app.abudhabigoldenvisa.com/t/abc123/' }] },
  { event: 'message', name: 'adgv_new_message_btn_v1', text: 'Hello {{1}}, your advisor sent a message about file {{2}}: {{3}}. Tap the button below to reply. Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Please upload your passport copy'], buttons: [{ text: 'Reply to advisor', url: 'https://app.abudhabigoldenvisa.com/{{1}}', ex: 'https://app.abudhabigoldenvisa.com/t/abc123/' }] },
  { event: 'welcome', name: 'adgv_file_opened_v3', text: 'Hello {{1}}, your file {{2}} for {{3}} has been opened. You can follow its status and upload your documents here: {{4}} Reply to this message if you have a question.', ex: ['Ahmed', 'ADGV-0001', 'Employment visa', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'status', name: 'adgv_status_update_v2', text: 'Hello {{1}}, the status of your application {{2}} has changed to: {{3}}. Next step: {{4}}. View your application here: {{5}} This is an automatic service update.', ex: ['Ahmed', 'ADGV-0001', 'Eligibility confirmed', 'We send your written quote', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'quote', name: 'adgv_quote_ready', text: 'Hello {{1}}, your quote for file {{2}} is ready. Total: {{3}}. Review and accept it here: {{4}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'AED 6,795.00', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'confirmed', name: 'adgv_order_confirmed', text: 'Hello {{1}}, your order {{2}} is confirmed. Service: {{3}}. Total: {{4}}. Date: {{5}}. Track your file here: {{6}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Golden Visa property investor', 'AED 6,795.00', '12 Nov 2026', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'payment', name: 'adgv_payment_request', text: 'Hello {{1}}, a payment is due for file {{2}}. For: {{3}}. Amount: {{4}}. Pay securely here: {{5}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Government fees', 'AED 4,000.00', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'paid', name: 'adgv_payment_received', text: 'Hello {{1}}, we received your payment for file {{2}}. For: {{3}}. Amount: {{4}}. Receipt: {{5}}. Track your file here: {{6}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Government fees', 'AED 4,000.00', 'RCPT-0001', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'message', name: 'adgv_new_message', text: 'Hello {{1}}, your advisor sent a message about file {{2}}: {{3}}. Reply here: {{4}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Please upload your passport copy', 'https://app.abudhabigoldenvisa.com/'] },
  // The file itself is attached to this message (document header), like the email attachment.
  { event: 'document', name: 'adgv_document_file_v1', header: 'DOCUMENT', text: 'Hello {{1}}, a new document is ready on file {{2}}: {{3}}. It is attached to this message and saved in your dashboard: {{4}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Entry permit', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'document', name: 'adgv_new_document', text: 'Hello {{1}}, a new document is ready on file {{2}}: {{3}}. View it here: {{4}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Entry permit', 'https://app.abudhabigoldenvisa.com/'] },
];

async function graph(path: string, token: string, init?: RequestInit) {
  const r = await fetch(`${GRAPH}/${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(20000) });
  const j = (await r.json().catch(() => ({}))) as { error?: { message?: string; error_user_msg?: string }; [k: string]: unknown };
  return { ok: r.ok, j, err: j.error?.error_user_msg || j.error?.message || `HTTP ${r.status}` };
}

/** Sends every template to Meta for approval. Templates that already exist are left as they are. */
export async function createMetaTemplates() {
  const w = (await getSecrets()).whatsapp;
  if (!w.businessId || !w.accessToken) return { ok: false, msg: 'Add the WhatsApp Business account ID and the access token first.' };
  const done: string[] = [], had: string[] = [], failed: string[] = [];
  let handle = '';
  for (const t of META_TPLS) {
    const comps: unknown[] = [{ type: 'BODY', text: t.text, example: { body_text: [t.ex] } }];
    if (t.buttons) comps.push({ type: 'BUTTONS', buttons: t.buttons.map((b) => ({ type: 'URL', text: b.text, url: b.url, example: [b.ex] })) });
    if (t.header === 'DOCUMENT') {
      handle ||= await sampleDocHandle(w.accessToken).catch((e) => { failed.push(`${t.name}: sample file upload failed (${(e as Error).message})`); return ''; });
      if (!handle) continue;
      comps.unshift({ type: 'HEADER', format: 'DOCUMENT', example: { header_handle: [handle] } });
    }
    const r = await graph(`${encodeURIComponent(w.businessId)}/message_templates`, w.accessToken, {
      method: 'POST',
      body: JSON.stringify({ name: t.name, language: 'en', category: 'UTILITY', components: comps }),
    });
    if (r.ok) done.push(t.name);
    else if (/already exists|duplicate|already (has |)?\w* ?content/i.test(r.err)) had.push(t.name);
    else failed.push(`${t.name}: ${r.err}`);
  }
  const msg = [done.length ? `Sent to Meta for approval: ${done.length}.` : '', had.length ? `Already there: ${had.length}.` : '', failed.length ? `Not accepted: ${failed.join(' | ')}` : '', 'Approval usually takes a few minutes; then press “Check approval”.'].filter(Boolean).join(' ');
  return { ok: failed.length === 0, msg };
}

/** Meta needs an example file for a template with a document header: a small sample PDF is uploaded
 *  with the resumable upload API of your app and its handle is returned. */
async function sampleDocHandle(token: string): Promise<string> {
  const app = await graph('app', token);
  const appId = (app.j as { id?: string }).id;
  if (!app.ok || !appId) throw new Error(app.err || 'app id not found');
  const { PDFDocument, StandardFonts } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([420, 300]);
  page.drawText('Sample document - Abu Dhabi Golden Visa', { x: 30, y: 250, size: 14, font: await pdf.embedFont(StandardFonts.Helvetica) });
  const bytes = await pdf.save();
  const s = await graph(`${appId}/uploads?file_name=sample.pdf&file_length=${bytes.length}&file_type=application/pdf`, token, { method: 'POST' });
  const sid = (s.j as { id?: string }).id;
  if (!s.ok || !sid) throw new Error(s.err || 'no upload session');
  const r = await fetch(`${GRAPH}/${sid}`, { method: 'POST', headers: { Authorization: `OAuth ${token}`, file_offset: '0' }, body: Buffer.from(bytes), signal: AbortSignal.timeout(20000) });
  const j = (await r.json().catch(() => ({}))) as { h?: string; error?: { message?: string } };
  if (!r.ok || !j.h) throw new Error(j.error?.message || `HTTP ${r.status}`);
  return j.h;
}

/** Reads the templates from Meta and fills in the names of the approved ones. */
export async function syncMetaTemplates() {
  const w = (await getSecrets()).whatsapp;
  if (!w.businessId || !w.accessToken) return { ok: false, msg: 'Add the WhatsApp Business account ID and the access token first.' };
  const r = await graph(`${encodeURIComponent(w.businessId)}/message_templates?fields=name,status,language,category&limit=250`, w.accessToken);
  if (!r.ok) return { ok: false, msg: `Meta said: ${r.err}` };
  const rows = ((r.j.data as { name: string; status: string; language: string; category?: string }[]) ?? []);
  const names = { ...(w.templateNames ?? {}) };
  const report: string[] = [];
  for (const t of META_TPLS) {
    const m = rows.find((x) => x.name === t.name);
    const st = m?.status ?? 'NOT CREATED';
    // Templates Meta moved to MARKETING are throttled for repeat updates, so they are not used: those
    // messages go out through the approved "new message" utility template instead.
    const better = META_TPLS.find((x) => x.event === t.event && x.name === names[t.event]);
    const takenByBetter = better && better !== t && META_TPLS.indexOf(better) < META_TPLS.indexOf(t) && rows.find((x) => x.name === better.name)?.status === 'APPROVED';
    if (st === 'APPROVED' && (!m?.category || m.category === 'UTILITY') && !takenByBetter) names[t.event] = t.name;
    else if (m?.category && m.category !== 'UTILITY' && names[t.event] === t.name) delete names[t.event];
    report.push(`${t.name}: ${st.toLowerCase().replace('_', ' ')}${m?.category && m.category !== 'UTILITY' ? ` (moved to ${m.category.toLowerCase()} by Meta)` : ''}`);
  }
  await saveSecrets({ whatsapp: { ...w, templateNames: names, templateLang: 'en' } });
  const ok = report.filter((x) => x.endsWith('approved')).length;
  return { ok: true, msg: `${ok} of ${META_TPLS.length} approved and filled in. ${report.join(' · ')}` };
}

/** Registers the phone number for sending (needed once for a new number, after its SMS verification).
 *  The 6-digit PIN becomes the number's two-step verification PIN; keep it safe. */
export async function registerNumber(pin: string) {
  const w = (await getSecrets()).whatsapp;
  if (!w.phoneNumberId || !w.accessToken) return { ok: false, msg: 'Add the Phone number ID and the access token first.' };
  if (!/^\d{6}$/.test(pin)) return { ok: false, msg: 'Enter a 6-digit PIN.' };
  const r = await graph(`${encodeURIComponent(w.phoneNumberId)}/register`, w.accessToken, { method: 'POST', body: JSON.stringify({ messaging_product: 'whatsapp', pin }) });
  if (!r.ok) return { ok: false, msg: `Meta said: ${r.err}` };
  return { ok: true, msg: 'Number registered. It can now send messages. Keep this PIN: it is the two-step verification PIN of the number.' };
}

/** Connects your app to the WhatsApp Business account so client replies reach the website (needed once). */
export async function subscribeWebhooks() {
  const w = (await getSecrets()).whatsapp;
  if (!w.businessId || !w.accessToken) return { ok: false, msg: 'Add the WhatsApp Business account ID and the access token first.' };
  const r = await graph(`${encodeURIComponent(w.businessId)}/subscribed_apps`, w.accessToken, { method: 'POST', body: '{}' });
  if (!r.ok) return { ok: false, msg: `Meta said: ${r.err}` };
  await saveSecrets({ whatsapp: { ...w, webhookSubscribedAt: new Date().toISOString() } });
  const chk = await graph(`${encodeURIComponent(w.businessId)}/subscribed_apps`, w.accessToken);
  const n = ((chk.j.data as unknown[]) ?? []).length;
  return { ok: true, msg: `Incoming messages connected (${n} app${n === 1 ? '' : 's'} subscribed). Send a WhatsApp message to your business number to test: it appears in the Message log.` };
}

/** Checks the token, the phone number and the business account, and lists the numbers this token can use. */
export async function checkConnection() {
  const w = (await getSecrets()).whatsapp;
  if (!w.accessToken) return { ok: false, msg: 'Add the access token first.' };
  const out: string[] = [];
  let ok = true;
  if (w.phoneNumberId) {
    const p = await graph(`${encodeURIComponent(w.phoneNumberId)}?fields=display_phone_number,verified_name,quality_rating,name_status`, w.accessToken);
    if (p.ok) out.push(`Phone number ID works: ${p.j.display_phone_number} (${p.j.verified_name}), quality ${String(p.j.quality_rating ?? '-').toLowerCase()}, name ${String(p.j.name_status ?? '-').toLowerCase().replace(/_/g, ' ')}.`);
    else { ok = false; out.push(`Phone number ID ${w.phoneNumberId} cannot be used with this token: ${p.err}`); }
  }
  if (w.businessId) {
    // Billing: business-started messages (templates) need a payment method on THIS WhatsApp account.
    const a = await graph(`${encodeURIComponent(w.businessId)}?fields=name,currency,account_review_status,business_verification_status,primary_funding_id,ownership_type`, w.accessToken);
    if (a.ok) {
      const fund = a.j.primary_funding_id;
      out.push(`WhatsApp account “${a.j.name}”: review ${String(a.j.account_review_status ?? '-').toLowerCase()}, business verification ${String(a.j.business_verification_status ?? '-').toLowerCase().replace(/_/g, ' ')}, currency ${a.j.currency ?? '-'}, payment method ${fund ? `linked (${fund})` : 'NOT LINKED'}.`);
      if (!fund) { ok = false; out.push('No payment method is linked to this WhatsApp account, so messages to new clients are blocked. Open WhatsApp Manager → Overview → Payment settings for THIS account (not your ads account) and add a card.'); }
    } else out.push(`Billing details could not be read: ${a.err}`);
    const n = await graph(`${encodeURIComponent(w.businessId)}/phone_numbers?fields=id,display_phone_number,verified_name`, w.accessToken);
    if (n.ok) {
      const rows = (n.j.data as { id: string; display_phone_number: string; verified_name: string }[]) ?? [];
      out.push(rows.length ? `Numbers this token can use: ${rows.map((r) => `${r.display_phone_number} (${r.verified_name}) → ID ${r.id}`).join(' · ')}` : 'This token sees no phone numbers in the business account.');
      if (w.phoneNumberId && rows.length && !rows.some((r) => r.id === w.phoneNumberId)) { ok = false; out.push('Your saved Phone number ID is not in that list: copy the right ID from above into Setup and Save.'); }
    } else { ok = false; out.push(`Business account ID ${w.businessId} cannot be read with this token: ${n.err}. In Business settings → System users → your user → Assign assets, give it Full control of the WhatsApp account, then generate a new token.`); }
  }
  return { ok, msg: out.join(' ') };
}
