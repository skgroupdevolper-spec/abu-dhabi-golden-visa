'use server';

import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from '@/lib/server/revalidate';
import { redirect } from 'next/navigation';
import { EDIT, FULL, requireAdmin } from '@/lib/server/auth';
import { insert, list, patch, remove } from '@/lib/server/collections';
import { getCustomPages, type Category, type CustomPage, type Faq, type MediaItem, type PageOverride, type Partner, type Post, type ServiceOverrides, type Testimonial } from '@/lib/server/content';
import { getSite, saveSite } from '@/lib/server/settings';
import { DATA_DIR, newId, now, readJsonFile, updateJsonFile } from '@/lib/server/store';
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
  const sched = s(f, 'scheduledAt', 40);
  const data = {
    slug, title, meta: s(f, 'meta', 320), summary: s(f, 'summary', 600), body: s(f, 'body', 80000), faq: faqFrom(f), status, author: s(f, 'author', 120) || 'Abu Dhabi Golden Visa editorial team', reviewer: s(f, 'reviewer', 120) || me.name,
    cover: s(f, 'cover', 400), coverAlt: s(f, 'coverAlt', 200), category: s(f, 'category', 80), tags: s(f, 'tags', 300).split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12),
    seoTitle: s(f, 'seoTitle', 200), ogImage: s(f, 'ogImage', 400), canonical: s(f, 'canonical', 400), noindex: f.get('noindex') === 'on', featured: f.get('featured') === 'on', keyword: s(f, 'keyword', 120),
    scheduledAt: sched && !Number.isNaN(Date.parse(sched)) ? new Date(sched).toISOString() : undefined, updatedAt: now(),
  };
  let pid = id;
  if (id) await patch<Post>('posts', id, (p) => ({ ...p, ...data, publishedAt: status === 'published' ? p.publishedAt || now() : p.publishedAt,
    revisions: p.body !== data.body || p.title !== data.title ? [{ at: p.updatedAt, by: me.name, title: p.title, summary: p.summary, meta: p.meta, body: p.body }, ...(p.revisions ?? [])].slice(0, 15) : p.revisions }));
  else { pid = newId(6); await insert<Post>('posts', { id: pid, ...data, source: 'manual', createdAt: now(), publishedAt: status === 'published' ? now() : undefined }); }
  live();
  if (status === 'published') void import('@/lib/server/translate').then((m) => m.autoTranslate([`/blog/${slug}/`])).catch(() => {});
  if (status === 'published' && !data.noindex) void import('@/lib/server/indexnow').then((m) => m.pingIndexNow([`/blog/${slug}/`, '/blog/'])).catch(() => {});
  if (!id) redirect(`/admin/posts/${pid}/`);
  return { ok: status === 'published' ? (data.scheduledAt && data.scheduledAt > now() ? 'Saved. It goes live on the scheduled date.' : 'Saved and live on the website.') : 'Saved.' };
}
export async function postAction(f: FormData) {
  await requireAdmin(EDIT);
  const id = s(f, 'id', 40), act = s(f, 'act', 20);
  if (act === 'delete') await remove<Post>('posts', id);
  else if (act === 'publish') await patch<Post>('posts', id, (p) => { p.status = 'published'; p.publishedAt = p.publishedAt || now(); p.updatedAt = now(); });
  else if (act === 'unpublish') await patch<Post>('posts', id, (p) => { p.status = 'draft'; });
  live();
  revalidatePath('/admin/posts/');
  if (act === 'delete' && f.get('back')) (await import('next/navigation')).redirect('/admin/posts/');
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
const SVC0: ServiceOverrides = { hidden: [], prices: {}, notes: {}, labels: {}, added: [], groupNames: {} };
export async function saveServices(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const hrefs = f.getAll('href').map(String);
  await updateJsonFile<ServiceOverrides>('services.json', SVC0, (cur) => {
    const o: ServiceOverrides = { ...SVC0, ...cur, hidden: [], prices: {}, notes: {}, labels: {}, groupNames: {} };
    for (const h of hrefs) {
      if (f.get(`hide_${h}`) === 'on') o.hidden.push(h);
      const p = s(f, `price_${h}`, 120); if (p) o.prices[h] = p;
      const n = s(f, `note_${h}`, 200); if (n) o.notes[h] = n;
      const l = s(f, `label_${h}`, 100); if (l) o.labels![h] = l;
    }
    for (const g of f.getAll('group').map(String)) { const v = s(f, `gname_${g}`, 80); if (v && v !== g) o.groupNames![g] = v; }
    return o;
  });
  live();
  return { ok: 'Services saved. The menu, service pages and prices are updated.' };
}
export async function addService(_: St, f: FormData): Promise<St> {
  await requireAdmin(FULL);
  const label = s(f, 'label', 100);
  if (!label) return { error: 'Give the service a name.' };
  const slug = slugify(s(f, 'slug', 80) || label);
  const href = `/services/${slug}/`;
  const note = s(f, 'note', 200), price = s(f, 'price', 120), group = s(f, 'group', 80);
  const [{ SERVICE_CATALOG }, { getPage }] = await Promise.all([import('@/content/services-catalog'), import('@/content/pages')]);
  const cur = await readJsonFile<ServiceOverrides>('services.json', SVC0);
  if (SERVICE_CATALOG.some((g) => g.items.some((i) => i.href === href)) || (cur.added ?? []).some((a) => a.href === href)) return { error: 'A service with this address already exists.' };
  await updateJsonFile<ServiceOverrides>('services.json', SVC0, (o) => ({ ...SVC0, ...o, added: [...(o.added ?? []), { id: newId(6), group, label, href, note }], prices: price ? { ...o.prices, [href]: price } : o.prices }));
  // Its own page, ready to edit in the page builder.
  if (f.get('page') === 'on' && !getPage(href) && !(await getCustomPages()).some((c) => c.path === href)) {
    const { uid } = await import('@/lib/blocks');
    await insert<CustomPage>('custom-pages', {
      id: newId(8), path: href, title: label, createdAt: now(), at: now(), h1: label, eyebrow: group || 'Our services', seoTitle: `${label} in Abu Dhabi | Abu Dhabi Golden Visa`.slice(0, 70),
      meta: (note || `${label}: what we handle, the documents and the steps. Free first consultation.`).slice(0, 160), intro: note || `${label}, handled for you from the first document to the final approval.`,
      facts: price ? [{ label: 'Price', value: price }, { label: 'Consultation', value: 'Free, no obligation' }] : undefined,
      blocks: [
        { id: uid(), type: 'text', style: {}, data: { title: `About ${label}`, body: `${note || label}\n\nTell us your situation and we confirm the documents, the steps and the cost in writing before you pay.` } },
        { id: uid(), type: 'cta', style: { bg: 'dark' }, data: { title: 'Get a free quote', text: price ? `${label}: ${price}` : 'We reply in your language on WhatsApp.', b1: [{ label: 'Apply now', href: '/apply/' }], b2: [{ label: 'WhatsApp', href: 'wa' }] } },
        { id: uid(), type: 'lead', style: {}, data: { title: 'Send your details' } },
      ],
    });
  }
  live();
  return { ok: `“${label}” added to the Our Services menu${f.get('page') === 'on' ? ' with its own page (edit it under Pages)' : ''}.` };
}
export async function deleteService(f: FormData) {
  await requireAdmin(FULL);
  const href = s(f, 'href', 200);
  await updateJsonFile<ServiceOverrides>('services.json', SVC0, (o) => ({ ...SVC0, ...o, added: (o.added ?? []).filter((a) => a.href !== href) }));
  live();
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

/* ---------- blog categories ---------- */
export async function saveCategory(_: St, f: FormData): Promise<St> {
  await requireAdmin(EDIT);
  const id = s(f, 'id', 40), name = s(f, 'name', 80);
  if (!name) return { error: 'Add a name.' };
  const slug = slugify(s(f, 'slug', 80) || name);
  const { getCategories } = await import('@/lib/server/content');
  const cur = await list<Category>('categories');
  // First edit: store the starting categories so they become editable.
  if (!cur.length) for (const c of await getCategories()) await insert<Category>('categories', c);
  const all = await list<Category>('categories');
  if (all.some((c) => c.slug === slug && c.id !== id)) return { error: 'Another category uses this address.' };
  const data = { name, slug, description: s(f, 'description', 400), image: s(f, 'image', 400), seoTitle: s(f, 'seoTitle', 200), meta: s(f, 'meta', 320) };
  if (id && all.some((c) => c.id === id)) await patch<Category>('categories', id, (c) => ({ ...c, ...data }));
  else await insert<Category>('categories', { id: newId(6), order: all.length, ...data });
  live();
  return { ok: 'Category saved.' };
}
export async function deleteCategory(f: FormData) {
  await requireAdmin(EDIT);
  const { getCategories } = await import('@/lib/server/content');
  if (!(await list<Category>('categories')).length) for (const c of await getCategories()) await insert<Category>('categories', c);
  await remove<Category>('categories', s(f, 'id', 40));
  live();
  revalidatePath('/admin/categories/');
}

export async function restoreRevision(f: FormData) {
  const me = await requireAdmin(EDIT);
  const id = s(f, 'id', 40), at = s(f, 'at', 40);
  await patch<Post>('posts', id, (p) => {
    const r = p.revisions?.find((x) => x.at === at);
    if (!r) return p;
    return { ...p, title: r.title, summary: r.summary, meta: r.meta, body: r.body, updatedAt: now(), revisions: [{ at: p.updatedAt, by: me.name, title: p.title, summary: p.summary, meta: p.meta, body: p.body }, ...(p.revisions ?? []).filter((x) => x.at !== at)].slice(0, 15) };
  });
  live();
  redirect(`/admin/posts/${id}/?restored=1`);
}

/* ---------- pages: duplicate and delete ---------- */
export async function duplicatePage(f: FormData) {
  await requireAdmin(EDIT);
  const from = s(f, 'path', 300);
  const [{ getPage }, { sectionsToBlocks }, { getOverrides }] = await Promise.all([import('@/content/pages'), import('@/lib/blocks'), import('@/lib/server/content')]);
  const customs = await getCustomPages();
  const c = customs.find((x) => x.path === from);
  const base = getPage(from);
  const o = (await getOverrides())[from] ?? {};
  const src: PageOverride = c ?? { ...o, h1: o.h1 || base?.h1, intro: o.intro || base?.intro, eyebrow: o.eyebrow || base?.eyebrow, seoTitle: o.seoTitle || base?.seoTitle, meta: o.meta || base?.meta, image: o.image || base?.image };
  let path = `${from === '/' ? '/home' : from.replace(/\/$/, '')}-copy/`;
  for (let i = 2; customs.some((x) => x.path === path) || getPage(path); i++) path = `${from === '/' ? '/home' : from.replace(/\/$/, '')}-copy-${i}/`;
  const blocks = src.blocks?.length ? src.blocks : base ? sectionsToBlocks(base.sections) : [];
  const title = `${src.h1 || c?.title || 'Page'} (copy)`;
  const { id: _id, path: _p, createdAt: _c, ...rest } = (c ?? {}) as CustomPage;
  await insert<CustomPage>('custom-pages', { ...src, ...rest, id: newId(8), path, title, h1: title, blocks, hidden: true, noindex: true, createdAt: now(), at: now() });
  live();
  redirect(`/admin/pages/edit/?path=${encodeURIComponent(path)}`);
}
export async function deleteCustomPage(f: FormData) {
  await requireAdmin(FULL);
  const path = s(f, 'path', 300);
  const c = (await getCustomPages()).find((x) => x.path === path);
  if (c) await remove<CustomPage>('custom-pages', c.id);
  live();
}
