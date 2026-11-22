import 'server-only';
import { quotePdf } from '@/lib/server/pdf';
import { CHECKLISTS, TIMELINE } from '@/lib/checklists';
import { ROUTES } from '@/lib/fees';
import { money } from '@/lib/stages';
import { getFees } from '@/lib/server/store';
import type { Application } from '@/lib/server/store';
import { BRAND_NAME } from '@/lib/brand';

/** The quotation PDF of a file: the same one the client downloads, sent with the email and on WhatsApp. */
export async function quotePdfFor(a: Application) {
  const fees = await getFees();
  const gov = a.quote.lines.reduce((s, l) => s + l.amount, 0);
  const lines: [string, string][] = [
    ...a.quote.lines.map((l): [string, string] => [(l.qty ?? 1) > 1 ? `${l.label} (${l.qty} × ${(l.unit ?? l.amount / (l.qty ?? 1)).toFixed(2)})` : l.label, l.amount.toFixed(2)]),
    ...(a.quote.serviceFee ? [['Service fee', a.quote.serviceFee.toFixed(2)] as [string, string], ['VAT 5% on service fee', a.quote.vat.toFixed(2)] as [string, string]] : []),
    ['Health insurance', a.quote.insurance],
  ];
  const route = ROUTES.find((r) => r.label === a.route)?.id ?? 'property';
  const pdf = await quotePdf({
    kind: 'quote', title: `${BRAND_NAME} quotation`, name: a.client.name, ref: a.ref,
    desc: `${a.route} - ${a.location === 'in' ? 'Inside the UAE' : 'Outside the UAE'} - ${1 + a.adults + a.kids} people`,
    lines, total: money(gov + a.quote.serviceFee + a.quote.vat), checklist: CHECKLISTS[route], timeline: TIMELINE, date: fees.date, assumptions: fees.assumptions,
  });
  return pdf;
}
