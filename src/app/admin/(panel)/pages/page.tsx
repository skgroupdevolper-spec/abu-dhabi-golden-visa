import type { Metadata } from 'next';
import Link from 'next/link';
import { PAGES } from '@/content/pages';
import { requireAdmin } from '@/lib/server/auth';
import { getCustomPages, getOverrides, getTranslations } from '@/lib/server/content';
import { Icon } from '@/components/Icon';
import { NewPageForm } from '@/components/dash/NewPageForm';
import { LOCALES } from '@/lib/i18n';
import { deleteCustomPage, duplicatePage } from '../../content-actions';

const FLAG: Record<string, string> = { en: 'GB', ar: 'AE', ru: 'RU', tr: 'TR', zh: 'CN', fr: 'FR', de: 'DE', it: 'IT', es: 'ES', ro: 'RO', pt: 'PT', at: 'AT', pl: 'PL', hu: 'HU', hr: 'HR', sk: 'SK', cs: 'CZ', hi: 'IN', id: 'ID', ur: 'PK' };

export const metadata: Metadata = { title: 'Pages & builder' };

function score(title: string, meta: string, img?: string) {
  let s = 0;
  if (title.length >= 30 && title.length <= 62) s++;
  if (meta.length >= 110 && meta.length <= 160) s++;
  if (img) s++;
  return Math.round((s / 3) * 100);
}

export default async function Pages({ searchParams }: { searchParams: Promise<{ q?: string; t?: string }> }) {
  await requireAdmin();
  const { q = '', t = 'all' } = await searchParams;
  const [over, customs, tr] = await Promise.all([getOverrides(), getCustomPages(), getTranslations()]);
  const stOf = (code: string, path: string, at?: string) => { const x = tr[code]?.[path]; return !x ? 'no' : !x.manual && at && at > x.at ? 'old' : 'ok'; };
  const all = [
    { path: '/', h1: 'Homepage', group: 'Main', seoTitle: over['/']?.seoTitle || 'Abu Dhabi Golden Visa | 10-Year UAE Residency Consultants', meta: over['/']?.meta || 'home', image: '/images/skyline.webp', o: over['/'] ?? {}, custom: false },
    ...customs.map((c) => ({ path: c.path, h1: c.h1 || c.title, group: 'Custom page', seoTitle: c.seoTitle || c.title, meta: c.meta || '', image: c.image, o: c, custom: true })),
    ...PAGES.filter((p) => !p.path.startsWith('/blog/') || p.path === '/blog/').map((p) => {
      const o = over[p.path] ?? {};
      const group = p.path.startsWith('/golden-visa') ? 'Golden Visa' : p.path.startsWith('/family') ? 'Family' : p.path.startsWith('/services/') || p.path.startsWith('/document-services/') ? 'Service' : 'Main';
      return { path: p.path, h1: o.h1 || p.h1, group, seoTitle: o.seoTitle || p.seoTitle, meta: o.meta || p.meta, image: o.image || p.image, o, custom: false };
    }),
  ];
  const n = q.toLowerCase();
  const rows = all.filter((p) => (t === 'all' || p.group === t) && (!n || `${p.h1} ${p.path}`.toLowerCase().includes(n)));
  const groups = ['all', 'Main', 'Golden Visa', 'Family', 'Service', 'Custom page'];
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Content</p><h1>Pages &amp; builder</h1></div><NewPageForm /></div>
      <div className="row" style={{ marginBottom: 14, justifyContent: 'space-between' }}>
        <nav className="tabs">{groups.map((g) => <a key={g} href={`/admin/pages/?t=${encodeURIComponent(g)}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className={t === g ? 'on' : ''}>{g === 'all' ? 'All pages' : g}</a>)}</nav>
        <form className="row" action="/admin/pages/"><input type="hidden" name="t" value={t} /><input name="q" defaultValue={q} placeholder="Search pages" style={{ width: 240 }} /><button className="btn btn-sm" type="submit">Search</button></form>
      </div>
      <p className="help" style={{ marginBottom: 12 }}>{rows.length} pages. Open any page to edit every section, add widgets, change the design, featured image and SEO. The homepage can hide, keep or add sections anywhere between its built-in parts. Blog articles are under Blog posts.</p>
      <div className="pg-list">
        {rows.map((p) => {
          const sc = score(p.seoTitle, p.meta, p.image);
          const secs = p.o.blocks?.length ?? PAGES.find((x) => x.path === p.path)?.sections.length ?? 0;
          const edit = `/admin/pages/edit/?path=${encodeURIComponent(p.path)}`;
          return (
            <div key={p.path} className={`pg-row${p.o.hidden ? ' off' : ''}`}>
              <span className="pg-ic"><Icon name={p.path === '/' ? 'home' : p.custom ? 'plus' : 'doc'} size={20} /></span>
              <div className="pg-main">
                <Link href={edit} className="pg-t">{p.h1}</Link>
                <small>{p.path} · {secs} sections{p.o.at ? ` · updated ${new Date(p.o.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ' · original'} · <span className={`score s${sc >= 80 ? 'g' : sc >= 50 ? 'm' : 'b'}`}>SEO {sc}%</span>{p.o.hidden && <span className="pill closed" style={{ marginInlineStart: 6 }}>Hidden</span>}</small>
              </div>
              <div className="pg-langs" aria-label="Translations">
                {LOCALES.map((l) => {
                  const st = l.code === 'en' ? 'ok' : stOf(l.code, p.path, p.o.at);
                  return <Link key={l.code} href={l.code === 'en' ? edit : `/admin/languages/edit/?path=${encodeURIComponent(p.path)}&lang=${l.code}`} className={`lg ${st}`} title={`${l.name}: ${st === 'ok' ? 'translated' : st === 'old' ? 'needs update' : 'not translated'}`}><i>{FLAG[l.code] ?? l.code.toUpperCase()}</i>{l.code.toUpperCase()}</Link>;
                })}
              </div>
              <div className="pg-act">
                <Link className="btn btn-sm btn-gold" href={edit}><Icon name="pen" size={14} /> Edit</Link>
                <a className="btn btn-sm btn-ghost" href={p.path} target="_blank" rel="noopener" aria-label="View" title="View"><Icon name="ext" size={15} /></a>
                <form action={duplicatePage}><input type="hidden" name="path" value={p.path} /><button className="btn btn-sm btn-ghost" title="Duplicate" aria-label="Duplicate"><Icon name="copy" size={15} /></button></form>
                {p.custom && <form action={deleteCustomPage}><input type="hidden" name="path" value={p.path} /><button className="btn btn-sm btn-ghost btn-danger" title="Delete" aria-label="Delete"><Icon name="trash" size={15} /></button></form>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
