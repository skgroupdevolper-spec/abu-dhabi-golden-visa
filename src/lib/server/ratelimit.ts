// Small in-memory limit per visitor IP for public endpoints (spam / abuse protection).
import type { NextRequest } from 'next/server';

/**
 * Visitor IP for limits. The proxy in front of the site (nginx on xCloud) sets X-Real-IP and appends
 * the real address as the LAST X-Forwarded-For entry; the first entries can be faked by the visitor.
 */
export function clientIp(h: { get(name: string): string | null }) {
  const real = h.get('x-real-ip')?.trim();
  if (real) return real;
  const list = (h.get('x-forwarded-for') || '').split(',').map((x) => x.trim()).filter(Boolean);
  return list[list.length - 1] || 'local';
}

const buckets = new Map<string, number[]>();
/** true when this IP already made `max` requests to `key` in the last `windowMs`. */
export function overLimit(req: NextRequest, key: string, max: number, windowMs = 10 * 60_000) {
  const ip = clientIp(req.headers);
  const k = `${key}:${ip}`, t = Date.now();
  const recent = (buckets.get(k) || []).filter((x) => t - x < windowMs);
  recent.push(t);
  buckets.set(k, recent);
  if (buckets.size > 5000) for (const [kk, v] of buckets) if (!v.some((x) => t - x < windowMs)) buckets.delete(kk);
  return recent.length > max;
}
