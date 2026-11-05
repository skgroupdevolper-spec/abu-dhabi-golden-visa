import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
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
      <p className="help" style={{ marginBottom: 12 }}>Used on the homepage and the FAQs page. Empty a question to remove it; fill the blank rows to add new ones.</p>
      <ActionForm action={saveFaqs} className="stack">
        {[...items, ...Array.from({ length: 4 }, (_, i) => ({ id: `n${i}`, q: '', a: '', order: 99 }))].map((f, i) => (
          <div className="panel" key={f.id} style={{ padding: 16 }}>
            <div className="field"><label>Question {i + 1}</label><input name="q" defaultValue={f.q} /></div>
            <div className="field" style={{ marginTop: 8 }}><label>Answer</label><textarea name="a" defaultValue={f.a} rows={3} /></div>
          </div>
        ))}
        <div><Submit>Save FAQs</Submit></div>
      </ActionForm>
    </>
  );
}
