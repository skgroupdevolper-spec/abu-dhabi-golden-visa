'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { saveUpload } from '@/lib/server/files';
import { getApplicationByToken, listApplications, newId, now, updateApplication } from '@/lib/server/store';

type State = { ok?: string; error?: string } | undefined;
const s = (f: FormData, k: string, max = 500) => String(f.get(k) ?? '').trim().slice(0, max);

/** Paths differ on the portal subdomain (/t/...) and the main site (/portal/t/...). */
async function base() {
  const host = ((await headers()).get('host') || '').split(':')[0].toLowerCase();
  return host && host === (process.env.PORTAL_HOST || '').toLowerCase() ? '' : '/portal';
}

const tries = new Map<string, number[]>();
export async function findFile(_: State, f: FormData): Promise<State> {
  const ip = ((await headers()).get('x-forwarded-for') || 'local').split(',')[0];
  const t = Date.now();
  const recent = (tries.get(ip) || []).filter((x) => t - x < 15 * 60_000);
  if (recent.length >= 10) return { error: 'Too many attempts. Please message your advisor on WhatsApp.' };
  tries.set(ip, [...recent, t]);
  const ref = s(f, 'ref', 20).toUpperCase().replace(/\s/g, '');
  const digits = s(f, 'phone', 40).replace(/\D/g, '');
  if (!ref || digits.length < 6) return { error: 'Enter your reference and WhatsApp number.' };
  const a = (await listApplications()).find((x) => !x.archived && x.ref === ref && x.client.phone.replace(/\D/g, '').endsWith(digits.slice(-6)));
  if (!a) return { error: 'We could not find that file. Check the reference, or ask your advisor for your link.' };
  redirect(`${await base()}/t/${a.token}/`);
}

async function withApp(f: FormData) {
  const a = await getApplicationByToken(s(f, 'token', 40));
  if (!a) throw new Error('This link is no longer valid. Please ask your advisor for a new one.');
  return a;
}
const done = async (token: string) => revalidatePath(`/portal/t/${token}/`);

export async function acceptQuote(f: FormData) {
  const a = await withApp(f);
  if (!a.quote.sentAt || a.quote.acceptedAt) return;
  await updateApplication(a.id, (x) => {
    x.quote.acceptedAt = now();
    x.messages.push({ id: newId(6), by: 'client', at: now(), text: 'I accept the quote.' });
  });
  await done(a.token);
}

export async function clientMessage(_: State, f: FormData): Promise<State> {
  try {
    const a = await withApp(f);
    const text = s(f, 'text', 3000);
    if (!text) return { error: 'Write a message first.' };
    await updateApplication(a.id, (x) => { x.messages.push({ id: newId(6), by: 'client', at: now(), text }); });
    await done(a.token);
    return { ok: 'Sent. Your advisor will reply here and on WhatsApp.' };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function clientUpload(_: State, f: FormData): Promise<State> {
  try {
    const a = await withApp(f);
    if (a.documents.filter((d) => d.by === 'client').length >= 60) return { error: 'Upload limit reached. Please send the rest to your advisor.' };
    const doc = await saveUpload(a.id, f.get('file') as File, 'client', true, s(f, 'label', 120));
    await updateApplication(a.id, (x) => {
      x.documents.push(doc);
      x.messages.push({ id: newId(6), by: 'client', at: now(), text: `Uploaded: ${doc.name}` });
    });
    await done(a.token);
    return { ok: `Uploaded ${doc.name}. Thank you.` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
