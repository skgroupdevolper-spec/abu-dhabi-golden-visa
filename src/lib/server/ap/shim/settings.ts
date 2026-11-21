import 'server-only';
// The few site settings the publisher reads, taken from the dashboard's own settings.
import { getSecrets, getSite } from '../../settings';
import { getFees } from '../../store';

/** Every { label, aed } in the government fee schedule, as "label: AED n" lines. */
function feeLines(v: unknown, out: string[] = [], seen = new Set<string>()): string[] {
  if (!v || typeof v !== 'object') return out;
  const o = v as Record<string, unknown>;
  if (typeof o.label === 'string' && typeof o.aed === 'number' && o.aed > 0 && !seen.has(o.label)) { seen.add(o.label); out.push(`${o.label}: government fee AED ${o.aed}`); }
  for (const x of Object.values(o)) if (x && typeof x === 'object') feeLines(x, out, seen);
  return out;
}

export async function getSetting(key: string): Promise<any> {
  if (key === 'translation') return { geminiKey: (await getSecrets()).ai.geminiKey || '' };
  if (key === 'fees') {
    const lines = feeLines(await getFees().catch(() => null)).slice(0, 60);
    return { enabled: lines.length > 0, groups: [{ label: 'Government fees', options: lines.map((l) => { const [label, gov] = l.split(': government fee AED '); return { label, gov }; }) }], packages: [] };
  }
  if (key === 'site') {
    const site: any = await getSite();
    const c = site.colors || {};
    // Pictures use the website's gold, its dark ink and the paper colour, with the website logo.
    return { name: site.name, logo: site.brand?.logo || '/brand/logo.webp', colors: { gold: c.gold || '#d4af37', goldLight: '#f6ecd0', ink: c.ink || '#0d0d0d', sand: c.paper || '#f8f7f5' } };
  }
  return null;
}
