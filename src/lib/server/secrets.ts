import 'server-only';
// Server secrets that must never be the sample values from .env.example (the repository is public).
// If SESSION_SECRET / CRON_SECRET are missing or still the placeholder, a strong random value is made
// once and kept in DATA_DIR/.secrets.json (readable by the site user only), so restarts keep sessions.
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './store';

/** True when a value is empty, too short or one of the sample placeholders. */
export function isPlaceholder(v: string | undefined, min = 12) {
  if (!v) return true;
  const s = v.trim();
  return s.length < min || /change-this|replace-with|your-|example|placeholder/i.test(s);
}

let cache: Record<string, string> | null = null;
function store(): Record<string, string> {
  if (cache) return cache;
  const file = path.join(DATA_DIR, '.secrets.json');
  try { cache = JSON.parse(readFileSync(file, 'utf8')); } catch { cache = {}; }
  let changed = false;
  for (const k of ['session', 'cron']) if (!cache![k]) { cache![k] = randomBytes(48).toString('base64url'); changed = true; }
  if (changed) {
    try { mkdirSync(DATA_DIR, { recursive: true }); writeFileSync(file, JSON.stringify(cache, null, 2), { mode: 0o600 }); chmodSync(file, 0o600); } catch { /* read-only disk: secrets live in memory until restart */ }
  }
  return cache!;
}

export const sessionSecret = () => (isPlaceholder(process.env.SESSION_SECRET, 32) ? store().session : process.env.SESSION_SECRET!);
export const cronSecret = () => (isPlaceholder(process.env.CRON_SECRET, 24) ? store().cron : process.env.CRON_SECRET!);
