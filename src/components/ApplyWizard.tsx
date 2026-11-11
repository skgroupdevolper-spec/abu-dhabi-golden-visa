'use client';

// Online application: service → applicant → family → documents → review & submit.
// Creates an enquiry and a client file (visible in the admin and the client dashboard).
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { APPLY_SERVICES, applyService, type ApplyService } from '@/content/apply';
import { FEE_SCHEDULE, ROUTES, aed } from '@/lib/fees';
import { governmentLines } from '@/lib/stages';
import { SITE, waLink } from '@/lib/site';
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

export function ApplyWizard() {
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
  const [done, setDone] = useState<{ ref: string; link: string } | null>(null);
  const [me, setMe] = useState<{ name: string; email: string; phone: string } | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('service');
    const s = applyService(id);
    if (s) { setSvc(s); setStep(1); }
    fetch('/api/fees/').then((r) => (r.ok ? r.json() : null)).then((j) => j?.perPerson && setFees(j)).catch(() => {});
    // Signed-in clients: use their account details instead of asking again.
    fetch('/api/me/', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (!j?.signedIn) return;
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
    fd.set('language', document.documentElement.lang || 'en');
    if (total) fd.set('estimate', String(total));
    for (const [label, f] of Object.entries(files)) if (f) { fd.append('files', f); fd.append('labels', label); }
    for (const f of extra) { fd.append('files', f); fd.append('labels', f.name); }
    try {
      const r = await fetch('/api/apply/', { method: 'POST', body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'We could not submit your application. Please send it on WhatsApp.');
      setDone({ ref: j.ref, link: j.link });
    } catch (e) {
      setErr((e as Error).message);
    } finally { setBusy(false); }
  }

  const waText = `Online application\nService: ${svc?.label ?? ''}\nName: ${d.name}\nWhatsApp: ${d.phone}\n${d.where === 'in' ? 'Inside the UAE' : 'Outside the UAE'}${fam.length ? `\nFamily: ${fam.map((m) => `${m.relation} ${m.name}`).join(', ')}` : ''}${done ? `\nReference: ${done.ref}` : ''}`;

  if (done) {
    return (
      <div className="apply-done wstep" role="status">
        <span className="ad-ic"><Icon name="check" size={30} /></span>
        <p className="eyebrow">Application received</p>
        <h2>Thank you, {d.name.split(' ')[0]}. Your reference is {done.ref}.</h2>
        <p className="lead">Your advisor checks your file and sends the written quote on WhatsApp{d.email ? ' and by email' : ''}. Follow every step, upload documents and message us in your client dashboard.</p>
        <div className="row-actions" style={{ justifyContent: 'center' }}>
          <a className="btn btn-red" href={done.link}>Open my client dashboard <Icon name="arrow" size={18} /></a>
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
                <div><h3>Which visa or service do you need?</h3><p className="muted">Pick one. You can add family members in a later step.</p></div>
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
              <h3>Your details</h3>
              {me ? (
                <div className="signed-in-note" role="status">
                  <Icon name="check" size={18} />
                  <div><b>You are already signed in as {me.name || me.email}.</b><span>No account needed: this application is added to your client dashboard. Check the details below and continue.</span></div>
                </div>
              ) : <p className="muted" style={{ margin: '6px 0 16px' }}>As written in your passport. We use WhatsApp for updates.</p>}
              <div className="form">
                <div className="field"><label htmlFor="ap-name">Full name</label><input id="ap-name" autoComplete="name" value={d.name} onChange={set('name')} /></div>
                <div className="field"><label htmlFor="ap-phone">WhatsApp number</label><input id="ap-phone" type="tel" autoComplete="tel" placeholder="+971" value={d.phone} onChange={set('phone')} /></div>
                <div className="field"><label htmlFor="ap-email">Email</label><input id="ap-email" type="email" autoComplete="email" value={d.email} onChange={set('email')} /></div>
                <div className="field"><label htmlFor="ap-nat">Nationality</label><input id="ap-nat" autoComplete="country-name" value={d.nationality} onChange={set('nationality')} /></div>
                <div className="field full">
                  <span className="lbl">Where are you now?</span>
                  <div className="seg" role="radiogroup" aria-label="Where are you now?">
                    <button type="button" role="radio" aria-checked={d.where === 'in'} onClick={() => setD({ ...d, where: 'in' })}><Icon name="pin" size={16} /> Inside the UAE</button>
                    <button type="button" role="radio" aria-checked={d.where === 'out'} onClick={() => setD({ ...d, where: 'out' })}><Icon name="plane" size={16} /> Outside the UAE</button>
                  </div>
                </div>
                <div className="field"><label htmlFor="ap-visa">Current UAE visa (if any)</label>
                  <select id="ap-visa" value={d.visa} onChange={set('visa')}>
                    <option value="">None / not in the UAE</option><option>Visit or tourist visa</option><option>Employment visa</option><option>Investor or partner visa</option><option>Family visa</option><option>Golden Visa</option><option>Other</option>
                  </select>
                </div>
                <div className="field"><label htmlFor="ap-notes">Anything we should know?</label><input id="ap-notes" value={d.notes} onChange={set('notes')} placeholder="e.g. property value, deadline" /></div>
                {!me && <p className="small muted full">You get a private link to your client dashboard to follow your file, upload documents and pay online. Already have an account? <a href="/portal/login/">Sign in first</a> and your details are filled in for you.</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wstep">
              <h3>Who is joining you?</h3>
              <p className="muted" style={{ margin: '6px 0 16px' }}>Spouse, children of any age and parents. Children under 18 do not need a medical test. You can skip this step.</p>
              <div className="fam-list">
                {fam.map((m, i) => (
                  <div className="fam-row" key={i}>
                    <select aria-label="Relation" value={m.relation} onChange={(e) => setFam(fam.map((x, k) => (k === i ? { ...x, relation: e.target.value as Member['relation'], adult: e.target.value === 'Child' ? x.adult : true } : x)))}>
                      <option>Spouse</option><option>Child</option><option>Parent</option>
                    </select>
                    <input aria-label="Full name" placeholder="Full name" value={m.name} onChange={(e) => setFam(fam.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} />
                    {m.relation === 'Child' ? (
                      <select aria-label="Age" value={m.adult ? 'a' : 'k'} onChange={(e) => setFam(fam.map((x, k) => (k === i ? { ...x, adult: e.target.value === 'a' } : x)))}>
                        <option value="k">Under 18</option><option value="a">18 or over</option>
                      </select>
                    ) : <span className="fam-tag">Adult</span>}
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
              <h3>Upload your documents</h3>
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
                  <span className="dt"><b>Other documents</b><small>{extra.length ? `${extra.length} file(s) chosen` : 'Optional, several files allowed'}</small></span>
                  <input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={(e) => { const fl = [...(e.target.files || [])].filter((f) => f.size <= MAX).slice(0, 8); setExtra(fl); }} />
                </label>
              </div>
            </div>
          )}

          {step === 4 && svc && (
            <div className="wstep">
              <h3>Review and submit</h3>
              <dl className="review">
                <div><dt>Service</dt><dd>{svc.label}</dd></div>
                <div><dt>Applicant</dt><dd>{d.name} · {d.phone}{d.email ? ` · ${d.email}` : ''}</dd></div>
                <div><dt>Location</dt><dd>{d.where === 'in' ? 'Inside the UAE' : 'Outside the UAE'}{d.visa ? ` · ${d.visa}` : ''}</dd></div>
                {famOn && <div><dt>Family</dt><dd>{fam.length ? fam.map((m) => `${m.relation}: ${m.name}`).join(', ') : 'None'}</dd></div>}
                <div><dt>Documents</dt><dd>{Object.values(files).filter(Boolean).length + extra.length} file(s)</dd></div>
              </dl>
              {route && (
                <>
                  <span className="lbl" style={{ marginTop: 18, display: 'block' }}>Service speed</span>
                  <div className="seg" role="radiogroup" aria-label="Service speed">
                    <button type="button" role="radio" aria-checked={d.pkg === 'normal'} onClick={() => setD({ ...d, pkg: 'normal' })}>Standard · 7–14 working days</button>
                    <button type="button" role="radio" aria-checked={d.pkg === 'vip'} onClick={() => setD({ ...d, pkg: 'vip' })}><Icon name="crown" size={16} /> VIP · 4–5 working days</button>
                  </div>
                </>
              )}
              <label className="check" style={{ marginTop: 18 }}><input type="checkbox" checked={d.consent} onChange={set('consent')} /> The details are correct and I agree to be contacted on WhatsApp, phone or email about this application.</label>
            </div>
          )}

          {err && <p className="err" role="alert" style={{ marginTop: 14 }}>{err}</p>}
          <div className="apply-nav">
            {step > 0 && <button type="button" className="btn btn-glass" onClick={back}>Back</button>}
            {step < 4 ? (
              <button type="button" className="btn btn-red" onClick={next}>{step === 2 && !fam.length ? 'Skip' : 'Continue'} <Icon name="arrow" size={18} /></button>
            ) : (
              <button type="button" className="btn btn-red" onClick={submit} disabled={busy}>{busy ? 'Submitting…' : 'Submit application'} <Icon name="arrow" size={18} /></button>
            )}
          </div>
        </div>

        <aside className="apply-side panel glass" aria-label="Summary">
          <p className="eyebrow">Your application</p>
          <h4>{svc?.label ?? 'Choose a service'}</h4>
          {route ? (
            <>
              <ul className="sum-lines">
                {lines.map((l, i) => <li key={i}><span>{l.label}</span><b>{aed(l.amount)}</b></li>)}
              </ul>
              <p className="sum-total"><span>Estimated government fees</span><b>{aed(total)}</b></p>
              <p className="small muted">Health insurance and our {d.pkg === 'vip' ? 'VIP' : 'Standard'} service fee (+5% VAT) are quoted in writing. Fee schedule dated {fees.date}.</p>
            </>
          ) : (
            <p className="small muted" style={{ marginTop: 8 }}>{svc ? 'Government fees for this service depend on your case. Your advisor sends an itemised quote before you pay.' : 'Pick a service to see what you need and the estimated fees.'}</p>
          )}
          <ul className="side-points">
            <li><Icon name="check" size={16} /> Free review before you pay</li>
            <li><Icon name="shield" size={16} /> Documents stored privately</li>
            <li><Icon name="wa" size={16} /> Updates on WhatsApp</li>
          </ul>
          <a className="btn btn-glass btn-sm" style={{ width: '100%' }} href={waLink(waText)} target="_blank" rel="noopener"><Icon name="wa" size={16} /> Prefer WhatsApp?</a>
        </aside>
      </div>
    </div>
  );
}
