import { ServiceSidebar } from './ServiceSidebar';
import { isServicePage } from '@/content/services-catalog';
import type { Page, Section } from '@/content/types';
import { getPage } from '@/content/pages';
import type { Locale } from '@/lib/i18n';
import { Calculator } from './Calculator';
import { Eligibility } from './Eligibility';
import { LeadForm } from './LeadForm';
import { Icon } from './Icon';
import { L } from './L';
import { TranslationNotice } from './TranslationNotice';

const CARD_ICONS = ['home', 'briefcase', 'rocket', 'user', 'star', 'spark', 'cap', 'heart', 'shield', 'globe'];

export function SectionView({ s, locale, i }: { s: Section; locale: Locale; i: number }) {
  switch (s.type) {
    case 'text':
      return (
        <section className="block" data-reveal>
          <h2>{s.title}</h2>
          <div style={{ display: 'grid', gap: 14, maxWidth: '70ch' }}>
            {s.body.map((p) => <p key={p.slice(0, 30)} className="lead">{p}</p>)}
          </div>
        </section>
      );
    case 'list':
      return (
        <section className="block" data-reveal>
          <h2>{s.title}</h2>
          {s.intro && <p className="intro">{s.intro}</p>}
          <ul className="ticks">{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
        </section>
      );
    case 'table':
      return (
        <section className="block" data-reveal>
          <h2>{s.title}</h2>
          {s.intro && <p className="intro">{s.intro}</p>}
          <div className="tbl glass">
            <table>
              <thead><tr>{s.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {s.rows.map((r) => (
                  <tr key={r.join('|')}>
                    {r.map((c, j) => <td key={j}>{c.startsWith('/') ? <L locale={locale} href={c}>{getPage(c)?.h1 ?? c}</L> : c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {s.note && <p className="note">{s.note}</p>}
        </section>
      );
    case 'steps':
      return (
        <section className="block" data-reveal>
          <h2>{s.title}</h2>
          {s.intro && <p className="intro">{s.intro}</p>}
          <div className="steps">
            {s.items.map((st, k) => (
              <div className="step glass" key={st.title}>
                <span className="n">{k + 1}</span>
                <div><b>{st.title}</b><span>{st.text}</span></div>
              </div>
            ))}
          </div>
          {s.note && <p className="note">{s.note}</p>}
        </section>
      );
    case 'cards':
      return (
        <section className="block" data-reveal>
          <h2>{s.title}</h2>
          {s.intro && <p className="intro">{s.intro}</p>}
          <div className="grid">
            {s.items.map((c, k) => (
              <L key={c.href} locale={locale} href={c.href} className="card glass">
                <span className="ico"><Icon name={CARD_ICONS[(k + i) % CARD_ICONS.length]} /></span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <span className="go">Learn more →</span>
              </L>
            ))}
          </div>
        </section>
      );
    case 'faq':
      return (
        <section className="block faq" data-reveal>
          <h2>{s.title}</h2>
          {s.items.map((f, k) => (
            <details key={f.q} open={k === 0}>
              <summary>{f.q}<i aria-hidden="true">+</i></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      );
    case 'tool':
      return (
        <section className="block" data-reveal>
          {s.title && <h2>{s.title}</h2>}
          {s.intro && <p className="intro">{s.intro}</p>}
          {s.tool === 'calculator' ? <Calculator /> : s.tool === 'eligibility' ? <Eligibility /> : <LeadForm source="page" />}
        </section>
      );
  }
}

export function PageView({ page, locale }: { page: Page; locale: Locale }) {
  const withSide = isServicePage(page.path);
  const parts = page.path.split('/').filter(Boolean);
  const crumbs = parts.slice(0, -1).map((_, k) => '/' + parts.slice(0, k + 1).join('/') + '/');
  return (
    <>
      <header className="phero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <L locale={locale} href="/">Home</L>
            {crumbs.map((c) => getPage(c) && (<span key={c}>/ <L locale={locale} href={c}>{getPage(c)!.eyebrow}</L></span>))}
          </nav>
          <p className="eyebrow" style={{ marginTop: 18 }}>{page.eyebrow}</p>
          <h1>{page.h1}</h1>
          <p className="lead">{page.intro}</p>
          {page.cta && (
            <div className="cta">
              <L locale={locale} href={page.cta.href} className="btn btn-red">{page.cta.label} <Icon name="arrow" size={18} className="arrow" /></L>
              <L locale={locale} href="/golden-visa-cost/" className="btn btn-glass">Calculate Visa Cost</L>
            </div>
          )}
          <TranslationNotice locale={locale} />
        </div>
      </header>
      <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
        <div className={withSide ? 'svc-layout' : undefined}>
        {withSide && <ServiceSidebar current={page.path} locale={locale} />}
        <div className={withSide ? 'svc-main' : undefined}>
        {page.article && (
          <p className="byline block" style={{ marginBottom: 0 }}>
            By <b>{page.article.author}</b> · Reviewed by <b>{page.article.reviewer}</b> · Last reviewed {page.article.reviewed} · {page.article.minutes} min read
          </p>
        )}
        {page.sections.map((s, i) => <SectionView key={i} s={s} locale={locale} i={i} />)}
        {page.related && page.related.length > 0 && (
          <section className="block" data-reveal>
            <h2>Related</h2>
            <div className="grid">
              {page.related.map((r) => getPage(r) && (
                <L key={r} locale={locale} href={r} className="card glass">
                  <p className="eyebrow">{getPage(r)!.eyebrow}</p>
                  <h3>{getPage(r)!.h1}</h3>
                  <span className="go">Read more →</span>
                </L>
              ))}
            </div>
          </section>
        )}
        </div>
        </div>
      </div>
    </>
  );
}
