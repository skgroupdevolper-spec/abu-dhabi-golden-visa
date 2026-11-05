// Translations of one page or blog post: status in every language, edit by hand, or translate with AI.
import Link from 'next/link';
import { ActionForm, Submit } from './ActionForm';
import { LOCALES } from '@/lib/i18n';
import { aiReady } from '@/lib/server/ai';
import { getOverrides, getTranslations } from '@/lib/server/content';
import { getBlock } from '@/lib/server/settings';
import { retranslatePage } from '@/app/admin/ai-actions';

export async function TranslatePanel({ path, updated, live = true }: { path: string; updated?: string; live?: boolean }) {
  const [tr, over, ready, cfg] = await Promise.all([getTranslations(), getOverrides(), aiReady('translate'), getBlock<{ onSave: boolean }>('langcfg', { onSave: true })]);
  const changed = updated ?? over[path]?.at;
  const langs = LOCALES.filter((l) => l.code !== 'en');
  const st = langs.map((l) => {
    const t = tr[l.code]?.[path];
    const s = !t ? 'missing' : t.manual ? 'manual' : changed && changed > t.at ? 'old' : 'ok';
    return { l, s };
  });
  const done = st.filter((x) => x.s === 'ok' || x.s === 'manual').length;
  return (
    <div className="panel tr-panel" id="translations">
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div><h2>Translations · {done}/{langs.length}</h2>
          <p className="help">Auto-translate on save is <b>{cfg.onSave ? 'ON' : 'OFF'}</b>{ready ? '' : ' · no translation AI key yet'}. <Link href="/admin/languages/">Change in Languages</Link></p></div>
        {live && (ready ? (
          <ActionForm action={retranslatePage}><input type="hidden" name="path" value={path} /><input type="hidden" name="lang" value="all" /><Submit>Translate into all {langs.length} languages now</Submit></ActionForm>
        ) : <Link className="btn btn-gold" href="/admin/languages/#ai">Add translation AI key</Link>)}
      </div>
      {!live && <p className="notice">Publish this article first; then it can be translated.</p>}
      <div className="tr-bar"><i style={{ width: `${Math.round((done / langs.length) * 100)}%` }} /></div>
      <div className="tr-grid">
        {st.map(({ l, s }) => (
          <div key={l.code} className={`tr-l ${s}`}>
            <span className="tr-code">{l.code.toUpperCase()}</span>
            <span className="tr-n"><b>{l.name}</b><small>{s === 'ok' ? 'Translated' : s === 'manual' ? 'Edited by hand' : s === 'old' ? 'Page changed, needs update' : 'Not translated yet'}</small></span>
            <span className="tr-a">
              <Link className="btn btn-sm" href={`/admin/languages/edit/?path=${encodeURIComponent(path)}&lang=${l.code}`} title="Edit by hand">Edit</Link>
              {live && ready && <ActionForm action={retranslatePage}><input type="hidden" name="path" value={path} /><input type="hidden" name="lang" value={l.code} /><Submit className="btn btn-sm btn-ghost">AI</Submit></ActionForm>}
              {live && <a className="btn btn-sm btn-ghost" href={`/${l.code}${path}`} target="_blank" rel="noopener" aria-label={`View in ${l.name}`}>↗</a>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
