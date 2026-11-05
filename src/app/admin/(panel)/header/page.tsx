import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getSite } from '@/lib/server/settings';
import { saveHeader } from '../../content-actions';

export const metadata: Metadata = { title: 'Header & menu' };

export default async function Header() {
  await requireAdmin(FULL);
  const s = await getSite();
  const extra = [...s.nav.extra, { label: '', href: '' }, { label: '', href: '' }];
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Header & menu</p><h1>The first thing <span className="gold">visitors see.</span></h1></div></div>
      <div className="panel" style={{ maxWidth: 820 }}>
        <ActionForm action={saveHeader} className="form">
          <F name="ctaLabel" label="Main button text" value={s.nav.ctaLabel} />
          <F name="ctaLink" label="Main button link" value={s.nav.ctaLink} />
          <div className="full"><Toggle name="topBar" label="Announcement bar above the header" on={s.features.topBar} /></div>
          <F name="topBarText" label="Announcement text" value={s.features.topBarText} full />
          <div className="full"><span className="lbl">Extra menu links (after Contact)</span></div>
          {extra.map((x, i) => (
            <div key={i} className="full row"><input name="extra_label" defaultValue={x.label} placeholder="Label" style={{ flex: 1 }} /><input name="extra_href" defaultValue={x.href} placeholder="/page/ or https://…" style={{ flex: 2 }} /></div>
          ))}
          <p className="help full">The Golden Visa, Family & Residency and Our Services mega menus follow your pages and services automatically. Hide services under Services & prices.</p>
          <div className="full"><Submit>Save header</Submit></div>
        </ActionForm>
      </div>
    </>
  );
}
