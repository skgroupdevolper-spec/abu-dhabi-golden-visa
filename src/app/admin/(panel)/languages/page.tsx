import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { Toggle } from '@/components/dash/Fields';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { aiReady } from '@/lib/server/ai';
import { list } from '@/lib/server/collections';
import { getBlock } from '@/lib/server/settings';
import { JOB0, translationProgress, type AiLog, type TranslateJob } from '@/lib/server/translate';
import { LOCALES } from '@/lib/i18n';
import { when } from '@/lib/stages';
import { clearTranslations, startTranslation, stopTranslation } from '../../ai-actions';

export const metadata: Metadata = { title: 'Languages' };
export const dynamic = 'force-dynamic';

export default async function Languages() {
  await requireAdmin(FULL);
  const [prog, job, ready, logs] = await Promise.all([translationProgress(), getBlock<TranslateJob>('translateJob', JOB0), aiReady(), list<AiLog>('ai-log')]);
  const langs = LOCALES.filter((l) => l.code !== 'en');
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Languages & translation</p><h1>One website, <span className="gold">20 languages.</span></h1></div>
        {job.running && <form action={stopTranslation}><button className="btn" type="submit">Stop translating</button></form>}</div>
      {job.running ? (
        <div className="notice" style={{ marginBottom: 16 }}><b>Translating… {job.done} of {job.total}</b>{job.errors ? ` · ${job.errors} errors` : ''}<div className="bar" style={{ margin: '8px 0' }}><i style={{ width: `${job.total ? (job.done / job.total) * 100 : 0}%` }} /></div><span className="small muted">{job.current}</span></div>
      ) : job.finishedAt && <p className="notice" style={{ marginBottom: 16 }}>Last run finished {when(job.finishedAt)}: {job.done} translated{job.errors ? `, ${job.errors} errors` : ''}. {job.message}</p>}
      <div className="cols">
        <div className="panel">
          <h2>Progress</h2>
          <p className="help">{prog.total} pages and guides. Pages without a translation show in English with a short notice. The customer dashboard is already translated in all languages.</p>
          <div className="stack" style={{ marginTop: 12 }}>
            {langs.map((l) => {
              const n = prog.perLang[l.code] ?? 0;
              return (
                <div key={l.code}>
                  <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}><span><b>{l.native}</b> <span className="muted">/{l.code}/</span></span><span>{n} / {prog.total}</span></div>
                  <div className="bar" style={{ marginTop: 4 }}><i style={{ width: `${(n / prog.total) * 100}%` }} /></div>
                  {n > 0 && <form action={clearTranslations} style={{ marginTop: 4 }}><input type="hidden" name="lang" value={l.code} /><button className="btn btn-sm btn-ghost" type="submit">Remove {l.name} translations</button></form>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel">
          <h2>Translate automatically</h2>
          {!ready && <p className="notice err">Add an AI key in <a href="/admin/settings/?tab=ai">Site settings › AI keys</a> first.</p>}
          <ActionForm action={startTranslation} className="stack">
            <span className="lbl">Languages</span>
            <div className="grid2">{langs.map((l) => <label key={l.code} className="row small"><input type="checkbox" name="langs" value={l.code} defaultChecked={['ar', 'ru', 'hi', 'ur', 'zh'].includes(l.code)} /> {l.native}</label>)}</div>
            <Toggle name="auto" label="Keep going every day" help="With the daily scheduled job, new pages and guides are translated too." on={job.auto} />
            <p className="help">Each page uses one AI request per language; the daily limit is in Site settings. A native speaker should review important pages.</p>
            <Submit>Translate missing pages</Submit>
          </ActionForm>
        </div>
      </div>
      {logs.filter((l) => l.kind === 'translate').length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}><h2>Recent errors</h2><div className="files" style={{ marginTop: 10 }}>{logs.filter((l) => l.kind === 'translate').slice(0, 20).map((l) => <div key={l.id} className="file"><span className="fn"><b>{l.text}</b><small>{when(l.at)}</small></span></div>)}</div></div>
      )}
    </>
  );
}
