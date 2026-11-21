// Order and design of the built-in homepage sections. Each section sits in <div class="hs" data-hs="key">
// (display: contents), so it keeps its normal layout; a custom order turns the homepage into a column
// and gives each section's elements their place with `order`.
import { HOME_SECTIONS } from './blocks';
import { designCss, type SectionDesign } from './section-design';

export const HOME_KEYS = HOME_SECTIONS.map(([k]) => k).filter((k) => k !== 'top');

/** The saved order with any missing or unknown keys fixed. */
export function homeOrder(saved?: string[]): string[] {
  const known = (saved ?? []).filter((k) => HOME_KEYS.includes(k));
  return [...new Set([...known, ...HOME_KEYS.filter((k) => !known.includes(k))])];
}

/** The selector for the elements of one built-in section (not the sections added after it). */
export const homeSel = (k: string) => `.home [data-hs="${k.replace(/[^\w-]/g, '')}"]>:not(style):not(.home-blocks)`;

export function homeLayoutCss(order?: string[], styles?: Record<string, SectionDesign>): string {
  const out = ['.home .hs{display:contents}'];
  const list = homeOrder(order);
  if (order?.length && list.some((k, i) => k !== HOME_KEYS[i])) {
    out.push('.home{display:flex;flex-direction:column}.home>*{min-width:0}');
    list.forEach((k, i) => out.push(`.home [data-hs="${k}"]>*{order:${i + 1}}`));
    out.push('.home>style{order:999}');
  }
  for (const [k, d] of Object.entries(styles ?? {})) if (HOME_KEYS.includes(k)) out.push(designCss(homeSel(k), d));
  return out.filter(Boolean).join('\n');
}
