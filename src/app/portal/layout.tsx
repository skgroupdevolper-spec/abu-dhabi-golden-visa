import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fontVars } from '@/lib/fonts';
import { applyRuntimeSync } from '@/lib/server/settings';
import { T } from '@/lib/server/portal';
import '../dash.css';

export const metadata: Metadata = { title: { default: 'Client portal | Abu Dhabi Golden Visa', template: '%s | Client portal' }, robots: { index: false, follow: false }, referrer: 'no-referrer' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f8f7f5' };

export default async function PortalRoot({ children }: { children: ReactNode }) {
  const site = applyRuntimeSync();
  const { lang } = await T();
  return (
    <html lang={lang.html} dir={lang.dir} className={fontVars}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `window.__ADGV_SITE=${JSON.stringify(site).replace(/</g, '\\u003c')}` }} />
        {children}
      </body>
    </html>
  );
}
