// Site-wide design system, editable in the admin (Design & colours): fonts, sizes, corners, shadows,
// buttons, layout width, spacing and custom CSS. Rendered as CSS in the page head.
export type Design = {
  headingFont: string; bodyFont: string; baseSize: number; h1Size: number; h2Size: number; h3Size: number; headingWeight: number;
  lineHeight: number; letterSpacing: number; radius: number; buttonShape: 'pill' | 'rounded' | 'square'; buttonSize: 's' | 'm' | 'l';
  shadow: 'none' | 'soft' | 'medium' | 'strong'; container: number; sectionSpace: number; uppercaseEyebrow: boolean; customCss: string;
};

export const DEFAULT_DESIGN: Design = {
  headingFont: 'Instrument Serif', bodyFont: 'Manrope', baseSize: 17, h1Size: 60, h2Size: 38, h3Size: 24, headingWeight: 400,
  lineHeight: 1.6, letterSpacing: -0.015, radius: 22, buttonShape: 'pill', buttonSize: 'm', shadow: 'soft', container: 1320, sectionSpace: 26, uppercaseEyebrow: true, customCss: '',
};

export const HEADING_FONTS = ['Instrument Serif', 'Playfair Display', 'Cormorant Garamond', 'DM Serif Display', 'Libre Baskerville', 'Lora', 'Marcellus', 'Cinzel', 'Poppins', 'Montserrat', 'Inter', 'Manrope', 'Raleway', 'Outfit'];
export const BODY_FONTS = ['Manrope', 'Inter', 'Poppins', 'Montserrat', 'Open Sans', 'Lato', 'Roboto', 'Nunito Sans', 'Raleway', 'DM Sans', 'Outfit', 'Source Sans 3'];
const BUILT_IN = ['Instrument Serif', 'Manrope'];

const n = (v: unknown, d: number, min: number, max: number) => { const x = Number(v); return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : d; };

export function cleanDesign(o?: Partial<Design>): Design {
  const d = { ...DEFAULT_DESIGN, ...o };
  return {
    headingFont: HEADING_FONTS.includes(d.headingFont) ? d.headingFont : DEFAULT_DESIGN.headingFont,
    bodyFont: BODY_FONTS.includes(d.bodyFont) ? d.bodyFont : DEFAULT_DESIGN.bodyFont,
    baseSize: n(d.baseSize, 17, 13, 22), h1Size: n(d.h1Size, 60, 28, 110), h2Size: n(d.h2Size, 38, 20, 80), h3Size: n(d.h3Size, 24, 16, 44),
    headingWeight: n(d.headingWeight, 400, 300, 800), lineHeight: n(d.lineHeight, 1.6, 1.2, 2), letterSpacing: n(d.letterSpacing, -0.015, -0.06, 0.1),
    radius: n(d.radius, 22, 0, 40), buttonShape: (['pill', 'rounded', 'square'] as const).includes(d.buttonShape) ? d.buttonShape : 'pill',
    buttonSize: (['s', 'm', 'l'] as const).includes(d.buttonSize) ? d.buttonSize : 'm',
    shadow: (['none', 'soft', 'medium', 'strong'] as const).includes(d.shadow) ? d.shadow : 'soft',
    container: n(d.container, 1320, 960, 1800), sectionSpace: n(d.sectionSpace, 26, 0, 120), uppercaseEyebrow: d.uppercaseEyebrow !== false,
    customCss: String(d.customCss ?? '').slice(0, 50000),
  };
}

/** Google Fonts stylesheet for fonts that are not built in, or '' when none is needed. */
export function fontHref(d: Design) {
  const fams = [d.headingFont, d.bodyFont].filter((f, i, a) => !BUILT_IN.includes(f) && a.indexOf(f) === i);
  if (!fams.length) return '';
  return `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800`).join('&')}&display=swap`;
}

const SHADOW = { none: 'none', soft: '0 24px 60px -30px rgba(0,0,0,.35)', medium: '0 30px 70px -28px rgba(0,0,0,.45)', strong: '0 40px 90px -30px rgba(0,0,0,.6)' };

export function designCss(d: Design) {
  const hf = d.headingFont === 'Instrument Serif' ? 'var(--font-display)' : `'${d.headingFont}'`;
  const bf = d.bodyFont === 'Manrope' ? 'var(--font-body)' : `'${d.bodyFont}'`;
  const btnR = d.buttonShape === 'pill' ? '999px' : d.buttonShape === 'rounded' ? '12px' : '0';
  const btnH = d.buttonSize === 's' ? 44 : d.buttonSize === 'l' ? 62 : 54;
  const def = JSON.stringify(cleanDesign({})) === JSON.stringify({ ...d, customCss: '' });
  const base = def ? '' : `
:root{--display:${hf},Georgia,serif;--body:${bf},system-ui,sans-serif;--radius:${d.radius}px;--shadow:${SHADOW[d.shadow]}}
body{font-size:${d.baseSize}px;line-height:${d.lineHeight}}
h1,h2,h3{font-weight:${d.headingWeight};letter-spacing:${d.letterSpacing}em}
.phero h1{font-size:clamp(30px,4.4vw,${d.h1Size}px)}
.bh h2,.block h2,.cta-band-in h2{font-size:clamp(22px,2.8vw,${d.h2Size}px)}
h3{font-size:${d.h3Size}px}
.btn{border-radius:${btnR};min-height:${btnH}px}
.wrap{max-width:${d.container}px}
.block{padding-block:${d.sectionSpace}px}
.facts,.card,.panel,.tbl,.doc-grid li,.req-grid li,.timeline li>div,.aw-card,.cta-band-in,.side-apply,.bk-card{border-radius:${d.radius}px}
.facts,.card,.side-apply{box-shadow:${SHADOW[d.shadow]}}
${d.uppercaseEyebrow ? '' : '.eyebrow{text-transform:none;letter-spacing:.02em}'}`;
  return (base + '\n' + d.customCss).replace(/<\/?style/gi, '');
}
