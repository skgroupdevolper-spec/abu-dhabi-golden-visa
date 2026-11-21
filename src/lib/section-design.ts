// Design of one section (page-builder block or built-in homepage part): colours, background,
// typography, spacing, boxes and visibility. Turned into CSS for the public page and for the live
// preview in the admin (both use designCss, so the preview matches the website exactly).

export type SectionDesign = {
  bgType?: '' | 'color' | 'gradient' | 'image';
  bgColor?: string; bgColor2?: string; bgAngle?: number;
  bgImage?: string; overlayColor?: string; overlay?: number; bgPos?: '' | 'top' | 'center' | 'bottom'; parallax?: boolean;
  headingColor?: string; textColor?: string; accentColor?: string; linkColor?: string;
  align?: '' | 'left' | 'center' | 'right';
  headingSize?: number; textSize?: number;
  padTop?: number; padBottom?: number; padTopM?: number; padBottomM?: number; maxWidth?: number;
  boxStyle?: '' | 'glass' | 'glass-dark' | 'solid' | 'outline' | 'elevated' | 'flat';
  boxBg?: string; boxBorder?: string; boxRadius?: number;
  hover?: '' | 'lift' | 'glow' | 'scale' | 'none';
  sectionRadius?: number; goldLine?: boolean;
  hideMobile?: boolean; hideDesktop?: boolean;
};

export type DField = { k: keyof SectionDesign; label: string; kind: 'color' | 'range' | 'select' | 'check' | 'image'; min?: number; max?: number; step?: number; unit?: string; options?: [string, string][]; half?: boolean; when?: (d: SectionDesign) => boolean };
export type DGroup = { title: string; fields: DField[] };

/** The design panel shown under every section (same groups as the editor in the reference project). */
export const DESIGN_GROUPS: DGroup[] = [
  { title: 'Background', fields: [
    { k: 'bgType', label: 'Background type', kind: 'select', options: [['', 'Website default'], ['color', 'Solid colour'], ['gradient', 'Gradient'], ['image', 'Photo']] },
    { k: 'bgColor', label: 'Colour', kind: 'color', half: true, when: (d) => d.bgType === 'color' || d.bgType === 'gradient' },
    { k: 'bgColor2', label: 'Second colour', kind: 'color', half: true, when: (d) => d.bgType === 'gradient' },
    { k: 'bgAngle', label: 'Gradient angle', kind: 'range', min: 0, max: 360, step: 5, unit: '°', when: (d) => d.bgType === 'gradient' },
    { k: 'bgImage', label: 'Background photo', kind: 'image', when: (d) => d.bgType === 'image' },
    { k: 'overlayColor', label: 'Darken colour', kind: 'color', half: true, when: (d) => d.bgType === 'image' },
    { k: 'overlay', label: 'Darken the photo', kind: 'range', min: 0, max: 95, step: 5, unit: '%', half: true, when: (d) => d.bgType === 'image' },
    { k: 'bgPos', label: 'Photo position', kind: 'select', options: [['', 'Centre'], ['top', 'Top'], ['bottom', 'Bottom']], half: true, when: (d) => d.bgType === 'image' },
    { k: 'parallax', label: 'Photo stays still while scrolling', kind: 'check', when: (d) => d.bgType === 'image' },
  ] },
  { title: 'Text & colours', fields: [
    { k: 'headingColor', label: 'Headings', kind: 'color', half: true },
    { k: 'textColor', label: 'Text', kind: 'color', half: true },
    { k: 'accentColor', label: 'Buttons & highlights', kind: 'color', half: true },
    { k: 'linkColor', label: 'Links', kind: 'color', half: true },
    { k: 'align', label: 'Text alignment', kind: 'select', options: [['', 'Website default'], ['left', 'Left'], ['center', 'Centre'], ['right', 'Right']] },
    { k: 'headingSize', label: 'Heading size', kind: 'range', min: 18, max: 96, step: 1, unit: 'px', half: true },
    { k: 'textSize', label: 'Text size', kind: 'range', min: 12, max: 24, step: 1, unit: 'px', half: true },
  ] },
  { title: 'Spacing', fields: [
    { k: 'padTop', label: 'Space above (computer)', kind: 'range', min: 0, max: 240, step: 4, unit: 'px', half: true },
    { k: 'padBottom', label: 'Space below (computer)', kind: 'range', min: 0, max: 240, step: 4, unit: 'px', half: true },
    { k: 'padTopM', label: 'Space above (phone)', kind: 'range', min: 0, max: 160, step: 4, unit: 'px', half: true },
    { k: 'padBottomM', label: 'Space below (phone)', kind: 'range', min: 0, max: 160, step: 4, unit: 'px', half: true },
    { k: 'maxWidth', label: 'Content width', kind: 'range', min: 480, max: 1800, step: 20, unit: 'px' },
  ] },
  { title: 'Boxes & cards', fields: [
    { k: 'boxStyle', label: 'Box style', kind: 'select', options: [['', 'Website default'], ['glass', 'Glass (frosted)'], ['glass-dark', 'Dark glass'], ['solid', 'Solid'], ['outline', 'Outline'], ['elevated', 'Raised with shadow'], ['flat', 'Flat (no box)']] },
    { k: 'boxBg', label: 'Box colour', kind: 'color', half: true },
    { k: 'boxBorder', label: 'Box border', kind: 'color', half: true },
    { k: 'boxRadius', label: 'Box corners', kind: 'range', min: 0, max: 48, step: 1, unit: 'px', half: true },
    { k: 'hover', label: 'Box hover effect', kind: 'select', options: [['', 'Website default'], ['lift', 'Lift up'], ['glow', 'Gold glow'], ['scale', 'Zoom'], ['none', 'None']], half: true },
  ] },
  { title: 'Section frame & visibility', fields: [
    { k: 'sectionRadius', label: 'Rounded section corners', kind: 'range', min: 0, max: 64, step: 2, unit: 'px', half: true },
    { k: 'goldLine', label: 'Thin gold line on top', kind: 'check', half: true },
    { k: 'hideMobile', label: 'Hide on phones', kind: 'check', half: true },
    { k: 'hideDesktop', label: 'Hide on computers', kind: 'check', half: true },
  ] },
];

const COLOR = /^#[0-9a-f]{3,8}$/i;
const col = (v: unknown) => (typeof v === 'string' && COLOR.test(v.trim()) ? v.trim() : '');
const num = (v: unknown, min: number, max: number) => { const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN; return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null; };
const url = (v: unknown) => (typeof v === 'string' && /^(\/|https:\/\/)[^\s"'()<>\\]*$/.test(v.trim()) ? v.trim() : '');
const rgba = (hex: string, a: number) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** True when the design changes anything. */
export const hasDesign = (d?: SectionDesign | null) => !!d && Object.entries(d).some(([, v]) => v !== '' && v != null && v !== false);

/** CSS for one section. `sel` is the section element (for example [data-bid="x1"]). */
export function designCss(sel: string, d?: SectionDesign | null): string {
  if (!hasDesign(d)) return '';
  const x = d!;
  const out: string[] = [];
  const self: string[] = [];
  const mobile: string[] = [];
  const box = `${sel} .card,${sel} .glass,${sel} .bk-card,${sel} .step,${sel} .route,${sel} .faq-item,${sel} details,${sel} .tile`;
  const c1 = col(x.bgColor), c2 = col(x.bgColor2);
  if (x.bgType === 'color' && c1) self.push(`background:${c1}!important`);
  if (x.bgType === 'gradient' && c1) self.push(`background:linear-gradient(${num(x.bgAngle, 0, 360) ?? 135}deg,${c1},${c2 || c1})!important`);
  const img = url(x.bgImage);
  if (x.bgType === 'image' && img) {
    const a = (num(x.overlay, 0, 95) ?? 45) / 100;
    const oc = col(x.overlayColor) || '#000000';
    self.push(`background-image:linear-gradient(${rgba(oc, a)},${rgba(oc, a)}),url("${img}")!important`, `background-size:cover!important`, `background-position:center ${x.bgPos || 'center'}!important`);
    if (x.parallax) self.push('background-attachment:fixed');
  }
  if (num(x.sectionRadius, 0, 64) != null) self.push(`border-radius:${num(x.sectionRadius, 0, 64)}px`, 'overflow:hidden');
  if (x.goldLine) self.push(`border-top:3px solid ${col(x.accentColor) || 'var(--gold,#d4af37)'}`);
  const pt = num(x.padTop, 0, 400), pb = num(x.padBottom, 0, 400);
  if (pt != null) self.push(`padding-top:${pt}px!important`);
  if (pb != null) self.push(`padding-bottom:${pb}px!important`);
  if (x.align) self.push(`text-align:${x.align}`);
  const tc = col(x.textColor);
  if (tc) self.push(`color:${tc}`);
  const ac = col(x.accentColor);
  if (ac) self.push(`--gold:${ac}`, `--gold-deep:${ac}`);
  const ts = num(x.textSize, 10, 30);
  if (self.length) out.push(`${sel}{${self.join(';')}}`);
  if (tc) out.push(`${sel} p,${sel} li,${sel} .lead,${sel} .intro,${sel} small,${sel} td,${sel} th,${sel} figcaption,${sel} blockquote{color:${tc}}`);
  if (ts != null) out.push(`${sel} p,${sel} li,${sel} .lead,${sel} .intro,${sel} td{font-size:${ts}px}`);
  const hc = col(x.headingColor), hs = num(x.headingSize, 14, 120);
  if (hc || hs != null) out.push(`${sel} h1,${sel} h2,${sel} h3,${sel} .bk-hero-h{${hc ? `color:${hc};-webkit-text-fill-color:${hc};background:none;` : ''}${hs != null ? `font-size:${hs}px;line-height:1.15` : ''}}`);
  if (hs != null) out.push(`${sel} h3{font-size:${Math.round(hs * 0.55)}px}`);
  if (ac) out.push(`${sel} .btn-gold,${sel} .btn-primary{background:${ac}!important;border-color:${ac}!important;color:#fff}`, `${sel} .eyebrow,${sel} .gold,${sel} em{color:${ac}}`);
  const lc = col(x.linkColor);
  if (lc) out.push(`${sel} a:not(.btn){color:${lc}}`);
  if (x.align === 'center') out.push(`${sel} .cta,${sel} .bk-btns{justify-content:center}`);
  const mw = num(x.maxWidth, 320, 2400);
  if (mw != null) out.push(`${sel} .wrap,${sel} .bk-in{max-width:${mw}px;margin-inline:auto}`);
  const bb = col(x.boxBg), bo = col(x.boxBorder), br = num(x.boxRadius, 0, 60);
  const bs: string[] = [];
  switch (x.boxStyle) {
    case 'glass': bs.push('background:rgba(255,255,255,.55)', 'backdrop-filter:blur(14px)', '-webkit-backdrop-filter:blur(14px)', 'border:1px solid rgba(255,255,255,.6)'); break;
    case 'glass-dark': bs.push('background:rgba(13,13,13,.55)', 'backdrop-filter:blur(14px)', '-webkit-backdrop-filter:blur(14px)', 'border:1px solid rgba(255,255,255,.12)', 'color:#fff'); break;
    case 'solid': bs.push('background:#fff', 'border:1px solid rgba(0,0,0,.06)', 'box-shadow:none'); break;
    case 'outline': bs.push('background:transparent', 'border:1.5px solid currentColor', 'box-shadow:none'); break;
    case 'elevated': bs.push('background:#fff', 'border:0', 'box-shadow:0 18px 44px rgba(0,0,0,.12)'); break;
    case 'flat': bs.push('background:transparent', 'border:0', 'box-shadow:none', 'backdrop-filter:none'); break;
  }
  if (bb) bs.push(`background:${bb}`);
  if (bo) bs.push(`border:1px solid ${bo}`);
  if (br != null) bs.push(`border-radius:${br}px`);
  if (bs.length) out.push(`${box}{${bs.map((r) => `${r}!important`).join(';')}}`);
  if (x.hover === 'lift') out.push(`${box}{transition:transform .25s,box-shadow .25s}${box.split(',').map((b) => `${b}:hover`).join(',')}{transform:translateY(-6px);box-shadow:0 18px 40px rgba(0,0,0,.14)}`);
  if (x.hover === 'glow') out.push(`${box}{transition:box-shadow .25s}${box.split(',').map((b) => `${b}:hover`).join(',')}{box-shadow:0 0 0 2px ${ac || '#d4af37'},0 12px 36px ${rgba(ac || '#d4af37', 0.35)}}`);
  if (x.hover === 'scale') out.push(`${box}{transition:transform .25s}${box.split(',').map((b) => `${b}:hover`).join(',')}{transform:scale(1.03)}`);
  if (x.hover === 'none') out.push(`${box.split(',').map((b) => `${b}:hover`).join(',')}{transform:none!important;box-shadow:inherit}`);
  const ptm = num(x.padTopM, 0, 300), pbm = num(x.padBottomM, 0, 300);
  if (ptm != null) mobile.push(`padding-top:${ptm}px!important`);
  if (pbm != null) mobile.push(`padding-bottom:${pbm}px!important`);
  if (x.hideMobile) mobile.push('display:none!important');
  if (mobile.length) out.push(`@media (max-width:760px){${sel}{${mobile.join(';')}}}`);
  if (x.parallax) out.push(`@media (max-width:760px){${sel}{background-attachment:scroll}}`);
  if (x.hideDesktop) out.push(`@media (min-width:761px){${sel}{display:none!important}}`);
  return out.join('\n');
}

/** Keeps only known design keys with safe values (used when saving). */
export function cleanDesign(d: unknown): SectionDesign | undefined {
  if (!d || typeof d !== 'object') return undefined;
  const keys = new Set(DESIGN_GROUPS.flatMap((g) => g.fields.map((f) => f.k)));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d as Record<string, unknown>)) {
    if (!keys.has(k as keyof SectionDesign)) continue;
    if (typeof v === 'boolean') { if (v) out[k] = true; }
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'string' && v.trim() && v.length < 500) out[k] = v.trim();
  }
  return Object.keys(out).length ? (out as SectionDesign) : undefined;
}
