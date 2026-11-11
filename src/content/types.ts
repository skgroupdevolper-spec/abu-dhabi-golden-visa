export type Section =
  | { type: 'text'; title: string; body: string[] }
  | { type: 'list'; title: string; intro?: string; items: string[]; style?: 'docs' | 'cards' | 'ticks' }
  | { type: 'table'; title: string; intro?: string; head: string[]; rows: string[][]; note?: string }
  | { type: 'steps'; title: string; intro?: string; items: { title: string; text: string }[]; note?: string }
  | { type: 'cards'; title: string; intro?: string; items: { title: string; text: string; href: string }[] }
  | { type: 'faq'; title: string; items: { q: string; a: string }[] }
  /** Switchable tabs: one panel per option (family member, visa type, permit group...). */
  | { type: 'tabs'; title: string; intro?: string; tabs: { label: string; sub?: string; text?: string; items?: string[]; facts?: { label: string; value: string }[] }[] }
  | { type: 'tool'; tool: 'calculator' | 'eligibility' | 'lead' | 'apply' | 'booking' | 'flight' | 'contact-hub' | 'about-hub'; title?: string; intro?: string }
  /** Rendered from the safe Markdown renderer only (blog posts, admin page additions). */
  | { type: 'html'; title?: string; html: string };

export type Page = {
  /** Path without language prefix, with trailing slash, e.g. "/golden-visa/property-investment/" */
  path: string;
  seoTitle: string;
  meta: string;
  eyebrow: string;
  h1: string;
  intro: string;
  cta?: { label: string; href: string };
  sections: Section[];
  related?: string[];
  /** Quick facts shown in the page hero (price from, processing time, validity...). */
  facts?: { label: string; value: string }[];
  /** Featured image (hero and social sharing). */
  image?: string;
  imageAlt?: string;
  /** Blog category name (articles). */
  category?: string;
  /** Service preselected in the online application (/apply/?service=...). */
  apply?: string;
  /** Blog articles: byline and review date (spec section 11). */
  article?: { author: string; reviewer: string; reviewed: string; minutes: number; summary: string };
};
