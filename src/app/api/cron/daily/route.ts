import { NextResponse, type NextRequest } from 'next/server';
import { autoRun } from '@/lib/server/autopub';
import { getBlock } from '@/lib/server/settings';
import { JOB0, runTranslation, type TranslateJob } from '@/lib/server/translate';

export const dynamic = 'force-dynamic';

/** Daily job (call from xCloud cron): https://www.abudhabigoldenvisa.com/api/cron/daily?key=CRON_SECRET */
export async function GET(req: NextRequest) {
  const key = process.env.CRON_SECRET;
  if (!key || req.nextUrl.searchParams.get('key') !== key) return NextResponse.json({ ok: false }, { status: 403 });
  const pub = await autoRun();
  const job = await getBlock<TranslateJob>('translateJob', JOB0);
  if (job.auto && job.langs.length) void runTranslation(job.langs, true);
  return NextResponse.json({ ok: true, autopublisher: pub.message, translation: job.auto ? 'resumed' : 'off' });
}
