import type { Metadata } from 'next';
import { FeesEditor } from '@/components/dash/FeesEditor';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getFees } from '@/lib/server/store';
import { saveFeesJson } from '../../actions';

export const metadata: Metadata = { title: 'Cost calculator' };

export default async function Fees() {
  await requireAdmin(FULL);
  const f = await getFees();
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Cost calculator</p><h1>Cost calculator · <span className="gold">full control</span></h1>
        <p className="muted small" style={{ marginTop: 6 }}>Every fee, name, route, package, add-on, extra charge, step, button, wording and currency rate of the website calculator.</p></div></div>
      <FeesEditor initial={f} action={saveFeesJson} />
    </>
  );
}
