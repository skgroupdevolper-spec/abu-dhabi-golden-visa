import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { ROUTE_LABELS } from '@/lib/stages';
import { newApplication } from '../../../actions';

export const metadata: Metadata = { title: 'New application' };

export default function NewApp() {
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">New application</p><h1>Open a <span className="gold">client file.</span></h1></div></div>
      <div className="panel" style={{ maxWidth: 820 }}>
        <ActionForm action={newApplication} className="form">
          <div className="field"><label htmlFor="name">Client name</label><input id="name" name="name" required /></div>
          <div className="field"><label htmlFor="phone">WhatsApp number</label><input id="phone" name="phone" type="tel" placeholder="+971" required /></div>
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" /></div>
          <div className="field"><label htmlFor="nationality">Nationality</label><input id="nationality" name="nationality" /></div>
          <div className="field"><label htmlFor="route">Route</label><select id="route" name="route">{ROUTE_LABELS.map((r) => <option key={r}>{r}</option>)}</select></div>
          <div className="field"><label htmlFor="location">Where is the client?</label><select id="location" name="location"><option value="in">Inside the UAE</option><option value="out">Outside the UAE</option></select></div>
          <div className="field"><label htmlFor="adults">Adult family members</label><input id="adults" name="adults" type="number" min={0} max={10} defaultValue={0} /></div>
          <div className="field"><label htmlFor="kids">Children under 18</label><input id="kids" name="kids" type="number" min={0} max={10} defaultValue={0} /></div>
          <div className="field"><label htmlFor="language">Preferred language</label><input id="language" name="language" defaultValue="English" /></div>
          <div className="field full"><label htmlFor="notes">Private notes</label><textarea id="notes" name="notes" /></div>
          <div className="full"><Submit>Create application</Submit></div>
        </ActionForm>
      </div>
    </>
  );
}
