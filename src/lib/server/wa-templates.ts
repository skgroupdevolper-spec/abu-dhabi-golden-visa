import 'server-only';
// Creates the WhatsApp message templates in Meta for you (Utility, English) and copies the approved names back.
// Each template uses the same variable order the website sends ({{1}} = first variable of that event, and so on).
import { getSecrets, saveSecrets } from './settings';
import type { WaEvent } from '@/lib/settings-schema';

const GRAPH = 'https://graph.facebook.com/v21.0';

export const META_TPLS: { event: WaEvent; name: string; text: string; ex: string[] }[] = [
  { event: 'leadTeam', name: 'adgv_new_enquiry', text: 'New website enquiry from {{1}} ({{2}}). Service: {{3}}. Message: {{4}}. Please reply soon.', ex: ['Ahmed', '+971501234567', 'Golden Visa property investor', 'I would like to know the fees'] },
  { event: 'welcome', name: 'adgv_file_opened_v2', text: 'Hello {{1}}, your Golden Visa file {{2}} has been opened. You can follow its status and upload your documents here: {{3}} Reply to this message if you have a question.', ex: ['Ahmed', 'ADGV-0001', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'status', name: 'adgv_status_update_v2', text: 'Hello {{1}}, the status of your application {{2}} has changed to: {{3}}. Next step: {{4}}. View your application here: {{5}} This is an automatic service update.', ex: ['Ahmed', 'ADGV-0001', 'Eligibility confirmed', 'We send your written quote', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'quote', name: 'adgv_quote_ready', text: 'Hello {{1}}, your quote for file {{2}} is ready. Total: {{3}}. Review and accept it here: {{4}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'AED 6,795.00', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'confirmed', name: 'adgv_order_confirmed', text: 'Hello {{1}}, your order {{2}} is confirmed. Service: {{3}}. Total: {{4}}. Date: {{5}}. Track your file here: {{6}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Golden Visa property investor', 'AED 6,795.00', '12 Nov 2026', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'payment', name: 'adgv_payment_request', text: 'Hello {{1}}, a payment is due for file {{2}}. For: {{3}}. Amount: {{4}}. Pay securely here: {{5}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Government fees', 'AED 4,000.00', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'paid', name: 'adgv_payment_received', text: 'Hello {{1}}, we received your payment for file {{2}}. For: {{3}}. Amount: {{4}}. Receipt: {{5}}. Track your file here: {{6}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Government fees', 'AED 4,000.00', 'RCPT-0001', 'https://app.abudhabigoldenvisa.com/'] },
  { event: 'message', name: 'adgv_new_message', text: 'Hello {{1}}, your advisor sent a message about file {{2}}: {{3}}. Reply here: {{4}} Thank you.', ex: ['Ahmed', 'ADGV-0001', 'Please upload your passport copy', 'https://app.abudhabigoldenvisa.com/'] },
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
  for (const t of META_TPLS) {
    const r = await graph(`${encodeURIComponent(w.businessId)}/message_templates`, w.accessToken, {
      method: 'POST',
      body: JSON.stringify({ name: t.name, language: 'en', category: 'UTILITY', components: [{ type: 'BODY', text: t.text, example: { body_text: [t.ex] } }] }),
    });
    if (r.ok) done.push(t.name);
    else if (/already exists|duplicate|already (has |)?\w* ?content/i.test(r.err)) had.push(t.name);
    else failed.push(`${t.name}: ${r.err}`);
  }
  const msg = [done.length ? `Sent to Meta for approval: ${done.length}.` : '', had.length ? `Already there: ${had.length}.` : '', failed.length ? `Not accepted: ${failed.join(' | ')}` : '', 'Approval usually takes a few minutes; then press “Check approval”.'].filter(Boolean).join(' ');
  return { ok: failed.length === 0, msg };
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
    if (st === 'APPROVED') names[t.event] = t.name;
    report.push(`${t.name}: ${st.toLowerCase().replace('_', ' ')}${m?.category && m.category !== 'UTILITY' ? ` (moved to ${m.category.toLowerCase()} by Meta)` : ''}`);
  }
  await saveSecrets({ whatsapp: { ...w, templateNames: names, templateLang: 'en' } });
  const ok = report.filter((x) => x.endsWith('approved')).length;
  return { ok: true, msg: `${ok} of ${META_TPLS.length} approved and filled in. ${report.join(' · ')}` };
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
