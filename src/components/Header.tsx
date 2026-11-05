'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV } from '@/content/nav';
import { LOCALES, localeInfo, localizePath, splitLocale, type Locale } from '@/lib/i18n';
import { RATES } from '@/lib/fees';
import { SITE, waLink } from '@/lib/site';
import { Icon } from './Icon';
import { L } from './L';

export const CURRENCY_EVENT = 'adgv:currency';

export function getCurrency(): string {
  try {
    const c = localStorage.getItem('adgv-currency');
    return c && RATES[c] ? c : 'AED';
  } catch {
    return 'AED';
  }
}

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const { path } = splitLocale(pathname);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [cur, setCur] = useState('AED');
  const [small, setSmall] = useState(false);
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

  return (
    <>
      <header className="top" ref={ref}>
        <div className="wrap">
          <div className="bar glass" style={{ paddingBlock: small ? 4 : 6 }}>
            <L locale={locale} href="/" className="logo" aria-label={`${SITE.name} home`}>
              <img src="/brand/logo.webp" alt={SITE.name} width={164} height={40} />
            </L>
            <nav className="nav" aria-label="Main">
              {NAV.map((item) =>
                item.groups ? (
                  <div key={item.label} onMouseEnter={() => setOpen(item.label)} onMouseLeave={() => setOpen((o) => (o === item.label ? null : o))}>
                    <button type="button" className="nav-link" aria-expanded={open === item.label} onClick={() => toggle(item.label)}>
                      {item.label} <Icon name="chev" size={14} />
                    </button>
                    {open === item.label && (
                      <div className={`mega${item.groups.length > 3 ? ' wide' : item.groups.length === 3 ? ' three' : item.groups.length > 1 ? ' two' : ''}`} data-lenis-prevent>
                        {item.groups.map((g) => (
                          <div key={g.title}>
                            <h4>{g.title}</h4>
                            {g.links.map((l) => (
                              <L key={l.href + l.label} locale={locale} href={l.href}>
                                {l.label}
                                {l.note && <small>{l.note}</small>}
                              </L>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div key={item.label}>
                    <L locale={locale} href={item.href} className="nav-link">
                      {item.label}
                    </L>
                  </div>
                ),
              )}
            </nav>
            <div className="tools">
              <div className="chip">
                <button type="button" aria-haspopup="true" aria-expanded={open === 'lang'} aria-label="Choose language" onClick={() => toggle('lang')}>
                  <Icon name="globe" size={17} /> {localeInfo(locale).code.toUpperCase()}
                </button>
                {open === 'lang' && (
                  <div className="drop langs" role="menu">
                    {LOCALES.map((l) => (
                      <a key={l.code} href={localizePath(path, l.code as Locale)} hrefLang={l.htmlLang} aria-current={l.code === locale} role="menuitem">
                        <b>{l.code.toUpperCase()}</b>
                        <span>{l.native}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="chip hide-sm">
                <button type="button" aria-haspopup="true" aria-expanded={open === 'cur'} aria-label="Choose currency" onClick={() => toggle('cur')}>
                  <Icon name="coins" size={17} /> {cur}
                </button>
                {open === 'cur' && (
                  <div className="drop curs" role="menu">
                    {Object.entries(RATES).map(([code, r]) => (
                      <button key={code} type="button" role="menuitemradio" aria-checked={code === cur} onClick={() => pickCurrency(code)}>
                        <b>{code}</b>
                        <span style={{ flex: 1 }}>{r.name}</span>
                        <span className="muted">{r.symbol.trim()}</span>
                      </button>
                    ))}
                    <p className="note">Approximate conversion. Government fees are paid in AED.</p>
                  </div>
                )}
              </div>
              <a className="icon-btn hide-sm" href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener" aria-label="WhatsApp us">
                <Icon name="wa" size={20} />
              </a>
              <L locale={locale} href="/visa-check/" className="btn btn-red hide-sm" style={{ minHeight: 44, padding: '0 18px' }}>
                Check Eligibility
              </L>
              <button type="button" className="burger" aria-label="Open menu" onClick={() => setMobile(true)}>
                <Icon name="menu" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobile && (
        <div className="mobile-panel" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="mp-head">
            <img src="/brand/logo.webp" alt={SITE.name} width={140} height={34} style={{ height: 34, width: 'auto' }} />
            <button type="button" className="burger" style={{ display: 'grid' }} aria-label="Close menu" onClick={() => setMobile(false)}>
              <Icon name="close" />
            </button>
          </div>
          {NAV.map((item) =>
            item.groups ? (
              <details key={item.label}>
                <summary>
                  {item.label} <Icon name="chev" size={16} />
                </summary>
                {item.groups.flatMap((g) => g.links).map((l) => (
                  <L key={l.href + l.label} locale={locale} href={l.href}>
                    {l.label}
                  </L>
                ))}
              </details>
            ) : (
              <L key={item.label} locale={locale} href={item.href}>
                {item.label}
              </L>
            ),
          )}
          <div className="cta">
            <L locale={locale} href="/visa-check/" className="btn btn-red">
              Check Eligibility
            </L>
            <a className="btn btn-glass" href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener">
              WhatsApp {SITE.whatsappDisplay}
            </a>
          </div>
        </div>
      )}

      <nav className="dock" aria-label="Quick actions">
        <L locale={locale} href="/golden-visa-cost/" data-open-calc="">
          <span className="ic g"><Icon name="calc" /></span>
          <span className="lb">Cost calculator</span>
        </L>
        <a href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener">
          <span className="ic w"><Icon name="wa" /></span>
          <span className="lb">WhatsApp us</span>
        </a>
        <L locale={locale} href="/visa-check/">
          <span className="ic r"><Icon name="check" /></span>
          <span className="lb">Check eligibility</span>
        </L>
        <L locale={locale} href="/free-consultation/">
          <span className="ic"><Icon name="doc" /></span>
          <span className="lb">Free consultation</span>
        </L>
      </nav>

      <nav className="mnav" aria-label="Mobile">
        <L locale={locale} href="/"><Icon name="home" />Home</L>
        <L locale={locale} href="/golden-visa/"><Icon name="star" />Golden Visa</L>
        <L locale={locale} href="/golden-visa-cost/" className="mid" aria-label="Cost calculator" data-open-calc=""><Icon name="calc" size={26} /></L>
        <L locale={locale} href="/visa-check/"><Icon name="check" />Visa Check</L>
        <a href={waLink('Hello, I would like help with the Abu Dhabi Golden Visa.')} target="_blank" rel="noopener"><Icon name="wa" />WhatsApp</a>
      </nav>
    </>
  );
}
