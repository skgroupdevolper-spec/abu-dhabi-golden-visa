'use client';

import { OfficeStatus } from './OfficeStatus';
import { u } from '@/lib/ui';
import { catalog } from '@/content/services-catalog';
import { BrandLogo } from './BrandLogo';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV } from '@/content/nav';
import { LOCALES, localeInfo, localizePath, splitLocale, type Locale } from '@/lib/i18n';
import { RATES, siteFx } from '@/lib/fees';
import { liveLocales, SITE, waLink } from '@/lib/site';
import { Icon } from './Icon';
import { L } from './L';

export const CURRENCY_EVENT = 'adgv:currency';

export function getCurrency(): string {
  try {
    const c = localStorage.getItem('adgv-currency');
    return c && (siteFx() ?? RATES)[c] ? c : 'AED';
  } catch {
    return 'AED';
  }
}

const ICON_RULES: [RegExp, string][] = [
  [/property|valuation|home/i, 'home'], [/company|business|investor|corporate|pro\b|tasheel|tawjeeh|clearing|employment|work permit|freelanc/i, 'briefcase'],
  [/entrepreneur|startup|technology/i, 'rocket'], [/student|graduate|teacher|degree|education/i, 'cap'], [/doctor|health|medical|frontline/i, 'stetho'],
  [/talent|artist|creative|exceptional|scientist|research/i, 'spark'], [/spouse|children|family|parent|newborn|baby/i, 'family'], [/retire/i, 'heart'],
  [/remote|virtual|tourist|entry|travel/i, 'plane'], [/attest|translation|legal|document|certificate|notary|will/i, 'doc'], [/emirates id|insurance|iloe|cancel|renewal|shield/i, 'shield'],
  [/cost|calculator|fee/i, 'calc'], [/eligib|check|validity/i, 'check'], [/faq|blog|guide|benefit|process|time|requirement/i, 'folder'], [/contact|about|why|consult/i, 'user'],
  [/indian|pakistan|russia|kazakh|chin|filip|niger|egypt|uk|usa|turk|german|country/i, 'globe'], [/golden/i, 'star'],
];
function iconFor(label: string, group: string) {
  for (const [re, ic] of ICON_RULES) if (re.test(label)) return ic;
  for (const [re, ic] of ICON_RULES) if (re.test(group)) return ic;
  return 'star';
}

// The Our Services menu always follows the live service list (Admin > Services & prices).
const MENU = () => (SITE.nav.menu?.length ? SITE.nav.menu : NAV.map((i) => (i.href === '/services/' && i.groups ? { ...i, groups: catalog().map((g) => ({ title: g.title, links: g.items.map((x) => ({ label: x.label, href: x.href, note: x.note })) })) } : i)));

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const { path } = splitLocale(pathname);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [cur, setCur] = useState('AED');
  const [small, setSmall] = useState(false);
  const [tab, setTab] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => setCur(getCurrency()), []);
  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [pathname]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setMobile(false);
      }
    };
    const onScroll = () => setSmall(window.scrollY > 30);
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  function pickCurrency(code: string) {
    setCur(code);
    setOpen(null);
    try {
      localStorage.setItem('adgv-currency', code);
    } catch {}
    window.dispatchEvent(new CustomEvent(CURRENCY_EVENT, { detail: code }));
  }

  const toggle = (k: string) => setOpen((o) => (o === k ? null : k));
  // Hover menus: open at once, close after a short delay so the pointer can travel to the panel.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enter = (k: string) => { if (timer.current) clearTimeout(timer.current); setOpen(k); };
  const leave = (k: string) => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOpen((o) => (o === k ? null : o)), 220); };

  const F = SITE.features;
  const portal = process.env.NEXT_PUBLIC_PORTAL_URL || '/portal/login/';
  const waHello = waLink('Hello, I would like help with the Abu Dhabi Golden Visa.');

  const langChip = (cls = '') => F.languageSwitcher && (
    <div className={`chip ${cls}`}>
      <button type="button" aria-haspopup="true" aria-expanded={open === 'lang' + cls} aria-label={u('Choose language', locale)} onClick={() => toggle('lang' + cls)}>
        <Icon name="globe" size={16} /> {localeInfo(locale).native} <Icon name="chev" size={13} className="dd" />
      </button>
      {open === 'lang' + cls && (
        <div className="drop langs" role="menu">
          {liveLocales().map((l) => (
            <a key={l.code} href={localizePath(path, l.code as Locale)} hrefLang={l.htmlLang} aria-current={l.code === locale} role="menuitem">
              <b>{l.code.toUpperCase()}</b>
              <span>{l.native}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {F.topBar && F.topBarText && <div className="topline">{F.topBarText}</div>}
      <header className={`top${F.topBar && F.topBarText ? ' with-line' : ''}${small ? ' small' : ''}`} ref={ref}>
        <div className="utility">
          <div className="wrap utility-in">
            <a href={waHello} target="_blank" rel="noopener"><Icon name="wa" size={15} /> {SITE.whatsappDisplay}</a>
            <a href={`mailto:${SITE.email}`} className="hide-md"><Icon name="mail" size={15} /> {SITE.email}</a>
            <span className="hide-md"><OfficeStatus locale={locale} fallback={SITE.hours} /></span>
            <span className="u-sp" />
            {F.clientLogin && <a href={portal}><Icon name="user" size={15} /> {u('Login', locale)}</a>}
            {langChip('u')}
            <div className="chip u">
              <button type="button" aria-haspopup="true" aria-expanded={open === 'cur'} aria-label={u('Choose currency', locale)} onClick={() => toggle('cur')}>
                <Icon name="coins" size={16} /> {cur} <Icon name="chev" size={13} className="dd" />
              </button>
              {open === 'cur' && (
                <div className="drop curs" role="menu">
                  {Object.entries(siteFx() ?? RATES).map(([code, r]) => (
                    <button key={code} type="button" role="menuitemradio" aria-checked={code === cur} onClick={() => pickCurrency(code)}>
                      <b>{code}</b>
                      <span style={{ flex: 1 }}>{r.name}</span>
                      <span className="muted">{r.symbol.trim()}</span>
                    </button>
                  ))}
                  <p className="note">{u('Approximate conversion. Government fees are paid in AED.', locale)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mainbar">
          <div className="wrap bar">
            <L locale={locale} href="/" className="logo" aria-label={`${SITE.name} home`}>
              <BrandLogo alt={SITE.name} />
            </L>
            <nav className="nav" aria-label={u('Main', locale)}>
              {[...MENU(), ...SITE.nav.extra.map((x) => ({ label: x.label, href: x.href, groups: undefined }))].map((item) =>
                item.groups ? (
                  <div key={item.label} className="has-mega" onMouseEnter={() => enter(item.label)} onMouseLeave={() => leave(item.label)}>
                    <button type="button" className={`nav-link${path.startsWith(item.href) && item.href !== '/' ? ' here' : ''}`} aria-expanded={open === item.label} onClick={(e) => ((e.nativeEvent as PointerEvent).pointerType === 'mouse' ? setOpen(item.label) : toggle(item.label))}>
                      {u(item.label, locale)} <Icon name="chev" size={14} />
                    </button>
                    {open === item.label && (
                      item.groups.length > 3 ? (
                      <div className="mega wide tabs" data-lenis-prevent>
                        <div className="mt-list" role="tablist" aria-label={u(item.label, locale)}>
                          {item.groups.map((g, gi) => (
                            <button key={g.title} type="button" role="tab" aria-selected={tab === gi} onMouseEnter={() => setTab(gi)} onFocus={() => setTab(gi)} onClick={() => setTab(gi)}>
                              <span className="mi"><Icon name={iconFor(g.links[0]?.label ?? '', g.title)} size={17} /></span>
                              <span>{u(g.title, locale)}</span><em className="mt-count">{g.links.length}</em>
                              <Icon name="chev" size={14} className="mt-arrow" />
                            </button>
                          ))}
                          <L locale={locale} href={item.href} className="mt-all">{item.href === '/blog/' ? 'All blog posts →' : 'See all services →'}</L>
                        </div>
                        <div className="mt-panel" role="tabpanel">
                          <h4>{u(item.groups[tab]?.title ?? "", locale)}</h4>
                          <div className="mt-grid">
                            {(item.groups[tab]?.links ?? []).map((l) => (
                              <L key={l.href + l.label} locale={locale} href={l.href} className="mt-card">
                                <span className="mi"><Icon name={iconFor(l.label, item.groups![tab].title)} size={18} /></span>
                                <span><b>{u(l.label, locale)}</b>{l.note && <small>{u(l.note, locale)}</small>}</span>
                              </L>
                            ))}
                          </div>
                        </div>
                        <div className="mega-promo">
                          <p className="eyebrow">{item.href === '/blog/' ? 'Have a question?' : 'Need help choosing?'}</p>
                          <b>{item.href === '/blog/' ? 'Ask an advisor for free' : 'Tell us what you need'}</b>
                          <p>{u('An advisor replies on WhatsApp with the steps, documents and a written quote.', locale)}</p>
                          <L locale={locale} href="/apply/" className="btn btn-gold btn-s">{u('Apply online', locale)}</L>
                          <a href={waHello} target="_blank" rel="noopener" className="btn btn-red btn-s">{u('WhatsApp us', locale)}</a>
                        </div>
                      </div>
                      ) : (
                      <div className={`mega${item.groups.length === 3 ? ' three' : item.groups.length > 1 ? ' two' : ' one'}${item.href === '/contact/' ? ' end' : ''}`} data-lenis-prevent>
                        <div className="mega-cols">
                          {item.groups.map((g) => (
                            <div key={g.title} className={g.links.length > 8 ? 'mg-dense' : g.links.some((l) => l.note) ? 'mg-notes' : 'mg-plain'}>
                              <h4>{u(g.title, locale)}</h4>
                              {g.links.map((l) => (
                                <L key={l.href + l.label} locale={locale} href={l.href}>
                                  <span className="mi"><Icon name={iconFor(l.label, g.title)} size={16} /></span>
                                  <span>{u(l.label, locale)}{l.note && <small>{u(l.note, locale)}</small>}</span>
                                </L>
                              ))}
                            </div>
                          ))}
                        </div>
                        <div className="mega-promo">
                          <p className="eyebrow">{u('Not sure where to start?', locale)}</p>
                          <b>{u('Free eligibility check in one minute', locale)}</b>
                          <p>{u('Answer a few questions and an advisor confirms your best route on WhatsApp.', locale)}</p>
                          <L locale={locale} href="/visa-check/" className="btn btn-red btn-s">{u('Check eligibility', locale)}</L>
                          <L locale={locale} href="/apply/" className="btn btn-gold btn-s">{u('Apply online', locale)}</L>
                        </div>
                      </div>
                      )
                    )}
                  </div>
                ) : (
                  <div key={item.label}>
                    <L locale={locale} href={item.href} className={`nav-link${path === item.href ? ' here' : ''}`} {...(item.href === '/golden-visa-cost/' ? { 'data-open-calc': '' } : {})}>
                      {u(item.label, locale)}
                    </L>
                  </div>
                ),
              )}
            </nav>
            <div className="tools">
              {langChip('m')}
              <L locale={locale} href={SITE.nav.ctaLink || '/visa-check/'} className="btn btn-red btn-s hide-sm">
                {SITE.nav.ctaLabel || 'Check Eligibility'}
              </L>
              <L locale={locale} href="/apply/" className="btn btn-gold btn-s hide-xs">{u('Apply Now', locale)}</L>
              <button type="button" className="burger" aria-label={u('Open menu', locale)} onClick={() => setMobile(true)}>
                <Icon name="menu" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobile && (
        <div className="mobile-panel" role="dialog" aria-modal="true" aria-label={u('Menu', locale)}>
          <div className="mp-head">
            <BrandLogo alt={SITE.name} size={34} />
            <button type="button" className="burger" style={{ display: 'grid' }} aria-label={u('Close menu', locale)} onClick={() => setMobile(false)}>
              <Icon name="close" />
            </button>
          </div>
          {MENU().map((item) =>
            item.groups ? (
              <details key={item.label}>
                <summary>
                  {u(item.label, locale)} <Icon name="chev" size={16} />
                </summary>
                {item.groups.flatMap((g) => g.links).map((l) => (
                  <L key={l.href + l.label} locale={locale} href={l.href}>
                    {u(l.label, locale)}
                  </L>
                ))}
              </details>
            ) : (
              <L key={item.label} locale={locale} href={item.href}>
                {u(item.label, locale)}
              </L>
            ),
          )}
          <div className="cta">
            <L locale={locale} href="/apply/" className="btn btn-gold">
              {u('Apply Now', locale)}
            </L>
            <L locale={locale} href="/visa-check/" className="btn btn-red">
              {u('Check Eligibility', locale)}
            </L>
            <a className="btn btn-glass" href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener">
              WhatsApp {SITE.whatsappDisplay}
            </a>
          </div>
        </div>
      )}

      {F.dock && <nav className="dock" aria-label={u('Quick actions', locale)}>
        <L locale={locale} href="/golden-visa-cost/" data-open-calc="">
          <span className="ic g"><Icon name="calc" /></span>
          <span className="lb">{u('Cost calculator', locale)}</span>
        </L>
        <a href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener">
          <span className="ic w"><Icon name="wa" /></span>
          <span className="lb">{u('WhatsApp us', locale)}</span>
        </a>
        <L locale={locale} href="/visa-check/">
          <span className="ic r"><Icon name="check" /></span>
          <span className="lb">{u('Check eligibility', locale)}</span>
        </L>
        <L locale={locale} href="/free-consultation/">
          <span className="ic"><Icon name="doc" /></span>
          <span className="lb">{u('Free consultation', locale)}</span>
        </L>
        {F.clientLogin && (
          <a href={portal}>
            <span className="ic"><Icon name="user" /></span>
            <span className="lb">{u('Login', locale)}</span>
          </a>
        )}
      </nav>}

      {F.mobileBar && <nav className="mnav" aria-label={u('Mobile', locale)}>
        <L locale={locale} href="/"><Icon name="home" />{u('Home', locale)}</L>
        <L locale={locale} href="/golden-visa/"><Icon name="star" />{u('Golden Visa', locale)}</L>
        <L locale={locale} href="/golden-visa-cost/" className="mid" aria-label={u('Cost calculator', locale)} data-open-calc=""><Icon name="calc" size={26} /></L>
        <L locale={locale} href="/visa-check/"><Icon name="check" />{u('Visa Check', locale)}</L>
        <a href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener"><Icon name="wa" />{u('WhatsApp', locale)}</a>
      </nav>}
      {F.floatingWhatsApp && !F.dock && (
        <a className="wa-float" href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener" aria-label={u('WhatsApp us', locale)}><Icon name="wa" size={26} /></a>
      )}
    </>
  );
}
