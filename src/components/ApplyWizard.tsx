'use client';

import { Opt, T } from './T';
// Online application: service → applicant → family → documents → review & submit.
// Creates an enquiry and a client file (visible in the admin and the client dashboard).
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { APPLY_SERVICES, applyService, type ApplyService } from '@/content/apply';
import { FEE_SCHEDULE, ROUTES, aed } from '@/lib/fees';
import { governmentLines } from '@/lib/stages';
import { SITE, waLink } from '@/lib/site';
import { portalApply, portalHome, portalLogin } from '@/lib/portal-links';
import { Icon } from './Icon';

type Member = { relation: 'Spouse' | 'Child' | 'Parent'; name: string; adult: boolean };
const STEPS = ['Service', 'Your details', 'Family', 'Documents', 'Review & submit'];
const GROUP_ICON: Record<string, string> = { 'Golden Visa': 'star', 'Family & residency': 'family', Visas: 'plane', Employment: 'briefcase', 'Employment visas & permits': 'briefcase', 'Property & documents': 'home', 'Visa services': 'shield', 'Attestation & legalisation': 'doc', 'Property & business': 'home', 'Other services': 'globe', 'Wills & estate planning': 'heart' };
const MAX = 15 * 1024 * 1024;
const SVC_ICON: Record<string, string> = {
  'gv-property': 'home', 'gv-investor': 'briefcase', 'gv-entrepreneur': 'rocket', 'gv-professional': 'user', 'gv-talent': 'spark', 'gv-student': 'cap', 'gv-other': 'heart', 'golden-visa': 'star',
  'gv-family': 'family', 'gv-renewal': 'shield', newborn: 'baby', retirement: 'heart', 'virtual-work': 'plane', 'investor-visa': 'briefcase', 'maid-visa': 'home', 'tourist-visa': 'plane',
  employment: 'briefcase', iloe: 'shield', valuation: 'coins', cancellation: 'close', 'emirates-id': 'user', medical: 'stetho', 'visa-check': 'check',
};

export function ApplyWizard({ inPortal = false }: { inPortal?: boolean } = {}) {
  const [step, setStep] = useState(0);
  const [svc, setSvc] = useState<ApplyService | null>(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [d, setD] = useState({ name: '', phone: '', email: '', nationality: '', where: 'in' as 'in' | 'out', visa: '', notes: '', pkg: 'normal' as 'normal' | 'vip', consent: false });
  const [fam, setFam] = useState<Member[]>([]);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [extra, setExtra] = useState<File[]>([]);
  const [fees, setFees] = useState(FEE_SCHEDULE);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ ref: string; link: string; account?: string } | null>(null);
  // New clients choose a password here: the account is created with the application and they go straight to their dashboard.
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pw2, setPw2] = useState('');
  const [me, setMe] = useState<{ name: string; email: string; phone: string } | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('service');
    const s = applyService(id);
    if (s) { setSvc(s); setStep(1); }
    fetch('/api/fees/').then((r) => (r.ok ? r.json() : null)).then((j) => j?.perPerson && setFees(j)).catch(() => {});
    // Signed-in clients: use their account details instead of asking again.
    fetch('/api/me/', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (!j?.signedIn) return;
      // On the public website a signed-in client goes straight to the application inside their dashboard.
      if (!inPortal) { window.location.replace(portalApply(new URLSearchParams(window.location.search).get('service'))); return; }
      setMe({ name: j.name || '', email: j.email || '', phone: j.phone || '' });
      setD((x) => ({ ...x, name: x.name || j.name || '', email: x.email || j.email || '', phone: x.phone || j.phone || '' }));
    }).catch(() => {});
  }, []);

  const set = (k: keyof typeof d) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setD({ ...d, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value });

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const m = new Map<string, ApplyService[]>();
    for (const s of APPLY_SERVICES) if (!needle || `${s.label} ${s.group}`.toLowerCase().includes(needle)) m.set(s.group, [...(m.get(s.group) || []), s]);
    return [...m.entries()];
  }, [q]);

  const allGroups = useMemo(() => [...new Set(APPLY_SERVICES.map((x) => x.group))], []);
  const route = svc?.route ? ROUTES.find((r) => r.id === svc.route) : undefined;
  const adults = fam.filter((m) => m.adult).length, kids = fam.length - adults;
  const famOnly = svc?.route === 'family';
  const lines = route
    ? governmentLines(fees, { route: route.label, location: d.where, adults, kids, vip: d.pkg === 'vip', newFile: true }).filter((l) => !famOnly || !l.label.startsWith('Main applicant'))
    : [];
  const total = lines.reduce((a, l) => a + l.amount, 0);
  const famOn = !!svc?.family;

  function next() {
    setErr('');
    if (step === 0 && !svc) return setErr('Choose a service to continue.');
    if (step === 1) {
      if (d.name.trim().length < 2) return setErr('Please add your full name as in your passport.');
      if (d.phone.replace(/\D/g, '').length < 7) return setErr('Please add your WhatsApp number with the country code.');
      if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) return setErr('Please check your email address.');
      if (!me) {
        if (!d.email) return setErr('Please add your email: it is your login for the client dashboard.');
        if (pw.length < 8) return setErr('Please choose a password of at least 8 characters.');
        if (pw !== pw2) return setErr('The two passwords do not match.');
      }
    }
    if (step === 2 && fam.some((m) => !m.name.trim())) return setErr('Add a name for each family member, or remove the empty row.');
    setStep((x) => Math.min(4, famOn || x !== 1 ? x + 1 : x + 2));
    window.scrollTo({ top: (document.getElementById('apply-top')?.getBoundingClientRect().top ?? 0) + window.scrollY - 110, behavior: 'smooth' });
  }
  function back() { setErr(''); setStep((x) => Math.max(0, !famOn && x === 3 ? 1 : x - 1)); }

  function pick(key: string, f: File | null) {
    if (f && f.size > MAX) { setErr(`${f.name} is larger than 15 MB.`); return; }
    setErr('');
    setFiles((x) => ({ ...x, [key]: f }));
  }

  async function submit() {
    if (!svc) return;
    if (!d.consent) return setErr('Please confirm the details are correct and agree to be contacted.');
    setErr(''); setBusy(true);
    const fd = new FormData();
    fd.set('service', svc.id); fd.set('serviceLabel', svc.label); fd.set('route', route?.label || svc.label);
    for (const [k, v] of Object.entries(d)) fd.set(k, String(v));
    fd.set('family', JSON.stringify(fam));
    if (!me && pw) fd.set('password', pw);
    fd.set('language', document.documentElement.lang || 'en');
    if (total) fd.set('estimate', String(total));
    for (const [label, f] of Object.entries(files)) if (f) { fd.append('files', f); fd.append('labels', label); }
    for (const f of extra) { fd.append('files', f); fd.append('labels', f.name); }
    try {
      // The server can be busy for a moment (for example while it restarts): try again up to 3 times.
      let r: Response | null = null, j: { ok?: boolean; error?: string; ref?: string; link?: string; account?: string } = {};
      for (let i = 0; i < 6; i++) {
        try {
          r = await fetch('/api/apply/', { method: 'POST', body: fd });
          j = await r.json().catch(() => ({}));
          if (r.ok || (r.status >= 400 && r.status < 500)) break;
        } catch { r = null; }
        if (i === 1) setErr('The server is updating for a moment. Sending again…');
        await new Promise((res) => setTimeout(res, 3000 * (i + 1)));
      }
      if (!r) throw new Error('We could not reach the server. Please check your internet and press Submit again.');
      if (!r.ok || !j.ok) throw new Error(j.error || 'We could not submit your application just now. Please press Submit again in a minute, or send it on WhatsApp.');
      setErr('');
      setDone({ ref: j.ref ?? '', link: j.link ?? '', account: j.account });
      // Account created (or the right password for an existing one): open the dashboard right away.
      if (j.account === 'created' || j.account === 'signed-in') setTimeout(() => { window.location.href = portalHome(); }, 1200);
    } catch (e) {
      setErr((e as Error).message);
    } finally { setBusy(false); }
  }

  const waText = `Online application\nService: ${svc?.label ?? ''}\nName: ${d.name}\nWhatsApp: ${d.phone}\n${d.where === 'in' ? 'Inside the UAE' : 'Outside the UAE'}${fam.length ? `\nFamily: ${fam.map((m) => `${m.relation} ${m.name}`).join(', ')}` : ''}${done ? `\nReference: ${done.ref}` : ''}`;

  if (done) {
    return (
      <div className="apply-done wstep" role="status">
        <span className="ad-ic"><Icon name="check" size={30} /></span>
        <p className="eyebrow"><T>{"Application received"}</T></p>
        <h2>Thank you, {d.name.split(' ')[0]}. Your reference is {done.ref}.</h2>
        {(done.account === 'created' || done.account === 'signed-in') && <p className="signed-in-note" style={{ justifyContent: 'center' }}><Icon name="check" size={18} /> <span><T>{"Your account is ready and you are signed in. Opening your dashboard…"}</T></span></p>}
        {done.account === 'exists' && <p className="notice" style={{ textAlign: 'start' }}><T>{"You already have an account with this email, so we did not create a new one. Your application is added to that account: sign in with your existing password to see it."}</T> <a href={portalLogin()}><T>{"Sign in"}</T></a></p>}
        <p className="lead">Your advisor checks your file and sends the written quote on WhatsApp{d.email ? ' and by email' : ''}. Follow every step, upload documents and message us in your client dashboard.</p>
        <div className="row-actions" style={{ justifyContent: 'center' }}>
          <a className="btn btn-red" href={done.account === 'created' || done.account === 'signed-in' ? portalHome() : done.link}><T>{"Open my client dashboard"}</T> <Icon name="arrow" size={18} /></a>
          <a className="btn btn-glass" href={waLink(waText)} target="_blank" rel="noopener"><Icon name="wa" size={18} /> WhatsApp {SITE.whatsappDisplay}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="apply" id="apply-top">
      <div className="aw-progress" aria-hidden="true"><span style={{ width: `${(step / 4) * 100}%` }} /></div>
      <ol className="apply-steps" aria-label="Application steps">
        {STEPS.map((t, i) => (i === 2 && !famOn && svc ? null : (
          <li key={t} className={i === step ? 'on' : i < step ? 'done' : ''}><span>{i < step ? <Icon name="check" size={14} /> : i + 1}</span>{t}</li>
        )))}
      </ol>

      <div className="apply-body">
        <div className="apply-main panel glass">
          {step === 0 && (
            <div className="wstep">
              <div className="aw-head">
                <div><h3><T>{"Which visa or service do you need?"}</T></h3><p className="muted"><T>{"Pick one. You can add family members in a later step."}</T></p></div>
                <label className="aw-search"><Icon name="grid" size={17} /><input type="search" placeholder="Search services" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search services" /></label>
              </div>
              <div className="aw-cats" role="tablist" aria-label="Service categories">
                {['All', ...allGroups].map((g) => (
                  <button key={g} type="button" role="tab" aria-selected={cat === g} onClick={() => setCat(g)}>{g}</button>
                ))}
              </div>
              {groups.filter(([g]) => cat === 'All' || cat === g).map(([g, items]) => (
                <div key={g} className="apply-group">
                  <p className="aw-gt"><Icon name={GROUP_ICON[g] || 'star'} size={15} /> {g}</p>
                  <div className="aw-grid">
                    {items.map((s) => (
                      <button key={s.id} type="button" className="aw-card" aria-pressed={svc?.id === s.id} onClick={() => { setSvc(s); setErr(''); }}>
                        <span className="aw-ic"><Icon name={SVC_ICON[s.id] || GROUP_ICON[s.group] || 'doc'} size={20} /></span>
                        <span className="aw-tx"><b>{s.label.replace(/^Golden Visa: (.)/, (_, c: string) => c.toUpperCase())}</b><small>{s.note || (s.family ? 'Family can be added' : 'Quote before you pay')}</small></span>
                        <span className="aw-ok" aria-hidden="true"><Icon name="check" size={14} /></span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="wstep">
              <h3><T>{"Your details"}</T></h3>
              {me ? (
                <div className="signed-in-note" role="status">
                  <Icon name="check" size={18} />
                  <div><b>You are already signed in as {me.name || me.email}.</b><span><T>{"No account needed: this application is added to your client dashboard. Check the details below and continue."}</T></span></div>
                </div>
              ) : <p className="muted" style={{ margin: '6px 0 16px' }}><T>{"As written in your passport. We use WhatsApp for updates."}</T></p>}
              <div className="form">
                <div className="field"><label htmlFor="ap-name"><T>{"Full name"}</T></label><input id="ap-name" autoComplete="name" value={d.name} onChange={set('name')} /></div>
                <div className="field"><label htmlFor="ap-phone"><T>{"WhatsApp number"}</T></label><input id="ap-phone" type="tel" autoComplete="tel" placeholder="+971 50 123 4567" value={d.phone} onChange={set('phone')} />{(() => { const c = dialCountry(d.phone); return d.phone.replace(/\D/g, '').length >= 3 ? <small className={`help ${c ? '' : 'err-t'}`}>{c ? <>Country: <b>{c}</b>. Please check this is right, we send your updates to this WhatsApp.</> : 'Start with + and your country code, e.g. +971 for the UAE, +92 for Pakistan.'}</small> : null; })()}</div>
                <div className="field"><label htmlFor="ap-email"><T>{"Email"}</T>{!me && ' *'}</label><input id="ap-email" type="email" autoComplete="email" value={d.email} onChange={set('email')} readOnly={!!me} required={!me} /></div>
                <div className="field"><label htmlFor="ap-nat"><T>{"Nationality"}</T></label><input id="ap-nat" autoComplete="country-name" value={d.nationality} onChange={set('nationality')} /></div>
                <div className="field full">
                  <span className="lbl"><T>{"Where are you now?"}</T></span>
                  <div className="seg" role="radiogroup" aria-label="Where are you now?">
                    <button type="button" role="radio" aria-checked={d.where === 'in'} onClick={() => setD({ ...d, where: 'in' })}><Icon name="pin" size={16} /> <T>{"Inside the UAE"}</T></button>
                    <button type="button" role="radio" aria-checked={d.where === 'out'} onClick={() => setD({ ...d, where: 'out' })}><Icon name="plane" size={16} /> <T>{"Outside the UAE"}</T></button>
                  </div>
                </div>
                <div className="field"><label htmlFor="ap-visa"><T>{"Current UAE visa (if any)"}</T></label>
                  <select id="ap-visa" value={d.visa} onChange={set('visa')}>
                    <Opt value="">{"None / not in the UAE"}</Opt><Opt>{"Visit or tourist visa"}</Opt><Opt>{"Employment visa"}</Opt><Opt>{"Investor or partner visa"}</Opt><Opt>{"Family visa"}</Opt><Opt>{"Golden Visa"}</Opt><Opt>{"Other"}</Opt>
                  </select>
                </div>
                <div className="field"><label htmlFor="ap-notes"><T>{"Anything we should know?"}</T></label><input id="ap-notes" value={d.notes} onChange={set('notes')} placeholder="e.g. property value, deadline" /></div>
                {!me && (
                  <section className="acct-box full" aria-labelledby="acct-h">
                    <div className="acct-head">
                      <span className="acct-ic"><Icon name="lock" size={20} /></span>
                      <div>
                        <h4 id="acct-h"><T>{"Create your client account"}</T></h4>
                        <p><T>{"Your email above is your login. Choose a password to follow your file, upload documents, message your advisor and pay online."}</T></p>
                      </div>
                    </div>
                    <div className="acct-grid">
                      <div className="field">
                        <label htmlFor="ap-pw"><T>{"Create password"}</T> *</label>
                        <div className="pw-wrap">
                          <input id="ap-pw" type={showPw ? 'text' : 'password'} autoComplete="new-password" minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} aria-describedby="ap-pw-help" placeholder="••••••••" />
                          <button type="button" className="pw-eye" onClick={() => setShowPw((x) => !x)} aria-label={showPw ? 'Hide password' : 'Show password'} aria-pressed={showPw}><Icon name={showPw ? 'eyeoff' : 'eye'} size={18} /></button>
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="ap-pw2"><T>{"Confirm password"}</T> *</label>
                        <div className="pw-wrap">
                          <input id="ap-pw2" type={showPw ? 'text' : 'password'} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                    <ul className="pw-rules" id="ap-pw-help">
                      <li className={pw.length >= 8 ? 'ok' : ''}><Icon name="check" size={14} /> <T>{"At least 8 characters"}</T></li>
                      <li className={pw && pw === pw2 ? 'ok' : ''}><Icon name="check" size={14} /> <T>{"Both passwords match"}</T></li>
                    </ul>
                    <p className="acct-foot"><T>{"Already have an account?"}</T> <a href={portalLogin()}><T>{"Sign in first"}</T></a> <T>{"and your details are filled in for you."}</T></p>
                  </section>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wstep">
              <h3><T>{"Who is joining you?"}</T></h3>
              <p className="muted" style={{ margin: '6px 0 16px' }}><T>{"Spouse, children of any age and parents. Children under 18 do not need a medical test. You can skip this step."}</T></p>
              <div className="fam-list">
                {fam.map((m, i) => (
                  <div className="fam-row" key={i}>
                    <select aria-label="Relation" value={m.relation} onChange={(e) => setFam(fam.map((x, k) => (k === i ? { ...x, relation: e.target.value as Member['relation'], adult: e.target.value === 'Child' ? x.adult : true } : x)))}>
                      <Opt>{"Spouse"}</Opt><Opt>{"Child"}</Opt><Opt>{"Parent"}</Opt>
                    </select>
                    <input aria-label="Full name" placeholder="Full name" value={m.name} onChange={(e) => setFam(fam.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} />
                    {m.relation === 'Child' ? (
                      <select aria-label="Age" value={m.adult ? 'a' : 'k'} onChange={(e) => setFam(fam.map((x, k) => (k === i ? { ...x, adult: e.target.value === 'a' } : x)))}>
                        <Opt value="k">{"Under 18"}</Opt><Opt value="a">{"18 or over"}</Opt>
                      </select>
                    ) : <span className="fam-tag"><T>{"Adult"}</T></span>}
                    <button type="button" className="fam-x" aria-label="Remove" onClick={() => setFam(fam.filter((_, k) => k !== i))}><Icon name="close" size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="row-actions">
                {(['Spouse', 'Child', 'Parent'] as const).map((r) => (
                  <button key={r} type="button" className="btn btn-glass btn-sm" onClick={() => setFam([...fam, { relation: r, name: '', adult: r !== 'Child' }])}>+ Add {r.toLowerCase()}</button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && svc && (
            <div className="wstep">
              <h3><T>{"Upload your documents"}</T></h3>
              <p className="muted" style={{ margin: '6px 0 16px' }}>Photos or PDFs up to 15 MB each. Missing something? Submit anyway and add it later in your client dashboard.</p>
              <div className="doc-list">
                {svc.docs.map((label) => (
                  <label key={label} className={`doc-up${files[label] ? ' ok' : ''}`}>
                    <span className="di"><Icon name={files[label] ? 'check' : 'doc'} size={18} /></span>
                    <span className="dt"><b>{label}</b><small>{files[label]?.name ?? 'Tap to choose a file'}</small></span>
                    <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={(e) => pick(label, e.target.files?.[0] ?? null)} />
                  </label>
                ))}
                <label className="doc-up">
                  <span className="di"><Icon name="folder" size={18} /></span>
                  <span className="dt"><b><T>{"Other documents"}</T></b><small>{extra.length ? `${extra.length} file(s) chosen` : 'Optional, several files allowed'}</small></span>
                  <input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={(e) => { const fl = [...(e.target.files || [])].filter((f) => f.size <= MAX).slice(0, 8); setExtra(fl); }} />
                </label>
              </div>
            </div>
          )}

          {step === 4 && svc && (
            <div className="wstep">
              <h3><T>{"Review and submit"}</T></h3>
              <dl className="review">
                <div><dt><T>{"Service"}</T></dt><dd>{svc.label}</dd></div>
                <div><dt><T>{"Applicant"}</T></dt><dd>{d.name} · {d.phone}{d.email ? ` · ${d.email}` : ''}</dd></div>
                <div><dt><T>{"Location"}</T></dt><dd>{d.where === 'in' ? 'Inside the UAE' : 'Outside the UAE'}{d.visa ? ` · ${d.visa}` : ''}</dd></div>
                {famOn && <div><dt><T>{"Family"}</T></dt><dd>{fam.length ? fam.map((m) => `${m.relation}: ${m.name}`).join(', ') : 'None'}</dd></div>}
                <div><dt><T>{"Documents"}</T></dt><dd>{Object.values(files).filter(Boolean).length + extra.length} file(s)</dd></div>
              </dl>
              {route && (
                <>
                  <span className="lbl" style={{ marginTop: 18, display: 'block' }}><T>{"Service speed"}</T></span>
                  <div className="seg" role="radiogroup" aria-label="Service speed">
                    <button type="button" role="radio" aria-checked={d.pkg === 'normal'} onClick={() => setD({ ...d, pkg: 'normal' })}><T>{"Standard · 7–14 working days"}</T></button>
                    <button type="button" role="radio" aria-checked={d.pkg === 'vip'} onClick={() => setD({ ...d, pkg: 'vip' })}><Icon name="crown" size={16} /> <T>{"VIP · 4–5 working days"}</T></button>
                  </div>
                </>
              )}
              <label className="check" style={{ marginTop: 18 }}><input type="checkbox" checked={d.consent} onChange={set('consent')} /> <T>{"The details are correct and I agree to be contacted on WhatsApp, phone or email about this application."}</T></label>
            </div>
          )}

          {err && <p className="err" role="alert" style={{ marginTop: 14 }}>{err}</p>}
          <div className="apply-nav">
            {step > 0 && <button type="button" className="btn btn-glass" onClick={back}><T>{"Back"}</T></button>}
            {step < 4 ? (
              <button type="button" className="btn btn-red" onClick={next}>{step === 2 && !fam.length ? 'Skip' : 'Continue'} <Icon name="arrow" size={18} /></button>
            ) : (
              <button type="button" className="btn btn-red" onClick={submit} disabled={busy}>{busy ? 'Submitting…' : 'Submit application'} <Icon name="arrow" size={18} /></button>
            )}
          </div>
        </div>

        <aside className="apply-side panel glass" aria-label="Summary">
          <p className="eyebrow"><T>{"Your application"}</T></p>
          <h4>{svc?.label ?? 'Choose a service'}</h4>
          {route ? (
            <>
              <ul className="sum-lines">
                {lines.map((l, i) => <li key={i}><span>{l.label}</span><b>{aed(l.amount)}</b></li>)}
              </ul>
              <p className="sum-total"><span><T>{"Estimated government fees"}</T></span><b>{aed(total)}</b></p>
              <p className="small muted">Health insurance and our {d.pkg === 'vip' ? 'VIP' : 'Standard'} service fee (+5% VAT) are quoted in writing. Fee schedule dated {fees.date}.</p>
            </>
          ) : (
            <p className="small muted" style={{ marginTop: 8 }}>{svc ? 'Government fees for this service depend on your case. Your advisor sends an itemised quote before you pay.' : 'Pick a service to see what you need and the estimated fees.'}</p>
          )}
          <ul className="side-points">
            <li><Icon name="check" size={16} /> <T>{"Free review before you pay"}</T></li>
            <li><Icon name="shield" size={16} /> <T>{"Documents stored privately"}</T></li>
            <li><Icon name="wa" size={16} /> <T>{"Updates on WhatsApp"}</T></li>
          </ul>
          <a className="btn btn-glass btn-sm" style={{ width: '100%' }} href={waLink(waText)} target="_blank" rel="noopener"><Icon name="wa" size={16} /> <T>{"Prefer WhatsApp?"}</T></a>
        </aside>
      </div>
    </div>
  );
}

/** Country of a phone number from its dial code (common ones), so a wrong code (e.g. +91 instead of +92) is easy to spot. */
const DIAL: [string, string][] = [['971', 'United Arab Emirates'], ['966', 'Saudi Arabia'], ['974', 'Qatar'], ['973', 'Bahrain'], ['968', 'Oman'], ['965', 'Kuwait'], ['962', 'Jordan'], ['961', 'Lebanon'], ['963', 'Syria'], ['964', 'Iraq'], ['970', 'Palestine'], ['972', 'Israel'], ['98', 'Iran'], ['90', 'Turkey'], ['20', 'Egypt'], ['212', 'Morocco'], ['213', 'Algeria'], ['216', 'Tunisia'], ['92', 'Pakistan'], ['91', 'India'], ['880', 'Bangladesh'], ['94', 'Sri Lanka'], ['977', 'Nepal'], ['93', 'Afghanistan'], ['86', 'China'], ['852', 'Hong Kong'], ['81', 'Japan'], ['82', 'South Korea'], ['63', 'Philippines'], ['62', 'Indonesia'], ['60', 'Malaysia'], ['65', 'Singapore'], ['66', 'Thailand'], ['84', 'Vietnam'], ['7', 'Russia / Kazakhstan'], ['380', 'Ukraine'], ['44', 'United Kingdom'], ['49', 'Germany'], ['43', 'Austria'], ['41', 'Switzerland'], ['33', 'France'], ['39', 'Italy'], ['34', 'Spain'], ['351', 'Portugal'], ['31', 'Netherlands'], ['32', 'Belgium'], ['48', 'Poland'], ['40', 'Romania'], ['36', 'Hungary'], ['420', 'Czechia'], ['421', 'Slovakia'], ['385', 'Croatia'], ['30', 'Greece'], ['46', 'Sweden'], ['47', 'Norway'], ['45', 'Denmark'], ['353', 'Ireland'], ['1', 'USA / Canada'], ['55', 'Brazil'], ['52', 'Mexico'], ['61', 'Australia'], ['64', 'New Zealand'], ['27', 'South Africa'], ['234', 'Nigeria'], ['254', 'Kenya'], ['251', 'Ethiopia'], ['249', 'Sudan'], ['233', 'Ghana']];
function dialCountry(p: string): string {
  const t = p.trim();
  if (!t.startsWith('+') && !t.startsWith('00')) return '';
  const d = t.replace(/\D/g, '').replace(/^00/, '');
  const hit = DIAL.filter(([c]) => d.startsWith(c)).sort((a, b) => b[0].length - a[0].length)[0];
  return hit ? `${hit[1]} (+${hit[0]})` : '';
}

