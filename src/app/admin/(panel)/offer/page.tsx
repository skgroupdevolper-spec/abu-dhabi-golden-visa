import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F, Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getSite } from '@/lib/server/settings';
import { saveOffer } from '../../settings-actions';

export const metadata: Metadata = { title: 'Offer pop-up' };

export default async function Offer() {
  await requireAdmin(FULL);
  const site = await getSite();
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Offer pop-up</p><h1>A friendly nudge, <span className="gold">once per visitor.</span></h1></div></div>
      <div className="panel" style={{ maxWidth: 760 }}>
        <ActionForm action={saveOffer} className="form">
          <div className="full"><Toggle name="on" label="Show the offer pop-up" help="Shown once per visitor after the delay below" on={site.features.offer} /></div>
          <F name="title" label="Title" value={site.offer.title} full />
          <F name="text" label="Text" value={site.offer.text} type="textarea" full />
          <F name="button" label="Button text" value={site.offer.button} />
          <F name="link" label="Button link" value={site.offer.link} />
          <F name="delay" label="Delay (seconds)" value={site.offer.delaySeconds} type="number" />
          <div className="full"><Submit>Save</Submit></div>
        </ActionForm>
      </div>
    </>
  );
}
