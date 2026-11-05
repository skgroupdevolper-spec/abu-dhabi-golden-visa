import 'server-only';
import { getSecrets } from './settings';

/** Sends an email through the SMTP account set in the admin. Silently skips when it is not set up. */
export async function sendMail(to: string, subject: string, text: string) {
  const m = (await getSecrets()).smtp;
  if (!m.host || !m.user || !m.pass || !to) return { ok: false, error: 'Email is not set up' };
  try {
    const nodemailer = await import('nodemailer');
    const t = nodemailer.createTransport({ host: m.host, port: Number(m.port) || 465, secure: !!m.secure, auth: { user: m.user, pass: m.pass } });
    await t.sendMail({ from: m.from || m.user, to, subject, text });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function mailTeam(subject: string, text: string) {
  const m = (await getSecrets()).smtp;
  return m.notify ? sendMail(m.notify, subject, text) : { ok: false, error: 'No notification email set' };
}
