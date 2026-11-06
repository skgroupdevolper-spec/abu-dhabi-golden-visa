// CI only: adds test team members (staff with chosen sections, viewer, staff without extras) for the role tests.
import { randomBytes, scrypt as _scrypt } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt);
const hash = async (p) => { const s = randomBytes(16); return `s1$${s.toString('hex')}$${(await scrypt(p, s, 32)).toString('hex')}`; };
const dir = path.resolve(process.env.DATA_DIR || './data');
await mkdir(dir, { recursive: true });
const file = path.join(dir, 'team.json');
let team = [];
try { team = JSON.parse(await readFile(file, 'utf8')); } catch {}
const at = new Date().toISOString();
const add = async (id, email, role, perms) => { if (!team.some((u) => u.email === email)) team.push({ id, email, name: `CI ${role}`, role, pass: await hash('ci-team-pass-123'), active: true, createdAt: at, ...(perms ? { perms } : {}) }); };
await add('ci-staff-p', 'staff-perms@ci.local', 'staff', ['/admin/leads/', '/admin/applications/']);
await add('ci-staff', 'staff@ci.local', 'staff');
await add('ci-viewer', 'viewer@ci.local', 'viewer');
await writeFile(file, JSON.stringify(team, null, 2));
console.log('Team members for tests:', team.map((u) => `${u.email} (${u.role})`).join(', '));
