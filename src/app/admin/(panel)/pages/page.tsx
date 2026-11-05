import type { Metadata } from 'next';
import Link from 'next/link';
import { PAGES } from '@/content/pages';
import { requireAdmin } from '@/lib/server/auth';
import { getCustomPages, getOverrides } from '@/lib/server/content';
import { Icon } from '@/components/Icon';
import { NewPageForm } from '@/components/dash/NewPageForm';

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
  const [over, customs] = await Promise.all([getOverrides(), getCustomPages()]);
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
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Page</th><th>Type</th><th>SEO</th><th>Status</th><th></th></tr></thead><tbody>
        {rows.map((p) => {
          const sc = score(p.seoTitle, p.meta, p.image);
          return (
            <tr key={p.path}>
              <td><Link href={`/admin/pages/edit/?path=${encodeURIComponent(p.path)}`}>{p.h1}</Link><div className="small muted">{p.path}</div></td>
              <td><span className="small">{p.group}</span></td>
              <td><span className={`score s${sc >= 80 ? 'g' : sc >= 50 ? 'm' : 'b'}`}>{sc}%</span>{p.o.noindex && <span className="pill closed" style={{ marginInlineStart: 6 }}>noindex</span>}</td>
              <td>{p.o.hidden ? <span className="pill closed">Hidden</span> : p.o.blocks?.length ? <span className="pill ok">Built</span> : Object.keys(p.o).length ? <span className="pill new">Edited</span> : <span className="muted small">Original</span>}</td>
              <td className="num"><Link className="btn btn-sm" href={`/admin/pages/edit/?path=${encodeURIComponent(p.path)}`}><Icon name="pen" size={14} /> Edit</Link> <a className="btn btn-sm btn-ghost" href={p.path} target="_blank" rel="noopener" aria-label="View"><Icon name="ext" size={14} /></a></td>
            </tr>
          );
        })}
      </tbody></table></div>
    </>
  );
}
