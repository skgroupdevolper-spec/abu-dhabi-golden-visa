// Renders page-builder blocks on the public site. Standard content blocks reuse the site's section
// design; layout and media blocks are drawn here. Every block carries its own style options.
import type { CSSProperties } from 'react';
import { arr, blockToSection, str, type Block } from '@/lib/blocks';
import { md } from '@/lib/markdown';
import type { Locale } from '@/lib/i18n';
import { SITE, waLink } from '@/lib/site';
import { SectionView } from './PageView';
import { Icon } from './Icon';
import { L } from './L';

type Btn = { label?: string; href?: string };

function Buttons({ b1, b2, locale }: { b1: unknown; b2?: unknown; locale: Locale }) {
  const list = [...arr<Btn>(b1).slice(0, 1).map((b) => ({ ...b, k: 'gold' })), ...arr<Btn>(b2).slice(0, 1).map((b) => ({ ...b, k: 'glass' }))].filter((b) => b.label);
  if (!list.length) return null;
  return (
    <div className="cta bk-btns">
      {list.map((b) => b.href === 'wa'
        ? <a key={b.label} className={`btn btn-${b.k}`} href={waLink('Hello, I would like help.')} target="_blank" rel="noopener"><Icon name="wa" size={18} /> {b.label}</a>
        : <L key={b.label} locale={locale} href={b.href || '/apply/'} className={`btn btn-${b.k}`}>{b.label}{b.k === 'gold' && <Icon name="arrow" size={18} />}</L>)}
    </div>
  );
}

function youtube(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : '';
}

function Inner({ b, locale, i, reviews }: { b: Block; locale: Locale; i: number; reviews: { name: string; country: string; text: string; rating: number }[] }) {
  const d = b.data;
  const title = str(d.title);
  const H = title ? <div className="bh"><h2>{title}</h2></div> : null;
  switch (b.type) {
    case 'hero': {
      const layout = str(d.layout) || 'split';
      return (
        <div className={`bk-hero bk-hero-${layout}`} style={layout === 'cover' && str(d.image) ? ({ ['--hero-img' as string]: `url("${str(d.image)}")` } as CSSProperties) : undefined}>
          <div className="bk-hero-tx">
            {str(d.eyebrow) && <p className="eyebrow pill-eyebrow"><Icon name="star" size={14} /> {str(d.eyebrow)}</p>}
            {title && <h2 className="bk-hero-h">{title}</h2>}
            {str(d.text) && <p className="lead">{str(d.text)}</p>}
            <Buttons b1={d.b1} b2={d.b2} locale={locale} />
          </div>
          {layout === 'split' && str(d.image) && <div className="bk-hero-im"><img decoding="async" src={str(d.image)} alt={title} loading="lazy" /></div>}
        </div>
      );
    }
    case 'text':
      return <>{H}<div className="prose prose-lite" dangerouslySetInnerHTML={{ __html: md(str(d.body)) }} /></>;
    case 'image': {
      const img = str(d.src) ? <img decoding="async" src={str(d.src)} alt={str(d.alt)} loading="lazy" className="bk-img" /> : <div className="bk-ph"><Icon name="image" /> Add an image</div>;
      return <figure className="bk-fig">{str(d.href) ? <L locale={locale} href={str(d.href)}>{img}</L> : img}{str(d.caption) && <figcaption>{str(d.caption)}</figcaption>}</figure>;
    }
    case 'imageText':
      return (
        <div className={`bk-it${str(d.side) === 'left' ? ' left' : ''}`}>
          <div>{H}<div className="prose prose-lite" dangerouslySetInnerHTML={{ __html: md(str(d.body)) }} /><Buttons b1={d.b1} locale={locale} /></div>
          <div>{str(d.image) ? <img decoding="async" src={str(d.image)} alt={str(d.alt) || title} loading="lazy" className="bk-img" /> : <div className="bk-ph"><Icon name="image" /> Add an image</div>}</div>
        </div>
      );
    case 'cards':
      return (
        <>
          {H}{str(d.intro) && <p className="intro">{str(d.intro)}</p>}
          <div className={`bk-cards c${str(d.cols) || '3'}`}>
            {arr(d.items).map((c, k) => {
              const inner = (<>{c.image ? <img decoding="async" src={c.image} alt={c.title} loading="lazy" className="bk-card-img" /> : <span className="ico"><Icon name={c.icon || 'star'} /></span>}<h3>{c.title}</h3>{c.text && <p>{c.text}</p>}{c.href && <span className="go">Learn more →</span>}</>);
              return c.href ? <L key={k} locale={locale} href={c.href} className="card glass bk-card">{inner}</L> : <div key={k} className="card glass bk-card">{inner}</div>;
            })}
          </div>
        </>
      );
    case 'cta':
      return (
        <div className="bk-cta">
          <div>{title && <h2>{title}</h2>}{str(d.text) && <p className="lead">{str(d.text)}</p>}</div>
          <Buttons b1={d.b1} b2={d.b2} locale={locale} />
        </div>
      );
    case 'stats':
      return <div className="bk-stats">{arr(d.items).map((x, k) => <div key={k}><b>{x.value}</b><span>{x.label}</span></div>)}</div>;
    case 'video': {
      const url = str(d.url), yt = youtube(url);
      return <>{H}<div className="bk-video">{yt ? <iframe src={yt} title={title || 'Video'} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen /> : url ? <video src={url} controls preload="metadata" /> : <div className="bk-ph"><Icon name="video" /> Add a YouTube or MP4 link</div>}</div></>;
    }
    case 'gallery':
      return <>{H}<div className="bk-gallery">{arr(d.images).filter((g) => g.src).map((g, k) => <img decoding="async" key={k} src={g.src} alt={g.alt || ''} loading="lazy" />)}</div></>;
    case 'testimonials':
      return reviews.length ? (
        <>{H}<div className="bk-reviews">{reviews.slice(0, 6).map((r, k) => <figure key={k}><div className="stars">{'★'.repeat(r.rating)}</div><blockquote>{r.text}</blockquote><figcaption><b>{r.name}</b>{r.country && ` · ${r.country}`}</figcaption></figure>)}</div></>
      ) : null;
    case 'html':
      return <>{H}<div className="bk-html" dangerouslySetInnerHTML={{ __html: str(d.html) }} /></>;
    case 'spacer':
      return <div style={{ height: Math.max(0, Math.min(400, Number(d.size) || 40)) }} aria-hidden="true" />;
    case 'divider':
      return <hr className="bk-hr" />;
    default: {
      const s = blockToSection(b);
      return s ? <SectionView s={s} locale={locale} i={i} /> : null;
    }
  }
}

export function BlockView({ blocks, locale, reviews = [] }: { blocks: Block[]; locale: Locale; reviews?: { name: string; country: string; text: string; rating: number }[] }) {
  return (
    <>
      {blocks.filter((b) => !b.hidden).map((b, i) => {
        const st = b.style ?? {};
        const cls = ['bk', `bk-${b.type}`, `bg-${st.bg || 'none'}`, `pad-${st.pad || 'm'}`, `w-${st.width || 'normal'}`, `al-${st.align || 'left'}`, `ts-${st.titleSize || 'm'}`, `rd-${st.radius || 'm'}`, `sh-${st.shadow || 'none'}`, st.border ? 'bd' : '', `an-${st.anim || 'up'}`, st.hideMobile ? 'hide-m' : '', st.hideDesktop ? 'hide-d' : '', (st.className || '').replace(/[^\w\- ]/g, '')].filter(Boolean).join(' ');
        const style = st.bg === 'image' && st.bgImage ? ({ backgroundImage: `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url("${st.bgImage}")` } as CSSProperties) : undefined;
        return (
          <section key={b.id} id={st.anchor?.replace(/[^\w-]/g, '') || undefined} className={cls} style={style} data-reveal={st.anim === 'none' ? undefined : ''}>
            <div className="bk-in"><Inner b={b} locale={locale} i={i} reviews={reviews} /></div>
          </section>
        );
      })}
    </>
  );
}

export const siteName = () => SITE.name;
