'use client';

import { T } from './T';
import { useState, type FormEvent, type ChangeEvent } from 'react';
import { SITE, waLink } from '@/lib/site';
import { Icon } from './Icon';

const SERVICES = ['Property investor Golden Visa', 'Business / investor Golden Visa', 'Entrepreneur Golden Visa', 'Skilled professional Golden Visa', 'Talent or student Golden Visa', 'Family visa', 'Renewal', 'Document services', 'Valuation certificate', 'Something else'];

export function LeadForm({ source = 'contact' }: { source?: string }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', service: SERVICES[0], message: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || !f.phone.trim()) {
      setErr('Please add your name and WhatsApp number.');
      return;
    }
    setErr('');
    setState('sending');
    try {
      const r = await fetch('/api/leads/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, source }) });
      setState(r.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  const summary = `Quote request from abudhabigoldenvisa.com\nName: ${f.name}\nWhatsApp: ${f.phone}\nService: ${f.service}${f.message ? `\nDetails: ${f.message}` : ''}`;

  if (state === 'done' || state === 'error') {
    return (
      <div className="msg-ok wstep" role="status">
        <p className="eyebrow"><T>{"Free quote"}</T></p>
        <h3 style={{ marginTop: 6 }}>{state === 'done' ? 'Your request is ready' : 'Send your request on WhatsApp'}</h3>
        <p style={{ opacity: 0.85, marginTop: 8 }}>
          {state === 'done' ? 'Request received. An advisor will reply with your written quote during office hours. You can also send it on WhatsApp now.' : 'We could not save it right now. Send it on WhatsApp and we will reply there.'}
        </p>
        <div className="sum">{summary}</div>
        <div className="row-actions">
          <a className="btn" style={{ background: '#b8901f', color: '#fff' }} href={waLink(summary)} target="_blank" rel="noopener"><Icon name="wa" size={18} /> Send on WhatsApp · {SITE.whatsappDisplay}</a>
          <button type="button" className="btn btn-glass" onClick={() => setState('idle')}><T>{"Edit request"}</T></button>
        </div>
      </div>
    );
  }

  return (
    <form className="form panel glass" onSubmit={submit} noValidate>
      <div className="field"><label htmlFor={`${source}-name`}><T>{"Full name"}</T></label><input id={`${source}-name`} autoComplete="name" value={f.name} onChange={set('name')} required /></div>
      <div className="field"><label htmlFor={`${source}-phone`}><T>{"WhatsApp number"}</T></label><input id={`${source}-phone`} type="tel" autoComplete="tel" placeholder="+971" value={f.phone} onChange={set('phone')} required /></div>
      <div className="field"><label htmlFor={`${source}-email`}><T>{"Email (optional)"}</T></label><input id={`${source}-email`} type="email" autoComplete="email" value={f.email} onChange={set('email')} /></div>
      <div className="field"><label htmlFor={`${source}-service`}><T>{"Service"}</T></label><select id={`${source}-service`} value={f.service} onChange={set('service')}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select></div>
      <div className="field full"><label htmlFor={`${source}-msg`}><T>{"Anything we should know?"}</T></label><textarea id={`${source}-msg`} value={f.message} onChange={set('message')} /></div>
      {err && <p className="err full" role="alert">{err}</p>}
      <div className="full row-actions" style={{ marginTop: 0 }}>
        <button className="btn btn-red" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Get My Free Quote'}</button>
        <a className="btn btn-glass" href={waLink('Hello, I would like a free Golden Visa consultation.')} target="_blank" rel="noopener"><Icon name="wa" size={18} /> <T>{"WhatsApp us"}</T></a>
      </div>
      <p className="full note"><T>{"By sending this form you agree that we contact you about your enquiry. See our privacy policy."}</T></p>
    </form>
  );
}
