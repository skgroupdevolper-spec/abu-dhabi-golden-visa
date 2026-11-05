import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Toggle } from '@/components/dash/Fields';
import { getPage } from '@/content/pages';
import { requireAdmin } from '@/lib/server/auth';
import { getOverrides } from '@/lib/server/content';
import { savePage } from '../../../content-actions';

export const metadata: Metadata = { title: 'Edit page' };

export default async function EditPage({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  await requireAdmin();
  const { path = '' } = await searchParams;
  const p = getPage(path);
  if (!p) notFound();
  const o = (await getOverrides())[p.path] ?? {};
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Edit page · {p.path}</p><h1>{o.h1 || p.h1}</h1></div><a className="btn" href={p.path} target="_blank" rel="noopener">View page ↗</a></div>
      <div className="panel">
        <ActionForm action={savePage} className="form">
          <input type="hidden" name="path" value={p.path} />
          <F name="h1" label="Main heading (H1)" value={o.h1} placeholder={p.h1} full />
          <F name="intro" label="Introduction" value={o.intro} placeholder={p.intro} type="textarea" rows={3} full />
          <F name="seoTitle" label="SEO title" value={o.seoTitle} placeholder={p.seoTitle} full />
          <F name="meta" label="SEO description" value={o.meta} placeholder={p.meta} type="textarea" rows={2} full />
          <F name="extra" label="Extra content at the end of the page (Markdown)" value={o.extra} type="textarea" rows={10} full help="Use ## for headings and - for lists. Leave a field empty to keep the original." />
          <div className="full"><Toggle name="hidden" label="Hide this page from the website" on={!!o.hidden} /></div>
          <div className="full"><Submit>Save page</Submit></div>
        </ActionForm>
      </div>
    </>
  );
}
