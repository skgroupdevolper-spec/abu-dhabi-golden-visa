import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PAGES, getPage } from '@/content/pages';
import type { Page, Section } from '@/content/types';
import { md } from '@/lib/markdown';
import { LOCALE_CODES, isLocale, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import type { Block } from '@/lib/blocks';
import { SITE } from '@/lib/site';
import { getCategories, getCustomPages, getFaqs, getOverrides, getPublishedPosts, getServiceOverrides, getTestimonials, getTranslations, postToPage, type PageOverride, type Post } from '@/lib/server/content';
import { PageView } from '@/components/PageView';
import { BlogIndex } from '@/components/BlogIndex';

type Params = Promise<{ locale: string; slug: string[] }>;

// Built pages are static; new blog posts and admin edits appear without a rebuild.
export const dynamicParams = true;
export const revalidate = 60;

export function generateStaticParams() {
  return LOCALE_CODES.flatMap((locale) => PAGES.map((p) => ({ locale, slug: p.path.split('/').filter(Boolean) })));
}

type Resolved = { page: Page; loc: Locale; translated: boolean; price?: string; hidden: string[]; o: PageOverride; blocks?: Block[]; post?: Post; blog?: { category?: string } };

async function resolve(locale: string, slug: string[]): Promise<Resolved | null> {
  const loc = (isLocale(locale) ? locale : 'en') as Locale;
  const path = '/' + slug.map((s) => decodeURIComponent(s)).join('/') + '/';
  const [over, tr, svc, customs] = await Promise.all([getOverrides(), getTranslations(), getServiceOverrides(), getCustomPages()]);
  let page = getPage(path);
  let post: Post | undefined;
  let blog: Resolved['blog'];
  const custom = customs.find((c) => c.path === path);
  if (!page && custom && !custom.hidden) {
    page = { path, seoTitle: custom.seoTitle || custom.title, meta: custom.meta || '', eyebrow: custom.eyebrow || custom.title, h1: custom.h1 || custom.title, intro: custom.intro || '', sections: [] };
  }
  if (!page && path.startsWith('/blog/category/')) {
    const cat = (await getCategories()).find((c) => `/blog/category/${c.slug}/` === path);
    if (cat) { page = { path, seoTitle: cat.seoTitle || `${cat.name} | Blog | ${SITE.name}`, meta: cat.meta || cat.description, eyebrow: 'Blog category', h1: cat.name, intro: cat.description, sections: [], image: cat.image }; blog = { category: cat.slug }; }
  }
  if (!page && path.startsWith('/blog/')) {
    post = (await getPublishedPosts()).find((p) => `/blog/${p.slug}/` === path);
    if (post) page = postToPage(post);
  }
  if (!page) return null;
  const o: PageOverride = custom ?? over[path] ?? {};
  if (o.hidden || svc.hidden.includes(path)) return null;
  if (path === '/blog/') blog = {};
  let sections: Section[] = page.sections;
  if (path === '/faqs/') {
    const faqs = await getFaqs();
    if (faqs.length) sections = [{ type: 'faq', title: 'Frequently asked questions', items: faqs.map((f) => ({ q: f.q, a: f.a })) }];
  }
  if (path === '/services/' && svc.hidden.length) {
    sections = sections.map((s) => (s.type === 'cards' ? { ...s, items: s.items.filter((i) => !svc.hidden.includes(i.href)) } : s));
  }
  if (o.extra) sections = [...sections.slice(0, -1), { type: 'html', html: md(o.extra) }, ...sections.slice(-1)];

  page = {
    ...page, sections, seoTitle: o.seoTitle || page.seoTitle, meta: o.meta || page.meta, h1: o.h1 || page.h1, intro: o.intro || page.intro,
    eyebrow: o.eyebrow || page.eyebrow, image: o.image || page.image, imageAlt: o.imageAlt || page.imageAlt, facts: o.facts?.length ? o.facts : page.facts,
  };

  let translated = false;
  const t = loc !== 'en' ? tr[loc]?.[path] : undefined;
  if (t) {
    translated = true;
    page = { ...page, seoTitle: t.seoTitle || page.seoTitle, meta: t.meta || page.meta, eyebrow: t.eyebrow || page.eyebrow, h1: t.h1 || page.h1, intro: t.intro || page.intro, sections: t.sections?.length ? t.sections : page.sections };
  }
  const blocks = o.blocks?.length ? (t?.blocks?.length ? t.blocks : o.blocks) : undefined;
  return { page, loc, translated, price: svc.prices[path], hidden: svc.hidden, o, blocks, post, blog };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const r = await resolve(locale, slug);
  if (!r) return {};
  return pageMetadata(r.page.path, r.loc, r.page.seoTitle, r.page.meta, {
    image: r.o.ogImage || r.post?.ogImage || r.page.image, noindex: r.o.noindex || r.post?.noindex, canonical: r.o.canonical || r.post?.canonical,
    type: r.post || r.page.article ? 'article' : 'website', published: r.post?.publishedAt,
  });
}

export default async function ContentPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const r = await resolve(locale, slug);
  if (!r) notFound();
  const reviews = r.blocks?.some((b) => b.type === 'testimonials') ? await getTestimonials() : [];
  const blogData = r.blog ? { posts: await getPublishedPosts(), categories: await getCategories(), current: r.blog.category } : undefined;
  return (
    <>
      <PageView page={r.page} locale={r.loc} translated={r.translated} price={r.price} hidden={r.hidden} blocks={r.blocks} o={r.o} reviews={reviews}
        before={blogData ? <BlogIndex locale={r.loc} {...blogData} /> : undefined} />
      {(r.post || r.page.article) && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BlogPosting', headline: r.page.h1, description: r.page.meta,
          image: r.page.image ? [r.page.image.startsWith('http') ? r.page.image : SITE.url + r.page.image] : [SITE.url + '/brand/coin.webp'],
          datePublished: r.post?.publishedAt, dateModified: r.post?.updatedAt, author: { '@type': 'Organization', name: r.page.article?.author ?? SITE.name },
          publisher: { '@type': 'Organization', name: SITE.operator, logo: { '@type': 'ImageObject', url: SITE.url + '/brand/coin.webp' } }, mainEntityOfPage: SITE.url + r.page.path,
        }).replace(/</g, '\\u003c') }} />
      )}
      {r.o.css && <style dangerouslySetInnerHTML={{ __html: r.o.css.replace(/<\/?style/gi, '') }} />}
    </>
  );
}
