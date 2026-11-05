import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { getFees } from '@/lib/server/store';
import { saveFeeSchedule } from '../../actions';

export const metadata: Metadata = { title: 'Government fees' };

export default async function Fees() {
  const f = await getFees();
  const rows: [string, string, number][] = [
    ['visa', f.perPerson.visa.label, f.perPerson.visa.aed],
    ['emiratesId', f.perPerson.emiratesId.label, f.perPerson.emiratesId.aed],
    ['changeOfStatus', f.perPerson.changeOfStatus.label, f.perPerson.changeOfStatus.aed],
    ['medNormal', f.medical.normal.label, f.medical.normal.aed],
    ['medVip', f.medical.vip.label, f.medical.vip.aed],
    ['sponsorFile', f.sponsorFile.label, f.sponsorFile.aed],
    ['propertyValuation', f.propertyValuation.label, f.propertyValuation.aed],
  ];
  const main = f.perPerson.visa.aed + f.medical.normal.aed + f.perPerson.emiratesId.aed + f.perPerson.changeOfStatus.aed + f.propertyValuation.aed;
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Government fees</p><h1>The numbers behind <span className="gold">every quote.</span></h1></div></div>
      <div className="cols">
        <div className="panel">
          <ActionForm action={saveFeeSchedule} className="form">
            <div className="field full"><label htmlFor="date">Schedule date (shown under every estimate)</label><input id="date" name="date" defaultValue={f.date} /></div>
            {rows.map(([k, label, v]) => (
              <div className="field" key={k}><label htmlFor={k}>{label} (AED)</label><input id={k} name={k} inputMode="decimal" defaultValue={v.toFixed(2)} /></div>
            ))}
            <div className="full"><Submit>Save fees</Submit></div>
          </ActionForm>
        </div>
        <div className="panel">
          <h2>Check</h2>
          <p className="muted">Property investor inside the UAE, main applicant, normal medical:</p>
          <div className="total"><span>Government fees</span><b>AED {main.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></div>
          <p className="small muted" style={{ marginTop: 14 }}>The website calculator and new quotes use these amounts straight away. Fee examples written inside page text update on the next deploy.</p>
        </div>
      </div>
    </>
  );
}
