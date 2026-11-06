import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { SITE } from '@/lib/site';

export type QuotePdf = {
  title?: string; label?: string; name?: string; ref?: string; desc: string; lines: [string, string][]; total: string; converted?: string | null;
  checklist?: string[]; timeline?: string[]; date: string; assumptions?: string[];
};

const GOLD = rgb(0.72, 0.55, 0.12), INK = rgb(0.05, 0.05, 0.05), SOFT = rgb(0.38, 0.32, 0.2), LINE = rgb(0.9, 0.84, 0.68);
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
  const doc = await PDFDocument.create();
  doc.setTitle(t(q.title ?? 'Abu Dhabi Golden Visa quote'));
  doc.setAuthor(SITE.operator);
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const serif = await doc.embedFont(StandardFonts.TimesRomanItalic);
  let page: PDFPage = doc.addPage([595, 842]);
  const W = 595, M = 48;
  let y = 842 - M;

  try {
    const logo = await doc.embedPng(await readFile(path.join(process.cwd(), 'public/brand/logo-pdf.png')));
    const h = 40, w = (logo.width / logo.height) * h;
    page.drawImage(logo, { x: M, y: y - h, width: w, height: h });
  } catch {}
  const LBL = t(q.label ?? 'QUOTATION');
  page.drawText(LBL, { x: W - M - bold.widthOfTextAtSize(LBL, 11), y: y - 14, size: 11, font: bold, color: GOLD });
  page.drawText(t(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })), { x: W - M - 120, y: y - 30, size: 9, font: reg, color: SOFT });
  y -= 70;

  const ensure = (need: number) => { if (y - need < M + 40) { page = doc.addPage([595, 842]); y = 842 - M; } };
  const text = (s: string, o: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number; width?: number; gap?: number } = {}) => {
    const size = o.size ?? 10, font = o.font ?? reg, x = o.x ?? M;
    for (const l of wrap(t(s, 600), font, size, o.width ?? W - 2 * M)) { ensure(size + 4); page.drawText(l, { x, y, size, font, color: o.color ?? INK }); y -= size + (o.gap ?? 4); }
  };

  text(q.title ?? 'Abu Dhabi Golden Visa estimate', { size: 22, font: serif });
  y -= 4;
  if (q.name) text(`Prepared for: ${q.name}`, { size: 11, font: bold });
  if (q.ref) text(`Reference: ${q.ref}`, { size: 10, color: SOFT });
  text(q.desc, { size: 10, color: SOFT });
  y -= 10;

  page.drawRectangle({ x: M, y: y - 4, width: W - 2 * M, height: 20, color: rgb(0.99, 0.95, 0.84) });
  page.drawText('Item', { x: M + 8, y: y + 2, size: 9, font: bold, color: SOFT });
  page.drawText('AED', { x: W - M - 8 - bold.widthOfTextAtSize('AED', 9), y: y + 2, size: 9, font: bold, color: SOFT });
  y -= 22;
  for (const [label, amount] of q.lines.slice(0, 80)) {
    const ls = wrap(t(label), reg, 10, W - 2 * M - 140);
    ensure(ls.length * 14 + 6);
    ls.forEach((l, i) => page.drawText(l, { x: M + 8, y: y - i * 13, size: 10, font: reg, color: INK }));
    const a = t(amount, 40);
    page.drawText(a, { x: W - M - 8 - reg.widthOfTextAtSize(a, 10), y, size: 10, font: reg, color: INK });
    y -= ls.length * 13 + 4;
    page.drawLine({ start: { x: M, y: y + 2 }, end: { x: W - M, y: y + 2 }, thickness: 0.5, color: LINE });
    y -= 6;
  }
  ensure(60);
  y -= 6;
  page.drawRectangle({ x: M, y: y - 26, width: W - 2 * M, height: 40, color: rgb(0.95, 0.85, 0.55) });
  page.drawText('Estimated total', { x: M + 12, y: y - 10, size: 11, font: bold, color: INK });
  const tt = t(q.total);
  page.drawText(tt, { x: W - M - 12 - bold.widthOfTextAtSize(tt, 16), y: y - 12, size: 16, font: bold, color: INK });
  y -= 44;
  if (q.converted) text(`${q.converted} (approximate, for information only)`, { size: 9, color: SOFT });
  y -= 8;

  if (q.timeline?.length) { text('Timeline', { size: 13, font: bold, color: GOLD }); q.timeline.forEach((s, i) => text(`${i + 1}. ${s}`, { size: 10 })); y -= 8; }
  if (q.checklist?.length) { text('Document checklist', { size: 13, font: bold, color: GOLD }); q.checklist.forEach((s) => text(`[  ]  ${s}`, { size: 10 })); y -= 8; }
  text('Assumptions', { size: 13, font: bold, color: GOLD });
  (q.assumptions ?? []).forEach((s) => text(`- ${s}`, { size: 9, color: SOFT }));
  text(`Government fee schedule dated ${q.date}. Fees can change; we confirm the final amount in writing before you pay.`, { size: 9, color: SOFT });
  text(SITE.disclaimer, { size: 9, font: bold, color: SOFT });

  for (const p of doc.getPages()) {
    p.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.5, color: LINE });
    p.drawText(t(`${SITE.operator} - Trade Licence ${SITE.licence} - ${SITE.office} - WhatsApp ${SITE.whatsappDisplay} - ${SITE.email}`), { x: M, y: 32, size: 7.5, font: reg, color: SOFT });
  }
  return doc.save();
}
