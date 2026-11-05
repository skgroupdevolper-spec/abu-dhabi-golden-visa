// Page builder: blocks (sections and widgets), their editable fields and style options.
// Used by the admin editor (client) and the public renderer (server).
import type { Section } from '@/content/types';

export type BlockStyle = {
  bg?: 'none' | 'white' | 'cream' | 'gold' | 'dark' | 'image';
  bgImage?: string;
  pad?: 'none' | 's' | 'm' | 'l' | 'xl';
  width?: 'narrow' | 'normal' | 'wide' | 'full';
  align?: 'left' | 'center';
  titleSize?: 's' | 'm' | 'l' | 'xl';
  radius?: 'none' | 's' | 'm' | 'l';
  shadow?: 'none' | 'soft' | 'strong';
  border?: boolean;
  anim?: 'none' | 'up' | 'fade' | 'zoom';
  anchor?: string;
  className?: string;
  hideMobile?: boolean;
  hideDesktop?: boolean;
  /** Homepage only: built-in section after which this block shows. */
  place?: string;
};

export type Block = { id: string; type: BlockType; hidden?: boolean; style?: BlockStyle; data: Record<string, unknown> };

export type BlockType =
  | 'hero' | 'text' | 'image' | 'imageText' | 'cards' | 'list' | 'steps' | 'table' | 'faq' | 'cta' | 'stats'
  | 'video' | 'gallery' | 'testimonials' | 'calculator' | 'eligibility' | 'lead' | 'apply' | 'html' | 'spacer' | 'divider';

export type FieldKind = 'text' | 'textarea' | 'md' | 'image' | 'link' | 'select' | 'number' | 'lines' | 'items' | 'table' | 'check';
export type Field = { k: string; label: string; kind: FieldKind; options?: [string, string][]; sub?: Field[]; help?: string };

const BTN: Field[] = [{ k: 'label', label: 'Button text', kind: 'text' }, { k: 'href', label: 'Button link', kind: 'link' }];

export const BLOCKS: Record<BlockType, { label: string; icon: string; group: 'Content' | 'Media' | 'Layout' | 'Widgets'; fields: Field[]; make: () => Record<string, unknown> }> = {
  hero: { label: 'Hero banner', icon: 'star', group: 'Content', fields: [
    { k: 'eyebrow', label: 'Small heading', kind: 'text' }, { k: 'title', label: 'Title', kind: 'text' }, { k: 'text', label: 'Text', kind: 'textarea' },
    { k: 'image', label: 'Image', kind: 'image' }, { k: 'layout', label: 'Layout', kind: 'select', options: [['split', 'Text left, image right'], ['center', 'Centred'], ['cover', 'Image behind text']] },
    { k: 'b1', label: 'Main button', kind: 'items', sub: BTN }, { k: 'b2', label: 'Second button', kind: 'items', sub: BTN },
  ], make: () => ({ eyebrow: 'Abu Dhabi Golden Visa', title: 'Your new section title', text: 'Write a short introduction here.', layout: 'split', b1: [{ label: 'Apply Now', href: '/apply/' }], b2: [] }) },
  text: { label: 'Text', icon: 'text', group: 'Content', fields: [{ k: 'title', label: 'Heading', kind: 'text' }, { k: 'body', label: 'Text (Markdown: ## heading, - list, **bold**, [link](/page/))', kind: 'md' }], make: () => ({ title: 'New heading', body: 'Write your text here.' }) },
  image: { label: 'Image', icon: 'image', group: 'Media', fields: [{ k: 'src', label: 'Image', kind: 'image' }, { k: 'alt', label: 'Alt text (for Google and screen readers)', kind: 'text' }, { k: 'caption', label: 'Caption', kind: 'text' }, { k: 'href', label: 'Link (optional)', kind: 'link' }], make: () => ({ src: '', alt: '', caption: '' }) },
  imageText: { label: 'Image + text', icon: 'layout', group: 'Content', fields: [
    { k: 'title', label: 'Heading', kind: 'text' }, { k: 'body', label: 'Text (Markdown)', kind: 'md' }, { k: 'image', label: 'Image', kind: 'image' }, { k: 'alt', label: 'Image alt text', kind: 'text' },
    { k: 'side', label: 'Image side', kind: 'select', options: [['right', 'Right'], ['left', 'Left']] }, { k: 'b1', label: 'Button', kind: 'items', sub: BTN },
  ], make: () => ({ title: 'Heading', body: 'Text next to the image.', image: '', side: 'right', b1: [] }) },
  cards: { label: 'Cards', icon: 'grid', group: 'Content', fields: [
    { k: 'title', label: 'Heading', kind: 'text' }, { k: 'intro', label: 'Introduction', kind: 'textarea' },
    { k: 'cols', label: 'Columns', kind: 'select', options: [['2', '2'], ['3', '3'], ['4', '4']] },
    { k: 'items', label: 'Cards', kind: 'items', sub: [{ k: 'title', label: 'Title', kind: 'text' }, { k: 'text', label: 'Text', kind: 'textarea' }, { k: 'href', label: 'Link', kind: 'link' }, { k: 'image', label: 'Image (optional)', kind: 'image' }, { k: 'icon', label: 'Icon', kind: 'select', options: [['star', 'Star'], ['home', 'Home'], ['briefcase', 'Business'], ['user', 'Person'], ['family', 'Family'], ['cap', 'Education'], ['shield', 'Shield'], ['doc', 'Document'], ['globe', 'Globe'], ['coins', 'Money'], ['clock', 'Clock'], ['check', 'Check']] }] },
  ], make: () => ({ title: 'Heading', cols: '3', items: [{ title: 'Card title', text: 'Card text', href: '/golden-visa/', icon: 'star' }] }) },
  list: { label: 'Checklist', icon: 'check', group: 'Content', fields: [{ k: 'title', label: 'Heading', kind: 'text' }, { k: 'intro', label: 'Introduction', kind: 'textarea' }, { k: 'items', label: 'Items (one per line)', kind: 'lines' }, { k: 'style', label: 'Look', kind: 'select', options: [['ticks', 'Ticks'], ['docs', 'Documents'], ['cards', 'Numbered cards']] }], make: () => ({ title: 'What you need', items: ['First item', 'Second item'], style: 'ticks' }) },
  steps: { label: 'Steps / timeline', icon: 'clock', group: 'Content', fields: [{ k: 'title', label: 'Heading', kind: 'text' }, { k: 'intro', label: 'Introduction', kind: 'textarea' }, { k: 'items', label: 'Steps', kind: 'items', sub: [{ k: 'title', label: 'Step title', kind: 'text' }, { k: 'text', label: 'Step text', kind: 'textarea' }] }, { k: 'note', label: 'Note under the steps', kind: 'text' }], make: () => ({ title: 'How it works', items: [{ title: 'Step one', text: 'What happens' }] }) },
  table: { label: 'Table / prices', icon: 'coins', group: 'Content', fields: [{ k: 'title', label: 'Heading', kind: 'text' }, { k: 'intro', label: 'Introduction', kind: 'textarea' }, { k: 'table', label: 'Table (first row = headings, columns separated by |)', kind: 'table' }, { k: 'note', label: 'Note under the table', kind: 'text' }], make: () => ({ title: 'Fees', table: 'Item | AED\nGovernment fee | 0.00' }) },
  faq: { label: 'FAQs', icon: 'question', group: 'Content', fields: [{ k: 'title', label: 'Heading', kind: 'text' }, { k: 'items', label: 'Questions', kind: 'items', sub: [{ k: 'q', label: 'Question', kind: 'text' }, { k: 'a', label: 'Answer', kind: 'textarea' }] }], make: () => ({ title: 'Frequently asked questions', items: [{ q: 'Question?', a: 'Answer.' }] }) },
  cta: { label: 'Call to action', icon: 'bolt', group: 'Content', fields: [{ k: 'title', label: 'Heading', kind: 'text' }, { k: 'text', label: 'Text', kind: 'textarea' }, { k: 'b1', label: 'Main button', kind: 'items', sub: BTN }, { k: 'b2', label: 'Second button', kind: 'items', sub: BTN }], make: () => ({ title: 'Ready to apply?', text: 'Start online in a few minutes.', b1: [{ label: 'Apply Now', href: '/apply/' }], b2: [{ label: 'WhatsApp us', href: 'wa' }] }) },
  stats: { label: 'Numbers', icon: 'chart', group: 'Content', fields: [{ k: 'items', label: 'Numbers', kind: 'items', sub: [{ k: 'value', label: 'Number', kind: 'text' }, { k: 'label', label: 'Label', kind: 'text' }] }], make: () => ({ items: [{ value: '10 years', label: 'Residency' }, { value: 'AED 2M', label: 'Property route' }, { value: '20', label: 'Languages' }] }) },
  video: { label: 'Video', icon: 'video', group: 'Media', fields: [{ k: 'title', label: 'Heading', kind: 'text' }, { k: 'url', label: 'YouTube link or MP4 link', kind: 'text' }], make: () => ({ title: '', url: '' }) },
  gallery: { label: 'Gallery', icon: 'image', group: 'Media', fields: [{ k: 'title', label: 'Heading', kind: 'text' }, { k: 'images', label: 'Images', kind: 'items', sub: [{ k: 'src', label: 'Image', kind: 'image' }, { k: 'alt', label: 'Alt text', kind: 'text' }] }], make: () => ({ title: 'Gallery', images: [] }) },
  testimonials: { label: 'Client reviews', icon: 'quote', group: 'Widgets', fields: [{ k: 'title', label: 'Heading', kind: 'text' }], make: () => ({ title: 'What our clients say' }) },
  calculator: { label: 'Cost calculator', icon: 'calc', group: 'Widgets', fields: [{ k: 'title', label: 'Heading', kind: 'text' }, { k: 'intro', label: 'Introduction', kind: 'textarea' }], make: () => ({ title: 'Calculate your cost' }) },
  eligibility: { label: 'Eligibility checker', icon: 'check', group: 'Widgets', fields: [{ k: 'title', label: 'Heading', kind: 'text' }, { k: 'intro', label: 'Introduction', kind: 'textarea' }], make: () => ({ title: 'Check your eligibility' }) },
  lead: { label: 'Enquiry form', icon: 'mail', group: 'Widgets', fields: [{ k: 'title', label: 'Heading', kind: 'text' }, { k: 'intro', label: 'Introduction', kind: 'textarea' }], make: () => ({ title: 'Ask an advisor' }) },
  apply: { label: 'Online application', icon: 'folder', group: 'Widgets', fields: [{ k: 'title', label: 'Heading', kind: 'text' }], make: () => ({ title: 'Apply online' }) },
  html: { label: 'Custom HTML / embed', icon: 'layout', group: 'Widgets', fields: [{ k: 'html', label: 'HTML (maps, forms, embeds)', kind: 'textarea' }], make: () => ({ html: '<p>Your HTML</p>' }) },
  spacer: { label: 'Space', icon: 'down', group: 'Layout', fields: [{ k: 'size', label: 'Height (px)', kind: 'number' }], make: () => ({ size: 40 }) },
  divider: { label: 'Divider line', icon: 'menu', group: 'Layout', fields: [], make: () => ({}) },
};

export const STYLE_FIELDS: Field[] = [
  { k: 'bg', label: 'Background', kind: 'select', options: [['none', 'None'], ['white', 'White card'], ['cream', 'Cream'], ['gold', 'Gold tint'], ['dark', 'Black'], ['image', 'Image']] },
  { k: 'bgImage', label: 'Background image', kind: 'image' },
  { k: 'pad', label: 'Spacing', kind: 'select', options: [['m', 'Normal'], ['none', 'None'], ['s', 'Small'], ['l', 'Large'], ['xl', 'Extra large']] },
  { k: 'width', label: 'Width', kind: 'select', options: [['normal', 'Normal'], ['narrow', 'Narrow (reading)'], ['wide', 'Wide'], ['full', 'Full screen']] },
  { k: 'align', label: 'Text alignment', kind: 'select', options: [['left', 'Left'], ['center', 'Centre']] },
  { k: 'titleSize', label: 'Heading size', kind: 'select', options: [['m', 'Medium'], ['s', 'Small'], ['l', 'Large'], ['xl', 'Extra large']] },
  { k: 'radius', label: 'Corners', kind: 'select', options: [['m', 'Rounded'], ['none', 'Square'], ['s', 'Slightly rounded'], ['l', 'Very rounded']] },
  { k: 'shadow', label: 'Shadow', kind: 'select', options: [['none', 'None'], ['soft', 'Soft'], ['strong', 'Strong']] },
  { k: 'border', label: 'Gold border', kind: 'check' },
  { k: 'anim', label: 'Animation', kind: 'select', options: [['up', 'Slide up'], ['none', 'None'], ['fade', 'Fade in'], ['zoom', 'Zoom in']] },
  { k: 'anchor', label: 'Anchor name (for #links)', kind: 'text' },
  { k: 'className', label: 'Extra CSS class', kind: 'text' },
  { k: 'hideMobile', label: 'Hide on mobile', kind: 'check' },
  { k: 'hideDesktop', label: 'Hide on desktop', kind: 'check' },
];

/** Built-in homepage sections: they can be hidden, and new blocks placed after any of them. */
export const HOME_SECTIONS: [string, string][] = [
  ['top', 'Very top (before the hero)'], ['hero', 'Hero with route finder'], ['band', 'Moving “Abu Dhabi Golden Visa” band'], ['manifesto', 'Manifesto text'], ['routes', 'Visa routes cards'],
  ['eligibility', 'Eligibility checker'], ['services', 'Services grid'], ['journey', 'Journey steps'], ['portal', 'Client portal promo'], ['calculator', 'Cost calculator'],
  ['family', 'Family band'], ['why', 'Why choose us'], ['partners', 'Partner logos'], ['benefits', 'Benefits'], ['faq', 'FAQs'], ['guides', 'Guides'],
  ['reviews', 'Reviews'], ['contact', 'Contact form'], ['finale', 'Final call to action'],
];

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Turns the built-in page sections into editable blocks. */
export function sectionsToBlocks(sections: Section[]): Block[] {
  return sections.map((s): Block => {
    const id = uid();
    switch (s.type) {
      case 'text': return { id, type: 'text', data: { title: s.title, body: s.body.join('\n\n') } };
      case 'list': return { id, type: 'list', data: { title: s.title, intro: s.intro ?? '', items: s.items, style: s.style ?? '' } };
      case 'table': return { id, type: 'table', data: { title: s.title, intro: s.intro ?? '', table: [s.head, ...s.rows].map((r) => r.join(' | ')).join('\n'), note: s.note ?? '' } };
      case 'steps': return { id, type: 'steps', data: { title: s.title, intro: s.intro ?? '', items: s.items, note: s.note ?? '' } };
      case 'cards': return { id, type: 'cards', data: { title: s.title, intro: s.intro ?? '', cols: '3', items: s.items.map((i) => ({ ...i, icon: '' })) } };
      case 'faq': return { id, type: 'faq', data: { title: s.title, items: s.items } };
      case 'tool': return { id, type: s.tool === 'calculator' ? 'calculator' : s.tool === 'eligibility' ? 'eligibility' : s.tool === 'apply' ? 'apply' : 'lead', data: { title: s.title ?? '', intro: s.intro ?? '' } };
      case 'html': return { id, type: 'html', data: { html: s.html, title: s.title ?? '' } };
    }
  });
}

export const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
export const arr = <T = Record<string, string>>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Converts block data back into a standard section where one exists (reuses the site's section design). */
export function blockToSection(b: Block): Section | null {
  const d = b.data;
  switch (b.type) {
    case 'list': return { type: 'list', title: str(d.title), intro: str(d.intro) || undefined, items: arr<string>(d.items).map(str).filter(Boolean), style: (['docs', 'cards', 'ticks'].includes(str(d.style)) ? str(d.style) : undefined) as 'docs' | 'cards' | 'ticks' | undefined };
    case 'steps': return { type: 'steps', title: str(d.title), intro: str(d.intro) || undefined, items: arr<{ title: string; text: string }>(d.items), note: str(d.note) || undefined };
    case 'table': {
      const rows = str(d.table).split('\n').map((r) => r.split('|').map((c) => c.trim())).filter((r) => r.some(Boolean));
      return { type: 'table', title: str(d.title), intro: str(d.intro) || undefined, head: rows[0] ?? [], rows: rows.slice(1), note: str(d.note) || undefined };
    }
    case 'faq': return { type: 'faq', title: str(d.title), items: arr<{ q: string; a: string }>(d.items).filter((x) => x.q) };
    case 'calculator': return { type: 'tool', tool: 'calculator', title: str(d.title) || undefined, intro: str(d.intro) || undefined };
    case 'eligibility': return { type: 'tool', tool: 'eligibility', title: str(d.title) || undefined, intro: str(d.intro) || undefined };
    case 'lead': return { type: 'tool', tool: 'lead', title: str(d.title) || undefined, intro: str(d.intro) || undefined };
    case 'apply': return { type: 'tool', tool: 'apply', title: str(d.title) || undefined };
    default: return null;
  }
}
