import { NextResponse, type NextRequest } from 'next/server';
import { autoRun } from '@/lib/server/autopub';
import { getBlock } from '@/lib/server/settings';
import { JOB0, runTranslation, type TranslateJob } from '@/lib/server/translate';

export const dynamic = 'force-dynamic';

/** Daily job (call from xCloud cron): https://www.abudhabigoldenvisa.com/api/cron/daily?key=CRON_SECRET */
export async function GET(req: NextRequest) {
  const key = process.env.CRON_SECRET;
  if (!key || req.nextUrl.searchParams.get('key') !== key) return NextResponse.json({ ok: false }, { status: 403 });
  const fx = await import('@/lib/server/fx').then((m) => m.refreshRates()).then((x) => !!x).catch(() => false);
  const payments = await import('@/lib/server/payments').then((m) => m.recheckPending()).catch(() => 0);
  const uiAdded = await import('@/lib/server/translate').then(async (m) => {
    const { aiReady } = await import('@/lib/server/ai');
    if (!(await aiReady('translate'))) return 0;
    const on = (await import('@/lib/server/settings').then((s) => s.getSite())).languages;
    const { LOCALES } = await import('@/lib/i18n');
    return m.translateUi(LOCALES.filter((l) => l.code !== 'en' && (!on?.length || on.includes(l.code))).map((l) => l.code));
  }).catch(() => 0);
  const pub = await autoRun();
  const job = await getBlock<TranslateJob>('translateJob', JOB0);
  if (job.auto && job.langs.length) void runTranslation(job.langs, true);
  return NextResponse.json({ ok: true, autopublisher: pub.message, translation: job.auto ? 'resumed' : 'off', paymentsConfirmed: payments, exchangeRates: fx ? 'updated' : 'unchanged', interfaceTexts: uiAdded });
}
