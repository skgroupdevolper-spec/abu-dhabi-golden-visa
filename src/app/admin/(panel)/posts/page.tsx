import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG } from '@/content/blog';
import { requireAdmin } from '@/lib/server/auth';
import { getCategories, getPosts, getTranslations } from '@/lib/server/content';
import { day } from '@/lib/stages';
import { coverUrl } from '@/lib/cover';
import { postAction } from '../../content-actions';

export const metadata: Metadata = { title: 'Blog posts' };

export default async function Posts({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  await requireAdmin();
  const { s = 'all' } = await searchParams;
  const [posts, cats, tr] = await Promise.all([getPosts(), getCategories(), getTranslations()]);
  const nTr = (path: string) => Object.values(tr).filter((l) => l[path]).length;
  const rows = posts.filter((p) => s === 'all' || p.status === s);
  const n = (k: string) => posts.filter((p) => p.status === k).length;
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Blog posts</p><h1>Blog posts</h1></div><div className="row"><Link className="btn" href="/admin/categories/">Categories</Link><Link className="btn btn-gold" href="/admin/posts/new/">New article</Link></div></div>
      <div className="row" style={{ marginBottom: 14 }}>
        {[['all', `All (${posts.length})`], ['review', `Review queue (${n('review')})`], ['published', `Published (${n('published')})`], ['draft', `Drafts (${n('draft')})`]].map(([k, l]) => <Link key={k} href={`/admin/posts/?s=${k}`} className={`btn btn-sm${s === k ? ' btn-gold' : ''}`}>{l}</Link>)}
      </div>
      {rows.length === 0 ? <p className="empty">No posts here. Write one, or let the Auto Publisher draft them for review.</p> : (
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Article</th><th>Category</th><th>Status</th><th>Languages</th><th>Source</th><th>Updated</th><th></th></tr></thead><tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td><div className="row" style={{ flexWrap: 'nowrap' }}><span className="thumb"><img src={p.cover || coverUrl(p.title)} alt="" /></span><div><Link href={`/admin/posts/${p.id}/`}>{p.title}</Link><div className="small muted">/blog/{p.slug}/{p.similarity ? ` · similarity ${Math.round(p.similarity * 100)}%` : ''}{p.scheduledAt && p.scheduledAt > new Date().toISOString() ? ` · scheduled ${day(p.scheduledAt)}` : ''}</div></div></div></td>
              <td className="small">{cats.find((c) => c.slug === p.category)?.name ?? '—'}</td>
              <td><span className={`pill ${p.status === 'published' ? 'ok' : p.status === 'review' ? 'new' : ''}`}>{p.status}</span></td>
              <td><Link href={`/admin/posts/${p.id}/#translations`} className={`pill ${nTr(`/blog/${p.slug}/`) >= 19 ? 'ok' : nTr(`/blog/${p.slug}/`) ? 'new' : ''}`}>{nTr(`/blog/${p.slug}/`)}/19</Link></td>
              <td>{p.source === 'auto' ? 'Auto Publisher' : 'Manual'}</td>
              <td>{day(p.updatedAt)}</td>
              <td><form action={postAction} className="row"><input type="hidden" name="id" value={p.id} />
                {p.status !== 'published' ? <button className="btn btn-sm btn-gold" name="act" value="publish">Publish</button> : <a className="btn btn-sm" href={`/blog/${p.slug}/`} target="_blank" rel="noopener">View</a>}
                {p.status === 'published' && <button className="btn btn-sm" name="act" value="unpublish">Unpublish</button>}
                <button className="btn btn-sm btn-ghost btn-danger" name="act" value="delete">Delete</button></form></td>
            </tr>
          ))}
        </tbody></table></div>
      )}
      <div className="panel" style={{ marginTop: 16 }}>
        <h2>Built-in guides ({BLOG.length})</h2>
        <p className="help">These 20 guides from the specification are part of the website. Edit their titles, text and SEO under Pages.</p>
        <div className="row" style={{ marginTop: 10 }}>{BLOG.slice(0, 20).map((b) => <Link key={b.path} className="btn btn-sm" href={`/admin/pages/edit/?path=${encodeURIComponent(b.path)}`}>{b.h1.slice(0, 40)}</Link>)}</div>
      </div>
    </>
  );
}
