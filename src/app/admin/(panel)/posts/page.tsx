import type { Metadata } from 'next';
import { DeleteButton } from '@/components/dash/DeleteButton';
import { setPageDeleted } from '@/app/admin/delete-actions';
import { getOverrides } from '@/lib/server/content';
import { readJsonFile } from '@/lib/server/store';
import { seoScore } from '@/lib/seo-score';
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
  const [posts, cats, tr, over, views] = await Promise.all([getPosts(), getCategories(), getTranslations(), getOverrides(), readJsonFile<Record<string, number>>('views.json', {})]);
  const pill = (sc: number, miss: string[]) => <span className={`score s${sc >= 80 ? 'g' : sc >= 50 ? 'm' : 'b'}`} title={miss.length ? `To improve: ${miss.join(' · ')}` : 'All checks passed'}>SEO {sc}%</span>;
  const vw = (p: string) => (views[p] ?? 0).toLocaleString('en-US');
  const totalViews = Object.entries(views).filter(([k]) => k.startsWith('/blog/')).reduce((a, [, v]) => a + v, 0);
  const nTr = (path: string) => Object.values(tr).filter((l) => l[path]).length;
  const rows = posts.filter((p) => s === 'all' || p.status === s);
  const n = (k: string) => posts.filter((p) => p.status === k).length;
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Blog posts</p><h1>Blog posts</h1><p className="small muted" style={{ margin: '4px 0 0' }}>👁 {totalViews.toLocaleString('en-US')} article views in total · SEO score = title, description, image, category, length, keyword and links (hover a score to see what to improve)</p></div><div className="row"><Link className="btn" href="/admin/categories/">Categories</Link><Link className="btn btn-gold" href="/admin/posts/new/">New article</Link></div></div>
      <div className="row" style={{ marginBottom: 14 }}>
        {[['all', `All (${posts.length})`], ['review', `Review queue (${n('review')})`], ['published', `Published (${n('published')})`], ['draft', `Drafts (${n('draft')})`]].map(([k, l]) => <Link key={k} href={`/admin/posts/?s=${k}`} className={`btn btn-sm${s === k ? ' btn-gold' : ''}`}>{l}</Link>)}
      </div>
      {rows.length === 0 ? <p className="empty">No posts here. Write one, or let the Auto Publisher draft them for review.</p> : (
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Article</th><th>Category</th><th>Status</th><th>SEO</th><th>Views</th><th>Languages</th><th>Source</th><th>Updated</th><th></th></tr></thead><tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td><div className="row" style={{ flexWrap: 'nowrap' }}><span className="thumb"><img src={p.cover || coverUrl(p.title)} alt="" /></span><div><Link href={`/admin/posts/${p.id}/`}>{p.title}</Link><div className="small muted">/blog/{p.slug}/{p.similarity ? ` · similarity ${Math.round(p.similarity * 100)}%` : ''}{p.scheduledAt && p.scheduledAt > new Date().toISOString() ? ` · scheduled ${day(p.scheduledAt)}` : ''}</div></div></div></td>
              <td className="small">{cats.find((c) => c.slug === p.category)?.name ?? '—'}</td>
              <td><span className={`pill ${p.status === 'published' ? 'ok' : p.status === 'review' ? 'new' : ''}`}>{p.status}</span></td>
              <td>{(() => { const x = seoScore({ title: p.title, seoTitle: p.seoTitle, meta: p.meta, summary: p.summary, cover: p.cover, category: p.category, body: p.body, keyword: p.keyword }); return pill(x.score, x.missing); })()}</td>
              <td className="num"><b>{vw(`/blog/${p.slug}/`)}</b></td>
              <td><Link href={`/admin/posts/${p.id}/#translations`} className={`pill ${nTr(`/blog/${p.slug}/`) >= 19 ? 'ok' : nTr(`/blog/${p.slug}/`) ? 'new' : ''}`}>{nTr(`/blog/${p.slug}/`)}/19</Link></td>
              <td>{p.source === 'auto' ? 'Auto Publisher' : 'Manual'}</td>
              <td>{day(p.updatedAt)}</td>
              <td><form action={postAction} className="row"><input type="hidden" name="id" value={p.id} />
                {p.status !== 'published' ? <button className="btn btn-sm btn-gold" name="act" value="publish">Publish</button> : <a className="btn btn-sm" href={`/blog/${p.slug}/`} target="_blank" rel="noopener">View</a>}
                {p.status === 'published' && <button className="btn btn-sm" name="act" value="unpublish">Unpublish</button>}
                <DeleteButton name="act" value="delete" /></form></td>
            </tr>
          ))}
        </tbody></table></div>
      )}
      <div className="panel" style={{ marginTop: 16 }}>
        <h2>Built-in guides ({BLOG.length})</h2>
        <p className="help">Guides that come with the website. Edit their text and SEO, or delete one to take it off the blog (you can restore it here).</p>
        <div className="tbl-wrap" style={{ marginTop: 10 }}><table className="tbl"><thead><tr><th>Guide</th><th>Status</th><th>SEO</th><th>Views</th><th /></tr></thead><tbody>
          {BLOG.map((b) => { const del = !!over[b.path]?.hidden; return (
            <tr key={b.path} style={del ? { opacity: 0.6 } : undefined}>
              <td><Link href={`/admin/pages/edit/?path=${encodeURIComponent(b.path)}`}>{over[b.path]?.h1 || b.h1}</Link><div className="small muted">{b.path}</div></td>
              <td><span className={`pill ${del ? 'closed' : 'ok'}`}>{del ? 'deleted' : 'published'}</span></td>
              <td>{(() => { const o = over[b.path] ?? {}; const body = JSON.stringify(b.sections) + ' ' + (o.extra ?? ''); const x = seoScore({ title: o.h1 || b.h1, seoTitle: o.seoTitle || b.seoTitle, meta: o.meta || b.meta, cover: o.image || b.image, category: b.category, body, keyword: o.keyword }); return pill(x.score, x.missing); })()}</td>
              <td className="num"><b>{vw(b.path)}</b></td>
              <td><div className="row" style={{ flexWrap: 'nowrap' }}>
                <Link className="btn btn-sm btn-gold" href={`/admin/pages/edit/?path=${encodeURIComponent(b.path)}`}>Edit</Link>
                {!del && <a className="btn btn-sm" href={b.path} target="_blank" rel="noopener">View</a>}
                <form action={setPageDeleted}><input type="hidden" name="path" value={b.path} /><input type="hidden" name="on" value={del ? '0' : '1'} />{del ? <button className="btn btn-sm">Restore</button> : <DeleteButton />}</form>
              </div></td>
            </tr>
          ); })}
        </tbody></table></div>
      </div>
    </>
  );
}
