import type { CSSProperties, ReactNode } from 'react';
import { preload } from 'react-dom';
import { Booking } from './Booking';
import { AboutHub, ContactHub } from './CompanyPages';
import { FlightPath } from './FlightPath';
import type { Block } from '@/lib/blocks';
import type { PageOverride } from '@/lib/server/content';
import { BlockView } from './BlockView';
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
import { ApplyWizard } from './ApplyWizard';
import { SITE, waLink } from '@/lib/site';

const CARD_ICONS = ['home', 'briefcase', 'rocket', 'user', 'star', 'spark', 'cap', 'heart', 'shield', 'globe'];

const DOCS_RE = /document|send us|what you need|have ready|to send|bring/i;
const sid = (t?: string) => (t ? 's-' + t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) : undefined);

function Head({ title, k, icon }: { title?: string; k: number; icon: string }) {
  if (!title) return null;
  return (
    <div className="bh">
      <span className="bn" aria-hidden="true"><Icon name={icon} size={20} /></span>
      <h2>{title}</h2>
    </div>
  );
}

export function SectionView({ s, locale, i }: { s: Section; locale: Locale; i: number }) {
  switch (s.type) {
    case 'text':
      return (
        <section className="block" id={sid(s.title)} data-reveal>
          <Head title={s.title} k={i} icon="spark" />
          <div className="prose-lite">
            {s.body.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}
          </div>
        </section>
      );
    case 'list': {
      const style = s.style ?? (DOCS_RE.test(s.title) ? 'docs' : 'ticks');
      return (
        <section className="block" id={sid(s.title)} data-reveal>
          <Head title={s.title} k={i} icon={style === 'docs' ? 'doc' : style === 'cards' ? 'shield' : 'check'} />
          {s.intro && <p className="intro">{s.intro}</p>}
          {style === 'docs' ? (
            <ul className="doc-grid">{s.items.map((it) => <li key={it}><span className="di"><Icon name="doc" size={18} /></span><span>{it}</span></li>)}</ul>
          ) : style === 'cards' ? (
            <ul className="req-grid">{s.items.map((it, k) => <li key={it}><span className="rn">{String(k + 1).padStart(2, '0')}</span><span>{it}</span></li>)}</ul>
          ) : (
            <ul className="ticks">{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
          )}
        </section>
      );
    }
    case 'table':
      return (
        <section className="block" id={sid(s.title)} data-reveal>
          <Head title={s.title} k={i} icon="coins" />
          {s.intro && <p className="intro">{s.intro}</p>}
          <div className="tbl">
            <table>
              <thead><tr>{s.head.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
              <tbody>
                {s.rows.map((r) => (
                  <tr key={r.join('|')} className={r[1] === 'Total' ? 'total' : undefined}>
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
        <section className="block" id={sid(s.title)} data-reveal>
          <Head title={s.title} k={i} icon="clock" />
          {s.intro && <p className="intro">{s.intro}</p>}
          <ol className="timeline">
            {s.items.map((st, k) => (
              <li key={st.title}>
                <span className="tn">{k + 1}</span>
                <div><b>{st.title}</b><span>{st.text}</span></div>
              </li>
            ))}
          </ol>
          {s.note && <p className="note">{s.note}</p>}
        </section>
      );
    case 'cards':
      return (
        <section className="block" id={sid(s.title)} data-reveal>
          <Head title={s.title} k={i} icon="grid" />
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
        <section className="block faq" id={sid(s.title)} data-reveal>
          <Head title={s.title} k={i} icon="spark" />
          {s.items.map((f, k) => (
            <details key={f.q} open={k === 0}>
              <summary>{f.q}<i aria-hidden="true">+</i></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      );
    case 'html':
      return (
        <section className="block prose" id={sid(s.title)} data-reveal>
          {s.title && <Head title={s.title} k={i} icon="doc" />}
          <div dangerouslySetInnerHTML={{ __html: s.html }} />
        </section>
      );
    case 'tool':
      if (s.tool === 'contact-hub') return <ContactHub locale={locale} />;
      if (s.tool === 'about-hub') return <AboutHub locale={locale} />;
      return (
        <section className={`block${s.tool === 'flight' ? ' block-flight' : ''}`} id={s.tool === 'apply' ? 'apply' : s.tool === 'booking' ? 'book' : sid(s.title)} data-reveal={s.tool === 'apply' || s.tool === 'flight' ? undefined : ''}>
          {s.title && s.tool !== 'booking' && s.tool !== 'flight' && <Head title={s.title} k={i} icon={s.tool === 'calculator' ? 'calc' : s.tool === 'eligibility' ? 'check' : 'wa'} />}
          {s.intro && s.tool !== 'booking' && s.tool !== 'flight' && <p className="intro">{s.intro}</p>}
          {s.tool === 'calculator' ? <Calculator /> : s.tool === 'eligibility' ? <Eligibility /> : s.tool === 'apply' ? <ApplyWizard /> : s.tool === 'booking' ? <Booking title={s.title} intro={s.intro} /> : s.tool === 'flight' ? <FlightPath title={s.title} intro={s.intro} /> : <LeadForm source="page" />}
        </section>
      );
  }
}

export type MoreLink = { href: string; title: string; image?: string; label?: string };
export function PageView({ page, locale, translated, price, hidden = [], blocks, o = {}, reviews = [], before, more = [] }: { page: Page; locale: Locale; translated?: boolean; price?: string; hidden?: string[]; blocks?: Block[]; o?: PageOverride; reviews?: { name: string; country: string; text: string; rating: number }[]; before?: ReactNode; more?: MoreLink[] }) {
  const withSide = isServicePage(page.path);
  const isApply = page.path === '/apply/';
  const parts = page.path.split('/').filter(Boolean);
  const crumbs = parts.slice(0, -1).map((_, k) => '/' + parts.slice(0, k + 1).join('/') + '/');
  const applyHref = `/apply/?service=${encodeURIComponent(page.apply || 'golden-visa')}`;
  const facts = price ? [{ label: 'Price', value: price }, ...(page.facts ?? []).filter((f) => !/price|fees? from|cost/i.test(f.label))] : page.facts ?? [];
  const jump = (blocks ? [] : page.sections).filter((x) => 'title' in x && x.title && x.type !== 'tool').slice(0, 8) as { title: string }[];
  const wa = waLink(`Hello, I would like help with: ${page.h1}`);
  const hub = page.sections.some((x) => x.type === 'tool' && (x.tool === 'contact-hub' || x.tool === 'about-hub'));
  const showAside = !withSide && !isApply && !page.article && !o.hideAside && !before && !hub;
  const postSide = !!page.article && !o.hideAside;
  const heroImg = page.image;
  if (heroImg) preload(heroImg, { as: 'image', fetchPriority: 'high' });
  const factsOn = !o.hideFacts && !before;
  return (
    <>
      <header className={`phero${isApply ? ' phero-apply' : ''}${o.heroStyle === 'minimal' ? ' phero-min' : ''}${o.heroStyle === 'image' && heroImg ? ' phero-cover' : ''}`} style={o.heroStyle === 'image' && heroImg ? ({ ['--hero-img' as string]: `url("${heroImg}")` } as CSSProperties) : undefined}>
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <L locale={locale} href="/">Home</L>
            {crumbs.map((c) => getPage(c) && (<span key={c}>/ <L locale={locale} href={c}>{getPage(c)!.eyebrow}</L></span>))}
            <span aria-current="page">/ {page.eyebrow}</span>
          </nav>
          <div className={`phero-grid${isApply || page.article || (!heroImg && (!factsOn || !facts.length)) ? ' solo' : ''}`}>
            <div>
              <p className="eyebrow pill-eyebrow"><Icon name="star" size={14} /> {page.eyebrow}</p>
              <h1>{page.h1}</h1>
              <p className="lead">{page.intro}</p>
              {!isApply && !page.article && !o.hideCta && (
                <div className="cta">
                  <L locale={locale} href={applyHref} className="btn btn-gold">Apply Now <Icon name="arrow" size={18} className="arrow" /></L>
                  {page.cta && page.cta.href !== '/free-consultation/' ? (
                    <L locale={locale} href={page.cta.href} className="btn btn-red">{page.cta.label}</L>
                  ) : (
                    <L locale={locale} href="/golden-visa-cost/" className="btn btn-red" data-open-calc="">Calculate Visa Cost</L>
                  )}
                  <a className="btn btn-glass" href={wa} target="_blank" rel="noopener"><Icon name="wa" size={18} /> WhatsApp</a>
                </div>
              )}
              {!isApply && !page.article && (
                <ul className="trust-row">
                  <li><Icon name="check" size={16} /> Free first review</li>
                  <li><Icon name="coins" size={16} /> Fees itemised before you pay</li>
                  <li><Icon name="globe" size={16} /> Inside or outside the UAE</li>
                </ul>
              )}
              {!translated && <TranslationNotice locale={locale} />}
            </div>
            {heroImg && !page.article && (!factsOn || !facts.length) && (
              <div className="phero-img"><img decoding="async" fetchPriority="high" width={1200} height={800} src={heroImg} alt={page.imageAlt || page.h1} /></div>
            )}
            {!isApply && !page.article && factsOn && facts.length > 0 && heroImg && (
              <div className="phero-img hero-pic"><img decoding="async" fetchPriority="high" width={1200} height={800} src={heroImg} alt={page.imageAlt || page.h1} /></div>
            )}
            {!isApply && !page.article && factsOn && facts.length > 0 && !heroImg && (
              <div className="phero-side">
              <aside className="facts" aria-label="Quick facts">
                <p className="eyebrow">Quick facts</p>
                <dl>
                  {facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
                </dl>
                <L locale={locale} href={applyHref} className="btn btn-gold" style={{ width: '100%' }}>Start my application</L>
                <L locale={locale} href="/free-consultation/" className="btn btn-glass" style={{ width: '100%' }}>Free consultation</L>
                <p className="fnote">Estimated figures. Final fees are confirmed in writing. Approval rests with the authorities.</p>
              </aside>
              </div>
            )}
          </div>
        </div>
      </header>
      {!isApply && !page.article && factsOn && facts.length > 0 && heroImg && (
        <section className="facts-strip" aria-label="Quick facts">
          <div className="wrap">
            <div className="fs-in">
              <dl className="fs-tiles">
                {facts.slice(0, 5).map((f) => <div key={f.label} className="fs-tile"><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
              </dl>
              <div className="fs-cta">
                <L locale={locale} href={applyHref} className="btn btn-gold">Start my application <Icon name="arrow" size={18} /></L>
                <L locale={locale} href="/free-consultation/" className="btn btn-glass">Free consultation</L>
              </div>
            </div>
            <p className="fnote">Estimated figures. Final fees are confirmed in writing. Approval rests with the authorities.</p>
          </div>
        </section>
      )}
      {!isApply && jump.length > 2 && (
        <nav className="onpage" aria-label="On this page">
          <div className="wrap"><div className="onpage-in">
            <span>On this page</span>
            {jump.map((j) => <a key={j.title} href={`#${sid(j.title)}`}>{j.title}</a>)}
          </div></div>
        </nav>
      )}
      <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
        <div className={withSide ? 'svc-layout' : showAside || postSide ? 'page-layout' : undefined}>
        {withSide && <ServiceSidebar current={page.path} locale={locale} hidden={hidden} />}
        <div className={withSide ? 'svc-main' : isApply || before || hub ? 'apply-main-wrap' : 'page-main'}>
        {page.article && heroImg && (
          <figure className="post-cover"><img decoding="async" width={1200} height={630} src={heroImg} alt={page.imageAlt || page.h1} fetchPriority="high" /></figure>
        )}
        {page.article && (
          <p className="byline block" style={{ marginBottom: 0 }}>
            By <b>{page.article.author}</b> · Reviewed by <b>{page.article.reviewer}</b> · Last reviewed {page.article.reviewed} · {page.article.minutes} min read
          </p>
        )}
        {before}
        {blocks ? <BlockView blocks={blocks} locale={locale} reviews={reviews} /> : page.sections.map((s, i) => <SectionView key={i} s={s} locale={locale} i={i} />)}
        {page.related && page.related.length > 0 && (
          <section className="block" data-reveal>
            <Head title="Related services and guides" k={0} icon="grid" />
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
        {postSide && (
          <aside className="side-post" aria-label="Contact and related">
            <div className="side-apply sp-box">
              <p className="eyebrow">Talk to an advisor</p>
              <h3>Questions about your visa?</h3>
              <p>Free first review of your case. We reply on WhatsApp within working hours.</p>
              <a className="btn btn-gold" href={wa} target="_blank" rel="noopener"><Icon name="wa" size={18} /> WhatsApp {SITE.whatsappDisplay}</a>
              <a className="btn btn-glass" style={{ border: '1px solid var(--line)' }} href={`tel:${SITE.phone}`}><Icon name="phone" size={18} /> Call us</a>
              <a className="btn btn-glass" style={{ border: '1px solid var(--line)' }} href={`mailto:${SITE.email}`}><Icon name="mail" size={18} /> {SITE.email}</a>
              <L locale={locale} href="/apply/" className="btn btn-red">Apply online <Icon name="arrow" size={18} /></L>
              {SITE.hours && <p className="fnote">{SITE.hours}</p>}
            </div>
            {more.length > 0 && (
              <div className="side-apply sp-more">
                <p className="eyebrow">More articles</p>
                {more.slice(0, 5).map((m) => (
                  <L key={m.href} locale={locale} href={m.href} className="sp-item">
                    {m.image && <img decoding="async" src={m.image} alt="" loading="lazy" />}
                    <span>{m.label && <small>{m.label}</small>}<b>{m.title}</b></span>
                  </L>
                ))}
                <L locale={locale} href="/blog/" className="go small">All articles →</L>
              </div>
            )}
          </aside>
        )}
        {showAside && (
          <aside className="side-apply" aria-label="Apply">
            <p className="eyebrow">Apply online</p>
            <h3>{page.eyebrow}</h3>
            <p>Start in a few minutes. We check your file and confirm the quote before you pay.</p>
            <ul>
              {(page.facts ?? []).slice(0, 3).map((f) => <li key={f.label}><Icon name="check" size={15} /> {f.label}: {f.value}</li>)}
            </ul>
            <L locale={locale} href={applyHref} className="btn btn-gold">Apply Now <Icon name="arrow" size={18} /></L>
            <L locale={locale} href="/golden-visa-cost/" className="btn btn-red" data-open-calc="">Calculate cost</L>
            <a className="btn btn-glass" style={{ border: '1px solid var(--line)' }} href={wa} target="_blank" rel="noopener"><Icon name="wa" size={18} /> WhatsApp</a>
          </aside>
        )}
        </div>
      </div>
      {!isApply && (
        <section className="cta-band" data-reveal>
          <div className="wrap">
            <div className="cta-band-in">
              <div>
                <p className="eyebrow">Ready when you are</p>
                <h2>Start your application online in a few minutes</h2>
                <p className="lead">Choose the service, add your family and upload what you have. Your advisor checks everything and confirms the quote before you pay.</p>
              </div>
              <div className="cta">
                <L locale={locale} href={applyHref} className="btn btn-gold">Apply Now <Icon name="arrow" size={18} /></L>
                <a className="btn btn-glass" href={wa} target="_blank" rel="noopener"><Icon name="wa" size={18} /> {SITE.whatsappDisplay}</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
