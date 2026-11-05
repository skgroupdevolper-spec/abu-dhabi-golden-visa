import 'server-only';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { getBlock, saveBlock } from './settings';

// Two-step login (TOTP, RFC 6238): works with Google Authenticator, Microsoft Authenticator, 1Password, Authy.
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const newSecret = () => Array.from(randomBytes(20)).map((b) => B32[b % 32]).join('');
function b32decode(s: string) {
  let bits = '';
  for (const c of s.replace(/=+$/, '').toUpperCase()) { const v = B32.indexOf(c); if (v >= 0) bits += v.toString(2).padStart(5, '0'); }
  const out: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(out);
}
function code(secret: string, step: number) {
  const msg = Buffer.alloc(8); msg.writeBigUInt64BE(BigInt(step));
  const h = createHmac('sha1', b32decode(secret)).update(msg).digest();
  const o = h[h.length - 1] & 15;
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000)).padStart(6, '0');
}
export function verify(secret: string, input: string) {
  const c = input.replace(/\s/g, '');
  if (!/^\d{6}$/.test(c)) return false;
  const now = Math.floor(Date.now() / 30000);
  return [-1, 0, 1].some((d) => { const a = Buffer.from(code(secret, now + d)), b = Buffer.from(c); return timingSafeEqual(a, b); });
}
export const uri = (secret: string, email: string) => `otpauth://totp/${encodeURIComponent('Abu Dhabi Golden Visa:' + email)}?secret=${secret}&issuer=${encodeURIComponent('Abu Dhabi Golden Visa')}&digits=6&period=30`;

type Entry = { secret: string; enabled: boolean; backup: string[] };
const hash = (s: string) => createHash('sha256').update(s.replace(/\s|-/g, '').toLowerCase()).digest('hex');
export const getTotp = async (email: string) => (await getBlock<Record<string, Entry>>('totp', {}))[email.toLowerCase()];
export async function setTotp(email: string, e: Entry | null) {
  const all = await getBlock<Record<string, Entry>>('totp', {});
  if (e) all[email.toLowerCase()] = e; else delete all[email.toLowerCase()];
  await saveBlock('totp', all);
}
export const backupCodes = () => Array.from({ length: 8 }, () => randomBytes(4).toString('hex').replace(/(.{4})/, '$1-'));
export const hashCodes = (c: string[]) => c.map(hash);

/** Checks a sign-in code (authenticator or one-time backup code). */
export async function checkSecondStep(email: string, input: string) {
  const e = await getTotp(email);
  if (!e?.enabled) return true;
  if (verify(e.secret, input)) return true;
  const h = hash(input);
  if (input && e.backup.includes(h)) { await setTotp(email, { ...e, backup: e.backup.filter((x) => x !== h) }); return true; }
  return false;
}
