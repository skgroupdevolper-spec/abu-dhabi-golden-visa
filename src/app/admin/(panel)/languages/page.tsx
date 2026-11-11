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
import { clearItems } from '@/app/admin/delete-actions';
import { AiPanel } from '@/components/dash/AiPanel';
import { clearTranslations, saveLangCfg, saveSiteLanguages, startTranslation, stopTranslation, translateEverything, translateInterface } from '../../ai-actions';
import { uiProgress } from '@/lib/server/translate';
import { getSite } from '@/lib/server/settings';

export const metadata: Metadata = { title: 'Languages' };
export const dynamic = 'force-dynamic';

export default async function Languages() {
  await requireAdmin(FULL);
  const [prog, job, ready, logs, langcfg] = await Promise.all([translationProgress(), getBlock<TranslateJob>('translateJob', JOB0), aiReady('translate'), list<AiLog>('ai-log'), getBlock<{ onSave: boolean }>('langcfg', { onSave: true })]);
  const langs = LOCALES.filter((l) => l.code !== 'en');
  const site = await getSite();
  const uip = await uiProgress();
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Languages & translation</p><h1>Languages &amp; translation</h1></div>
        <div className="row"><a className="btn" href="/admin/languages/edit/">Edit a translation by hand</a>{job.running && <form action={stopTranslation}><button className="btn" type="submit">Stop translating</button></form>}</div></div>
      <div className="panel goldbg" style={{ marginBottom: 16 }}>
        <div className="panel-h"><h2>Translate the whole website</h2></div>
        <p className="help">One click translates every page, guide and blog post into all {langs.length} website languages, plus menus and buttons. Only pages that are missing or changed in English are sent, six at a time. New pages and edits are translated automatically after each save and after each update of the website, so you do not need to come back here.</p>
        {ready ? (
          <ActionForm action={translateEverything}><Submit className="btn btn-gold">{job.running ? 'Running…' : 'Translate everything now'}</Submit></ActionForm>
        ) : <p className="notice err">Add the translation AI key at the bottom of this page first.</p>}
      </div>
      {job.running && <meta httpEquiv="refresh" content="8" />}
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
                  <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}><span><b>{l.native}</b> <span className="muted">/{l.code}/</span></span><span>{prog.upToDate[l.code] ?? 0} up to date{n - (prog.upToDate[l.code] ?? 0) > 0 ? ` · ${n - (prog.upToDate[l.code] ?? 0)} to update` : ''} / {prog.total}</span></div>
                  <div className="bar" style={{ marginTop: 4 }}><i style={{ width: `${((prog.upToDate[l.code] ?? 0) / prog.total) * 100}%` }} /></div>
                  {n > 0 && <form action={clearTranslations} style={{ marginTop: 4 }}><input type="hidden" name="lang" value={l.code} /><button className="btn btn-sm btn-ghost" type="submit">Remove {l.name} translations</button></form>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel">
          <h2>Menus, buttons &amp; widgets</h2>
          <p className="help">{uip.total} interface texts: header menu, footer, buttons, booking calendar, flight path, contact and about sections. Translated with AI; new texts are added every night automatically.</p>
          <div className="lang-on" style={{ margin: '10px 0' }}>{langs.map((l) => <span key={l.code} className="small"><b>{l.code.toUpperCase()}</b> {uip.per[l.code] ?? 0}/{uip.total}</span>)}</div>
          <ActionForm action={translateInterface}><Submit>Translate menus, buttons &amp; widgets now</Submit></ActionForm>
        </div>
        <div className="panel">
          <h2>Languages on the website</h2>
          <p className="help">Switch a language off to hide it from the language menu, the sitemap and Google, stop translating into it, and send its visitors to English.</p>
          <ActionForm action={saveSiteLanguages} className="form">
            <div className="full lang-on">{LOCALES.map((l) => (
              <label key={l.code} className="row small"><input type="checkbox" name="lang" value={l.code} defaultChecked={l.code === 'en' || !site.languages?.length || site.languages.includes(l.code)} disabled={l.code === 'en'} /> {l.native} <span className="muted">({l.name})</span></label>))}</div>
            <div className="full"><Toggle name="switcher" label="Show the language menu in the header" on={site.features.languageSwitcher} /></div>
            <div className="full"><Submit className="btn btn-sm">Save languages</Submit></div>
          </ActionForm>
        </div>
        <div className="panel">
          <h2>Translate automatically</h2>
          <ActionForm action={saveLangCfg} className="row" >
            <Toggle name="onSave" label="Translate automatically (recommended)" help="New pages, edits and blog posts are translated into all website languages in the background after each save and after every website update." on={langcfg.onSave} />
            <Submit className="btn btn-sm">Save</Submit>
          </ActionForm>
          {!ready && <p className="notice err">Add the translation AI key below first.</p>}
          <ActionForm action={startTranslation} className="stack">
            <span className="lbl">Languages</span>
            <div className="grid2">{langs.map((l) => <label key={l.code} className="row small"><input type="checkbox" name="langs" value={l.code} defaultChecked={['ar', 'ru', 'hi', 'ur', 'zh'].includes(l.code)} /> {l.native}</label>)}</div>
            <Toggle name="auto" label="Keep going every day" help="With the daily scheduled job, new pages and guides are translated too." on={job.auto} />
            <p className="help">Each page uses one AI request per language; the daily limit is in Site settings. A native speaker should review important pages.</p>
            <Submit>Translate missing pages</Submit>
          </ActionForm>
        </div>
      </div>
      <div id="ai" style={{ marginTop: 16 }}><AiPanel uses={['translate']} title="Translation AI provider & API key" /></div>
      {logs.filter((l) => l.kind === 'translate').length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}><div className="panel-h"><h2>Recent errors</h2><form action={clearItems}><input type="hidden" name="kind" value="ailog" /><input type="hidden" name="scope" value="kind:translate" /><button className="btn btn-sm" type="submit">Clear old errors</button></form></div><p className="small muted">Messages about “gemini-2.5-flash” are old: Google retired that model and the site now switches to Gemini 3.8 Flash automatically. Clear them and run the translation again.</p><div className="files" style={{ marginTop: 10 }}>{logs.filter((l) => l.kind === 'translate').slice(0, 20).map((l) => <div key={l.id} className="file"><span className="fn"><b>{l.text}</b><small>{when(l.at)}</small></span></div>)}</div></div>
      )}
    </>
  );
}
