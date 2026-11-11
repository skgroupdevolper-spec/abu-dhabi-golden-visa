'use client';

import { T as Tx } from './T';
import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { FEE_SCHEDULE, aed, convert } from '@/lib/fees';

// Live fee schedule from the admin dashboard (falls back to the built-in schedule).
let F: typeof FEE_SCHEDULE = FEE_SCHEDULE;
let feesLoaded = false;
import { waLink } from '@/lib/site';
import { CHECKLISTS, TIMELINE } from '@/lib/checklists';
import { CURRENCY_EVENT, getCurrency } from './Header';
import { Icon } from './Icon';

type State = { route: number | null; where: 'in' | 'out' | null; fam: boolean | null; file: boolean | null; adults: number; kids: number; counted: boolean; med: 0 | 1 | null; pkg: 'normal' | 'vip' | null; adds: string[] };
/** First state; steps switched off in the admin are answered in advance. */
function start(route: number | null = null): State {
  const o = F.options ?? FEE_SCHEDULE.options;
  const pk = F.packages;
  const onlyPkg = pk.normal.hidden ? 'vip' : pk.vip.hidden ? 'normal' : null;
  return { route, where: o.where ? null : 'out', fam: o.family ? null : false, file: null, adults: 0, kids: 0, counted: !o.family, med: o.medical ? null : 0, pkg: !o.package ? 'normal' : onlyPkg, adds: (F.addons ?? []).filter((a) => a.on).map((a) => a.id) };
}
const ICONS = ['home', 'briefcase', 'rocket', 'user', 'cap', 'family'];
const T = (k: string, d: string) => F.texts?.[k]?.trim() || d;
const routes = () => (F.routes?.length ? F.routes : FEE_SCHEDULE.routes);
const per = (p: string, s: State) => (p === 'once' || p === 'main' ? 1 : p === 'adult' ? 1 + s.adults : p === 'child' ? s.kids : 1 + s.adults + s.kids);

type Line = [string, number];
function person(s: State, adult: boolean, main: boolean): Line[] {
  const l: Line[] = [[F.perPerson.visa.label, F.perPerson.visa.aed]];
  if (adult) l.push(s.med ? [F.medical.vip.label, F.medical.vip.aed] : [F.medical.normal.label, F.medical.normal.aed]);
  l.push([F.perPerson.emiratesId.label, F.perPerson.emiratesId.aed]);
  if (s.where === 'in') l.push([F.perPerson.changeOfStatus.label, F.perPerson.changeOfStatus.aed]);
  if (main && s.route !== null && routes()[s.route]?.valuation) l.push([F.propertyValuation.label, F.propertyValuation.aed]);
  const rid = s.route !== null ? routes()[s.route]?.id : '';
  for (const x of F.extraFees ?? []) {
    if (x.routes?.length && !x.routes.includes(rid)) continue;
    if (x.per === 'person' || (x.per === 'adult' && adult) || (x.per === 'child' && !adult) || (x.per === 'main' && main)) l.push([x.label, x.aed]);
  }
  return l;
}
const sum = (l: Line[]) => l.reduce((a, x) => a + x[1], 0);

export function Calculator({ initialRoute = null, bare = false }: { initialRoute?: number | null; bare?: boolean }) {
  const [s, setS] = useState<State>(() => start(initialRoute));
  const [hist, setHist] = useState<State[]>(initialRoute === null ? [] : [start()]);
  const [cur, setCur] = useState('AED');
  const [copied, setCopied] = useState('');
  const [pdfName, setPdfName] = useState('');

  const [, setTick] = useState(0);
  useEffect(() => {
    if (feesLoaded) return;
    fetch('/api/fees/').then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (!j || !j.perPerson) return;
      F = j; feesLoaded = true; setTick((t) => t + 1);
      setHist((h) => { if (h.length <= (initialRoute === null ? 0 : 1)) { setS(start(initialRoute)); return initialRoute === null ? [] : [start()]; } return h; });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setCur(getCurrency());
    const on = (e: Event) => setCur((e as CustomEvent<string>).detail);
    window.addEventListener(CURRENCY_EVENT, on);
    return () => window.removeEventListener(CURRENCY_EVENT, on);
  }, []);

  const o = F.options ?? FEE_SCHEDULE.options;
  const steps: string[] = ['route', ...(o.where ? ['where'] : []), ...(o.family ? ['fam'] : []), ...(s.fam ? ['file', 'count'] : []), ...(o.medical ? ['med'] : []), ...(o.package && !F.packages.normal.hidden && !F.packages.vip.hidden ? ['pkg'] : []), 'result'];
  const current =
    s.route === null ? 'route' : !s.where ? 'where' : s.fam === null ? 'fam' : s.fam && s.file === null ? 'file' : s.fam && !s.counted ? 'count' : s.med === null ? 'med' : s.pkg === null ? 'pkg' : 'result';
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
        <h3>{T('routeH', 'What describes you?')}</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>{T('routeP', 'Choose the route you are applying through.')}</p>
        <div className="opts two">
          {routes().map((r, i) => !r.hidden && <Opt key={r.id} icon={r.icon || ICONS[i] || 'star'} title={r.label} sub={r.note} onClick={(e) => go({ route: i }, e)} />)}
        </div>
      </>
    );
  } else if (current === 'where') {
    body = (
      <>
        <h3>{T('whereH', 'Where are you now?')}</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>{T('whereP', 'This decides whether a change of status fee applies.')}</p>
        <div className="opts">
          <Opt icon="pin" title={T('inT', 'Inside the UAE')} sub={T('inS', 'On a visit, tourist or residence visa')} price={`+ ${aed(F.perPerson.changeOfStatus.aed)}`} onClick={(e) => go({ where: 'in' }, e)} />
          <Opt icon="plane" title={T('outT', 'Outside the UAE')} sub={T('outS', 'Applying from your home country')} onClick={(e) => go({ where: 'out' }, e)} />
        </div>
      </>
    );
  } else if (current === 'fam') {
    body = (
      <>
        <h3>{T('famH', 'Adding family members too?')}</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>{T('famP', 'Your spouse, children and parents can be added now.')}</p>
        <div className="opts">
          <Opt icon="user" title={T('soloT', 'No, just me')} sub={T('soloS', 'Only my own visa')} onClick={(e) => go({ fam: false, adults: 0, kids: 0 }, e)} />
          <Opt icon="family" title={T('famT', 'Yes, add family')} sub={T('famS', 'Add adults and children')} onClick={(e) => go({ fam: true }, e)} />
        </div>
      </>
    );
  } else if (current === 'file') {
    body = (
      <>
        <h3>{T('fileH', 'Does the sponsor file need opening?')}</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>{T('fileP', 'It is opened once per sponsor, not for each family member.')}</p>
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
          <button type="button" aria-label={`One more ${title.toLowerCase()}`} onClick={() => setS((x) => ({ ...x, [k]: Math.min(Math.max(1, o.maxPeople || 10), x[k] + 1) }))}>+</button>
        </span>
      </div>
    );
    body = (
      <>
        <h3>{T('countH', 'Add your family members')}</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>{T('countP', 'You are already counted. Add only your family.')}</p>
        <div className="opts">
          <Counter k="adults" title="Adults" sub="18 years and over" icon="user" />
          <Counter k="kids" title="Children" sub="Under 18, no medical test" icon="baby" />
        </div>
        <button type="button" className="btn btn-gold" style={{ marginTop: 16, width: '100%' }} onClick={(e) => go({ counted: true }, e)}><Tx>{"Continue"}</Tx></button>
      </>
    );
  } else if (current === 'med') {
    body = (
      <>
        <h3>{T('medH', 'Choose your medical test')}</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>{T('medP', 'Needed for everyone 18 and over.')}</p>
        <div className="opts">
          <Opt icon="stetho" title={T('medNT', 'Normal medical')} sub={T('medNS', 'Standard result time')} price={aed(F.medical.normal.aed)} onClick={(e) => go({ med: 0 }, e)} />
          <Opt icon="crown" title={T('medVT', 'VIP medical')} sub={T('medVS', 'Fastest result')} price={aed(F.medical.vip.aed)} dark onClick={(e) => go({ med: 1 }, e)} />
        </div>
      </>
    );
  } else if (current === 'pkg') {
    const price = (k: 'normal' | 'vip') => (F.packages?.[k]?.aed ? `${aed(F.packages[k].aed)} + VAT` : T('quoted', 'Quoted in writing'));
    const P = F.packages;
    const addons = F.addons ?? [];
    body = (
      <>
        <h3>{T('pkgH', 'Choose your service package')}</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>{T('pkgP', 'Both include eligibility and document review, government filing and Emirates ID help. Approval is always decided by the authorities.')}</p>
        {addons.length > 0 && (
          <div className="opts" style={{ marginBottom: 12 }}>
            {addons.map((a) => (
              <label key={a.id} className="counter" style={{ cursor: 'pointer' }}><input type="checkbox" checked={s.adds.includes(a.id)} onChange={(e) => setS((x) => ({ ...x, adds: e.target.checked ? [...x.adds, a.id] : x.adds.filter((y) => y !== a.id) }))} style={{ width: 20, height: 20 }} /><span><b>{a.label}</b><small className="muted" style={{ display: 'block' }}>{a.note}{a.aed ? ` · ${aed(a.aed)}${a.per === 'once' ? '' : ` per ${a.per}`}` : ''}</small></span></label>
            ))}
          </div>
        )}
        <div className="opts">
          {!P.normal.hidden && <Opt icon="check" title={P.normal.title || 'Normal'} sub={P.normal.sub || ''} price={price('normal')} onClick={(e) => go({ pkg: 'normal' }, e)} />}
          {!P.vip.hidden && <Opt icon="crown" title={P.vip.title || 'VIP Fast Track'} sub={P.vip.sub || ''} price={price('vip')} dark onClick={(e) => go({ pkg: 'vip' }, e)} />}
        </div>
      </>
    );
  } else if (s.route !== null) {
    const main = person(s, true, true), ad = person(s, true, false), ch = person(s, false, false);
    const file = s.fam && s.file ? F.sponsorFile.aed : 0;
    const rt = routes()[s.route];
    const onceFees: Line[] = (F.extraFees ?? []).filter((x) => x.per === 'once' && (!x.routes?.length || x.routes.includes(rt.id))).map((x) => [x.label, x.aed]);
    const gov = sum(main) + s.adults * sum(ad) + s.kids * sum(ch) + file + sum(onceFees);
    const pk = s.pkg && o.package ? F.packages?.[s.pkg] : undefined;
    const fee = pk?.aed ?? 0;
    const chosen = (F.addons ?? []).filter((a) => s.adds.includes(a.id));
    const addLines: Line[] = chosen.filter((a) => a.aed > 0).map((a) => [`${a.label.replace(/^Add /, '')}${per(a.per, s) > 1 ? ` × ${per(a.per, s)}` : ''}`, a.aed * per(a.per, s)]);
    const addTotal = sum(addLines);
    const vatRate = F.vatRate ?? 0.05;
    const vat = Math.round((fee + addTotal + (o.vatOnGov ? gov : 0)) * vatRate * 100) / 100;
    const total = gov + fee + addTotal + vat;
    const checklist = rt.checklist?.length ? rt.checklist : CHECKLISTS[rt.id] ?? [];
    const people = 1 + s.adults + s.kids;
    const desc = [rt.label, o.where ? (s.where === 'in' ? T('inT', 'Inside the UAE') : T('outT', 'Outside the UAE')) : '', o.medical ? (s.med ? T('medVT', 'VIP medical') : T('medNT', 'Normal medical')) : '', pk ? pk.title || pk.label : ''].filter(Boolean).join(' · ');
    const pdfLines: [string, string][] = [
      ...main.map(([l, v]): [string, string] => [`Main applicant: ${l}`, v.toFixed(2)]),
      ...(s.adults ? ad.map(([l, v]): [string, string] => [`Adult x ${s.adults}: ${l}`, (v * s.adults).toFixed(2)]) : []),
      ...(s.kids ? ch.map(([l, v]): [string, string] => [`Child x ${s.kids}: ${l}`, (v * s.kids).toFixed(2)]) : []),
      ...(file ? [[F.sponsorFile.label, file.toFixed(2)] as [string, string]] : []),
      ...onceFees.map(([l, v]): [string, string] => [l, v.toFixed(2)]),
      ...(pk ? [[pk.label, fee ? fee.toFixed(2) : T('quoted', 'Quoted in writing')] as [string, string]] : []),
      ...addLines.map(([l, v]): [string, string] => [l, v.toFixed(2)]),
      ...(vat ? [[`VAT ${Math.round(vatRate * 100)}%`, vat.toFixed(2)] as [string, string]] : []),
      ...chosen.filter((a) => !a.aed).map((a): [string, string] => [a.label.replace(/^Add /, ''), T('separate', 'Quoted separately')]),
    ];
    const downloadPdf = async () => {
      setCopied('Preparing PDF…');
      try {
        const r = await fetch('/api/quote-pdf/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: pdfName, desc, lines: pdfLines, total: aed(total), converted: o.convert ? convert(total, cur, F.rates) : null, checklist, timeline: TIMELINE, date: F.date, assumptions: F.assumptions }) });
        if (!r.ok) throw new Error();
        const url = URL.createObjectURL(await r.blob());
        const a = document.createElement('a');
        a.href = url; a.download = 'Abu-Dhabi-Golden-Visa-quote.pdf'; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        setCopied('');
      } catch { setCopied('PDF not available, please try again'); }
    };
    const summary = [
      'Abu Dhabi Golden Visa estimate',
      desc,
      `Main applicant: ${aed(sum(main))}`,
      s.adults ? `Adults × ${s.adults}: ${aed(s.adults * sum(ad))}` : '',
      s.kids ? `Children × ${s.kids}: ${aed(s.kids * sum(ch))}` : '',
      file ? `Sponsor file: ${aed(file)}` : '',
      ...onceFees.map(([l, v]) => `${l}: ${aed(v)}`),
      `Government fees: ${aed(gov)}`,
      pk ? (fee ? `${pk.label}: ${aed(fee)}` : `${pk.label}: quoted in writing`) : '',
      ...addLines.map(([l, v]) => `${l}: ${aed(v)}`),
      vat ? `VAT: ${aed(vat)}` : '',
      ...chosen.filter((a) => !a.aed).map((a) => `${a.label.replace(/^Add /, '')}: quoted separately`),
      `Estimated total: ${aed(total)}`,
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
        <p className="eyebrow">{T('resultH', 'Your estimate')}</p>
        <p className="muted" style={{ margin: '4px 0 14px' }}>{desc}</p>
        <Card title="Main applicant" lines={main} />
        {s.adults > 0 && <Card title="Adult family member" lines={ad} mult={s.adults} />}
        {s.kids > 0 && <Card title="Child under 18" lines={ch} mult={s.kids} />}
        {file > 0 && <div className="pc"><div className="h"><span>{F.sponsorFile.label}</span><span>{aed(file)}</span></div></div>}
        {onceFees.map(([l, v]) => <div className="pc" key={l}><div className="h"><span>{l}</span><span>{aed(v)}</span></div></div>)}
        {(pk || chosen.length > 0 || vat > 0) && (
          <div className="pc"><div className="h"><span>{pk ? pk.label : T('extrasH', 'Extras')}</span><span>{pk ? (fee ? aed(fee) : T('quoted', 'Quoted in writing')) : ''}</span></div>
            {addLines.map(([l, v]) => <div className="ln" key={l}><span>{l}</span><em /><b>{v.toFixed(2)}</b></div>)}
            {vat > 0 && <div className="ln"><span>VAT {Math.round(vatRate * 100)}%</span><em /><b>{vat.toFixed(2)}</b></div>}
            {chosen.filter((a) => !a.aed).map((a) => <div className="ln" key={a.id}><span>{a.label.replace(/^Add /, '')}</span><em /><b>{T('separate', 'Quoted separately')}</b></div>)}
          </div>
        )}
        <div className="total">
          <small>Estimated total for {people} {people > 1 ? 'people' : 'person'} (government fees {aed(gov)})</small>
          <div className="t">{aed(total)}</div>
          {o.convert && convert(total, cur, F.rates) && <div style={{ fontSize: 14, opacity: 0.85 }}>{convert(total, cur, F.rates)} (approximate)</div>}
        </div>
        <ul className="ticks" style={{ fontSize: 14 }}>
          {F.assumptions.map((a) => <li key={a}>{a}</li>)}
          <li>Fee schedule dated {F.date}.</li>
        </ul>
        {o.checklist && <details style={{ margin: '6px 0 4px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}><Tx>{"Your document checklist and timeline"}</Tx></summary>
          <ul className="ticks" style={{ fontSize: 14 }}>{checklist.map((c) => <li key={c}>{c}</li>)}</ul>
          <ol style={{ fontSize: 14, paddingInlineStart: 20 }}>{TIMELINE.map((t) => <li key={t}>{t}</li>)}</ol>
        </details>}
        {o.pdf && <div className="field" style={{ marginTop: 8 }}><label htmlFor="pdfname"><Tx>{"Your name for the PDF quote (optional)"}</Tx></label><input id="pdfname" value={pdfName} onChange={(e) => setPdfName(e.target.value)} placeholder="Full name" /></div>}
        <div className="row-actions">
          {o.pdf && <button type="button" className="btn btn-gold" onClick={downloadPdf}><Icon name="doc" size={18} /> {T('pdfB', 'Download PDF quote')}</button>}
          {o.whatsapp && <a className="btn btn-gold" href={waLink(summary)} target="_blank" rel="noopener"><Icon name="wa" size={18} /> {T('waB', 'Send to WhatsApp')}</a>}
          {o.copy && <button type="button" className="btn btn-glass" onClick={() => navigator.clipboard?.writeText(summary).then(() => setCopied('Copied'), () => setCopied('Select and copy the text'))}>{copied || T('copyB', 'Copy estimate')}</button>}
          <button type="button" className="btn btn-glass" onClick={() => { setS(start()); setHist([]); }}>{T('againB', 'Recalculate')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={bare ? 'calc-bare' : 'panel glass'} aria-live="polite" data-nofx="">
      <div className="bar-steps" aria-hidden="true">{steps.slice(0, -1).map((k, i) => <i key={k} className={i <= idx ? 'on' : ''} />)}</div>
      {hist.length > 0 && current !== 'result' && (
        <button type="button" className="btn btn-glass" style={{ minHeight: 40, padding: '0 14px', marginBottom: 12 }} onClick={back}><Tx>{"‹ Back"}</Tx></button>
      )}
      <div className="wstep" key={current}>{body}</div>
    </div>
  );
}
