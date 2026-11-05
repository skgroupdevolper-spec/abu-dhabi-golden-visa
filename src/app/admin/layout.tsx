import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fontVars } from '@/lib/fonts';
import '../dash.css';

export const metadata: Metadata = { title: { default: 'Admin | Abu Dhabi Golden Visa', template: '%s | Admin' }, robots: { index: false, follow: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f8f7f5' };

export default function AdminRoot({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
