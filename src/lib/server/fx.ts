// Exchange rates for showing prices in the visitor's currency. Prices are always set in AED; other
// currencies are approximate. Live rates come from open.er-api.com (free, updated daily) and are cached
// for a day; the admin can switch to fixed rates in Admin › Cost calculator.
import { RATES } from '@/lib/fees';
import { getBlock, saveBlock } from './settings';
import { getFees, now } from './store';

type Rates = Record<string, { rate: number; symbol: string; name: string }>;
type Live = { at: string; rates: Record<string, number> };
const DAY = 864e5;
let busy = false;

export async function refreshRates(): Promise<Live | null> {
  if (busy) return null;
  busy = true;
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/AED', { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    const j = (await r.json()) as { result?: string; rates?: Record<string, number> };
    if (j.result !== 'success' || !j.rates) return null;
    const live: Live = { at: now(), rates: j.rates };
    await saveBlock('fx', live);
    return live;
  } catch {
    return null;
  } finally {
    busy = false;
  }
}

/** Rates for the website: the admin's list of currencies, with today's live rate unless fixed rates are chosen. */
export async function siteRates(): Promise<Rates & { _at?: never }> {
  const [fees, live] = await Promise.all([getFees(), getBlock<Live | null>('fx', null)]);
  const base: Rates = Object.keys(fees.rates ?? {}).length ? { ...RATES, ...fees.rates } : { ...RATES };
  if (!live || Date.now() - Date.parse(live.at) > DAY) void refreshRates();
  if (fees.fxManual || !live) return base;
  const out: Rates = {};
  for (const [c, r] of Object.entries(base)) out[c] = { ...r, rate: c === 'AED' ? 1 : live.rates[c] ?? r.rate };
  return out;
}
export const liveAt = async () => (await getBlock<Live | null>('fx', null))?.at ?? '';
