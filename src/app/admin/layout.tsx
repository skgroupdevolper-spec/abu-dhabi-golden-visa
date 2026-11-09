import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fontVars } from '@/lib/fonts';
import { applyRuntimeSync } from '@/lib/server/settings';
import '../dash.css';

export const metadata: Metadata = { title: { default: 'Admin | Abu Dhabi Golden Visa', template: '%s | Admin' }, robots: { index: false, follow: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f8f7f5' };

export default function AdminRoot({ children }: { children: ReactNode }) {
  const site = applyRuntimeSync();
  return (
    <html lang="en" className={fontVars}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `window.__ADGV_SITE=${JSON.stringify(site).replace(/</g, '\\u003c')}` }} />
        {children}
      </body>
    </html>
  );
}
