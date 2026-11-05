import 'server-only';
import { cache } from 'react';
import type { Page, Section } from '@/content/types';
import type { Block } from '@/lib/blocks';
import { md } from '@/lib/markdown';
import { BLOG_CATEGORIES } from '@/content/blog';
import { list } from './collections';
import { readJsonFile } from './store';

export type Post = {
  id: string; slug: string; title: string; meta: string; summary: string; body: string; faq: { q: string; a: string }[];
  status: 'draft' | 'review' | 'published'; source: 'manual' | 'auto'; author: string; reviewer: string; keyword?: string; similarity?: number;
  createdAt: string; updatedAt: string; publishedAt?: string; cover?: string;
  coverAlt?: string; category?: string; tags?: string[]; seoTitle?: string; ogImage?: string; canonical?: string; noindex?: boolean; scheduledAt?: string; featured?: boolean;
  revisions?: { at: string; by: string; title: string; summary: string; meta: string; body: string }[];
};
export type Category = { id: string; slug: string; name: string; description: string; image?: string; seoTitle?: string; meta?: string; order: number };
/** Pages created in the admin page builder. */
export type CustomPage = PageOverride & { id: string; path: string; title: string; createdAt: string };
export type PageOverride = {
  seoTitle?: string; meta?: string; h1?: string; intro?: string; extra?: string; hidden?: boolean; at?: string;
  eyebrow?: string; image?: string; imageAlt?: string; ogImage?: string; canonical?: string; noindex?: boolean; keyword?: string;
  heroStyle?: 'default' | 'image' | 'minimal'; hideFacts?: boolean; hideCta?: boolean; hideAside?: boolean; facts?: { label: string; value: string }[];
  blocks?: Block[]; css?: string;
};
export type Faq = { id: string; q: string; a: string; order: number };
export type Testimonial = { id: string; name: string; country: string; text: string; rating: number; approved: boolean; consent: boolean; at: string };
export type Partner = { id: string; name: string; logo: string; link: string };
export type MediaItem = { id: string; file: string; name: string; type: string; size: number; alt: string; at: string };
export type ServiceOverrides = { hidden: string[]; prices: Record<string, string>; notes: Record<string, string> };
export type PageTranslation = { seoTitle?: string; meta?: string; eyebrow?: string; h1?: string; intro?: string; sections?: Section[]; at: string };
export type Translations = Record<string, Record<string, PageTranslation>>;

export const getPosts = cache(() => list<Post>('posts'));
export const getPublishedPosts = cache(async () => (await getPosts()).filter((p) => p.status === 'published' && (!p.scheduledAt || p.scheduledAt <= new Date().toISOString())).sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')));
export const getOverrides = cache(() => readJsonFile<Record<string, PageOverride>>('content.json', {}));
export const getCustomPages = cache(() => list<CustomPage>('custom-pages'));
export const getCategories = cache(async () => {
  const saved = await list<Category>('categories');
  if (saved.length) return saved.sort((a, b) => a.order - b.order);
  return BLOG_CATEGORIES.map((c, i): Category => ({ id: c.slug, slug: c.slug, name: c.name, description: c.description, order: i }));
});
export const getFaqs = cache(async () => (await list<Faq>('faqs')).sort((a, b) => a.order - b.order));
export const getTestimonials = cache(async () => (await list<Testimonial>('testimonials')).filter((t) => t.approved && t.consent));
export const getPartners = cache(() => list<Partner>('partners'));
export const getServiceOverrides = cache(() => readJsonFile<ServiceOverrides>('services.json', { hidden: [], prices: {}, notes: {} }));
export const getTranslations = cache(() => readJsonFile<Translations>('translations.json', {}));

export function postToPage(p: Post): Page {
  return {
    path: `/blog/${p.slug}/`, seoTitle: p.seoTitle || `${p.title} | Abu Dhabi Golden Visa`, meta: p.meta || p.summary, eyebrow: p.category ? p.category : 'Guide', h1: p.title, intro: p.summary, image: p.cover, imageAlt: p.coverAlt || p.title,
    cta: { label: 'Check My Eligibility', href: '/visa-check/' },
    sections: [
      { type: 'html', html: md(p.body) },
      ...(p.faq.length ? [{ type: 'faq', title: 'Frequently asked questions', items: p.faq } as Section] : []),
      { type: 'tool', tool: 'lead', title: 'Talk to an advisor', intro: 'Free first consultation. We reply on WhatsApp in your language.' },
    ],
    related: ['/blog/', '/golden-visa/', '/golden-visa-cost/'],
    article: { author: p.author, reviewer: p.reviewer, reviewed: new Date(p.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), minutes: Math.max(2, Math.round(p.body.split(/\s+/).length / 220)), summary: p.summary },
  };
}

export type Chat = { id: string; at: string; updated: string; lang: string; page: string; messages: { role: 'user' | 'assistant'; content: string; at: string }[] };
