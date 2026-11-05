import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fontVars } from '@/lib/fonts';
import '../dash.css';

export const metadata: Metadata = { title: { default: 'Client portal | Abu Dhabi Golden Visa', template: '%s | Client portal' }, robots: { index: false, follow: false }, referrer: 'no-referrer' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f8f7f5' };

export default function PortalRoot({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
