'use client';

// The design panel that opens under a section in the page builder: colours, background, text,
// spacing, boxes and visibility. Every change shows at once in the live preview.
import { DESIGN_GROUPS, type DField, type SectionDesign } from '@/lib/section-design';
import { MediaPicker } from './MediaPicker';

const HEX = /^#[0-9a-f]{6}$/i;

function Input({ f, v, set }: { f: DField; v: unknown; set: (v: unknown) => void }) {
  switch (f.kind) {
    case 'color': {
      const s = typeof v === 'string' ? v : '';
      return (
        <div className="dp-color">
          <input type="color" value={HEX.test(s) ? s : '#ffffff'} onChange={(e) => set(e.target.value)} aria-label={f.label} className={s ? '' : 'unset'} />
          <input type="text" value={s} placeholder="Website default" maxLength={9} onChange={(e) => set(e.target.value.trim())} />
        </div>
      );
    }
    case 'range': {
      const n = typeof v === 'number' ? v : null;
      return (
        <div className="dp-range">
          <input type="range" min={f.min} max={f.max} step={f.step} value={n ?? f.min ?? 0} className={n == null ? 'unset' : ''} onChange={(e) => set(Number(e.target.value))} aria-label={f.label} />
          <span>{n == null ? 'Default' : `${n}${f.unit ?? ''}`}</span>
        </div>
      );
    }
    case 'select':
      return <select value={typeof v === 'string' ? v : ''} onChange={(e) => set(e.target.value)}>{f.options?.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>;
    case 'check':
      return <label className="row small"><input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} /> {f.label}</label>;
    case 'image':
      return <MediaPicker value={typeof v === 'string' ? v : ''} onChange={(u) => set(u)} />;
    default:
      return null;
  }
}

export function DesignPanel({ value, onChange, title }: { value?: SectionDesign; onChange: (d: SectionDesign | undefined) => void; title?: string }) {
  const d = value ?? {};
  const set = (k: keyof SectionDesign, v: unknown) => {
    const next: Record<string, unknown> = { ...d, [k]: v };
    if (v === '' || v == null || v === false) delete next[k];
    onChange(Object.keys(next).length ? (next as SectionDesign) : undefined);
  };
  return (
    <div className="dp">
      <div className="dp-head">
        <span>🎨 {title ? <>Design of <b>{title}</b></> : 'Design of this section'}. Empty = website default. Changes show in the preview at once.</span>
        {Object.keys(d).length > 0 && <button type="button" className="btn btn-sm" onClick={() => { if (confirm('Reset the design of this section?')) onChange(undefined); }}>Reset all</button>}
      </div>
      {DESIGN_GROUPS.map((g) => {
        const fields = g.fields.filter((f) => !f.when || f.when(d));
        return (
          <fieldset key={g.title} className="dp-g">
            <legend>{g.title}</legend>
            <div className="dp-fields">
              {fields.map((f) => {
                const v = d[f.k];
                const isSet = v !== undefined && v !== '' && v !== false;
                return (
                  <div key={f.k} className={`field${f.half ? '' : ' full'}`}>
                    {f.kind !== 'check' && (
                      <label>{f.label}{isSet && f.kind !== 'select' && <button type="button" className="dp-x" onClick={() => set(f.k, undefined)} aria-label={`Reset ${f.label}`}>Reset</button>}</label>
                    )}
                    <Input f={f} v={v} set={(x) => set(f.k, x)} />
                  </div>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
