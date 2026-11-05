import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm, CopyButton, Submit } from '@/components/dash/ActionForm';
import { F } from '@/components/dash/Fields';
import { Icon } from '@/components/Icon';
import { PAGES } from '@/content/pages';
import { LOCALES } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getCustomPages, getOverrides, getPublishedPosts } from '@/lib/server/content';
import { getSecrets } from '@/lib/server/settings';
import { saveSeoSettings, submitAll } from '../../seo-actions';

export const metadata: Metadata = { title: 'SEO & Google' };

export default async function Seo() {
  await requireAdmin(FULL);
  const [sec, over, customs, posts] = await Promise.all([getSecrets(), getOverrides(), getCustomPages(), getPublishedPosts()]);
  const pages = PAGES.filter((p) => !p.path.startsWith('/blog/')).map((p) => ({ path: p.path, h1: over[p.path]?.h1 || p.h1, t: over[p.path]?.seoTitle || p.seoTitle, m: over[p.path]?.meta || p.meta, img: over[p.path]?.image || p.image, noindex: over[p.path]?.noindex }));
  const issues = pages.filter((p) => p.t.length > 62 || p.t.length < 30 || p.m.length < 110 || p.m.length > 160 || !p.img);
  const total = (PAGES.length + 1 + customs.length + posts.length) * LOCALES.length;
  const sitemap = `${SITE.url}/sitemap.xml`;
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Website</p><h1>SEO &amp; Google</h1></div><a className="btn" href="/sitemap.xml" target="_blank" rel="noopener"><Icon name="ext" size={15} /> Open sitemap</a></div>
      <div className="grid4" style={{ marginBottom: 16 }}>
        <div className="kpi"><small>Addresses in the sitemap</small><b>{total.toLocaleString('en-US')}</b><span className="small muted">{LOCALES.length} languages</span></div>
        <div className="kpi"><small>Pages with SEO to improve</small><b>{issues.length}</b><span className="small muted">of {pages.length}</span></div>
        <div className="kpi"><small>Published blog posts</small><b>{posts.length}</b></div>
        <div className="kpi goldbg"><small>Google verification</small><b style={{ fontSize: 20 }}>{sec.seo.googleVerify ? 'Connected' : 'Not added'}</b></div>
      </div>
      <div className="cols">
        <div className="stack">
          <div className="panel">
            <h2>Get indexed fast</h2>
            <ol className="help" style={{ paddingInlineStart: 18, display: 'grid', gap: 6, marginTop: 10 }}>
              <li>Open <a href="https://search.google.com/search-console" target="_blank" rel="noopener">Google Search Console</a>, add the property <b>{SITE.url}</b> and choose the <b>HTML tag</b> method. Paste the code below and save.</li>
              <li>In Search Console open <b>Sitemaps</b> and submit: <code className="k">{sitemap}</code> <CopyButton text={sitemap} label="Copy" /></li>
              <li>Do the same in <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener">Bing Webmaster Tools</a> (it can import from Google).</li>
              <li>Press <b>Send all pages now</b> below. Every time you save a page or publish a post it is sent again automatically, in all {LOCALES.length} languages.</li>
            </ol>
            <ActionForm action={submitAll}><div style={{ marginTop: 12 }}><Submit>Send all pages now (IndexNow)</Submit></div></ActionForm>
          </div>
          <div className="panel">
            <h2>Verification &amp; homepage</h2>
            <ActionForm action={saveSeoSettings} className="form" >
              <F name="googleVerify" label="Google Search Console code (or paste the whole meta tag)" value={sec.seo.googleVerify} full />
              <F name="bingVerify" label="Bing Webmaster code" value={sec.seo.bingVerify} full />
              <F name="homeTitle" label="Homepage SEO title" value={sec.seo.homeTitle} full />
              <F name="homeMeta" label="Homepage description" value={sec.seo.homeMeta} type="textarea" rows={2} full />
              <div className="full"><Submit>Save</Submit></div>
            </ActionForm>
            <p className="help" style={{ marginTop: 10 }}>Analytics and tracking codes are in <Link href="/admin/settings/">Site settings</Link>.</p>
          </div>
          <div className="panel">
            <h2>Already done for every page</h2>
            <ul className="checks" style={{ marginTop: 10 }}>
              {['Unique SEO title and description per page and language', 'hreflang links between all 20 languages and x-default', 'XML sitemap with images and last-change dates', 'Canonical links, robots rules and noindex control', 'Open Graph and X/Twitter cards with the featured image', 'Structured data: organisation, blog articles and FAQs', 'Fast static pages that refresh within a minute of an edit'].map((t) => <li key={t} className="ok"><Icon name="check" size={14} /> {t}</li>)}
            </ul>
          </div>
        </div>
        <div className="panel">
          <div className="panel-h"><h2>Pages to improve</h2><span className="small muted">Title 30–62, description 110–160, featured image</span></div>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Page</th><th>Title</th><th>Desc.</th><th>Image</th></tr></thead><tbody>
            {issues.slice(0, 60).map((p) => (
              <tr key={p.path}><td><Link href={`/admin/pages/edit/?path=${encodeURIComponent(p.path)}`}>{p.h1}</Link></td>
                <td className={p.t.length > 62 || p.t.length < 30 ? 'bad' : ''}>{p.t.length}</td><td className={p.m.length < 110 || p.m.length > 160 ? 'bad' : ''}>{p.m.length}</td><td>{p.img ? '✓' : '—'}</td></tr>
            ))}
          </tbody></table></div>
        </div>
      </div>
    </>
  );
}
