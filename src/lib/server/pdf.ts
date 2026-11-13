import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { SITE } from '@/lib/site';
import { docCfg, type PdfCfg } from './doccfg';

export type QuotePdf = {
  title?: string; label?: string; name?: string; ref?: string; desc: string; lines: [string, string][]; total: string; converted?: string | null;
  checklist?: string[]; timeline?: string[]; date: string; assumptions?: string[];
  /** Which document: picks the title and label set in Admin > Emails & PDFs. */
  kind?: 'quote' | 'receipt' | 'estimate';
  /** Preview with settings that are not saved yet. */
  cfg?: PdfCfg;
};
const hexRgb = (h: string) => { const n = parseInt(h.replace('#', ''), 16); return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };

let GOLD = rgb(0.72, 0.55, 0.12);
const INK = rgb(0.05, 0.05, 0.05), SOFT = rgb(0.38, 0.32, 0.2), LINE = rgb(0.9, 0.84, 0.68);
/** Standard PDF fonts only cover Latin-1; keep text safe. */
const t = (v: unknown, max = 160) =>
  String(v ?? '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/×/g, 'x').replace(/≈/g, 'approx.').replace(/·/g, '-').replace(/[^\x20-\x7E\xA0-\xFF]/g, '').slice(0, max);

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(' ')) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > width && line) { out.push(line); line = w; } else line = next;
  }
  if (line) out.push(line);
  return out;
}

export async function quotePdf(q: QuotePdf): Promise<Uint8Array> {
  const c = q.cfg ?? (await docCfg()).pdf;
  GOLD = /^#[0-9a-f]{6}$/i.test(c.accent) ? hexRgb(c.accent) : rgb(0.72, 0.55, 0.12);
  if (q.kind === 'quote') q = { ...q, title: c.quoteTitle || q.title, label: c.quoteLabel || q.label };
  if (q.kind === 'receipt') q = { ...q, title: c.receiptTitle || q.title, label: c.receiptLabel || q.label };
  const doc = await PDFDocument.create();
  doc.setTitle(t(q.title ?? 'Abu Dhabi Golden Visa quote'));
  doc.setAuthor(SITE.operator);
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const W = 595, H = 842, M = 50, CW = W - 2 * M;
  const CREAM = rgb(0.992, 0.973, 0.925), CREAM2 = rgb(0.98, 0.95, 0.87), WHITE = rgb(1, 1, 1);

  // footer text first: its height decides where the page body has to stop
  const footer = c.footer.trim() || [SITE.operator, SITE.licence ? `Trade Licence ${SITE.licence}` : '', SITE.office, SITE.whatsappDisplay ? `WhatsApp ${SITE.whatsappDisplay}` : '', SITE.email].filter(Boolean).join('  |  ');
  // wrap at the separators so no line ends with a stray "|"
  const flines = footer.split('\n').flatMap((l) => {
    const parts = t(l, 400).split(/\s+\|\s+|\s+-\s+/), out: string[] = [];
    let cur = '';
    for (const part of parts) { const nx = cur ? `${cur}  |  ${part}` : part; if (cur && reg.widthOfTextAtSize(nx, 7.5) > CW) { out.push(cur); cur = part; } else cur = nx; }
    if (cur) out.push(cur);
    return out.flatMap((x) => wrap(x, reg, 7.5, CW));
  }).slice(0, 3);
  const FOOT = 30 + flines.length * 11; // space kept free at the bottom of every page
  const BOTTOM = FOOT + 18;

  let page: PDFPage = doc.addPage([W, H]);
  let y = H - M;
  const newPage = () => { page = doc.addPage([W, H]); y = H - M; };
  const ensure = (need: number) => { if (y - need < BOTTOM) newPage(); };
  /** Paragraph with real line spacing; hanging indent for bullets. */
  const para = (s: string, o: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number; width?: number; lh?: number; bullet?: string; after?: number } = {}) => {
    const size = o.size ?? 10, font = o.font ?? reg, x = o.x ?? M, lh = o.lh ?? size * 1.5;
    const indent = o.bullet ? font.widthOfTextAtSize(o.bullet + ' ', size) + 2 : 0;
    const lines = wrap(t(s, 900), font, size, (o.width ?? CW) - indent);
    lines.forEach((l, i) => {
      ensure(lh);
      if (i === 0 && o.bullet) page.drawText(o.bullet, { x, y: y - size, size, font: o.bullet === '[  ]' ? reg : bold, color: GOLD });
      page.drawText(l, { x: x + indent, y: y - size, size, font, color: o.color ?? INK });
      y -= lh;
    });
    y -= o.after ?? 0;
  };
  const heading = (s: string) => {
    ensure(40);
    y -= 14;
    page.drawRectangle({ x: M, y: y - 13, width: 3, height: 14, color: GOLD });
    page.drawText(t(s), { x: M + 10, y: y - 12, size: 12.5, font: bold, color: INK });
    y -= 24;
  };

  /* ---- header ---- */
  let logoH = 0;
  if (c.showLogo) try {
    const logo = await doc.embedPng(await readFile(path.join(process.cwd(), 'public/brand/logo-pdf.png')));
    logoH = 44; const w = (logo.width / logo.height) * logoH;
    page.drawImage(logo, { x: M, y: y - logoH, width: w, height: logoH });
  } catch {}
  const LBL = t(q.label ?? 'QUOTATION');
  const lw = bold.widthOfTextAtSize(LBL, 9.5) + 24;
  page.drawRectangle({ x: W - M - lw, y: y - 22, width: lw, height: 22, color: INK });
  page.drawText(LBL, { x: W - M - lw + 12, y: y - 15, size: 9.5, font: bold, color: rgb(0.95, 0.84, 0.48) });
  if (c.showDate) { const d = t(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })); page.drawText(d, { x: W - M - reg.widthOfTextAtSize(d, 9), y: y - 38, size: 9, font: reg, color: SOFT }); }
  y -= Math.max(logoH, 44) + 14;
  page.drawRectangle({ x: M, y, width: CW, height: 1.6, color: GOLD });
  y -= 26;

  /* ---- title and client block ---- */
  para(q.title ?? 'Abu Dhabi Golden Visa estimate', { size: 24, font: serif, lh: 30, after: 8 });
  const facts: [string, string][] = [];
  if (q.name) facts.push(['Prepared for', q.name]);
  if (q.ref) facts.push(['Reference', q.ref]);
  if (facts.length) {
    const rowH = 30, boxH = 16 + Math.ceil(facts.length / 2) * rowH;
    ensure(boxH + 10);
    page.drawRectangle({ x: M, y: y - boxH, width: CW, height: boxH, color: CREAM, borderColor: LINE, borderWidth: 0.8 });
    facts.forEach(([k, v], i) => {
      const cx = M + 14 + (i % 2) * (CW / 2), cy = y - 12 - Math.floor(i / 2) * rowH;
      page.drawText(t(k.toUpperCase()), { x: cx, y: cy - 8, size: 7.5, font: bold, color: SOFT });
      const vv = wrap(t(v), bold, 10.5, CW / 2 - 24)[0] ?? '';
      page.drawText(vv, { x: cx, y: cy - 22, size: 10.5, font: bold, color: INK });
    });
    y -= boxH + 14;
  }
  if (q.desc) para(q.desc, { size: 10, color: SOFT, after: 4 });
  if (c.intro) c.intro.split('\n').forEach((l) => l.trim() && para(l, { size: 10, after: 2 }));
  y -= 10;

  /* ---- table ---- */
  const AW = 120; // amount column
  const head = () => {
    ensure(26 + 30);
    page.drawRectangle({ x: M, y: y - 24, width: CW, height: 24, color: INK });
    page.drawText(q.kind === 'receipt' ? 'DETAILS' : 'ITEM', { x: M + 12, y: y - 16, size: 8.5, font: bold, color: WHITE });
    const a = 'AED'; page.drawText(a, { x: W - M - 12 - bold.widthOfTextAtSize(a, 8.5), y: y - 16, size: 8.5, font: bold, color: rgb(0.95, 0.84, 0.48) });
    y -= 24;
  };
  head();
  q.lines.slice(0, 80).forEach(([label, amount], i) => {
    const ls = wrap(t(label), reg, 10, CW - AW - 24);
    const rh = 12 + ls.length * 14;
    if (y - rh < BOTTOM) { newPage(); head(); }
    if (i % 2 === 1) page.drawRectangle({ x: M, y: y - rh, width: CW, height: rh, color: CREAM });
    ls.forEach((l, k) => page.drawText(l, { x: M + 12, y: y - 6 - 10 - k * 14, size: 10, font: reg, color: INK }));
    const a = t(amount, 40);
    page.drawText(a, { x: W - M - 12 - reg.widthOfTextAtSize(a, 10), y: y - 16, size: 10, font: reg, color: INK });
    y -= rh;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: LINE });
  });

  /* ---- total ---- */
  ensure(64);
  y -= 12;
  page.drawRectangle({ x: M, y: y - 44, width: CW, height: 44, color: CREAM2, borderColor: GOLD, borderWidth: 1 });
  page.drawText(q.kind === 'receipt' ? 'Amount received' : 'Estimated total', { x: M + 14, y: y - 27, size: 11.5, font: bold, color: INK });
  const tt = t(q.total);
  page.drawText(tt, { x: W - M - 14 - bold.widthOfTextAtSize(tt, 16), y: y - 28, size: 16, font: bold, color: INK });
  y -= 56;
  if (q.converted) para(`${q.converted} (approximate, for information only)`, { size: 9, color: SOFT, after: 4 });

  /* ---- sections ---- */
  if (c.showTimeline && q.timeline?.length) { heading('Timeline'); q.timeline.forEach((s, i) => para(s, { bullet: `${i + 1}.`, after: 2 })); }
  if (c.showChecklist && q.checklist?.length) { heading('Document checklist'); q.checklist.forEach((s) => para(s, { bullet: '[  ]', after: 2 })); }
  if (c.notes && q.kind !== 'receipt') { heading('Notes'); c.notes.split('\n').forEach((l) => l.trim() && para(l, { after: 2 })); }
  if (c.showAssumptions && ((q.assumptions?.length ?? 0) > 0 || q.kind !== 'receipt')) {
    heading(q.kind === 'receipt' ? 'Details' : 'Assumptions');
    (q.assumptions ?? []).forEach((s) => para(s, { size: 9, color: SOFT, bullet: '-', after: 1 }));
    if (q.kind !== 'receipt') para(`Government fee schedule dated ${q.date}. Fees can change; we confirm the final amount in writing before you pay.`, { size: 9, color: SOFT });
  }
  if (c.showDisclaimer && SITE.disclaimer) { y -= 6; para(SITE.disclaimer, { size: 8.5, font: bold, color: SOFT }); }
  if (c.signName || c.signTitle) {
    ensure(80); y -= 40;
    page.drawLine({ start: { x: M, y }, end: { x: M + 190, y }, thickness: 0.7, color: INK });
    y -= 6;
    if (c.signName) para(c.signName, { size: 10.5, font: bold });
    if (c.signTitle) para(c.signTitle, { size: 9, color: SOFT });
  }

  /* ---- footer on every page ---- */
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const top = FOOT - 6;
    p.drawLine({ start: { x: M, y: top }, end: { x: W - M, y: top }, thickness: 0.6, color: LINE });
    flines.forEach((l, k) => p.drawText(l, { x: (W - reg.widthOfTextAtSize(l, 7.5)) / 2, y: top - 14 - k * 11, size: 7.5, font: reg, color: SOFT }));
    if (c.pageNumbers && pages.length > 1) { const n = `Page ${i + 1} of ${pages.length}`; p.drawText(n, { x: W - M - reg.widthOfTextAtSize(n, 7.5), y: top + 6, size: 7.5, font: reg, color: SOFT }); }
  });
  return doc.save();
}
