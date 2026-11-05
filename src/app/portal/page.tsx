import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { SITE, waLink } from '@/lib/site';
import { findFile } from './actions';

export const metadata: Metadata = { title: 'Open my file' };
export const dynamic = 'force-dynamic';

export default function PortalHome() {
  return (
    <main className="login">
      <div className="card reveal">
        <img className="coin" src="/brand/coin.webp" alt="" width={92} height={92} />
        <img src="/brand/logo.webp" alt="Abu Dhabi Golden Visa" style={{ height: 46, width: 'auto', margin: '0 auto 18px' }} />
        <p className="eyebrow" style={{ textAlign: 'center' }}>Client portal</p>
        <h1 style={{ textAlign: 'center', marginTop: 8, fontSize: 34 }}>Your Golden Visa file, <span className="gold">in one place.</span></h1>
        <p className="muted" style={{ textAlign: 'center', fontSize: 14.5 }}>Use the secure link we sent on WhatsApp, or open your file with your reference and WhatsApp number.</p>
        <ActionForm action={findFile} className="stack">
          <div className="field"><label htmlFor="ref">Reference</label><input id="ref" name="ref" placeholder="ADGV-0001" autoCapitalize="characters" required /></div>
          <div className="field"><label htmlFor="phone">WhatsApp number</label><input id="phone" name="phone" type="tel" placeholder="+971" autoComplete="tel" required /></div>
          <Submit>Open my file</Submit>
        </ActionForm>
        <a className="btn btn-wa" style={{ width: '100%', marginTop: 12 }} href={waLink('Hello, please send me the link to my Golden Visa portal.')} target="_blank" rel="noopener">Ask for my link on WhatsApp</a>
        <p className="small muted" style={{ textAlign: 'center', marginTop: 16 }}>{SITE.disclaimer}</p>
      </div>
    </main>
  );
}
