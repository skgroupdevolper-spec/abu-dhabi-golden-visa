import type { Metadata } from 'next';
import Link from 'next/link';
import { PAGES } from '@/content/pages';
import { requireAdmin } from '@/lib/server/auth';
import { getOverrides } from '@/lib/server/content';

export const metadata: Metadata = { title: 'Pages' };

export default async function Pages({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q = '' } = await searchParams;
  const over = await getOverrides();
  const n = q.toLowerCase();
  const rows = PAGES.filter((p) => !n || `${p.h1} ${p.path}`.toLowerCase().includes(n));
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Pages</p><h1>Every page, <span className="gold">editable.</span></h1></div>
        <form className="row" action="/admin/pages/"><input name="q" defaultValue={q} placeholder="Search pages" style={{ width: 240 }} /><button className="btn" type="submit">Search</button></form></div>
      <p className="help" style={{ marginBottom: 12 }}>{PAGES.length} pages. Change the title, SEO text, introduction, add extra content, or hide a page. The homepage hero and sections are edited in code; its FAQs are under FAQs.</p>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Page</th><th>Address</th><th>Status</th></tr></thead><tbody>
        {rows.map((p) => (
          <tr key={p.path}><td><Link href={`/admin/pages/edit/?path=${encodeURIComponent(p.path)}`}>{over[p.path]?.h1 || p.h1}</Link><div className="small muted">{p.eyebrow}</div></td><td><a href={p.path} target="_blank" rel="noopener">{p.path}</a></td>
            <td>{over[p.path]?.hidden ? <span className="pill closed">Hidden</span> : over[p.path] ? <span className="pill new">Edited</span> : <span className="muted small">Original</span>}</td></tr>
        ))}
      </tbody></table></div>
    </>
  );
}
