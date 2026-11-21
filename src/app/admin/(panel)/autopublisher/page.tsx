import type { Metadata } from 'next';
import AutoPublisherManager from '@/components/ap/AutoPublisherManager';
import { Toaster } from '@/components/ap/ui';
import { FULL, requireAdmin } from '@/lib/server/auth';
import '@/components/ap/ap.css';

export const metadata: Metadata = { title: 'Auto Publisher' };
export const dynamic = 'force-dynamic';

/**
 * Auto Publisher: researches topics, writes original articles with pictures, checks quality and
 * similarity, and publishes them on the blog; each published article is then translated into the website languages.
 * Runs by itself every few minutes (instrumentation.ts); this page shows and controls it.
 */
export default async function AutoPublisher() {
  await requireAdmin(FULL);
  return (
    <div className="ap-root">
      <AutoPublisherManager />
      <Toaster />
    </div>
  );
}
