'use client';

import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { FEE_SCHEDULE, ROUTES, aed, convert } from '@/lib/fees';

// Live fee schedule from the admin dashboard (falls back to the built-in schedule).
let F: typeof FEE_SCHEDULE = FEE_SCHEDULE;
let feesLoaded = false;
import { waLink } from '@/lib/site';
import { CHECKLISTS, TIMELINE } from '@/lib/checklists';
import { CURRENCY_EVENT, getCurrency } from './Header';
import { Icon } from './Icon';

type State = { route: number | null; where: 'in' | 'out' | null; fam: boolean | null; file: boolean | null; adults: number; kids: number; counted: boolean; med: 0 | 1 | null; pkg: 'normal' | 'vip' | null; ins: boolean; att: boolean };
const START: State = { route: null, where: null, fam: null, file: null, adults: 0, kids: 0, counted: false, med: null, pkg: null, ins: true, att: false };
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
  const [pdfName, setPdfName] = useState('');

  const [, setTick] = useState(0);
  useEffect(() => {
    if (feesLoaded) return;
    fetch('/api/fees/').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && j.perPerson) { F = j; feesLoaded = true; setTick((t) => t + 1); } }).catch(() => {});
  }, []);

  useEffect(() => {
    setCur(getCurrency());
    const on = (e: Event) => setCur((e as CustomEvent<string>).detail);
    window.addEventListener(CURRENCY_EVENT, on);
    return () => window.removeEventListener(CURRENCY_EVENT, on);
  }, []);

  const steps: string[] = ['route', 'where', 'fam', ...(s.fam ? ['file', 'count'] : []), 'med', 'pkg', 'result'];
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
  } else if (current === 'pkg') {
    const price = (k: 'normal' | 'vip') => (F.packages?.[k]?.aed ? `${aed(F.packages[k].aed)} + VAT` : 'Quoted in writing');
    body = (
      <>
        <h3>Choose your service package</h3>
        <p className="muted" style={{ margin: '6px 0 16px' }}>Both include eligibility and document review, government filing and Emirates ID help. Approval is always decided by the authorities.</p>
        <div className="opts" style={{ marginBottom: 12 }}>
          <label className="counter" style={{ cursor: 'pointer' }}><input type="checkbox" checked={s.ins} onChange={(e) => setS((x) => ({ ...x, ins: e.target.checked }))} style={{ width: 20, height: 20 }} /><span><b>Add health insurance</b><small className="muted" style={{ display: 'block' }}>Required for every person; quoted separately</small></span></label>
          <label className="counter" style={{ cursor: 'pointer' }}><input type="checkbox" checked={s.att} onChange={(e) => setS((x) => ({ ...x, att: e.target.checked }))} style={{ width: 20, height: 20 }} /><span><b>Add attestation and translation</b><small className="muted" style={{ display: 'block' }}>For documents from abroad; quoted separately</small></span></label>
        </div>
        <div className="opts">
          <Opt icon="check" title="Normal" sub="Standard medical booking and case updates" price={price('normal')} onClick={(e) => go({ pkg: 'normal' }, e)} />
          <Opt icon="crown" title="VIP Fast Track" sub="Priority medical, priority updates, pick-up where offered" price={price('vip')} dark onClick={(e) => go({ pkg: 'vip' }, e)} />
        </div>
      </>
    );
  } else if (s.route !== null) {
    const main = person(s, true, true), ad = person(s, true, false), ch = person(s, false, false);
    const file = s.fam && s.file ? F.sponsorFile.aed : 0;
    const gov = sum(main) + s.adults * sum(ad) + s.kids * sum(ch) + file;
    const pk = s.pkg ? F.packages?.[s.pkg] : undefined;
    const fee = pk?.aed ?? 0;
    const vat = Math.round(fee * (F.vatRate ?? 0.05) * 100) / 100;
    const total = gov + fee + vat;
    const checklist = CHECKLISTS[ROUTES[s.route].id] ?? [];
    const people = 1 + s.adults + s.kids;
    const desc = [ROUTES[s.route].label, s.where === 'in' ? 'Inside the UAE' : 'Outside the UAE', s.med ? 'VIP medical' : 'Normal medical', s.pkg === 'vip' ? 'VIP Fast Track' : 'Normal package'].join(' · ');
    const pdfLines: [string, string][] = [
      ...main.map(([l, v]): [string, string] => [`Main applicant: ${l}`, v.toFixed(2)]),
      ...(s.adults ? ad.map(([l, v]): [string, string] => [`Adult x ${s.adults}: ${l}`, (v * s.adults).toFixed(2)]) : []),
      ...(s.kids ? ch.map(([l, v]): [string, string] => [`Child x ${s.kids}: ${l}`, (v * s.kids).toFixed(2)]) : []),
      ...(file ? [[F.sponsorFile.label, file.toFixed(2)] as [string, string]] : []),
      [pk?.label ?? 'Service package', fee ? fee.toFixed(2) : 'Quoted in writing'],
      ...(fee ? [['VAT 5% on service package', vat.toFixed(2)] as [string, string]] : []),
      ...(s.ins ? [['Health insurance', 'Quoted separately'] as [string, string]] : []),
      ...(s.att ? [['Attestation and translation', 'Quoted separately'] as [string, string]] : []),
    ];
    const downloadPdf = async () => {
      setCopied('Preparing PDF…');
      try {
        const r = await fetch('/api/quote-pdf/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: pdfName, desc, lines: pdfLines, total: aed(total), converted: convert(total, cur), checklist, timeline: TIMELINE, date: F.date, assumptions: F.assumptions }) });
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
      `Government fees: ${aed(gov)}`,
      fee ? `${pk?.label}: ${aed(fee)} + VAT ${aed(vat)}` : `${pk?.label ?? 'Service package'}: quoted in writing`,
      s.ins ? 'Health insurance: quoted separately' : '',
      s.att ? 'Attestation and translation: quoted separately' : '',
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
        <p className="eyebrow">Your estimate</p>
        <p className="muted" style={{ margin: '4px 0 14px' }}>{desc}</p>
        <Card title="Main applicant" lines={main} />
        {s.adults > 0 && <Card title="Adult family member" lines={ad} mult={s.adults} />}
        {s.kids > 0 && <Card title="Child under 18" lines={ch} mult={s.kids} />}
        {file > 0 && <div className="pc"><div className="h"><span>{F.sponsorFile.label}</span><span>{aed(file)}</span></div></div>}
        <div className="pc"><div className="h"><span>{pk?.label ?? 'Service package'}</span><span>{fee ? aed(fee) : 'Quoted in writing'}</span></div>
          {fee > 0 && <div className="ln"><span>VAT 5%</span><em /><b>{vat.toFixed(2)}</b></div>}
          {s.ins && <div className="ln"><span>Health insurance</span><em /><b>Quoted separately</b></div>}
          {s.att && <div className="ln"><span>Attestation and translation</span><em /><b>Quoted separately</b></div>}
        </div>
        <div className="total">
          <small>Estimated total for {people} {people > 1 ? 'people' : 'person'} (government fees {aed(gov)})</small>
          <div className="t">{aed(total)}</div>
          {convert(total, cur) && <div style={{ fontSize: 14, opacity: 0.85 }}>{convert(total, cur)} (approximate)</div>}
        </div>
        <ul className="ticks" style={{ fontSize: 14 }}>
          {F.assumptions.map((a) => <li key={a}>{a}</li>)}
          <li>Fee schedule dated {F.date}.</li>
        </ul>
        <details style={{ margin: '6px 0 4px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Your document checklist and timeline</summary>
          <ul className="ticks" style={{ fontSize: 14 }}>{checklist.map((c) => <li key={c}>{c}</li>)}</ul>
          <ol style={{ fontSize: 14, paddingInlineStart: 20 }}>{TIMELINE.map((t) => <li key={t}>{t}</li>)}</ol>
        </details>
        <div className="field" style={{ marginTop: 8 }}><label htmlFor="pdfname">Your name for the PDF quote (optional)</label><input id="pdfname" value={pdfName} onChange={(e) => setPdfName(e.target.value)} placeholder="Full name" /></div>
        <div className="row-actions">
          <button type="button" className="btn btn-gold" onClick={downloadPdf}><Icon name="doc" size={18} /> Download PDF quote</button>
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
