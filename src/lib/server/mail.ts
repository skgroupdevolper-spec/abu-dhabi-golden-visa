import 'server-only';
import { getSecrets } from './settings';
import { docCfg, type MailCfg } from './doccfg';
import { SITE } from '@/lib/site';
import { fillTpl, type MailEvent } from '@/lib/mail-events';
import type { Transporter } from 'nodemailer';

export type MailOpts = { badge?: string; title?: string };

/** Sends an email through the SMTP account set in the admin. Silently skips when it is not set up.
 *  Every email goes out as a branded card (white, gold and black) with the plain text kept for simple mail apps. */
export async function sendMail(to: string, subject: string, text: string, opts: MailOpts = {}) {
  const m = (await getSecrets()).smtp;
  if (!m.host || !m.user || !m.pass || !to) return { ok: false, error: 'Email is not set up' };
  try {
    const t = await transport(m);
    const html = renderMail(subject, text, (await docCfg()).mail, opts);
    await t.sendMail({ from: m.from || m.user, to, subject, text: cleanText(text), html });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// One reusable SMTP connection (pooled), rebuilt only when the email settings change: much faster than connecting per email.
let cached: { key: string; t: Transporter } | null = null;
async function transport(m: { host: string; port: number; secure: boolean; user: string; pass: string }) {
  const key = `${m.host}|${m.port}|${m.secure}|${m.user}|${m.pass}`;
  if (cached?.key === key) return cached.t;
  const nodemailer = await import('nodemailer');
  cached?.t.close();
  const t = nodemailer.createTransport({ pool: true, maxConnections: 3, host: m.host, port: Number(m.port) || 465, secure: !!m.secure, auth: { user: m.user, pass: m.pass }, connectionTimeout: 15000, greetingTimeout: 10000, socketTimeout: 20000 });
  cached = { key, t };
  return t;
}

/** Sends the email for one event, using the text set in Admin > Emails & PDFs. Never throws. */
export async function mailEvent(to: string | undefined, event: MailEvent, vars: Record<string, string | number | undefined>) {
  try {
    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { ok: false, error: 'No email' };
    const c = (await docCfg()).mail;
    const tpl = c.events[event];
    if (!tpl?.on) return { ok: false, error: 'This email is switched off' };
    const v = { ...vars };
    return await sendMail(to, fillTpl(tpl.subject, v).slice(0, 200), fillTpl(tpl.body, v), { badge: fillTpl(tpl.badge, v), title: event === 'teamLead' ? 'Team notice' : undefined });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Team copy of an event email (to the notification address in Admin > Settings > Email). */
export async function mailEventTeam(event: MailEvent, vars: Record<string, string | number | undefined>) {
  const m = (await getSecrets()).smtp;
  return m.notify ? mailEvent(m.notify, event, vars) : { ok: false, error: 'No notification email set' };
}

export async function mailTeam(subject: string, text: string) {
  const m = (await getSecrets()).smtp;
  return m.notify ? sendMail(m.notify, subject, text, { title: 'Team notice' }) : { ok: false, error: 'No notification email set' };
}

/* ---------- branded HTML ---------- */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (u: string) => (/^https?:\/\//.test(u) ? u : `${(SITE.url || '').replace(/\/$/, '')}${u.startsWith('/') ? '' : '/'}${u}`);
const linkify = (s: string, gold: string) => esc(s).replace(/(https?:\/\/[^\s<]+)/g, `<a href="$1" style="color:${gold};font-weight:600;text-decoration:none">$1</a>`);
const isUrl = (s: string) => /^https?:\/\/\S+$/.test(s.trim());
const ROW = /^([A-Z][A-Za-z0-9 ()/.&'-]{1,32}):\s+(.+)$/;
const SIGN = /^(kind regards|regards|best regards|thank you|thanks),?$/i;

/** Plain text without the old sign-off and the disclaimer line (the disclaimer lives on /disclaimer/ only). */
function cleanText(text: string) {
  return text.split('\n').filter((l) => !/^not an official uae government website\.?$/i.test(l.trim())).join('\n');
}

type Block = { k: 'hello'; v: string } | { k: 'p'; v: string } | { k: 'rows'; v: [string, string][] } | { k: 'btn'; v: string; cap?: string };

function parse(text: string): Block[] {
  let lines = cleanText(text).split('\n');
  const si = lines.findIndex((l) => SIGN.test(l.trim()));
  if (si > 0) lines = lines.slice(0, si);
  const out: Block[] = [];
  let para: string[] = [];
  const flush = () => { if (para.length) { out.push({ k: 'p', v: para.join('\n') }); para = []; } };
  lines.forEach((raw, i) => {
    const l = raw.trim();
    if (!l) { flush(); return; }
    if (i === 0 && /^(hello|dear|hi)\b/i.test(l)) { out.push({ k: 'hello', v: l }); return; }
    if (isUrl(l)) {
      // "Follow your file here:" + link -> caption + button
      const cap = para.length && para[para.length - 1].endsWith(':') ? para.pop() : undefined;
      flush();
      out.push({ k: 'btn', v: l, cap });
      return;
    }
    const m = l.match(ROW);
    if (m && !/^https?$/i.test(m[1])) {
      flush();
      const last = out[out.length - 1];
      if (last?.k === 'rows') last.v.push([m[1], m[2]]); else out.push({ k: 'rows', v: [[m[1], m[2]]] });
      return;
    }
    para.push(l);
  });
  flush();
  return out;
}

export function renderMail(subject: string, text: string, c: MailCfg, o: MailOpts = {}) {
  const gold = c.accent || '#b8901f', ink = '#111111', soft = '#6b6252', line = '#efe6cf', cream = '#fbf7ec';
  const logo = abs(SITE.brand?.logo || '/brand/logo-pdf.png');
  const badge = (o.badge || subject.replace(/\s*·\s*Abu Dhabi Golden Visa$/i, '')).slice(0, 90);
  const blocks = parse(text);
  const body = blocks.map((b) => {
    if (b.k === 'hello') {
      const m = b.v.match(/^(\w+)\s+(.+?)(,?)$/);
      return `<p style="margin:0 0 14px;font-size:17px;color:${ink}">${m ? `${esc(m[1])} <b>${esc(m[2])}</b>${m[3]}` : esc(b.v)}</p>`;
    }
    if (b.k === 'p') return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#333">${linkify(b.v, gold).replace(/\n/g, '<br>')}</p>`;
    if (b.k === 'rows') return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:6px 0 18px;border:1px solid ${line}">${b.v.map(([k, v], i) => `<tr><td style="padding:11px 14px;background:${cream};border-top:${i ? `1px solid ${line}` : '0'};font-size:14px;font-weight:600;color:${soft};width:38%">${esc(k)}</td><td style="padding:11px 14px;border-top:${i ? `1px solid ${line}` : '0'};font-size:14px;color:${ink}">${linkify(v, gold)}</td></tr>`).join('')}</table>`;
    return `${b.cap ? `<p style="margin:4px 0 10px;font-size:15px;color:#333">${esc(b.cap)}</p>` : ''}<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px"><tr><td style="background:${gold};border-radius:8px"><a href="${esc(b.v)}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:700;color:${ink};text-decoration:none">${esc(c.buttonLabel || 'Open')} &rarr;</a></td></tr></table>`;
  }).join('');

  const wa = SITE.whatsapp ? `https://wa.me/${String(SITE.whatsapp).replace(/\D/g, '')}` : '';
  const help = c.showWhatsApp && wa ? `<tr><td align="center" style="padding:8px 32px 28px">
      <p style="margin:0 0 12px;font-size:15px;color:${soft}">${esc(c.helpText)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${ink};border-radius:8px"><a href="${wa}" style="display:inline-block;padding:12px 26px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none">${esc(c.whatsAppLabel)}</a></td></tr></table>
      ${SITE.whatsappDisplay ? `<p style="margin:12px 0 0;font-size:14px;color:${soft}">Or call: <a href="tel:${esc(String(SITE.phone || SITE.whatsapp).replace(/[^\d+]/g, ''))}" style="color:${gold};font-weight:700;text-decoration:none">${esc(SITE.whatsappDisplay)}</a></p>` : ''}
    </td></tr>` : '';
  const soc = SITE.social || ({} as Record<string, string>);
  const socials = c.showSocial ? (['facebook', 'instagram', 'linkedin', 'x', 'youtube', 'tiktok'] as const).filter((k) => (soc as Record<string, string>)[k]).map((k) => `<a href="${esc((soc as Record<string, string>)[k])}" style="color:${gold};text-decoration:none;font-size:13px;font-weight:600;margin-left:12px">${k === 'x' ? 'X' : k[0].toUpperCase() + k.slice(1)}</a>`).join('') : '';
  const contact = c.showContact ? `<tr><td style="padding:22px 32px;border-top:1px solid ${line}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td valign="bottom" style="font-size:13px;line-height:1.7;color:${soft}">
        <b style="font-size:15px;color:${ink}">${esc(c.signOff.split('\n').slice(-1)[0] || SITE.name)}</b><br>
        ${SITE.office ? `${esc(SITE.office)}<br>` : ''}
        ${SITE.whatsappDisplay ? `WhatsApp <a href="${wa}" style="color:${gold};text-decoration:none">${esc(SITE.whatsappDisplay)}</a><br>` : ''}
        ${SITE.email ? `<a href="mailto:${esc(SITE.email)}" style="color:${gold};text-decoration:none">${esc(SITE.email)}</a>` : ''}
      </td><td align="right" valign="bottom">${socials}</td></tr></table>
    </td></tr>` : '';
  const foot = c.footer || `© ${new Date().getFullYear()} ${SITE.operator || SITE.name}${SITE.office ? ` · ${SITE.office}` : ''}`;
  const host = (SITE.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const sign = c.signOff ? `<p style="margin:6px 0 0;font-size:15px;line-height:1.6;color:#333">${esc(c.signOff).replace(/\n/g, '<br>')}</p>` : '';

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${line}">
  <tr><td style="background:#ffffff;padding:24px 32px;border-bottom:3px solid ${gold}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><img src="${esc(logo)}" alt="${esc(SITE.name)}" height="44" style="display:block;height:44px;width:auto;border:0"></td>
      <td align="right" style="font-size:15px;font-weight:700;color:${ink}">${esc(o.title || c.headerTitle)}</td>
    </tr></table>
  </td></tr>
  <tr><td align="center" style="background:${cream};padding:16px 32px;border-bottom:1px solid ${line};font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${gold}">&#10003;&nbsp; ${esc(badge)}</td></tr>
  <tr><td style="padding:30px 32px 10px">${body}${sign}</td></tr>
  ${help}
  ${contact}
  <tr><td align="center" style="background:${ink};padding:14px 24px;font-size:12px;color:#d9cfb5">${esc(foot)}${host ? ` · <a href="${esc(SITE.url)}" style="color:${gold};font-weight:700;text-decoration:none">${esc(host)}</a>` : ''}</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
