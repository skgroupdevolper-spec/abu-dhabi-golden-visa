'use client';

import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { FEE_SCHEDULE as F, ROUTES, aed, convert } from '@/lib/fees';
import { waLink } from '@/lib/site';
import { CURRENCY_EVENT, getCurrency } from './Header';
import { Icon } from './Icon';

type State = { route: number | null; where: 'in' | 'out' | null; fam: boolean | null; file: boolean | null; adults: number; kids: number; counted: boolean; med: 0 | 1 | null };
const START: State = { route: null, where: null, fam: null, file: null, adults: 0, kids: 0, counted: false, med: null };
const ICONS = ['home', 'briefcase', 'rocket', 'user', 'cap', 'family'];

type Line = [string, number];
function person(s: State, adult: boolean, main: boolean): Line[] {
  const l: Line[] = [[F.perPerson.visa.label, F.perPerson.visa.aed]];
  if (adult) l.push(s.med ? [F.medical.vip.label, F.medical.vip.aed] : [F.medical.normal.label, F.medical.normal.aed]);
  l.push([F.perPerson.emiratesId.label, F.perPerson.emiratesId.aed]);
  if (s.where === 'in') l.push([F.perPerson.changeOfStatus.label, F.perPerson.changeOfStatus.aed]);
  if (main && s.route !== null && ROUTES[s.route].valuation) l.push([F.propertyValuation.label, F.propertyValuation.aed]);
  return l;
}
const sum = (l: Line[]) => l.reduce((a, x) => a + x[1], 0);

export function Calculator({ initialRoute = null, bare = false }: { initialRoute?: number | null; bare?: boolean }) {
  const [s, setS] = useState<State>(initialRoute === null ? START : { ...START, route: initialRoute });
  const [hist, setHist] = useState<State[]>(initialRoute === null ? [] : [START]);
  const [cur, setCur] = useState('AED');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    setCur(getCurrency());
    const on = (e: Event) => setCur((e as CustomEvent<string>).detail);
    window.addEventListener(CURRENCY_EVENT, on);
    return () => window.removeEventListener(CURRENCY_EVENT, on);
  }, []);

  const steps: string[] = ['route', 'where', 'fam', ...(s.fam ? ['file', 'count'] : []), 'med', 'result'];
  const current =
    s.route === null ? 'route' : !s.where ? 'where' : s.fam === null ? 'fam' : s.fam && s.file === null ? 'file' : s.fam && !s.counted ? 'count' : s.med === null ? 'med' : 'result';
  const idx = steps.indexOf(current);

  function go(patch: Partial<State>, e?: MouseEvent) {
    setHist((h) => [...h, s]);
    setS((x) => ({ ...x, ...patch }));
    if (e && window.__adgvDrop) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      window.__adgvDrop(r.left + r.width / 2, r.top + r.height / 2, 0.04, -0.6);
    }
  }
  function back() {
    setHist((h) => {
      if (!h.length) return h;
      setS(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }

  const Opt = ({ icon, title, sub, price, onClick, dark }: { icon: string; title: string; sub: string; price?: string; onClick: (e: MouseEvent) => void; dark?: boolean }) => (
    <button type="button" className="opt" onClick={onClick}>
      <span className="oi" style={dark ? { background: 'linear-gradient(135deg, var(--gold-light), var(--gold))', color: 'var(--navy)' } : undefined}><Icon name={icon} /></span>
      <span><b>{title}</b><small>{sub}</small></span>
      {price && <span className="pr">{price}</span>}
    </button>
  );

  let body: ReactNode = null;
  if (current === 'route') {
    body = (
      <>
        <h3>What describes you?</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>Choose the route you are applying through.</p>
        <div className="opts two">
          {ROUTES.map((r, i) => <Opt key={r.id} icon={ICONS[i]} title={r.label} sub={r.note} onClick={(e) => go({ route: i }, e)} />)}
        </div>
      </>
    );
  } else if (current === 'where') {
    body = (
      <>
        <h3>Where are you now?</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>This decides whether a change of status fee applies.</p>
        <div className="opts">
          <Opt icon="pin" title="Inside the UAE" sub="On a visit, tourist or residence visa" price={`+ ${aed(F.perPerson.changeOfStatus.aed)}`} onClick={(e) => go({ where: 'in' }, e)} />
          <Opt icon="plane" title="Outside the UAE" sub="Applying from your home country" onClick={(e) => go({ where: 'out' }, e)} />
        </div>
      </>
    );
  } else if (current === 'fam') {
    body = (
      <>
        <h3>Adding family members too?</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>Your spouse, children and parents can be added now.</p>
        <div className="opts">
          <Opt icon="user" title="No, just me" sub="Only my own visa" onClick={(e) => go({ fam: false, adults: 0, kids: 0 }, e)} />
          <Opt icon="family" title="Yes, add family" sub="Add adults and children" onClick={(e) => go({ fam: true }, e)} />
        </div>
      </>
    );
  } else if (current === 'file') {
    body = (
      <>
        <h3>Does the sponsor file need opening?</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>It is opened once per sponsor, not for each family member.</p>
        <div className="opts">
          <Opt icon="folder" title="Needs opening" sub="Charged once" price={aed(F.sponsorFile.aed)} dark onClick={(e) => go({ file: true }, e)} />
          <Opt icon="check" title="Already open" sub="No opening fee" onClick={(e) => go({ file: false }, e)} />
        </div>
      </>
    );
  } else if (current === 'count') {
    const Counter = ({ k, title, sub, icon }: { k: 'adults' | 'kids'; title: string; sub: string; icon: string }) => (
      <div className="counter">
        <span className="oi" style={{ flex: 'none', width: 48, height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#fbf4dd', color: 'var(--gold-deep)' }}><Icon name={icon} /></span>
        <span><b>{title}</b><small className="muted" style={{ display: 'block' }}>{sub}</small></span>
        <span className="st">
          <button type="button" aria-label={`One less ${title.toLowerCase()}`} onClick={() => setS((x) => ({ ...x, [k]: Math.max(0, x[k] - 1) }))}>−</button>
          <output aria-live="polite">{s[k]}</output>
          <button type="button" aria-label={`One more ${title.toLowerCase()}`} onClick={() => setS((x) => ({ ...x, [k]: Math.min(10, x[k] + 1) }))}>+</button>
        </span>
      </div>
    );
    body = (
      <>
        <h3>Add your family members</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>You are already counted. Add only your family.</p>
        <div className="opts">
          <Counter k="adults" title="Adults" sub="18 years and over" icon="user" />
          <Counter k="kids" title="Children" sub="Under 18, no medical test" icon="baby" />
        </div>
        <button type="button" className="btn btn-gold" style={{ marginTop: 16, width: '100%' }} onClick={(e) => go({ counted: true }, e)}>Continue</button>
      </>
    );
  } else if (current === 'med') {
    body = (
      <>
        <h3>Choose your medical test</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>Needed for everyone 18 and over.</p>
        <div className="opts">
          <Opt icon="stetho" title="Normal medical" sub="Standard result time" price={aed(F.medical.normal.aed)} onClick={(e) => go({ med: 0 }, e)} />
          <Opt icon="crown" title="VIP medical" sub="Fastest result" price={aed(F.medical.vip.aed)} dark onClick={(e) => go({ med: 1 }, e)} />
        </div>
      </>
    );
  } else if (s.route !== null) {
    const main = person(s, true, true), ad = person(s, true, false), ch = person(s, false, false);
    const file = s.fam && s.file ? F.sponsorFile.aed : 0;
    const total = sum(main) + s.adults * sum(ad) + s.kids * sum(ch) + file;
    const people = 1 + s.adults + s.kids;
    const desc = [ROUTES[s.route].label, s.where === 'in' ? 'Inside the UAE' : 'Outside the UAE', s.med ? 'VIP medical' : 'Normal medical'].join(' · ');
    const summary = [
      'Abu Dhabi Golden Visa estimate',
      desc,
      `Main applicant: ${aed(sum(main))}`,
      s.adults ? `Adults × ${s.adults}: ${aed(s.adults * sum(ad))}` : '',
      s.kids ? `Children × ${s.kids}: ${aed(s.kids * sum(ch))}` : '',
      file ? `Sponsor file: ${aed(file)}` : '',
      `Total government fees: ${aed(total)}`,
      `Fee schedule: ${F.date}`,
      'Please send me a full quote with insurance and consultancy.',
    ].filter(Boolean).join('\n');
    const Card = ({ title, lines, mult = 1 }: { title: string; lines: Line[]; mult?: number }) => (
      <div className="pc">
        <div className="h"><span>{title}{mult > 1 ? ` × ${mult}` : ''}</span><span>{aed(sum(lines) * mult)}</span></div>
        {lines.map(([l, v]) => <div className="ln" key={l}><span>{l}</span><em /><b>{v.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></div>)}
      </div>
    );
    body = (
      <div className="result">
        <p className="eyebrow">Your estimate</p>
        <p className="muted" style={{ margin: '4px 0 14px' }}>{desc}</p>
        <Card title="Main applicant" lines={main} />
        {s.adults > 0 && <Card title="Adult family member" lines={ad} mult={s.adults} />}
        {s.kids > 0 && <Card title="Child under 18" lines={ch} mult={s.kids} />}
        {file > 0 && <div className="pc"><div className="h"><span>{F.sponsorFile.label}</span><span>{aed(file)}</span></div></div>}
        <div className="total">
          <small>Government fees for {people} {people > 1 ? 'people' : 'person'}</small>
          <div className="t">{aed(total)}</div>
          {convert(total, cur) && <div style={{ fontSize: 14, opacity: 0.85 }}>{convert(total, cur)} (approximate)</div>}
        </div>
        <ul className="ticks" style={{ fontSize: 14 }}>
          {F.assumptions.map((a) => <li key={a}>{a}</li>)}
          <li>Fee schedule dated {F.date}.</li>
        </ul>
        <div className="row-actions">
          <a className="btn btn-gold" href={waLink(summary)} target="_blank" rel="noopener"><Icon name="wa" size={18} /> Send to WhatsApp</a>
          <button type="button" className="btn btn-glass" onClick={() => navigator.clipboard?.writeText(summary).then(() => setCopied('Copied'), () => setCopied('Select and copy the text'))}>{copied || 'Copy estimate'}</button>
          <button type="button" className="btn btn-glass" onClick={() => { setS(START); setHist([]); }}>Recalculate</button>
        </div>
      </div>
    );
  }

  return (
    <div className={bare ? 'calc-bare' : 'panel glass'} aria-live="polite">
      <div className="bar-steps" aria-hidden="true">{steps.slice(0, -1).map((k, i) => <i key={k} className={i <= idx ? 'on' : ''} />)}</div>
      {hist.length > 0 && current !== 'result' && (
        <button type="button" className="btn btn-glass" style={{ minHeight: 40, padding: '0 14px', marginBottom: 12 }} onClick={back}>‹ Back</button>
      )}
      <div className="wstep" key={current}>{body}</div>
    </div>
  );
}
