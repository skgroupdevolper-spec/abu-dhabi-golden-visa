import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { F } from '@/components/dash/Fields';
import { PAGES, getPage } from '@/content/pages';
import { LOCALES } from '@/lib/i18n';
import { requireAdmin } from '@/lib/server/auth';
import { getTranslations } from '@/lib/server/content';
import { retranslatePage, saveTranslation } from '../../../ai-actions';

export const metadata: Metadata = { title: 'Edit translation' };
export const dynamic = 'force-dynamic';

export default async function EditTranslation({ searchParams }: { searchParams: Promise<{ path?: string; lang?: string }> }) {
  await requireAdmin();
  const { path = '/golden-visa/', lang = 'ar' } = await searchParams;
  const p = getPage(path);
  const tr = (await getTranslations())[lang]?.[path];
  const langs = LOCALES.filter((l) => l.code !== 'en');
  const info = LOCALES.find((l) => l.code === lang);
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Languages · translation editor</p><h1>Edit a translation</h1></div>{p && <a className="btn" href={`/${lang}${path}`} target="_blank" rel="noopener">View in {info?.name} ↗</a>}</div>
      <form className="panel row" action="/admin/languages/edit/" style={{ marginBottom: 16 }}>
        <select name="path" defaultValue={path} style={{ flex: 2, minWidth: 220 }}>{PAGES.map((x) => <option key={x.path} value={x.path}>{x.h1.slice(0, 70)} — {x.path}</option>)}</select>
        <select name="lang" defaultValue={lang} style={{ flex: 1, minWidth: 140 }}>{langs.map((l) => <option key={l.code} value={l.code}>{l.name} · {l.native}</option>)}</select>
        <button className="btn" type="submit">Open</button>
      </form>
      {!p ? <p className="notice err">Page not found.</p> : (
        <div className="cols">
          <div className="panel" dir={info?.dir}>
            <div className="panel-h"><h2>{info?.name} {tr ? <span className="pill ok">Translated</span> : <span className="pill due">Not translated yet</span>}</h2></div>
            <ActionForm action={saveTranslation} className="form">
              <input type="hidden" name="path" value={path} /><input type="hidden" name="lang" value={lang} />
              <F name="h1" label="Main title" value={tr?.h1 ?? ''} placeholder={p.h1} full />
              <F name="eyebrow" label="Small heading" value={tr?.eyebrow ?? ''} placeholder={p.eyebrow} full />
              <F name="intro" label="Introduction" value={tr?.intro ?? ''} placeholder={p.intro} type="textarea" rows={3} full />
              <F name="seoTitle" label="SEO title" value={tr?.seoTitle ?? ''} placeholder={p.seoTitle} full />
              <F name="meta" label="SEO description" value={tr?.meta ?? ''} placeholder={p.meta} type="textarea" rows={2} full />
              <div className="full"><Submit>Save translation</Submit></div>
            </ActionForm>
            <ActionForm action={retranslatePage}><input type="hidden" name="path" value={path} /><input type="hidden" name="lang" value={lang} /><div style={{ marginTop: 12 }}><Submit className="btn">Translate this page again with AI</Submit></div></ActionForm>
          </div>
          <div className="panel">
            <h2>English original</h2>
            <dl className="kv" style={{ marginTop: 10 }}>
              <dt>Main title</dt><dd>{p.h1}</dd><dt>Small heading</dt><dd>{p.eyebrow}</dd><dt>Introduction</dt><dd>{p.intro}</dd><dt>SEO title</dt><dd>{p.seoTitle}</dd><dt>SEO description</dt><dd>{p.meta}</dd>
            </dl>
            <p className="help" style={{ marginTop: 10 }}>The page sections are translated with AI. To fix a section text, translate the page again or edit it in the page builder.</p>
          </div>
        </div>
      )}
    </>
  );
}
