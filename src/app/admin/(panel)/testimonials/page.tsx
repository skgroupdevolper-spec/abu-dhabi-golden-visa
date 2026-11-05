import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F } from '@/components/dash/Fields';
import { requireAdmin } from '@/lib/server/auth';
import { list } from '@/lib/server/collections';
import type { Testimonial } from '@/lib/server/content';
import { addTestimonial, testimonialAction } from '../../content-actions';

export const metadata: Metadata = { title: 'Testimonials' };

export default async function Testimonials() {
  await requireAdmin();
  const all = await list<Testimonial>('testimonials');
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Testimonials</p><h1>Real words, <span className="gold">real clients.</span></h1></div></div>
      <div className="cols">
        <div className="panel">
          {all.length === 0 ? <p className="empty">No testimonials yet. The homepage section appears once you add one.</p> : (
            <div className="stack">{all.map((t) => (
              <form key={t.id} action={testimonialAction} className="notice row"><input type="hidden" name="id" value={t.id} />
                <div style={{ flex: 1, minWidth: 200 }}><b>{t.name}</b> <span className="small muted">{t.country} · {'★'.repeat(t.rating)}</span><div className="small">“{t.text}”</div></div>
                <button className="btn btn-sm" type="submit">{t.approved ? 'Hide' : 'Show'}</button>
                <button className="btn btn-sm btn-ghost btn-danger" type="submit" name="delete" value="1">Delete</button>
              </form>
            ))}</div>
          )}
        </div>
        <div className="panel">
          <h2>Add a testimonial</h2>
          <ActionForm action={addTestimonial} className="stack" reset>
            <F name="name" label="Client name (as they agreed to show it)" />
            <F name="country" label="Country (optional)" />
            <F name="text" label="Their words" type="textarea" />
            <div className="field"><label htmlFor="rating">Rating</label><select id="rating" name="rating" defaultValue="5">{[5, 4, 3, 2, 1].map((r) => <option key={r}>{r}</option>)}</select></div>
            <label className="switch"><input type="checkbox" name="consent" /><span><b>The client gave permission to publish this</b><small>Required. Never publish invented reviews.</small></span></label>
            <Submit>Add</Submit>
          </ActionForm>
        </div>
      </div>
    </>
  );
}
