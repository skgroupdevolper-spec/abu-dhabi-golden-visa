import type { Metadata } from 'next';
import { ActionForm, Submit } from '@/components/dash/ActionForm';
import { FULL, requireAdmin } from '@/lib/server/auth';
import { getBlock, getSite } from '@/lib/server/settings';
import { BODY_FONTS, DEFAULT_DESIGN, HEADING_FONTS, cleanDesign, type Design } from '@/lib/design';
import { saveDesign } from '../../settings-actions';

export const metadata: Metadata = { title: 'Design & typography' };

function Num({ name, label, v, min, max, step = 1, unit = 'px' }: { name: string; label: string; v: number; min: number; max: number; step?: number; unit?: string }) {
  return <div className="field"><label htmlFor={name}>{label} <span className="muted">({unit})</span></label><input id={name} name={name} type="number" min={min} max={max} step={step} defaultValue={v} /></div>;
}

export default async function DesignPage() {
  await requireAdmin(FULL);
  const [site, saved] = await Promise.all([getSite(), getBlock<Partial<Design>>('design', DEFAULT_DESIGN)]);
  const d = cleanDesign(saved);
  const c = site.colors;
  const colors: [keyof typeof c, string][] = [['gold', 'Gold (buttons, accents)'], ['goldDeep', 'Deep gold (links, small headings)'], ['ink', 'Text colour'], ['paper', 'Page background']];
  return (
    <>
      <div className="topbar"><div><p className="eyebrow">Website</p><h1>Design &amp; typography</h1></div><a className="btn" href="/" target="_blank" rel="noopener">View website ↗</a></div>
      <ActionForm action={saveDesign} className="stack">
        <div className="grid2">
          <div className="panel">
            <h2>Typography</h2>
            <div className="form" style={{ marginTop: 12 }}>
              <div className="field"><label htmlFor="headingFont">Heading font</label><select id="headingFont" name="headingFont" defaultValue={d.headingFont}>{HEADING_FONTS.map((f) => <option key={f}>{f}</option>)}</select></div>
              <div className="field"><label htmlFor="bodyFont">Text font</label><select id="bodyFont" name="bodyFont" defaultValue={d.bodyFont}>{BODY_FONTS.map((f) => <option key={f}>{f}</option>)}</select></div>
              <Num name="baseSize" label="Text size" v={d.baseSize} min={13} max={22} />
              <Num name="lineHeight" label="Line height" v={d.lineHeight} min={1.2} max={2} step={0.05} unit="×" />
              <Num name="h1Size" label="Page title (H1) size" v={d.h1Size} min={28} max={110} />
              <Num name="h2Size" label="Section heading (H2) size" v={d.h2Size} min={20} max={80} />
              <Num name="h3Size" label="Small heading (H3) size" v={d.h3Size} min={16} max={44} />
              <div className="field"><label htmlFor="headingWeight">Heading weight</label><select id="headingWeight" name="headingWeight" defaultValue={d.headingWeight}>{[300, 400, 500, 600, 700, 800].map((w) => <option key={w} value={w}>{w}</option>)}</select></div>
              <Num name="letterSpacing" label="Heading letter spacing" v={d.letterSpacing} min={-0.06} max={0.1} step={0.005} unit="em" />
              <label className="switch full"><input type="checkbox" name="uppercaseEyebrow" defaultChecked={d.uppercaseEyebrow} /><span><b>Small headings in CAPITALS</b></span></label>
            </div>
          </div>
          <div className="panel">
            <h2>Shapes, shadows &amp; layout</h2>
            <div className="form" style={{ marginTop: 12 }}>
              <Num name="radius" label="Corner roundness" v={d.radius} min={0} max={40} />
              <div className="field"><label htmlFor="shadow">Shadows</label><select id="shadow" name="shadow" defaultValue={d.shadow}><option value="none">None</option><option value="soft">Soft</option><option value="medium">Medium</option><option value="strong">Strong</option></select></div>
              <div className="field"><label htmlFor="buttonShape">Button shape</label><select id="buttonShape" name="buttonShape" defaultValue={d.buttonShape}><option value="pill">Pill (round)</option><option value="rounded">Rounded</option><option value="square">Square</option></select></div>
              <div className="field"><label htmlFor="buttonSize">Button size</label><select id="buttonSize" name="buttonSize" defaultValue={d.buttonSize}><option value="s">Small</option><option value="m">Medium</option><option value="l">Large</option></select></div>
              <Num name="container" label="Content width" v={d.container} min={960} max={1800} step={10} />
              <Num name="sectionSpace" label="Space between sections" v={d.sectionSpace} min={0} max={120} />
            </div>
            <h2 style={{ marginTop: 20 }}>Colours</h2>
            <div className="form" style={{ marginTop: 12 }}>
              {colors.map(([k, label]) => (
                <div className="field" key={k}><label htmlFor={k}>{label}</label><div className="row"><input type="color" id={k} name={k} defaultValue={c[k]} style={{ width: 56, padding: 4 }} /><code className="k">{c[k]}</code></div></div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel">
          <h2>Custom CSS (whole website)</h2>
          <p className="help">Advanced styling for any element. Use the &quot;Extra CSS class&quot; option on a page section to target it here.</p>
          <textarea name="customCss" rows={12} className="mono" defaultValue={d.customCss} placeholder={'.phero h1 { letter-spacing: -0.03em; }\n.my-banner { background: #fffaf0; }'} style={{ marginTop: 10 }} />
        </div>
        <div><Submit>Save design</Submit></div>
      </ActionForm>
    </>
  );
}
