'use client';

// Cost calculator editor: every fee, label, route, package, add-on, extra fee, wording, option and currency rate.
import { useActionState, useMemo, useState } from 'react';
import { FEE_SCHEDULE, RATES, aed, type Addon, type ExtraFee, type Route } from '@/lib/fees';
import { Icon } from '@/components/Icon';

type Fees = typeof FEE_SCHEDULE;
type St = { ok?: string; error?: string } | undefined;
const TABS = [['fees', 'Government fees'], ['routes', 'Routes'], ['packages', 'Packages & add-ons'], ['extra', 'Extra fees'], ['texts', 'Wording'], ['options', 'Steps & buttons'], ['currency', 'Currencies'], ['notes', 'Notes & date']] as const;
const TEXTS: [string, string][] = [
  ['routeH', 'What describes you?'], ['routeP', 'Choose the route you are applying through.'], ['whereH', 'Where are you now?'], ['whereP', 'This decides whether a change of status fee applies.'],
  ['inT', 'Inside the UAE'], ['inS', 'On a visit, tourist or residence visa'], ['outT', 'Outside the UAE'], ['outS', 'Applying from your home country'],
  ['famH', 'Adding family members too?'], ['famP', 'Your spouse, children and parents can be added now.'], ['soloT', 'No, just me'], ['soloS', 'Only my own visa'], ['famT', 'Yes, add family'], ['famS', 'Add adults and children'],
  ['fileH', 'Does the sponsor file need opening?'], ['fileP', 'It is opened once per sponsor, not for each family member.'], ['countH', 'Add your family members'], ['countP', 'You are already counted. Add only your family.'],
  ['medH', 'Choose your medical test'], ['medP', 'Needed for everyone 18 and over.'], ['medNT', 'Normal medical'], ['medNS', 'Standard result time'], ['medVT', 'VIP medical'], ['medVS', 'Fastest result'],
  ['pkgH', 'Choose your service package'], ['pkgP', 'Both include eligibility and document review, government filing and Emirates ID help. Approval is always decided by the authorities.'],
  ['resultH', 'Your estimate'], ['quoted', 'Quoted in writing'], ['separate', 'Quoted separately'], ['extrasH', 'Extras'],
  ['pdfB', 'Download PDF quote'], ['waB', 'Send to WhatsApp'], ['copyB', 'Copy estimate'], ['againB', 'Recalculate'],
];
const PER = [['person', 'Per person'], ['adult', 'Per adult (18+)'], ['child', 'Per child'], ['main', 'Main applicant only'], ['once', 'Once per application']] as const;
const num = (v: string) => Math.max(0, Math.round((Number(v.replace(/,/g, '')) || 0) * 100) / 100);
const id = () => Math.random().toString(36).slice(2, 8);

function Money({ label, value, on, help }: { label: string; value: number; on: (n: number) => void; help?: string }) {
  return <div className="field"><label>{label}</label><input inputMode="decimal" defaultValue={value.toFixed(2)} onBlur={(e) => on(num(e.target.value))} />{help && <p className="help">{help}</p>}</div>;
}
function Text({ label, value, on, full, ph }: { label: string; value: string; on: (v: string) => void; full?: boolean; ph?: string }) {
  return <div className={`field${full ? ' full' : ''}`}><label>{label}</label><input defaultValue={value} placeholder={ph} onBlur={(e) => on(e.target.value)} /></div>;
}
function Check({ label, on, set, help }: { label: string; on: boolean; set: (v: boolean) => void; help?: string }) {
  return <label className="switch"><input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} /><span><b>{label}</b>{help && <small>{help}</small>}</span></label>;
}

export function FeesEditor({ initial, action }: { initial: Fees; action: (s: St, f: FormData) => Promise<St> }) {
  const [f, setF] = useState<Fees>(initial);
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('fees');
  const [state, run, pending] = useActionState(action, undefined);
  const [dirty, setDirty] = useState(false);
  const [ver, setVer] = useState(0);
  const set = (fn: (x: Fees) => Fees) => { setF((x) => fn(structuredClone(x))); setDirty(true); };

  const example = useMemo(() => f.perPerson.visa.aed + f.medical.normal.aed + f.perPerson.emiratesId.aed + f.perPerson.changeOfStatus.aed + f.propertyValuation.aed, [f]);
  const rates = Object.keys(f.rates ?? {}).length ? f.rates : RATES;

  const core: [string, { label: string; aed: number }, (x: Fees) => { label: string; aed: number }][] = [
    ['Per person', f.perPerson.visa, (x) => x.perPerson.visa], ['Per person', f.perPerson.emiratesId, (x) => x.perPerson.emiratesId], ['Per person, inside the UAE', f.perPerson.changeOfStatus, (x) => x.perPerson.changeOfStatus],
    ['Per adult', f.medical.normal, (x) => x.medical.normal], ['Per adult', f.medical.vip, (x) => x.medical.vip],
    ['Once, with family', f.sponsorFile, (x) => x.sponsorFile], ['Main applicant, property routes', f.propertyValuation, (x) => x.propertyValuation],
  ];

  return (
    <form action={run} className="fe" onSubmit={() => setDirty(false)}>
      <input type="hidden" name="json" value={JSON.stringify(f)} />
      <div className="pb-top">
        <nav className="pb-tabs">{TABS.map(([k, l]) => <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</nav>
        <div className="row">
          <a className="btn btn-sm" href="/golden-visa-cost/" target="_blank" rel="noopener"><Icon name="ext" size={15} /> Open calculator</a>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => { if (confirm('Reset every calculator setting to the original schedule?')) { setF(structuredClone(FEE_SCHEDULE)); setVer((v) => v + 1); setDirty(true); } }}>Reset all</button>
          <button className="btn btn-gold" disabled={pending}>{pending ? 'Saving…' : dirty ? 'Save changes •' : 'Save'}</button>
        </div>
      </div>
      {state?.ok && <p className="notice ok">{state.ok}</p>}
      {state?.error && <p className="notice err">{state.error}</p>}

      <div className="cols" key={ver}>
        <div className="panel">
          {tab === 'fees' && (
            <div className="form">
              <p className="help full">Change any name or amount. Names appear on the calculator, the PDF quote and WhatsApp summary.</p>
              {core.map(([when, item, pick], i) => (
                <div key={i} className="full form fe-row">
                  <Text label={`Name · ${when}`} value={item.label} on={(v) => set((x) => { pick(x).label = v || item.label; return x; })} />
                  <Money label="Amount (AED)" value={item.aed} on={(n) => set((x) => { pick(x).aed = n; return x; })} />
                </div>
              ))}
              <div className="field"><label>VAT rate (%)</label><input inputMode="decimal" defaultValue={String(Math.round((f.vatRate ?? 0.05) * 10000) / 100)} onBlur={(e) => set((x) => { x.vatRate = Math.min(50, num(e.target.value)) / 100; return x; })} /><p className="help">Applied to packages and paid add-ons.</p></div>
            </div>
          )}

          {tab === 'routes' && (
            <div className="stack">
              <p className="help">The first question of the calculator. Hide a route, rename it, change its icon, say if it needs the property value certificate, and give it its own document checklist.</p>
              {f.routes.map((r: Route, i) => (
                <div key={r.id + i} className={`fe-card${r.hidden ? ' off' : ''}`}>
                  <div className="form">
                    <Text label="Name" value={r.label} on={(v) => set((x) => { x.routes[i].label = v; return x; })} />
                    <Text label="Short note" value={r.note} on={(v) => set((x) => { x.routes[i].note = v; return x; })} />
                    <Text label="Icon (home, briefcase, rocket, user, cap, family, star, heart…)" value={r.icon ?? ''} on={(v) => set((x) => { x.routes[i].icon = v.trim(); return x; })} />
                    <Text label="Code (used for checklists and extra fees)" value={r.id} on={(v) => set((x) => { x.routes[i].id = v.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || r.id; return x; })} />
                    <div className="field full"><label>Document checklist (one per line; empty = built-in list)</label><textarea rows={3} defaultValue={(r.checklist ?? []).join('\n')} onBlur={(e) => set((x) => { x.routes[i].checklist = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean); return x; })} /></div>
                    <Check label="Adds the property value certificate" on={r.valuation} set={(v) => set((x) => { x.routes[i].valuation = v; return x; })} />
                    <Check label="Hidden" on={!!r.hidden} set={(v) => set((x) => { x.routes[i].hidden = v; return x; })} />
                  </div>
                  <div className="row fe-acts">
                    <button type="button" className="btn btn-sm" disabled={i === 0} onClick={() => set((x) => { [x.routes[i - 1], x.routes[i]] = [x.routes[i], x.routes[i - 1]]; return x; })}>↑</button>
                    <button type="button" className="btn btn-sm" disabled={i === f.routes.length - 1} onClick={() => set((x) => { [x.routes[i + 1], x.routes[i]] = [x.routes[i], x.routes[i + 1]]; return x; })}>↓</button>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => { if (confirm('Delete this route?')) set((x) => { x.routes.splice(i, 1); return x; }); }}>Delete</button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn" onClick={() => set((x) => { x.routes.push({ id: `route-${id()}`, label: 'New route', note: 'Short description', valuation: false, icon: 'star' }); return x; })}>+ Add route</button>
            </div>
          )}

          {tab === 'packages' && (
            <div className="stack">
              {(['normal', 'vip'] as const).map((k) => {
                const p = f.packages[k];
                return (
                  <div key={k} className={`fe-card${p.hidden ? ' off' : ''}`}>
                    <div className="form">
                      <Text label="Button title" value={p.title ?? ''} on={(v) => set((x) => { x.packages[k].title = v; return x; })} />
                      <Text label="Name on the quote" value={p.label} on={(v) => set((x) => { x.packages[k].label = v || p.label; return x; })} />
                      <Text label="Description" value={p.sub ?? ''} on={(v) => set((x) => { x.packages[k].sub = v; return x; })} full />
                      <Money label="Price (AED, 0 = quoted in writing)" value={p.aed} on={(n) => set((x) => { x.packages[k].aed = n; return x; })} />
                      <Check label="Hide this package" on={!!p.hidden} set={(v) => set((x) => { x.packages[k].hidden = v; return x; })} />
                    </div>
                  </div>
                );
              })}
              <h3 style={{ marginTop: 10 }}>Add-ons (tick boxes)</h3>
              <p className="help">Insurance, attestation, translation, typing, courier… Price 0 shows “quoted separately”.</p>
              {f.addons.map((a: Addon, i) => (
                <div key={a.id} className="fe-card">
                  <div className="form">
                    <Text label="Name" value={a.label} on={(v) => set((x) => { x.addons[i].label = v; return x; })} />
                    <Text label="Note" value={a.note} on={(v) => set((x) => { x.addons[i].note = v; return x; })} />
                    <Money label="Price (AED, 0 = quoted separately)" value={a.aed} on={(n) => set((x) => { x.addons[i].aed = n; return x; })} />
                    <div className="field"><label>Charged</label><select value={a.per} onChange={(e) => set((x) => { x.addons[i].per = e.target.value as Addon['per']; return x; })}>{PER.filter(([p]) => p !== 'main').map(([p, l]) => <option key={p} value={p}>{l}</option>)}</select></div>
                    <Check label="Ticked by default" on={a.on} set={(v) => set((x) => { x.addons[i].on = v; return x; })} />
                  </div>
                  <div className="row fe-acts"><button type="button" className="btn btn-sm btn-ghost" onClick={() => set((x) => { x.addons.splice(i, 1); return x; })}>Delete</button></div>
                </div>
              ))}
              <button type="button" className="btn" onClick={() => set((x) => { x.addons.push({ id: id(), label: 'New add-on', note: '', aed: 0, per: 'once', on: false }); return x; })}>+ Add add-on</button>
            </div>
          )}

          {tab === 'extra' && (
            <div className="stack">
              <p className="help">Fees added automatically to every estimate, for example a new government charge, typing fee or a fee for some routes only.</p>
              {f.extraFees.map((x0: ExtraFee, i) => (
                <div key={x0.id} className="fe-card">
                  <div className="form">
                    <Text label="Name" value={x0.label} on={(v) => set((x) => { x.extraFees[i].label = v; return x; })} />
                    <Money label="Amount (AED)" value={x0.aed} on={(n) => set((x) => { x.extraFees[i].aed = n; return x; })} />
                    <div className="field"><label>Charged</label><select value={x0.per} onChange={(e) => set((x) => { x.extraFees[i].per = e.target.value as ExtraFee['per']; return x; })}>{PER.map(([p, l]) => <option key={p} value={p}>{l}</option>)}</select></div>
                    <div className="field full"><label>Only for these routes (empty = all)</label>
                      <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>{f.routes.map((r) => <label key={r.id} className="row small"><input type="checkbox" checked={x0.routes.includes(r.id)} onChange={(e) => set((x) => { x.extraFees[i].routes = e.target.checked ? [...x0.routes, r.id] : x0.routes.filter((y) => y !== r.id); return x; })} /> {r.label}</label>)}</div></div>
                  </div>
                  <div className="row fe-acts"><button type="button" className="btn btn-sm btn-ghost" onClick={() => set((x) => { x.extraFees.splice(i, 1); return x; })}>Delete</button></div>
                </div>
              ))}
              {!f.extraFees.length && <p className="empty">No extra fees.</p>}
              <button type="button" className="btn" onClick={() => set((x) => { x.extraFees.push({ id: id(), label: 'New fee', aed: 0, per: 'person', routes: [] }); return x; })}>+ Add extra fee</button>
            </div>
          )}

          {tab === 'texts' && (
            <div className="form">
              <p className="help full">Change any heading, option or button on the calculator. Leave empty for the default text.</p>
              {TEXTS.map(([k, d]) => (
                <div key={k} className={`field${d.length > 60 ? ' full' : ''}`}><label>{d.length > 40 ? d.slice(0, 40) + '…' : d}</label><input defaultValue={f.texts?.[k] ?? ''} placeholder={d} onBlur={(e) => set((x) => { x.texts = { ...x.texts, [k]: e.target.value }; return x; })} /></div>
              ))}
            </div>
          )}

          {tab === 'options' && (
            <div className="stack">
              <p className="help">Switch steps and buttons on or off. A step that is off is answered automatically (outside the UAE, no family, normal medical, normal package).</p>
              {([['where', 'Ask “inside or outside the UAE”'], ['family', 'Ask about family members'], ['medical', 'Ask normal or VIP medical'], ['package', 'Show service packages and add-ons'], ['checklist', 'Show document checklist and timeline'], ['convert', 'Show the total in the visitor’s currency'], ['pdf', 'PDF quote button'], ['whatsapp', 'Send to WhatsApp button'], ['copy', 'Copy estimate button'], ['vatOnGov', 'Add VAT on government fees too']] as const).map(([k, l]) => (
                <Check key={k} label={l} on={!!f.options[k]} set={(v) => set((x) => { x.options = { ...x.options, [k]: v }; return x; })} />
              ))}
              <div className="field" style={{ maxWidth: 260 }}><label>Most family members per type</label><input type="number" defaultValue={f.options.maxPeople} onBlur={(e) => set((x) => { x.options.maxPeople = Math.max(1, Math.min(30, Number(e.target.value) || 10)); return x; })} /></div>
            </div>
          )}

          {tab === 'currency' && (
            <div className="stack">
              <p className="help">1 AED = rate. Used for the approximate total in the visitor’s chosen currency.</p>
              <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Code</th><th>Name</th><th>Symbol</th><th>Rate</th><th /></tr></thead><tbody>
                {Object.entries(rates).map(([c, r]) => (
                  <tr key={c}><td><b>{c}</b></td>
                    <td><input defaultValue={r.name} onBlur={(e) => set((x) => { x.rates = { ...rates, [c]: { ...r, name: e.target.value } }; return x; })} /></td>
                    <td><input defaultValue={r.symbol} style={{ width: 70 }} onBlur={(e) => set((x) => { x.rates = { ...rates, [c]: { ...r, symbol: e.target.value } }; return x; })} /></td>
                    <td><input inputMode="decimal" defaultValue={String(r.rate)} style={{ width: 110 }} onBlur={(e) => set((x) => { x.rates = { ...rates, [c]: { ...r, rate: Number(e.target.value) || r.rate } }; return x; })} /></td>
                    <td>{c !== 'AED' && <button type="button" className="btn btn-sm btn-ghost" onClick={() => set((x) => { const n = { ...rates }; delete n[c]; x.rates = n; return x; })}>Remove</button>}</td></tr>
                ))}
              </tbody></table></div>
              <button type="button" className="btn" onClick={() => { const c = (prompt('Currency code, e.g. CAD') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3); if (c) set((x) => { x.rates = { ...rates, [c]: { rate: 1, symbol: `${c} `, name: c } }; return x; }); }}>+ Add currency</button>
            </div>
          )}

          {tab === 'notes' && (
            <div className="form">
              <Text label="Schedule date (shown under every estimate)" value={f.date} on={(v) => set((x) => { x.date = v || x.date; return x; })} full />
              <div className="field full"><label>Notes under the result (one per line)</label><textarea rows={6} defaultValue={f.assumptions.join('\n')} onBlur={(e) => set((x) => { x.assumptions = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean); return x; })} /></div>
            </div>
          )}
        </div>
        <div className="panel">
          <h2>Live check</h2>
          <p className="muted small">Property investor inside the UAE, main applicant, normal medical:</p>
          <div className="total"><span>Government fees</span><b>{aed(example + f.extraFees.filter((x) => (x.per === 'person' || x.per === 'adult' || x.per === 'main' || x.per === 'once') && (!x.routes.length || x.routes.includes('property'))).reduce((a, x) => a + x.aed, 0))}</b></div>
          <p className="small muted" style={{ marginTop: 10 }}>{f.routes.filter((r) => !r.hidden).length} routes · {f.addons.length} add-ons · {f.extraFees.length} extra fees · VAT {Math.round((f.vatRate ?? 0.05) * 100)}%</p>
          <p className="small muted" style={{ marginTop: 10 }}>Saved changes are live on the website calculator, the apply form and new quotes straight away.</p>
        </div>
      </div>
    </form>
  );
}
