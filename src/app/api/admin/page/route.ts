import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { EDIT, currentAdmin } from '@/lib/server/auth';
import { insert, list, remove } from '@/lib/server/collections';
import type { CustomPage, PageOverride } from '@/lib/server/content';
import { getPage } from '@/content/pages';
import { newId, now, updateJsonFile } from '@/lib/server/store';
import { slugify } from '@/lib/markdown';
import { pingIndexNow } from '@/lib/server/indexnow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const s = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const deny = () => NextResponse.json({ ok: false, error: 'Please sign in again.' }, { status: 401 });

function clean(o: Record<string, unknown>): PageOverride {
  const facts = Array.isArray(o.facts) ? (o.facts as { label: string; value: string }[]).map((f) => ({ label: s(f.label, 80), value: s(f.value, 120) })).filter((f) => f.label && f.value).slice(0, 8) : undefined;
  const blocks = Array.isArray(o.blocks) ? JSON.parse(JSON.stringify(o.blocks).slice(0, 400000)) : undefined;
  return {
    seoTitle: s(o.seoTitle, 200), meta: s(o.meta, 320), h1: s(o.h1, 200), intro: s(o.intro, 1500), eyebrow: s(o.eyebrow, 120), extra: s(o.extra, 30000),
    image: s(o.image, 500), imageAlt: s(o.imageAlt, 200), ogImage: s(o.ogImage, 500), canonical: s(o.canonical, 500), keyword: s(o.keyword, 120),
    noindex: !!o.noindex, hidden: !!o.hidden, hideFacts: !!o.hideFacts, hideCta: !!o.hideCta, hideAside: !!o.hideAside,
    heroStyle: (['default', 'image', 'minimal'].includes(s(o.heroStyle)) ? s(o.heroStyle) : 'default') as PageOverride['heroStyle'],
    facts, blocks: blocks?.length ? blocks : undefined, css: s(o.css, 30000), at: now(),
    homeHide: Array.isArray(o.homeHide) ? (o.homeHide as unknown[]).map((x) => s(x, 30)).filter(Boolean).slice(0, 30) : undefined,
  };
}

/** Saves a page from the page builder (built-in page override or custom page). */
export async function POST(req: NextRequest) {
  const me = await currentAdmin();
  if (!me || !EDIT.includes(me.role)) return deny();
  const body = (await req.json().catch(() => null)) as { path?: string; o?: Record<string, unknown>; create?: { title: string; slug: string } } | null;
  if (!body) return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });

  if (body.create) {
    const title = s(body.create.title, 120);
    const slug = s(body.create.slug, 160).split('/').map((x) => slugify(x)).filter(Boolean).join('/') || slugify(title);
    if (!title || !slug) return NextResponse.json({ ok: false, error: 'Add a page title.' }, { status: 400 });
    const path = `/${slug}/`;
    if (getPage(path) || (await list<CustomPage>('custom-pages')).some((c) => c.path === path)) return NextResponse.json({ ok: false, error: 'A page with this address already exists.' }, { status: 400 });
    const id = newId(6);
    await insert<CustomPage>('custom-pages', { id, path, title, createdAt: now(), h1: title, eyebrow: title, intro: '', blocks: [{ id: newId(4), type: 'hero', data: { eyebrow: title, title, text: 'Write a short introduction here.', layout: 'split', b1: [{ label: 'Apply Now', href: '/apply/' }], b2: [] } }] });
    return NextResponse.json({ ok: true, path });
  }

  const path = s(body.path, 300);
  if (!path.startsWith('/')) return NextResponse.json({ ok: false, error: 'Unknown page.' }, { status: 400 });
  const o = clean(body.o ?? {});
  const customs = await list<CustomPage>('custom-pages');
  const custom = customs.find((c) => c.path === path);
  if (custom) {
    await updateJsonFile<CustomPage[]>('custom-pages.json', [], (all) => all.map((c) => (c.path === path ? { ...c, ...o, title: o.h1 || c.title } : c)));
  } else if (getPage(path) || path === '/') {
    await updateJsonFile<Record<string, PageOverride>>('content.json', {}, (all) => { all[path] = o; return all; });
  } else return NextResponse.json({ ok: false, error: 'Unknown page.' }, { status: 404 });
  revalidatePath('/', 'layout');
  if (!o.noindex && !o.hidden) void pingIndexNow([path]).catch(() => {});
  void import('@/lib/server/translate').then((m) => m.autoTranslate([path])).catch(() => {});
  return NextResponse.json({ ok: true });
}

/** Resets a built-in page to its original content, or deletes a custom page. */
export async function DELETE(req: NextRequest) {
  const me = await currentAdmin();
  if (!me || !EDIT.includes(me.role)) return deny();
  const path = s(req.nextUrl.searchParams.get('path'), 300);
  const custom = (await list<CustomPage>('custom-pages')).find((c) => c.path === path);
  if (custom) await remove<CustomPage>('custom-pages', custom.id);
  else await updateJsonFile<Record<string, PageOverride>>('content.json', {}, (all) => { delete all[path]; return all; });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
