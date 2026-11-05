import { NextResponse, type NextRequest } from 'next/server';
import { addLead, createApplication, updateApplication, updateLead, type Doc } from '@/lib/server/store';
import { saveUpload } from '@/lib/server/files';
import { notify } from '@/lib/server/collections';
import { sendTeam, sendWa } from '@/lib/server/whatsapp';
import { mailTeam, sendMail } from '@/lib/server/mail';
import { applyService } from '@/content/apply';
import { portalUrl } from '@/lib/site';
import { LOCALES } from '@/lib/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const t = Date.now();
  const recent = (hits.get(ip) || []).filter((x) => t - x < 30 * 60_000);
  recent.push(t);
  hits.set(ip, recent);
  return recent.length > 5;
}
const s = (f: FormData, k: string, max = 300) => String(f.get(k) ?? '').trim().slice(0, max);

/** Online application from /apply/: creates an enquiry and a client file with the uploaded documents. */
export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (limited(ip)) return NextResponse.json({ ok: false, error: 'Too many applications from this connection. Please message us on WhatsApp.' }, { status: 429 });
  let f: FormData;
  try { f = await req.formData(); } catch { return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 }); }

  const svc = applyService(s(f, 'service', 60));
  const name = s(f, 'name', 120), phone = s(f, 'phone', 40), email = s(f, 'email', 160).toLowerCase();
  if (!svc) return NextResponse.json({ ok: false, error: 'Please choose a service.' }, { status: 400 });
  if (name.length < 2 || phone.replace(/\D/g, '').length < 7) return NextResponse.json({ ok: false, error: 'Please add your name and WhatsApp number.' }, { status: 400 });
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ ok: false, error: 'Please check your email address.' }, { status: 400 });
  if (f.get('consent') !== 'true') return NextResponse.json({ ok: false, error: 'Please agree to be contacted about your application.' }, { status: 400 });

  let family: { relation: string; name: string; adult: boolean }[] = [];
  try { family = (JSON.parse(s(f, 'family', 4000)) as typeof family).slice(0, 12).map((m) => ({ relation: String(m.relation).slice(0, 20), name: String(m.name).slice(0, 100), adult: !!m.adult })); } catch {}
  const adults = family.filter((m) => m.adult).length, kids = family.length - adults;
  const where = s(f, 'where') === 'out' ? 'out' : 'in';
  const pkg = s(f, 'pkg') === 'vip' ? 'VIP Fast Track' : 'Standard';
  const lang = LOCALES.find((l) => l.htmlLang === s(f, 'language', 10) || l.code === s(f, 'language', 10));
  const notes = [
    `Online application: ${svc.label}`,
    `Package: ${pkg}`,
    `Location: ${where === 'in' ? 'Inside the UAE' : 'Outside the UAE'}${s(f, 'visa', 60) ? ` (${s(f, 'visa', 60)})` : ''}`,
    family.length ? `Family: ${family.map((m) => `${m.relation} ${m.name}${m.relation === 'Child' ? (m.adult ? ' (18+)' : ' (under 18)') : ''}`).join(', ')}` : '',
    s(f, 'estimate', 20) ? `Estimated government fees shown: AED ${s(f, 'estimate', 20)}` : '',
    s(f, 'notes', 1000) ? `Client note: ${s(f, 'notes', 1000)}` : '',
  ].filter(Boolean).join('\n');

  try {
    const lead = await addLead({ name, phone, email, service: svc.label, message: notes, source: 'apply', details: JSON.stringify({ language: lang?.name ?? 'English', service: svc.id }) });
    const app = await createApplication({
      client: { name, phone, email, nationality: s(f, 'nationality', 80), language: lang?.name ?? 'English' },
      route: s(f, 'route', 80) || svc.label, location: where, adults, kids, leadId: lead.id, notes,
    });
    await updateLead(lead.id, { status: 'converted', applicationId: app.id });

    const files = f.getAll('files').filter((x): x is File => typeof x === 'object' && 'arrayBuffer' in x).slice(0, 16);
    const labels = f.getAll('labels').map(String);
    const docs: Doc[] = [];
    const failed: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try { docs.push(await saveUpload(app.id, files[i], 'client', true, labels[i])); } catch { failed.push(files[i].name); }
    }
    const have = new Set(labels.slice(0, files.length));
    await updateApplication(app.id, (a) => {
      a.documents.push(...docs);
      a.requests = svc.docs.filter((d) => !have.has(d));
      a.nextStep = 'Your advisor reviews your documents and sends the written quote.';
    });

    const link = portalUrl(app.token);
    await notify('lead', `New online application ${app.ref}: ${name} (${svc.label}), ${docs.length} document(s)`, `/admin/applications/${app.id}/`);
    void Promise.allSettled([
      sendTeam('leadTeam', { name, phone, service: `${svc.label} · ${app.ref}`, message: notes.slice(0, 300) }),
      sendWa(phone, 'welcome', { name: name.split(' ')[0], ref: app.ref, link }),
      mailTeam(`New online application ${app.ref}: ${name}`, `${notes}\n\nPhone: ${phone}\nEmail: ${email}\nDocuments: ${docs.length}${failed.length ? ` (not saved: ${failed.join(', ')})` : ''}`),
      email ? sendMail(email, `Your application ${app.ref}`, `Dear ${name.split(' ')[0]},\n\nThank you for your application (${svc.label}). Your reference is ${app.ref}.\n\nFollow your file, upload documents and message your advisor here:\n${link}\n\nAbu Dhabi Golden Visa\nNot an official UAE government website.`) : Promise.resolve(),
    ]);
    return NextResponse.json({ ok: true, ref: app.ref, link });
  } catch (e) {
    console.error('Application not saved', e);
    return NextResponse.json({ ok: false, error: 'We could not save your application. Please send it on WhatsApp.' }, { status: 500 });
  }
}
