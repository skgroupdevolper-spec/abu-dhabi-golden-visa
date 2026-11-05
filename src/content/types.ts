export type Section =
  | { type: 'text'; title: string; body: string[] }
  | { type: 'list'; title: string; intro?: string; items: string[] }
  | { type: 'table'; title: string; intro?: string; head: string[]; rows: string[][]; note?: string }
  | { type: 'steps'; title: string; intro?: string; items: { title: string; text: string }[]; note?: string }
  | { type: 'cards'; title: string; intro?: string; items: { title: string; text: string; href: string }[] }
  | { type: 'faq'; title: string; items: { q: string; a: string }[] }
  | { type: 'tool'; tool: 'calculator' | 'eligibility' | 'lead'; title?: string; intro?: string };

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
};
