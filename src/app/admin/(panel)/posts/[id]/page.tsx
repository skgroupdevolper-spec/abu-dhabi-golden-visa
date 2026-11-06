import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostForm } from '@/components/dash/PostForm';
import { requireAdmin } from '@/lib/server/auth';
import { getCategories, getPosts } from '@/lib/server/content';
import { postAction, restoreRevision, savePost } from '../../../content-actions';
import { DeleteButton } from '@/components/dash/DeleteButton';
import { when } from '@/lib/stages';
import { TranslatePanel } from '@/components/dash/TranslatePanel';

export const metadata: Metadata = { title: 'Edit article' };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const [posts, cats] = await Promise.all([getPosts(), getCategories()]);
  const p = id === 'new' ? null : posts.find((x) => x.id === id);
  if (id !== 'new' && !p) notFound();
  const local = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Blog · {p ? (p.status === 'published' ? 'Published' : p.status === 'review' ? 'Needs review' : 'Draft') : 'New article'}</p><h1>{p ? p.title : 'New article'}</h1></div>
        <div className="row">
          {p?.status === 'published' && <a className="btn" href={`/blog/${p.slug}/`} target="_blank" rel="noopener">View on website ↗</a>}
          {p && <form action={postAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="back" value="1" /><DeleteButton name="act" value="delete" label="Delete article" className="btn btn-danger" /></form>}
        </div></div>
      <PostForm action={savePost} categories={cats.map((c) => ({ slug: c.slug, name: c.name }))} p={{
        id: p?.id, title: p?.title, slug: p?.slug, status: p?.status ?? 'draft', meta: p?.meta, summary: p?.summary, body: p?.body,
        faq: p?.faq.map((x) => `${x.q}\n${x.a}`).join('\n\n'), author: p?.author ?? 'Abu Dhabi Golden Visa editorial team', reviewer: p?.reviewer || me.name,
        cover: p?.cover, coverAlt: p?.coverAlt, category: p?.category, tags: p?.tags?.join(', '), seoTitle: p?.seoTitle, ogImage: p?.ogImage, canonical: p?.canonical,
        noindex: p?.noindex, scheduledAt: local(p?.scheduledAt), featured: p?.featured, keyword: p?.keyword,
      }} />
      {p && <TranslatePanel path={`/blog/${p.slug}/`} updated={p.updatedAt} live={p.status === 'published'} />}
      {p?.revisions?.length ? (
        <div className="panel" style={{ marginTop: 16 }}>
          <h2>Earlier versions</h2>
          <p className="help">Every save keeps the previous version (last 15). Restoring keeps the current text as a version too.</p>
          <div className="files" style={{ marginTop: 10 }}>{p.revisions.map((r) => (
            <div key={r.at} className="file"><span className="fn"><b>{r.title}</b><small>{when(r.at)} · {r.by} · {r.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length} words</small></span>
              <form action={restoreRevision}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="at" value={r.at} /><button className="btn btn-sm" type="submit">Restore</button></form></div>
          ))}</div>
        </div>
      ) : null}
    </>
  );
}
