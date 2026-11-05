'use server';

import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { EDIT, FULL, requireAdmin } from '@/lib/server/auth';
import { insert, list, patch, remove } from '@/lib/server/collections';
import type { Faq, MediaItem, PageOverride, Partner, Post, ServiceOverrides, Testimonial } from '@/lib/server/content';
import { getSite, saveSite } from '@/lib/server/settings';
import { DATA_DIR, newId, now, updateJsonFile } from '@/lib/server/store';
import { slugify } from '@/lib/markdown';

type St = { ok?: string; error?: string } | undefined;
const s = (f: FormData, k: string, max = 4000) => String(f.get(k) ?? '').trim().slice(0, max);
const live = () => revalidatePath('/', 'layout');

/* ---------- blog posts ---------- */
function faqFrom(f: FormData) {
  return s(f, 'faq', 8000).split(/\n\s*\n/).map((b) => { const [q, ...a] = b.split('\n'); return { q: (q || '').replace(/^Q:\s*/i, '').trim(), a: a.join(' ').replace(/^A:\s*/i, '').trim() }; }).filter((x) => x.q && x.a).slice(0, 12);
}
export async function savePost(_: St, f: FormData): Promise<St> {
  const me = await requireAdmin(EDIT);
  const id = s(f, 'id', 40), title = s(f, 'title', 200);
  if (!title) return { error: 'Add a title.' };
  const slug = slugify(s(f, 'slug', 100) || title);
  const posts = await list<Post>('posts');
  if (posts.some((p) => p.slug === slug && p.id !== id)) return { error: 'Another post uses this web address. Change the slug.' };
  const status = (['draft', 'review', 'published'].includes(s(f, 'status')) ? s(f, 'status') : 'draft') as Post['status'];
  const data = { slug, title, meta: s(f, 'meta', 320), summary: s(f, 'summary', 600), body: s(f, 'body', 60000), faq: faqFrom(f), status, author: s(f, 'author', 120) || 'Abu Dhabi Golden Visa editorial team', reviewer: s(f, 'reviewer', 120) || me.name, cover: s(f, 'cover', 400), updatedAt: now() };
  let pid = id;
  if (id) await patch<Post>('posts', id, (p) => ({ ...p, ...data, publishedAt: status === 'published' ? p.publishedAt || now() : p.publishedAt }));
  else { pid = newId(6); await insert<Post>('posts', { id: pid, ...data, source: 'manual', createdAt: now(), publishedAt: status === 'published' ? now() : undefined }); }
  live();
  if (!id) redirect(`/admin/posts/${pid}/`);
  return { ok: status === 'published' ? 'Saved and live on the website.' : 'Saved.' };
}
export async function postAction(f: FormData) {
  await requireAdmin(EDIT);
  const id = s(f, 'id', 40), act = s(f, 'act', 20);
  if (act === 'delete') await remove<Post>('posts', id);
  else if (act === 'publish') await patch<Post>('posts', id, (p) => { p.status = 'published'; p.publishedAt = p.publishedAt || now(); p.updatedAt = now(); });
  else if (act === 'unpublish') await patch<Post>('posts', id, (p) => { p.status = 'draft'; });
  live();
  revalidatePath('/admin/posts/');
}

/* ---------- pages ---------- */
export async function savePage(_: St, f: FormData): Promise<St> {
  await requireAdmin(EDIT);
  const p = s(f, 'path', 300);
  const o: PageOverride = { seoTitle: s(f, 'seoTitle', 200), meta: s(f, 'meta', 320), h1: s(f, 'h1', 200), intro: s(f, 'intro', 1200), extra: s(f, 'extra', 30000), hidden: f.get('hidden') === 'on', at: now() };
  await updateJsonFile<Record<string, PageOverride>>('content.json', {}, (all) => {
    const empty = !o.seoTitle && !o.meta && !o.h1 && !o.intro && !o.extra && !o.hidden;
    if (empty) delete all[p]; else all[p] = o;
    return all;
  });
  live();
  return { ok: 'Saved. The page shows your changes now.' };
}

/* ---------- FAQs ---------- */
export async function saveFaqs(_: St, f: FormData): Promise<St> {
  await requireAdmin(EDIT);
  const qs = f.getAll('q').map(String), as = f.getAll('a').map(String);
  const faqs: Faq[] = qs.map((q, i) => ({ id: newId(4), q: q.trim().slice(0, 300), a: (as[i] || '').trim().slice(0, 2000), order: i })).filter((x) => x.q && x.a);
  await updateJsonFile<Faq[]>('faqs.json', [], () => faqs);
  live();
  return { ok: `${faqs.length} questions saved.` };
}

/* ---------- services & prices ---------- */
export async function saveServices(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const hrefs = f.getAll('href').map(String);
  const o: ServiceOverrides = { hidden: [], prices: {}, notes: {} };
  for (const h of hrefs) {
    if (f.get(`hide_${h}`) === 'on') o.hidden.push(h);
    const p = s(f, `price_${h}`, 120);
    if (p) o.prices[h] = p;
  }
  await updateJsonFile<ServiceOverrides>('services.json', { hidden: [], prices: {}, notes: {} }, () => o);
  live();
  return { ok: 'Services saved.' };
}

/* ---------- testimonials ---------- */
export async function addTestimonial(_: St, f: FormData): Promise<St> {
  await requireAdmin(EDIT);
  if (!s(f, 'name') || !s(f, 'text')) return { error: 'Add a name and the review text.' };
  if (f.get('consent') !== 'on') return { error: 'Only publish reviews the client agreed to share.' };
  await insert<Testimonial>('testimonials', { id: newId(6), name: s(f, 'name', 80), country: s(f, 'country', 60), text: s(f, 'text', 800), rating: Math.max(1, Math.min(5, Number(s(f, 'rating', 1)) || 5)), approved: true, consent: true, at: now() });
  live();
  return { ok: 'Added.' };
}
export async function testimonialAction(f: FormData) {
  await requireAdmin(EDIT);
  const id = s(f, 'id', 40);
  if (f.get('delete')) await remove<Testimonial>('testimonials', id);
  else await patch<Testimonial>('testimonials', id, (t) => { t.approved = !t.approved; });
  live();
  revalidatePath('/admin/testimonials/');
}

/* ---------- media ---------- */
const MEDIA_OK = /\.(png|jpe?g|webp|gif|svg|avif|pdf|mp4)$/i;
export async function uploadMedia(_: St, f: FormData): Promise<St> {
  await requireAdmin(EDIT);
  const files = f.getAll('files') as File[];
  let n = 0;
  await mkdir(path.join(DATA_DIR, 'media'), { recursive: true });
  for (const file of files) {
    if (!file?.size || file.size > 20 * 1024 * 1024) continue;
    const clean = file.name.normalize('NFKD').replace(/[^\w.\- ]+/g, '').replace(/\s+/g, '-').slice(-60);
    if (!MEDIA_OK.test(clean)) continue;
    const name = `${newId(4)}-${clean}`;
    await writeFile(path.join(DATA_DIR, 'media', name), Buffer.from(await file.arrayBuffer()));
    await insert<MediaItem>('media', { id: newId(6), file: name, name: file.name.slice(0, 100), type: file.type, size: file.size, alt: s(f, 'alt', 200), at: now() });
    n++;
  }
  revalidatePath('/admin/media/');
  return n ? { ok: `${n} file(s) uploaded.` } : { error: 'Choose images, PDF or MP4 files up to 20 MB.' };
}
export async function deleteMedia(f: FormData) {
  await requireAdmin(EDIT);
  const id = s(f, 'id', 40);
  const m = (await list<MediaItem>('media')).find((x) => x.id === id);
  if (m) { await unlink(path.join(DATA_DIR, 'media', path.basename(m.file))).catch(() => {}); await remove<MediaItem>('media', id); }
  revalidatePath('/admin/media/');
}

/* ---------- partners ---------- */
export async function addPartner(_: St, f: FormData): Promise<St> {
  await requireAdmin(EDIT);
  const logo = s(f, 'logo', 400);
  if (!s(f, 'name') || !logo) return { error: 'Add a name and a logo (upload it in Media library and paste its link).' };
  await insert<Partner>('partners', { id: newId(6), name: s(f, 'name', 80), logo, link: s(f, 'link', 400) });
  live();
  return { ok: 'Added.' };
}
export async function deletePartner(f: FormData) {
  await requireAdmin(EDIT);
  await remove<Partner>('partners', s(f, 'id', 40));
  live();
  revalidatePath('/admin/partners/');
}

/* ---------- header & footer ---------- */
function links(f: FormData, prefix: string) {
  const l = f.getAll(`${prefix}_label`).map(String), h = f.getAll(`${prefix}_href`).map(String);
  return l.map((label, i) => ({ label: label.trim().slice(0, 60), href: (h[i] || '').trim().slice(0, 300) })).filter((x) => x.label && x.href);
}
export async function saveHeader(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const cur = await getSite();
  await saveSite({ nav: { ...cur.nav, ctaLabel: s(f, 'ctaLabel', 40), ctaLink: s(f, 'ctaLink', 300), extra: links(f, 'extra') }, features: { ...cur.features, topBar: f.get('topBar') === 'on', topBarText: s(f, 'topBarText', 200) } });
  live();
  return { ok: 'Header saved.' };
}
export async function saveFooter(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const cur = await getSite();
  await saveSite({ footerAbout: s(f, 'footerAbout', 800), disclaimer: s(f, 'disclaimer', 400) || cur.disclaimer, nav: { ...cur.nav, footerLinks: links(f, 'foot'), copyright: s(f, 'copyright', 200) } });
  live();
  return { ok: 'Footer saved.' };
}
