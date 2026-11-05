import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { DATA_DIR } from '@/lib/server/store';
import { restoreBackup } from '../../settings-actions';

export const metadata: Metadata = { title: 'Backup & move' };

export default async function Backup() {
  const me = await requireAdmin(FULL);
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Backup & move</p><h1>Your data, <span className="gold">safe and portable.</span></h1></div></div>
      <div className="grid2">
        <div className="panel">
          <h2>Download a backup</h2>
          <p className="muted">One file with settings, enquiries, applications, customers, team, content and logs. Keep it private: it contains client details.</p>
          <a className="btn btn-gold" href="/admin/export/?f=backup">Download backup</a>
          <h3 style={{ marginTop: 22 }}>Exports (CSV)</h3>
          <div className="row" style={{ marginTop: 10 }}>
            <a className="btn btn-sm" href="/admin/export/?f=leads">Enquiries</a>
            <a className="btn btn-sm" href="/admin/export/?f=applications">Applications</a>
            <a className="btn btn-sm" href="/admin/export/?f=customers">Customers</a>
            <a className="btn btn-sm" href="/admin/export/?f=subscribers">Subscribers</a>
          </div>
          <p className="help" style={{ marginTop: 16 }}>Uploaded documents live in <code className="k">{DATA_DIR}/uploads</code> on the server. Include that folder in your server backups.</p>
        </div>
        <div className="panel">
          <h2>Restore</h2>
          {me.role !== 'owner' ? <p className="notice">Only the owner can restore a backup.</p> : (
            <ActionForm action={restoreBackup} className="stack">
              <p className="notice err">Restoring replaces the current data with the backup.</p>
              <input type="file" name="file" accept="application/json,.json" required />
              <Submit>Restore backup</Submit>
            </ActionForm>
          )}
        </div>
      </div>
    </>
  );
}
