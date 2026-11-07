import type { Metadata } from 'next';
import { FaqEditor } from '@/components/dash/FaqEditor';
import { FAQS } from '@/content/faqs';
import { requireAdmin } from '@/lib/server/auth';
import { getFaqs } from '@/lib/server/content';
import { saveFaqs } from '../../content-actions';

export const metadata: Metadata = { title: 'FAQs' };

export default async function Faqs() {
  await requireAdmin();
  const stored = await getFaqs();
  const items = stored.length ? stored : FAQS.map((f, i) => ({ id: String(i), q: f.q, a: f.a, order: i }));
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">FAQs</p><h1>Answers, <span className="gold">in your words.</span></h1></div></div>
      <p className="help" style={{ marginBottom: 12 }}>Used on the homepage and the FAQs page. Add a new question, delete one, or move it up or down, then press Save FAQs. New questions are translated with the page.</p>
      <FaqEditor items={items.map((f) => ({ q: f.q, a: f.a }))} action={saveFaqs} />
    </>
  );
}
