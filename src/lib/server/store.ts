import 'server-only';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { FEE_SCHEDULE } from '@/lib/fees';

/** Folder for all saved data. Keep it outside the release folder on the server so it survives deploys. */
// "~/adgv-data" means a folder in the site user's home: it survives every redeploy.
const rawDir = process.env.DATA_DIR || process.env.LEADS_DIR || './data';
export const DATA_DIR = path.resolve(rawDir.startsWith('~/') ? path.join(os.homedir(), rawDir.slice(2)) : rawDir);
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'closed';
export type Lead = {
  id: string; at: string; name: string; phone: string; email: string; service: string; message: string;
  source: string; details: string; status: LeadStatus; note: string; applicationId?: string;
};

export type QuoteLine = { label: string; amount: number; qty?: number; unit?: number };
export type Payment = { id: string; label: string; amount: number; status: 'due' | 'paid'; link: string; createdAt: string; paidAt?: string; method?: string; receiptNo?: string; txn?: string; gw?: { provider: string; id: string; at: string; ref: string }; tries?: number };
export type Doc = { id: string; name: string; file: string; size: number; type: string; by: 'client' | 'team'; at: string; shared: boolean };
export type Message = { id: string; by: 'client' | 'team'; text: string; at: string; read?: boolean };

export type Application = {
  id: string; ref: string; token: string; createdAt: string; updatedAt: string; archived?: boolean;
  client: { name: string; phone: string; email: string; nationality: string; language: string };
  route: string; location: 'in' | 'out'; adults: number; kids: number;
  stage: number; stageDates: Record<string, string>; nextStep: string; expected: string; notes: string;
  quote: { lines: QuoteLine[]; serviceFee: number; vat: number; insurance: string; sentAt?: string; acceptedAt?: string };
  payments: Payment[]; documents: Doc[]; requests: string[]; messages: Message[]; leadId?: string;
  /** Advisor shown to the client, terms and quote validity. */
  advisor?: { name: string; phone: string }; validUntil?: string; confirmedAt?: string;
};

export type Fees = typeof FEE_SCHEDULE;
type Settings = { fees: Fees };

const locks = new Map<string, Promise<unknown>>();
export async function withLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(name) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(name, next.catch(() => undefined));
  return next;
}

export async function readJsonFile<T>(name: string, fallback: T): Promise<T> {
  return readJson(name, fallback);
}
export async function writeJsonFile(name: string, data: unknown) {
  return withLock('file:' + name, () => writeJson(name, data));
}
/** Read, change and save one file under a lock. */
export function updateJsonFile<T>(name: string, fallback: T, fn: (v: T) => T | void): Promise<T> {
  return withLock('file:' + name, async () => {
    const cur = await readJson<T>(name, fallback);
    const next = (fn(cur) ?? cur) as T;
    await writeJson(name, next);
    return next;
  });
}

async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path.join(DATA_DIR, name), 'utf8')) as T;
  } catch {
    return fallback;
  }
}
async function writeJson(name: string, data: unknown) {
  await mkdir(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, name);
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 1), 'utf8');
  await rename(tmp, file);
}

export const newId = (n = 8) => randomBytes(n).toString('hex');
export const now = () => new Date().toISOString();

/* ---------- leads ---------- */
export const listLeads = () => readJson<Lead[]>('leads.json', []);
export function addLead(l: Omit<Lead, 'id' | 'at' | 'status' | 'note'>) {
  return withLock('leads', async () => {
    const all = await listLeads();
    const lead: Lead = { ...l, id: newId(6), at: now(), status: 'new', note: '' };
    all.unshift(lead);
    await writeJson('leads.json', all);
    return lead;
  });
}
export function updateLead(id: string, patch: Partial<Lead>) {
  return withLock('leads', async () => {
    const all = await listLeads();
    const i = all.findIndex((x) => x.id === id);
    if (i < 0) return null;
    all[i] = { ...all[i], ...patch, id };
    await writeJson('leads.json', all);
    return all[i];
  });
}

/* ---------- applications ---------- */
export const listApplications = () => readJson<Application[]>('applications.json', []);
export async function getApplication(id: string) {
  return (await listApplications()).find((a) => a.id === id) ?? null;
}
export async function getApplicationByToken(token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return null;
  return (await listApplications()).find((a) => a.token === token && !a.archived) ?? null;
}
export function createApplication(data: Pick<Application, 'client' | 'route' | 'location' | 'adults' | 'kids'> & { leadId?: string; notes?: string }) {
  return withLock('apps', async () => {
    const all = await listApplications();
    const n = all.reduce((m, a) => Math.max(m, Number(a.ref.split('-')[1]) || 0), 0) + 1;
    const t = now();
    const app: Application = {
      id: newId(6), ref: `ADGV-${String(n).padStart(4, '0')}`, token: newId(16), createdAt: t, updatedAt: t,
      client: data.client, route: data.route, location: data.location, adults: data.adults, kids: data.kids,
      stage: 0, stageDates: { '0': t }, nextStep: 'We review your documents and confirm your route.', expected: '', notes: data.notes ?? '',
      quote: { lines: [], serviceFee: 0, vat: 0, insurance: 'Quoted separately' },
      payments: [], documents: [], requests: [], messages: [], leadId: data.leadId,
    };
    all.unshift(app);
    await writeJson('applications.json', all);
    return app;
  });
}
export function updateApplication(id: string, fn: (a: Application) => Application | void) {
  return withLock('apps', async () => {
    const all = await listApplications();
    const i = all.findIndex((x) => x.id === id);
    if (i < 0) return null;
    const copy = structuredClone(all[i]);
    const res = fn(copy) ?? copy;
    res.updatedAt = now();
    all[i] = res;
    await writeJson('applications.json', all);
    return res;
  });
}

/* ---------- settings (editable fees) ---------- */
export async function getFees(): Promise<Fees> {
  const s = await readJson<Partial<Settings>>('settings.json', {});
  const d = FEE_SCHEDULE, x = s.fees as Partial<Fees> | undefined;
  if (!x) return d;
  return {
    ...d, ...x, perPerson: { ...d.perPerson, ...x.perPerson }, medical: { ...d.medical, ...x.medical },
    packages: { normal: { ...d.packages.normal, ...x.packages?.normal }, vip: { ...d.packages.vip, ...x.packages?.vip } },
    routes: x.routes?.length ? x.routes : d.routes, addons: x.addons ?? d.addons, extraFees: x.extraFees ?? d.extraFees,
    texts: { ...d.texts, ...x.texts }, options: { ...d.options, ...x.options }, rates: x.rates ?? d.rates, assumptions: x.assumptions?.length ? x.assumptions : d.assumptions,
  };
}
export function saveFees(fees: Fees) {
  return withLock('file:settings.json', async () => {
    const s = await readJson<Partial<Settings>>('settings.json', {});
    await writeJson('settings.json', { ...s, fees });
  });
}
