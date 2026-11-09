import { LangSelect } from './LangSelect';
import { setLang, logout } from '@/app/portal/actions';
import type { Dict } from '@/lib/portal-i18n';
import { coinImg, fullLogo } from '@/components/BrandLogo';

export function PortalTop({ t, lang, base, back, right, signedIn }: { t: Dict; lang: string; base: string; back: string; right?: React.ReactNode; signedIn?: boolean }) {
  return (
    <header className="portal-top">
      <div className="in">
        <a href={`${base}/`}><img src={fullLogo()} alt="Abu Dhabi Golden Visa" /></a>
        <div className="row" style={{ marginInlineStart: 'auto' }}>
          {right}
          <LangSelect action={setLang} current={lang} back={back} label={t.language} />
          {signedIn && <a className="btn btn-sm" href={`${base}/account/`}>{t.profile}</a>}
          {signedIn && <form action={logout}><button className="btn btn-sm btn-ghost" type="submit">{t.signOut}</button></form>}
        </div>
      </div>
    </header>
  );
}
