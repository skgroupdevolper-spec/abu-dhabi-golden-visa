import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F } from '@/components/dash/Fields';
import { requireAdmin } from '@/lib/server/auth';
import { getPosts } from '@/lib/server/content';
import { savePost } from '../../../content-actions';

export const metadata: Metadata = { title: 'Edit post' };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const p = id === 'new' ? null : (await getPosts()).find((x) => x.id === id);
  if (id !== 'new' && !p) notFound();
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Blog post</p><h1>{p ? p.title : <>New <span className="gold">post.</span></>}</h1></div>{p?.status === 'published' && <a className="btn" href={`/blog/${p.slug}/`} target="_blank" rel="noopener">View on website ↗</a>}</div>
      <div className="panel">
        <ActionForm action={savePost} className="form">
          <input type="hidden" name="id" value={p?.id ?? ''} />
          <F name="title" label="Title (H1)" value={p?.title} full />
          <F name="slug" label="Web address (slug)" value={p?.slug} help="Leave empty to make it from the title" />
          <div className="field"><label htmlFor="status">Status</label><select id="status" name="status" defaultValue={p?.status ?? 'draft'}><option value="draft">Draft</option><option value="review">Needs review</option><option value="published">Published</option></select></div>
          <F name="meta" label="SEO description" value={p?.meta} full />
          <F name="summary" label="Summary (shown under the title and on cards)" value={p?.summary} type="textarea" rows={2} full />
          <F name="body" label="Article (Markdown: ## heading, - list, **bold**, [link](/page/))" value={p?.body} type="textarea" rows={18} full />
          <F name="faq" label="FAQs: question on the first line, answer below, blank line between" value={p?.faq.map((x) => `${x.q}\n${x.a}`).join('\n\n')} type="textarea" rows={6} full />
          <F name="author" label="Author" value={p?.author ?? 'Abu Dhabi Golden Visa editorial team'} />
          <F name="reviewer" label="Reviewed by" value={p?.reviewer ?? me.name} />
          <F name="cover" label="Cover image link (optional, from Media library)" value={p?.cover} full />
          <p className="help full">Rules: no promises of guaranteed approval or fixed timelines; confirm fees against the official sources.</p>
          <div className="full"><Submit>Save post</Submit></div>
        </ActionForm>
      </div>
    </>
  );
}
