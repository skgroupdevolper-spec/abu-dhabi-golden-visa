import type { Metadata } from 'next';
import { ClientShell } from '@/components/dash/ClientShell';
import { ApplyWizard } from '@/components/ApplyWizard';
import { clientArea } from '@/lib/server/portal';
import './apply.css';

export const metadata: Metadata = { title: 'New application' };
export const dynamic = 'force-dynamic';

/** The full online application (every service, family, documents, fees) inside the client dashboard. */
export default async function PortalApply() {
  const area = await clientArea();
  return (
    <ClientShell area={area} active="apply" title="New application">
      <div className="ph"><h2>New application</h2><p className="muted">Choose any visa or service. You are signed in, so your details are filled in and the new file appears in your dashboard.</p></div>
      <div className="papply"><ApplyWizard inPortal /></div>
    </ClientShell>
  );
}
