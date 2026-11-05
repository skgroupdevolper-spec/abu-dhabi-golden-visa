// Blog listing: category filter, featured article and image cards (admin posts and starting guides).
import { BLOG } from '@/content/blog';
import type { Locale } from '@/lib/i18n';
import type { Category, Post } from '@/lib/server/content';
import { Icon } from './Icon';
import { L } from './L';
import { coverUrl } from '@/lib/cover';

type Item = { href: string; title: string; summary: string; image?: string; cat?: string; minutes: number; date?: string; featured?: boolean };

export function BlogIndex({ locale, posts, categories, current }: { locale: Locale; posts: Post[]; categories: Category[]; current?: string }) {
  const name = (slug?: string) => categories.find((c) => c.slug === slug)?.name;
  const items: Item[] = [
    ...posts.map((p) => ({ href: `/blog/${p.slug}/`, title: p.title, summary: p.summary, image: p.cover, cat: p.category, minutes: Math.max(2, Math.round(p.body.split(/\s+/).length / 220)), date: p.publishedAt, featured: p.featured })),
    ...BLOG.map((b) => ({ href: b.path, title: b.h1, summary: b.intro, image: b.image, cat: b.category, minutes: b.article?.minutes ?? 5 })),
  ].filter((x) => !current || x.cat === current);
  const top = items.find((x) => x.featured) ?? items[0];
  const rest = items.filter((x) => x !== top);
  const Img = ({ it, big }: { it: Item; big?: boolean }) => (
    <img decoding="async" src={it.image || coverUrl(it.title, name(it.cat))} alt={it.title} loading={big ? 'eager' : 'lazy'} />
  );
  return (
    <section className="block blog-index">
      <nav className="bi-cats" aria-label="Categories">
        <L locale={locale} href="/blog/" className={!current ? 'on' : ''}>All guides</L>
        {categories.map((c) => <L key={c.slug} locale={locale} href={`/blog/category/${c.slug}/`} className={current === c.slug ? 'on' : ''}>{c.name}</L>)}
      </nav>
      {top && (
        <L locale={locale} href={top.href} className="bi-feat">
          <div className="bi-im"><Img it={top} big /></div>
          <div className="bi-tx">
            {name(top.cat) && <span className="bi-cat">{name(top.cat)}</span>}
            <h2>{top.title}</h2>
            <p>{top.summary}</p>
            <span className="bi-meta"><Icon name="clock" size={15} /> {top.minutes} min read</span>
          </div>
        </L>
      )}
      <div className="bi-grid">
        {rest.map((it) => (
          <L key={it.href} locale={locale} href={it.href} className="bi-card">
            <div className="bi-im"><Img it={it} /></div>
            <div className="bi-tx">
              {name(it.cat) && <span className="bi-cat">{name(it.cat)}</span>}
              <h3>{it.title}</h3>
              <p>{it.summary}</p>
              <span className="bi-meta"><Icon name="clock" size={14} /> {it.minutes} min read</span>
            </div>
          </L>
        ))}
      </div>
      {!items.length && <p className="muted">No articles in this category yet.</p>}
    </section>
  );
}
