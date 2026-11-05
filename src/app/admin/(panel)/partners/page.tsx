import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F } from '@/components/dash/Fields';
import { requireAdmin } from '@/lib/server/auth';
import { getPartners } from '@/lib/server/content';
import { addPartner, deletePartner } from '../../content-actions';

export const metadata: Metadata = { title: 'Partner logos' };

export default async function Partners() {
  await requireAdmin();
  const all = await getPartners();
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Partner logos</p><h1>Who you <span className="gold">work with.</span></h1></div></div>
      <div className="cols">
        <div className="panel">
          {all.length === 0 ? <p className="empty">No logos yet. The homepage strip appears once you add one.</p> : (
            <div className="files">{all.map((p) => (
              <form key={p.id} action={deletePartner} className="file"><input type="hidden" name="id" value={p.id} />
                <img src={p.logo} alt="" style={{ height: 36, width: 'auto' }} /><span className="fn"><b>{p.name}</b><small>{p.link}</small></span>
                <button className="btn btn-sm btn-ghost btn-danger" type="submit">Remove</button></form>
            ))}</div>
          )}
        </div>
        <div className="panel">
          <h2>Add a logo</h2>
          <ActionForm action={addPartner} className="stack" reset>
            <F name="name" label="Partner name" />
            <F name="logo" label="Logo link" help={<>Upload the logo in <a href="/admin/media/">Media library</a> and paste its link. Only use logos you have permission to show.</>} />
            <F name="link" label="Website (optional)" type="url" />
            <Submit>Add</Submit>
          </ActionForm>
        </div>
      </div>
    </>
  );
}
