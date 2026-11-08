// Daily job runner for the server cron (xCloud → Cron Job: `npm run cron` in the site folder).
// Reads the cron key from CRON_SECRET or from DATA_DIR/.secrets.json, so the key never has to be
// typed into a panel, then calls the running site on this machine.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const raw = process.env.DATA_DIR || './data';
const dataDir = path.resolve(raw.startsWith('~/') ? path.join(os.homedir(), raw.slice(2)) : raw);
let key = process.env.CRON_SECRET || '';
if (!key || key.length < 24 || /replace-with|change-this/i.test(key)) {
  try { key = JSON.parse(readFileSync(path.join(dataDir, '.secrets.json'), 'utf8')).cron || ''; } catch { key = ''; }
}
if (!key) { console.error('No cron key yet: open the website once so it creates one, then run again.'); process.exit(1); }
const port = process.env.PORT || 3000;
const res = await fetch(`http://127.0.0.1:${port}/api/cron/daily?key=${encodeURIComponent(key)}`).catch((e) => ({ ok: false, status: String(e) }));
console.log(new Date().toISOString(), 'daily job', res.status, res.ok ? await res.text() : '');
process.exit(res.ok ? 0 : 1);
