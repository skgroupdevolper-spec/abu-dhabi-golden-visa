import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage } from '@/content/pages';
import { requireAdmin } from '@/lib/server/auth';
import { getCustomPages, getOverrides } from '@/lib/server/content';
import { sectionsToBlocks } from '@/lib/blocks';
import { md } from '@/lib/markdown';
import { PageBuilder } from '@/components/dash/PageBuilder';

export const metadata: Metadata = { title: 'Page builder' };

export default async function EditPage({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  await requireAdmin();
  const { path = '' } = await searchParams;
  const custom = (await getCustomPages()).find((c) => c.path === path);
  const p = getPage(path);
  if (!p && !custom) notFound();
  const o = custom ?? (await getOverrides())[path] ?? {};
  const original = p
    ? { h1: p.h1, intro: p.intro, eyebrow: p.eyebrow, seoTitle: p.seoTitle, meta: p.meta, facts: p.facts ?? [] }
    : { h1: custom!.title, intro: '', eyebrow: custom!.title, seoTitle: custom!.title, meta: '', facts: [] };
  const sections = p ? [...p.sections, ...(o.extra ? [{ type: 'html' as const, html: md(o.extra) }] : [])] : [];
  const blocks = o.blocks?.length ? o.blocks : sectionsToBlocks(sections);
  const { blocks: _b, ...rest } = o;
  void _b;
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Page builder · {path}</p><h1>{o.h1 || original.h1}</h1></div></div>
      <PageBuilder path={path} custom={!!custom} original={original} initial={{ ...rest, extra: '' }} blocks={blocks} hasOverride={!!Object.keys(o).length && !custom ? true : false} />
    </>
  );
}
