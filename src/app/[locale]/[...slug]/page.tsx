import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PAGES, getPage } from '@/content/pages';
import type { Page, Section } from '@/content/types';
import { md } from '@/lib/markdown';
import { LOCALE_CODES, isLocale, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { getFaqs, getOverrides, getPublishedPosts, getServiceOverrides, getTranslations, postToPage } from '@/lib/server/content';
import { PageView } from '@/components/PageView';

type Params = Promise<{ locale: string; slug: string[] }>;

// Built pages are static; new blog posts and admin edits appear without a rebuild.
export const dynamicParams = true;
export const revalidate = 60;

export function generateStaticParams() {
  return LOCALE_CODES.flatMap((locale) => PAGES.map((p) => ({ locale, slug: p.path.split('/').filter(Boolean) })));
}

async function resolve(locale: string, slug: string[]): Promise<{ page: Page; loc: Locale; translated: boolean; price?: string; hidden: string[] } | null> {
  const loc = (isLocale(locale) ? locale : 'en') as Locale;
  const path = '/' + slug.map((s) => decodeURIComponent(s)).join('/') + '/';
  let page = getPage(path);
  if (!page && path.startsWith('/blog/')) {
    const post = (await getPublishedPosts()).find((p) => `/blog/${p.slug}/` === path);
    if (post) page = postToPage(post);
  }
  if (!page) return null;
  const [over, tr, svc] = await Promise.all([getOverrides(), getTranslations(), getServiceOverrides()]);
  const o = over[path];
  if (o?.hidden) return null;
  let sections: Section[] = page.sections;

  if (path === '/blog/') {
    const posts = await getPublishedPosts();
    if (posts.length) sections = [{ type: 'cards', title: 'Latest guides', items: posts.map((p) => ({ title: p.title, text: p.summary, href: `/blog/${p.slug}/` })) }, ...sections];
  }
  if (path === '/faqs/') {
    const faqs = await getFaqs();
    if (faqs.length) sections = [{ type: 'faq', title: 'Frequently asked questions', items: faqs.map((f) => ({ q: f.q, a: f.a })) }];
  }
  if (path === '/services/' && svc.hidden.length) {
    sections = sections.map((s) => (s.type === 'cards' ? { ...s, items: s.items.filter((i) => !svc.hidden.includes(i.href)) } : s));
  }
  if (o?.extra) sections = [...sections.slice(0, -1), { type: 'html', html: md(o.extra) }, ...sections.slice(-1)];

  page = { ...page, sections, seoTitle: o?.seoTitle || page.seoTitle, meta: o?.meta || page.meta, h1: o?.h1 || page.h1, intro: o?.intro || page.intro };

  let translated = false;
  const t = loc !== 'en' ? tr[loc]?.[path] : undefined;
  if (t) {
    translated = true;
    page = { ...page, seoTitle: t.seoTitle || page.seoTitle, meta: t.meta || page.meta, eyebrow: t.eyebrow || page.eyebrow, h1: t.h1 || page.h1, intro: t.intro || page.intro, sections: t.sections?.length ? t.sections : page.sections };
  }
  if (svc.hidden.includes(path)) return null;
  return { page, loc, translated, price: svc.prices[path], hidden: svc.hidden };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const r = await resolve(locale, slug);
  if (!r) return {};
  return pageMetadata(r.page.path, r.loc, r.page.seoTitle, r.page.meta);
}

export default async function ContentPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const r = await resolve(locale, slug);
  if (!r) notFound();
  return <PageView page={r.page} locale={r.loc} translated={r.translated} price={r.price} hidden={r.hidden} />;
}
