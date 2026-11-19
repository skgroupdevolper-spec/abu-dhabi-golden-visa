'use client';

// UAE visa status check: a 3-question portal finder (which authority holds the file and what to type),
// and "Ask us to check": a 5-step form that turns passport details into a WhatsApp message the visitor
// sends us. Nothing is stored on the website.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLoc } from './T';
import { u } from '@/lib/ui';
import { waLink } from '@/lib/site';
import { Icon } from './Icon';
import { COMMON_NATIONALITIES, NATIONALITIES } from '@/lib/nationalities';
import { PORTALS } from '@/lib/visa-portals';

type Emirate = 'Dubai' | 'Abu Dhabi' | 'Sharjah' | 'Ajman' | 'Ras Al Khaimah' | 'Fujairah' | 'Umm Al Quwain' | 'Not sure';
type Kind = 'residence' | 'property' | 'golden' | 'visit' | 'arrival';
type Id = 'passport' | 'file' | 'eid' | 'uid';

const EMIRATES: Emirate[] = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Not sure'];
const KINDS: { k: Kind; t: string; s: string }[] = [
  { k: 'residence', t: 'Residence visa', s: 'Work, family or investor' },
  { k: 'property', t: 'Property owner visa', s: 'Residence through property' },
  { k: 'golden', t: 'Golden or Green visa', s: 'Holder or family member' },
  { k: 'visit', t: 'Visit or tourist visa', s: 'Entry permit issued before travel' },
  { k: 'arrival', t: 'Visa on arrival', s: 'Stamped at the airport' },
];
const IDS: { k: Id; t: string; s: string }[] = [
  { k: 'passport', t: 'My passport', s: 'Number, nationality and date of birth' },
  { k: 'file', t: 'Visa file number', s: 'On the visa page or e-visa' },
  { k: 'eid', t: 'Emirates ID number', s: '15 digits starting 784' },
  { k: 'uid', t: 'Unified number (UID)', s: 'Your number in the immigration system' },
];
const GRACE: Record<Kind, string> = {
  residence: 'Most residents have 30 days after the visa is cancelled or expires to leave the UAE or move to a new visa.',
  property: 'Property owner visas usually come with up to 90 days after the visa is cancelled or expires.',
  golden: 'Golden and Green visa holders, and their sponsored family, can usually stay up to 180 days after the visa is cancelled or expires.',
  visit: 'Visit and tourist visas usually have no grace period: the last day on the visa is your last day.',
  arrival: 'A visa on arrival usually has no grace period: count your days from the entry stamp.',
};


function stepsFor(portal: 'gdrfa' | 'icp', id: Id): string[] {
  const by: Record<Id, string> = {
    passport: 'Choose the search by passport details. Type the passport number, then choose your nationality and fill in your date of birth.',
    file: 'Choose the search by file number and type the number exactly as it is on the visa.',
    eid: 'Choose the search by Emirates ID and type the 15-digit number starting 784.',
    uid: 'Choose the search by unified number (UID) and type it with your nationality and date of birth.',
  };
  return portal === 'gdrfa'
    ? ['Open the GDRFA Dubai status enquiry page.', by[id], 'Type the captcha and search.']
    : ['In ICP Smart Services, open Public Services, then File Validity.', 'Select Residency or Visa.', by[id], 'Type the captcha and search.'];
}

/** Any button with data-visa-check opens the "Ask us to check" form. */
export function AskCheckButton({ label = 'Send my passport details', className = 'btn btn-gold' }: { label?: string; className?: string }) {
  const loc = useLoc();
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event('visa-check:open'))}>
      <Icon name="doc" size={18} /> {u(label, loc)}
    </button>
  );
}

export function VisaStatusChecker() {
  const loc = useLoc();
  const t = (s: string) => u(s, loc);
  const [em, setEm] = useState<Emirate | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);
  const [id, setId] = useState<Id | null>(null);
  const step = !em ? 1 : !kind ? 2 : !id ? 3 : 4;
  const back = () => (id ? setId(null) : kind ? setKind(null) : setEm(null));
  const reset = () => { setEm(null); setKind(null); setId(null); };
  const portals: ('gdrfa' | 'icp')[] = em === 'Dubai' ? ['gdrfa'] : em === 'Not sure' ? ['gdrfa', 'icp'] : ['icp'];
  const opt = (on: boolean, label: string, sub: string | undefined, fn: () => void) => (
    <button type="button" className={`vs-opt${on ? ' on' : ''}`} onClick={fn}>
      <span className="vs-dot" aria-hidden="true" /><span><b>{t(label)}</b>{sub && <small>{t(sub)}</small>}</span>
    </button>
  );
  return (
    <div className="vs-card" id="checker">
      <div className="vs-top"><span className="vs-ic"><Icon name="doc" size={18} /></span><b>{t('Visa Validity Checker')}</b><span className="vs-tag">{t('Portal finder')}</span></div>
      <div className="vs-body">
        {step > 1 && (
          <div className="vs-chips" aria-label={t('Your answers')}>
            {em && <span>{t(em)}</span>}{kind && <span>{t(KINDS.find((x) => x.k === kind)!.t)}</span>}{id && <span>{t(IDS.find((x) => x.k === id)!.t)}</span>}
          </div>
        )}
        {step === 1 && (
          <>
            <p className="vs-q">{t('Question 1 of 3')}</p>
            <h3>{t('Which emirate issued the visa?')}</h3>
            <p className="vs-hint">{t('It is printed on the visa page or e-visa. Pick “Not sure” if you cannot tell.')}</p>
            <div className="vs-grid2">{EMIRATES.map((e) => opt(em === e, e, undefined, () => setEm(e)))}</div>
          </>
        )}
        {step === 2 && (
          <>
            <p className="vs-q">{t('Question 2 of 3')}</p>
            <h3>{t('What kind of visa is it?')}</h3>
            <p className="vs-hint">{t('This decides how long you can stay once it ends.')}</p>
            <div className="vs-list">{KINDS.map((k) => opt(kind === k.k, k.t, k.s, () => setKind(k.k)))}</div>
          </>
        )}
        {step === 3 && (
          <>
            <p className="vs-q">{t('Question 3 of 3')}</p>
            <h3>{t('What do you have to hand?')}</h3>
            <p className="vs-hint">{t('Pick the detail you can read right now.')}</p>
            <div className="vs-list">{IDS.map((k) => opt(id === k.k, k.t, k.s, () => setId(k.k)))}</div>
          </>
        )}
        {step === 4 && kind && id && (
          <div className="vs-result">
            {portals.map((p) => (
              <div key={p} className="vs-portal">
                <p className="vs-q">{portals.length > 1 ? t(p === 'gdrfa' ? 'If the visa is from Dubai' : 'If it is from another emirate') : t('Where to check')}</p>
                <h3>{t(PORTALS[p].title)}</h3>
                <p className="vs-hint">{t(PORTALS[p].holds)}</p>
                <p className="vs-q">{t('What to do')}</p>
                <ol className="vs-steps">{stepsFor(p, id).map((x) => <li key={x}>{t(x)}</li>)}</ol>
                <div className="vs-row">
                  <a className="btn btn-dark btn-sm" href={PORTALS[p].url} target="_blank" rel="noopener">{t(`Open ${PORTALS[p].name}`)} <Icon name="arrow" size={14} /></a>
                  <small>{t(PORTALS[p].app)} {t('Call centre')} <b>{PORTALS[p].call}</b></small>
                </div>
              </div>
            ))}
            <div className="vs-box">
              <p className="vs-q">{t('What the result shows')}</p>
              <ul className="vs-ticks"><li>{t('File status (valid, cancelled or expired)')}</li><li>{t('Issue date')}</li><li>{t('Expiry date')}</li></ul>
            </div>
            <div className="vs-box vs-warn">
              <p className="vs-q">{t('Once the visa ends')}</p>
              <p>{t(GRACE[kind])}</p>
              <p>{t('After the visa and any grace period run out, the overstay fine is AED 50 for every extra day. The rate is the same for visit, tourist and residence visas.')}</p>
            </div>
            <div className="vs-box vs-gold">
              <b>{t('“No record found”? Rather we checked it?')}</b>
              <p>{t('Send your passport details on WhatsApp. We look up your file on the official portal and reply with the status, the last day you can stay and any fines.')}</p>
              <AskCheckButton label="Ask us to check" className="btn btn-gold btn-sm" />
            </div>
          </div>
        )}
        <div className="vs-foot">
          {step > 1 && <button type="button" className="vs-link" onClick={back}>← {t('Back')}</button>}
          {step === 4 && <button type="button" className="vs-link" onClick={reset}>{t('Start again')}</button>}
        </div>
        <p className="vs-note">{t('This checker does not read your record. It shows where your file is held and how to look it up yourself.')}</p>
      </div>
      <AskDialog emirate={em} kind={kind} />
    </div>
  );
}

/** "Check my UAE visa status": passport number → nationality → date of birth → passport expiry → review → WhatsApp. */
function AskDialog({ emirate, kind }: { emirate: Emirate | null; kind: Kind | null }) {
  const loc = useLoc();
  const t = (s: string) => u(s, loc);
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(1);
  const [d, setD] = useState({ passport: '', nat: '', dob: '', exp: '' });
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = () => { setOpen(true); setN(1); setErr(''); };
    window.addEventListener('visa-check:open', on);
    return () => window.removeEventListener('visa-check:open', on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    setTimeout(() => box.current?.querySelector<HTMLElement>('input, button')?.focus(), 50);
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [open, n]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? NATIONALITIES.filter((x) => x.toLowerCase().includes(s) || t(x).toLowerCase().includes(s)) : NATIONALITIES;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, loc]);
  if (!open) return null;
  const today = new Date().toISOString().slice(0, 10);
  const fmt = (v: string) => (v ? new Date(`${v}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
  const next = () => {
    setErr('');
    if (n === 1 && !/^[A-Za-z0-9]{5,15}$/.test(d.passport.trim())) return setErr(t('Please type the passport number: letters and numbers only.'));
    if (n === 2 && !d.nat) return setErr(t('Please choose your nationality.'));
    if (n === 3 && (!d.dob || d.dob >= today)) return setErr(t('Please enter a date of birth in the past.'));
    if (n === 4 && !d.exp) return setErr(t('Please enter the passport expiry date.'));
    setN(n + 1);
  };
  const kindLabel = kind ? KINDS.find((x) => x.k === kind)!.t : '';
  const msg = [
    'Hello, please check my UAE visa status.',
    `Passport number: ${d.passport.trim().toUpperCase()}`,
    `Nationality: ${d.nat}`,
    `Date of birth: ${fmt(d.dob)}`,
    `Passport expiry: ${fmt(d.exp)}`,
    emirate && emirate !== 'Not sure' ? `Visa issued in: ${emirate}` : '',
    kindLabel ? `Visa type: ${kindLabel}` : '',
  ].filter(Boolean).join('\n');
  const row = (label: string, v: string, step?: number) => (
    <div className="vs-rv"><span>{t(label)}</span><b>{v}</b>{step && <button type="button" className="vs-link" onClick={() => setN(step)}>{t('Edit')}</button>}</div>
  );
  return (
    <div className="vs-back" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="vs-dlg" role="dialog" aria-modal="true" aria-labelledby="vs-dlg-t" ref={box}>
        <div className="vs-dlg-h">
          <b id="vs-dlg-t">{t('Check my UAE visa status')}</b>
          <button type="button" className="vs-x" aria-label={t('Close')} onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="vs-prog"><i style={{ width: `${(n / 5) * 100}%` }} /></div>
        <p className="vs-q">{t(`Step ${n} of 5`)}</p>
        <form onSubmit={(e) => { e.preventDefault(); if (n < 5) next(); }}>
          {n === 1 && (<><h3>{t('What is your passport number?')}</h3><p className="vs-hint">{t('Type it exactly as printed in the passport, letters and numbers only.')}</p>
            <input className="vs-in" value={d.passport} onChange={(e) => setD({ ...d, passport: e.target.value.replace(/\s/g, '') })} placeholder="e.g. N1234567" autoComplete="off" autoCapitalize="characters" inputMode="text" /></>)}
          {n === 2 && (<><h3>{t('Which nationality is on your passport?')}</h3><p className="vs-hint">{t('Search, or pick one of the common ones.')}</p>
            <input className="vs-in" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search countries')} aria-label={t('Search countries')} />
            {!q && <><p className="vs-q">{t('Common')}</p><div className="vs-pills">{COMMON_NATIONALITIES.map((c) => <button type="button" key={c} className={d.nat === c ? 'on' : ''} onClick={() => { setD({ ...d, nat: c }); setN(3); }}>{t(c)}</button>)}</div></>}
            <div className="vs-natlist" role="listbox" aria-label={t('Nationality')}>{list.map((c) => <button type="button" role="option" aria-selected={d.nat === c} key={c} className={d.nat === c ? 'on' : ''} onClick={() => { setD({ ...d, nat: c }); setN(3); }}>{t(c)}</button>)}</div></>)}
          {n === 3 && (<><h3>{t('What is your date of birth?')}</h3><p className="vs-hint">{t('As shown in the passport.')}</p>
            <input className="vs-in" type="date" max={today} value={d.dob} onChange={(e) => setD({ ...d, dob: e.target.value })} aria-label={t('Date of birth')} /></>)}
          {n === 4 && (<><h3>{t('When does your passport expire?')}</h3><p className="vs-hint">{t('You will find it on the photo page.')}</p>
            <input className="vs-in" type="date" value={d.exp} onChange={(e) => setD({ ...d, exp: e.target.value })} aria-label={t('Passport expiry')} /></>)}
          {n === 5 && (<><h3>{t('Check your details')}</h3><p className="vs-hint">{t('Tap Edit to change anything before you send it.')}</p>
            <div className="vs-review">
              {row('Passport number', d.passport.toUpperCase(), 1)}{row('Nationality', t(d.nat), 2)}{row('Date of birth', fmt(d.dob), 3)}{row('Passport expiry', fmt(d.exp), 4)}
              {emirate && emirate !== 'Not sure' && row('Issued in', t(emirate))}{kindLabel && row('Visa type', t(kindLabel))}
            </div>
            <p className="vs-note">{t('Nothing is saved on this website. Your details go into a WhatsApp message that you send to us yourself. Our team then checks your file on the official GDRFA or ICP portal and replies on WhatsApp.')}</p></>)}
          {err && <p className="vs-err" role="alert">{err}</p>}
          <div className="vs-dlg-a">
            {n > 1 && <button type="button" className="btn btn-glass" onClick={() => { setErr(''); setN(n - 1); }}>{t('Back')}</button>}
            {n < 5 && n !== 2 && <button type="submit" className="btn btn-gold">{t('Continue')}</button>}
            {n === 2 && d.nat && <button type="button" className="btn btn-gold" onClick={() => setN(3)}>{t('Continue')}</button>}
            {n === 5 && <a className="btn btn-gold" href={waLink(msg)} target="_blank" rel="noopener" onClick={() => setOpen(false)}><Icon name="wa" size={18} /> {t('Send on WhatsApp')}</a>}
          </div>
        </form>
      </div>
    </div>
  );
}
