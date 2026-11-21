import 'server-only';
// The publisher's view of this website: blog posts (/blog/), services, FAQ questions and pictures,
// read and written straight in the website's own files (posts.json, media/).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { insert, list, patch, remove } from '../../collections';
import { getCategories, getFaqs, getServiceOverrides, type MediaItem, type Post } from '../../content';
import { DATA_DIR, newId, now } from '../../store';
import { mergeCatalog } from '@/content/services-catalog';
import { matches, type FindArgs } from './table';

type Row = Record<string, any>;
/** Languages a mission may choose from (the website translates every published post into its languages). */
export const LANGS = ['en', 'ar', 'ru', 'tr', 'zh', 'fr', 'de', 'it', 'es', 'ro', 'pt', 'at', 'pl', 'hu', 'hr', 'sk', 'cs', 'hi', 'id', 'ur'];

/** The website languages that are switched on. */
export async function liveLangs(): Promise<string[]> {
  const on = (await import('../../settings').then((m) => m.getSite())).languages as string[] | undefined;
  return on?.length ? on : LANGS;
}

/** The website's category slug for a name the AI chose (a name or slug, else the closest by words, else the first). */
export async function categoryKey(name: string) {
  const list = await getCategories();
  const n = String(name || '').toLowerCase().trim();
  const exact = list.find((c) => c.name.toLowerCase() === n || c.slug === n);
  if (exact) return exact.slug;
  const words = n.split(/\W+/).filter((w) => w.length > 3);
  const scored = list.map((c) => ({ c, s: words.filter((w) => `${c.name} ${c.slug}`.toLowerCase().includes(w)).length })).sort((a, b) => b.s - a.s);
  return (scored[0]?.s ? scored[0].c : list[0])?.slug;
}
async function categoryName(slug?: string) {
  return (await getCategories()).find((c) => c.slug === slug)?.name || slug || '';
}

const toRow = async (p: Post): Promise<Row> => ({
  id: p.id, slug: p.slug, title: p.title, excerpt: p.summary, content: p.body || '', cover: p.cover || null, category: await categoryName(p.category),
  tags: (p.tags || []).join(', '), author: p.author, status: p.status === 'published' ? 'published' : 'draft', metaTitle: p.seoTitle || '', metaDescription: p.meta || '', views: 0,
  publishedAt: p.publishedAt ? new Date(p.publishedAt) : null, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt),
});
async function allPosts(): Promise<Row[]> {
  return Promise.all((await list<Post>('posts')).map(toRow));
}

function pick(row: Row, select?: Row) {
  if (!select) return row;
  return Object.fromEntries(Object.entries(select).filter(([, on]) => on).map(([k]) => [k, row[k]]));
}

/** The publisher's fields as the website's post fields. */
async function postFields(f: Row): Promise<Partial<Post>> {
  const out: Partial<Post> = {};
  if (f.title !== undefined) out.title = String(f.title).slice(0, 200);
  if (f.excerpt !== undefined) out.summary = String(f.excerpt).slice(0, 600);
  if (f.content !== undefined) out.body = String(f.content).slice(0, 120000);
  if (f.cover !== undefined) out.cover = f.cover ? String(f.cover) : undefined;
  if (f.category !== undefined) out.category = await categoryKey(f.category);
  if (f.tags !== undefined) out.tags = String(f.tags || '').split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10);
  if (f.metaTitle !== undefined) out.seoTitle = String(f.metaTitle).slice(0, 70);
  if (f.metaDescription !== undefined) out.meta = String(f.metaDescription).slice(0, 320);
  if (f.title !== undefined && f.cover !== undefined) out.coverAlt = String(f.title).slice(0, 120);
  return out;
}

function statusOf(f: Row, existing?: Post): Pick<Post, 'status' | 'publishedAt' | 'reviewer'> | Record<string, never> {
  if (f.status === undefined) return {};
  const published = f.status === 'published';
  const at = f.publishedAt instanceof Date ? f.publishedAt.toISOString() : now();
  return { status: published ? 'published' : 'draft', publishedAt: published ? existing?.publishedAt || at : existing?.publishedAt, reviewer: published ? existing?.reviewer || 'Auto Publisher' : existing?.reviewer || '' };
}

async function created(f: Row): Promise<Row> {
  const posts = await list<Post>('posts');
  let slug = String(f.slug || '').trim() || newId(4);
  if (posts.some((p) => p.slug === slug)) slug = `${slug}-${newId(2)}`;
  const st: Partial<Post> = statusOf(f);
  const p: Post = {
    id: newId(6), slug, title: '', meta: '', summary: '', body: '', faq: [], source: 'auto', author: String(f.author || 'Abu Dhabi Golden Visa editorial team'),
    createdAt: now(), updatedAt: now(), ...(await postFields(f)), ...st, status: st.status || 'draft', reviewer: st.reviewer || '', keyword: f.focusKeyword || undefined,
  };
  await insert<Post>('posts', p);
  return (await toRow(p));
}

async function updated(id: string, f: Row): Promise<Row> {
  const extra = await postFields(f);
  let out: Post | undefined;
  await patch<Post>('posts', id, (p) => {
    const s = statusOf(f, p);
    out = { ...p, ...extra, ...s, updatedAt: now(), revisions: [...(p.revisions ?? []).slice(-9), { at: now(), by: 'Auto Publisher', title: p.title, summary: p.summary, meta: p.meta, body: p.body }] };
    return out;
  });
  if (!out) throw new Error('Article not found');
  return toRow(out);
}

export const post = {
  findMany: async (args: FindArgs = {}) => {
    let rows = (await allPosts()).filter((r) => matches(r, args.where));
    if (args.orderBy) {
      const [k, dir] = Object.entries(Array.isArray(args.orderBy) ? args.orderBy[0] : args.orderBy)[0] as [string, string];
      const v = (x: any) => (x instanceof Date ? x.getTime() : x);
      rows.sort((a, b) => (v(a[k]) < v(b[k]) ? -1 : 1) * (dir === 'desc' ? -1 : 1));
    }
    if (args.distinct?.length) { const seen = new Set<string>(); rows = rows.filter((r) => { const key = args.distinct!.map((k) => r[k]).join('|'); if (seen.has(key)) return false; seen.add(key); return true; }); }
    if (args.skip) rows = rows.slice(args.skip);
    if (args.take != null) rows = rows.slice(0, args.take);
    return rows.map((r) => pick(r, args.select)) as any[];
  },
  findUnique: async (args: { where: Row; select?: Row }) => {
    const r = (await allPosts()).find((p) => matches(p, args.where));
    return r ? (pick(r, args.select) as any) : null;
  },
  findFirst: async (args: { where?: Row; select?: Row } = {}) => {
    const r = (await allPosts()).find((p) => matches(p, args.where));
    return r ? (pick(r, args.select) as any) : null;
  },
  count: async (args: { where?: Row } = {}) => (await allPosts()).filter((r) => matches(r, args.where)).length,
  create: async (args: { data: Row }) => created(args.data) as Promise<any>,
  update: async (args: { where: Row; data: Row }) => {
    const r = (await allPosts()).find((p) => matches(p, args.where));
    if (!r) throw new Error('Article not found');
    return updated(r.id, args.data) as Promise<any>;
  },
  updateMany: async (args: { where?: Row; data: Row }) => {
    const rows = (await allPosts()).filter((p) => matches(p, args.where));
    for (const p of rows) await updated(p.id, args.data);
    return { count: rows.length };
  },
  delete: async (args: { where: Row }) => {
    const r = (await allPosts()).find((p) => matches(p, args.where));
    if (!r) throw new Error('Article not found');
    await remove<Post>('posts', r.id);
    return r as any;
  },
};

// ---------------------------------------------------------------- services and FAQs

export const service = {
  // slug is the page address here (/golden-visa/, /services/family-visa/ …)
  findMany: async (args: FindArgs = {}) =>
    mergeCatalog(await getServiceOverrides().catch(() => null)).flatMap((g) => g.items).map((s, i) => pick({ id: s.href, slug: s.href, title: s.label, subtitle: s.note || '', active: true, order: i }, args.select)) as any[],
};
export const faq = {
  findMany: async (args: FindArgs = {}) => (await getFaqs()).map((f) => pick({ id: f.id, question: f.q, answer: f.a, active: true }, args.select)) as any[],
};

// Per-language versions are made by the website's languages engine
export const translation = {
  findMany: async (_args: FindArgs = {}) => [] as any[],
  upsert: async (args: { where: Row; create: Row; update: Row }) => args.create,
};

// ---------------------------------------------------------------- pictures

const MEDIA = path.join(DATA_DIR, 'media');
const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

/** Saves a picture in the website's media library. Returns its address (/media/…). */
export async function savePublicFile(file: File): Promise<{ url: string; filename: string; size: number }> {
  const buf = Buffer.from(await file.arrayBuffer());
  const type = EXT[file.type] ? file.type : 'image/webp';
  const base = path.basename(String(file.name || 'picture')).replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'picture';
  const filename = `${base}-${newId(3)}.${EXT[type]}`;
  await mkdir(MEDIA, { recursive: true });
  await writeFile(path.join(MEDIA, filename), buf);
  await insert<MediaItem>('media', { id: newId(6), file: filename, name: filename, type, size: buf.length, alt: '', at: now() }).catch(() => {});
  return { url: `/media/${filename}`, filename, size: buf.length };
}

/** A picture by its address: /media/… (media library) or /path in the website's public folder. */
export async function readPicture(url: string): Promise<Buffer | null> {
  const clean = url.split('?')[0];
  if (clean.startsWith('/media/')) return readFile(path.join(MEDIA, path.basename(clean))).catch(() => null);
  if (clean.startsWith('/')) {
    const pub = path.resolve(process.cwd(), 'public');
    const file = path.resolve(pub, `.${clean}`);
    if (!file.startsWith(pub)) return null;
    return readFile(file).catch(() => null);
  }
  return null;
}

// kept for code shared with the other dashboards
export async function siteData(): Promise<Row> { return { languages: (await liveLangs()).map((code) => ({ code })) }; }
export async function getSitePost(_slug: string) { return null; }
export async function saveLanguage() { /* the website translates posts itself */ }
export const forgetPosts = () => {};
