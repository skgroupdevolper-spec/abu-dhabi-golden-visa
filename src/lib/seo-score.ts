// SEO score for an article (same checks as the article editor), used in the admin lists.
export type SeoInput = { title: string; seoTitle?: string; meta?: string; summary?: string; cover?: string; category?: string; body?: string; keyword?: string };
export function seoChecks(v: SeoInput) {
  const title = v.seoTitle || `${v.title} | Abu Dhabi Golden Visa`;
  const meta = v.meta || v.summary || '';
  const kw = (v.keyword ?? '').toLowerCase();
  const words = (v.body ?? '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return [
    { ok: title.length >= 30 && title.length <= 62, t: `SEO title ${title.length} characters (30–62)` },
    { ok: meta.length >= 110 && meta.length <= 160, t: `Description ${meta.length} characters (110–160)` },
    { ok: !!v.cover, t: 'Cover image' },
    { ok: !!v.category, t: 'Category' },
    { ok: words >= 600, t: `${words} words (600+)` },
    { ok: !kw || v.title.toLowerCase().includes(kw), t: 'Keyword in the title' },
    { ok: !kw || meta.toLowerCase().includes(kw), t: 'Keyword in the description' },
    { ok: /\]\(\/|href="\/|href: '\//.test(v.body ?? ''), t: 'Links to other pages' },
  ];
}
export const seoScore = (v: SeoInput) => { const c = seoChecks(v); return { score: Math.round((c.filter((x) => x.ok).length / c.length) * 100), missing: c.filter((x) => !x.ok).map((x) => x.t) }; };
