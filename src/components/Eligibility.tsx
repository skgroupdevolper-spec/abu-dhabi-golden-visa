'use client';

import { Opt, T } from './T';
import { useState, type FormEvent } from 'react';
import { waLink } from '@/lib/site';
import { Icon } from './Icon';

// Eligibility checker, spec section 7. A first screening only: never claims guaranteed eligibility.
type Cat = 'property' | 'business' | 'professional' | 'talent';
const CATS: { id: Cat; label: string; icon: string }[] = [
  { id: 'property', label: 'Property investor', icon: 'home' },
  { id: 'business', label: 'Business owner / investor', icon: 'briefcase' },
  { id: 'professional', label: 'Skilled professional', icon: 'user' },
  { id: 'talent', label: 'Talent, scientist or student', icon: 'star' },
];

export function Eligibility() {
  const [cat, setCat] = useState<Cat>('property');
  const [value, setValue] = useState('');
  const [salary, setSalary] = useState('');
  const [where, setWhere] = useState<'in' | 'out'>('in');
  const [deps, setDeps] = useState(0);
  const [result, setResult] = useState<{ tone: 'good' | 'warn'; title: string; text: string } | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState('');

  function check(e: FormEvent) {
    e.preventDefault();
    const n = Number(String(value).replace(/[^\d.]/g, ''));
    const sal = Number(String(salary).replace(/[^\d.]/g, ''));
    if (cat === 'property') {
      setResult(
        n >= 2_000_000
          ? { tone: 'good', title: 'Potential property investment pathway', text: 'Your stated value meets the usual AED 2 million benchmark. Ownership, financing and nomination must still be verified.' }
          : { tone: 'warn', title: 'Below the usual AED 2M benchmark', text: 'Your stated value is below the usual AED 2 million benchmark. Explore other routes, or combine properties registered in your name.' },
      );
    } else if (cat === 'business') {
      setResult({ tone: 'good', title: 'Potential investor or business pathway', text: 'Routes include an AED 2 million deposit or company stake, AED 250,000 tax paid each year for two years, or an entrepreneur nomination. We need your company documents to confirm.' });
    } else if (cat === 'professional') {
      setResult(
        sal >= 30_000
          ? { tone: 'good', title: 'Potential skilled professional pathway', text: 'Your salary meets the usual AED 30,000 monthly benchmark. Your classification, degree and work permit must still be verified.' }
          : { tone: 'warn', title: 'Below the usual salary benchmark', text: 'The professional route usually needs AED 30,000 a month. A specialist recommendation or another route may still be possible.' },
      );
    } else {
      setResult({ tone: 'good', title: 'Recommendation-based pathway', text: 'Talents, scientists and students qualify through recommendations or academic results. Send us your achievements or transcripts for a review.' });
    }
    if (window.__adgvDrop) window.__adgvDrop(window.innerWidth / 2, window.innerHeight / 2, 0.08, -1);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setSaved('Please add your name and WhatsApp number.');
      return;
    }
    try {
      const r = await fetch('/api/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, source: 'eligibility', details: { cat, value, salary, where, deps, result: result?.title } }),
      });
      setSaved(r.ok ? 'Saved. An advisor will contact you shortly.' : 'Could not save right now. Please send it on WhatsApp.');
    } catch {
      setSaved('Could not save right now. Please send it on WhatsApp.');
    }
  }

  const summary = `Eligibility check\nCategory: ${CATS.find((c) => c.id === cat)?.label}\n${cat === 'property' ? `Property value: AED ${value}\n` : ''}${cat === 'professional' ? `Salary: AED ${salary}\n` : ''}Applying from: ${where === 'in' ? 'inside the UAE' : 'outside the UAE'}\nDependants: ${deps}\nResult: ${result?.title ?? ''}`;

  return (
    <div className="panel glass">
      <form onSubmit={check} className="form">
        <div className="full">
          <span className="field"><label><T>{"Application category"}</T></label></span>
          <div className="opts two elig-opts" role="group" aria-label="Application category">
            {CATS.map((c) => (
              <button key={c.id} type="button" className="opt" aria-pressed={cat === c.id} onClick={() => { setCat(c.id); setResult(null); }}>
                <span className="oi"><Icon name={c.icon} /></span><span><b>{c.label}</b></span><span className="aw-ok" aria-hidden="true"><Icon name="check" size={14} /></span>
              </button>
            ))}
          </div>
        </div>
        {cat === 'property' && (
          <div className="field full"><label htmlFor="el-value"><T>{"Property value (AED)"}</T></label><input id="el-value" inputMode="numeric" placeholder="2,000,000" value={value} onChange={(e) => setValue(e.target.value)} required /></div>
        )}
        {cat === 'professional' && (
          <div className="field full"><label htmlFor="el-salary"><T>{"Monthly salary (AED)"}</T></label><input id="el-salary" inputMode="numeric" placeholder="30,000" value={salary} onChange={(e) => setSalary(e.target.value)} required /></div>
        )}
        <div className="field"><label htmlFor="el-where"><T>{"Where are you now?"}</T></label><select id="el-where" value={where} onChange={(e) => setWhere(e.target.value as 'in' | 'out')}><Opt value="in">{"Inside the UAE"}</Opt><Opt value="out">{"Outside the UAE"}</Opt></select></div>
        <div className="field"><label htmlFor="el-deps"><T>{"Number of dependants"}</T></label><input id="el-deps" type="number" min={0} max={15} value={deps} onChange={(e) => setDeps(Math.max(0, Number(e.target.value) || 0))} /></div>
        <div className="full"><button className="btn btn-red" type="submit"><T>{"Check My Eligibility"}</T> <Icon name="arrow" size={18} className="arrow" /></button></div>
      </form>

      {result && (
        <div className={`screen-result ${result.tone} wstep`} style={{ marginTop: 20 }} aria-live="polite">
          <h3 style={{ fontSize: 24 }}>{result.title}</h3>
          <p className="muted" style={{ marginTop: 8 }}>{result.text}</p>
          <p className="note"><T>{"This is a first screening, not a decision. The competent authorities decide eligibility."}</T></p>
          <form onSubmit={save} className="form" style={{ marginTop: 16 }}>
            <div className="field"><label htmlFor="el-name"><T>{"Your name"}</T></label><input id="el-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="field"><label htmlFor="el-phone"><T>{"WhatsApp number"}</T></label><input id="el-phone" type="tel" autoComplete="tel" placeholder="+971" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="full row-actions" style={{ marginTop: 0 }}>
              <button className="btn btn-navy" type="submit"><T>{"Save and get a call back"}</T></button>
              <a className="btn btn-gold" href={waLink(summary)} target="_blank" rel="noopener"><Icon name="wa" size={18} /> <T>{"Continue on WhatsApp"}</T></a>
            </div>
            {saved && <p className="full note" role="status">{saved}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
