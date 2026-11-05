import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getSite } from '@/lib/server/settings';
import { saveColors } from '../../settings-actions';

export const metadata: Metadata = { title: 'Design & colours' };

export default async function Design() {
  await requireAdmin(FULL);
  const c = (await getSite()).colors;
  const rows: [keyof typeof c, string][] = [['gold', 'Gold (accents, buttons)'], ['goldDeep', 'Deep gold (links, small headings)'], ['ink', 'Text colour'], ['paper', 'Page background']];
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Design & colours</p><h1>Your brand, <span className="gold">everywhere.</span></h1></div></div>
      <div className="panel" style={{ maxWidth: 680 }}>
        <ActionForm action={saveColors} className="form">
          {rows.map(([k, label]) => (
            <div className="field" key={k}><label htmlFor={k}>{label}</label><div className="row"><input type="color" id={k} name={k} defaultValue={c[k]} style={{ width: 64, padding: 4 }} /><code className="k">{c[k]}</code></div></div>
          ))}
          <p className="help full">Keep strong contrast between text and background so every visitor can read the site.</p>
          <div className="full"><Submit>Save colours</Submit></div>
        </ActionForm>
      </div>
    </>
  );
}
