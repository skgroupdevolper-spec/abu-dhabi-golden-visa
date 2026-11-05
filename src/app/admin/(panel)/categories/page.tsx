import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F } from '@/components/dash/Fields';
import { BLOG } from '@/content/blog';
import { requireAdmin } from '@/lib/server/auth';
import { getCategories, getPosts } from '@/lib/server/content';
import { deleteCategory, saveCategory } from '../../content-actions';

export const metadata: Metadata = { title: 'Blog categories' };

export default async function Categories({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await requireAdmin();
  const { edit } = await searchParams;
  const [cats, posts] = await Promise.all([getCategories(), getPosts()]);
  const cur = cats.find((c) => c.id === edit);
  const count = (slug: string) => posts.filter((p) => p.category === slug).length + BLOG.filter((b) => b.category === slug).length;
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Blog</p><h1>Categories</h1></div><a className="btn" href="/blog/" target="_blank" rel="noopener">View blog ↗</a></div>
      <div className="cols">
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Category</th><th>Articles</th><th>Address</th><th></th></tr></thead><tbody>
          {cats.map((c) => (
            <tr key={c.id}><td><a href={`/admin/categories/?edit=${c.id}`}>{c.name}</a><div className="small muted">{c.description}</div></td><td>{count(c.slug)}</td>
              <td><a href={`/blog/category/${c.slug}/`} target="_blank" rel="noopener" className="small">/blog/category/{c.slug}/</a></td>
              <td className="num"><form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><button className="btn btn-sm btn-danger" type="submit">Delete</button></form></td></tr>
          ))}
        </tbody></table></div>
        <div className="panel">
          <h2>{cur ? `Edit “${cur.name}”` : 'Add a category'}</h2>
          <ActionForm action={saveCategory} className="form" reset={!cur}>
            <input type="hidden" name="id" value={cur?.id ?? ''} />
            <F name="name" label="Name" value={cur?.name} full />
            <F name="slug" label="Web address" value={cur?.slug} help="Made from the name if empty" full />
            <F name="description" label="Description" value={cur?.description} type="textarea" rows={2} full />
            <F name="image" label="Image link (from Media library, optional)" value={cur?.image} full />
            <F name="seoTitle" label="SEO title" value={cur?.seoTitle} full />
            <F name="meta" label="SEO description" value={cur?.meta} type="textarea" rows={2} full />
            <div className="full row"><Submit>{cur ? 'Save category' : 'Add category'}</Submit>{cur && <a className="btn" href="/admin/categories/">New category</a>}</div>
          </ActionForm>
        </div>
      </div>
    </>
  );
}
