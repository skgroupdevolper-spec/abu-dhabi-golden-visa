import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getSite } from '@/lib/server/settings';
import { saveFooter } from '../../content-actions';

export const metadata: Metadata = { title: 'Footer' };

export default async function Footer() {
  await requireAdmin(FULL);
  const s = await getSite();
  const links = [...s.nav.footerLinks, { label: '', href: '' }, { label: '', href: '' }];
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Footer</p><h1>The last word <span className="gold">on every page.</span></h1></div></div>
      <div className="panel" style={{ maxWidth: 820 }}>
        <ActionForm action={saveFooter} className="form">
          <F name="footerAbout" label="About text" value={s.footerAbout} type="textarea" full help="Leave empty for the standard operator and licence sentence." />
          <F name="disclaimer" label="Legal disclaimer" value={s.disclaimer} type="textarea" full />
          <F name="copyright" label="Copyright line (optional)" value={s.nav.copyright} full />
          <div className="full"><span className="lbl">Extra links in the Contact column</span></div>
          {links.map((x, i) => (
            <div key={i} className="full row"><input name="foot_label" defaultValue={x.label} placeholder="Label" style={{ flex: 1 }} /><input name="foot_href" defaultValue={x.href} placeholder="/page/ or https://…" style={{ flex: 2 }} /></div>
          ))}
          <p className="help full">Contact details and social links are in Site settings.</p>
          <div className="full"><Submit>Save footer</Submit></div>
        </ActionForm>
      </div>
    </>
  );
}
