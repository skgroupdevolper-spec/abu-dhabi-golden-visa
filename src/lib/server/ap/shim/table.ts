import 'server-only';
// A small table store with the same calls the publisher code uses (findMany, findUnique, create,
// update, upsert, count, deleteMany…). Each table is one JSON file in DATA_DIR (ap-<table>.json).
// Only the query shapes the publisher uses are supported: equality, in, notIn, gt/gte/lt/lte, not,
// contains, AND / OR / NOT, compound keys (kind_refId: { kind, refId }), orderBy, skip, take, select,
// distinct, and { increment } / { decrement } in updates.
import { randomBytes } from 'node:crypto';
import { readJsonFile, updateJsonFile } from '../../store';

type Row = Record<string, any>;
const DATE_FIELDS = new Set(['createdAt', 'updatedAt', 'lastRunAt', 'publishAt', 'lastUsedAt', 'publishedAt']);
const OPS = new Set(['in', 'notIn', 'gt', 'gte', 'lt', 'lte', 'not', 'contains', 'equals', 'startsWith', 'mode']);

const cuid = () => `c${Date.now().toString(36)}${randomBytes(6).toString('hex')}`;
const comparable = (v: any) => (v instanceof Date ? v.getTime() : typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) ? Date.parse(v) : v);
const isPlain = (v: any) => v && typeof v === 'object' && !(v instanceof Date) && !Array.isArray(v);

function hydrate(row: Row): Row {
  const out: Row = { ...row };
  for (const k of DATE_FIELDS) if (typeof out[k] === 'string') out[k] = new Date(out[k]);
  return out;
}
function dehydrate(row: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) out[k] = v instanceof Date ? v.toISOString() : v;
  return out;
}

function test(value: any, cond: any): boolean {
  if (!isPlain(cond) || !Object.keys(cond).some((k) => OPS.has(k))) return comparable(value) === comparable(cond);
  const v = comparable(value);
  for (const [op, raw] of Object.entries(cond)) {
    const c = Array.isArray(raw) ? raw.map(comparable) : comparable(raw);
    if (op === 'in' && !(c as any[]).includes(v)) return false;
    if (op === 'notIn' && (c as any[]).includes(v)) return false;
    if (op === 'gt' && !(v != null && v > c)) return false;
    if (op === 'gte' && !(v != null && v >= c)) return false;
    if (op === 'lt' && !(v != null && v < c)) return false;
    if (op === 'lte' && !(v != null && v <= c)) return false;
    if (op === 'equals' && v !== c) return false;
    if (op === 'not' && (isPlain(raw) ? test(value, raw) : v === c)) return false;
    if (op === 'contains' && !String(value ?? '').toLowerCase().includes(String(raw).toLowerCase())) return false;
    if (op === 'startsWith' && !String(value ?? '').startsWith(String(raw))) return false;
  }
  return true;
}

export function matches(row: Row, where: Row = {}): boolean {
  for (const [key, cond] of Object.entries(where || {})) {
    if (cond === undefined) continue;
    if (key === 'AND') { if (!(Array.isArray(cond) ? cond : [cond]).every((w) => matches(row, w))) return false; continue; }
    if (key === 'OR') { if (!(cond as Row[]).some((w) => matches(row, w))) return false; continue; }
    if (key === 'NOT') { if ((Array.isArray(cond) ? cond : [cond]).some((w) => matches(row, w))) return false; continue; }
    // compound unique key (kind_refId: { kind, refId })
    if (!(key in row) && key.includes('_') && isPlain(cond) && !Object.keys(cond).some((k) => OPS.has(k))) { if (!matches(row, cond)) return false; continue; }
    if (!test(row[key], cond)) return false;
  }
  return true;
}

function pick(row: Row, select?: Row) {
  if (!select) return row;
  const out: Row = {};
  for (const [k, on] of Object.entries(select)) if (on) out[k] = row[k];
  return out;
}

function sort(rows: Row[], orderBy?: Row | Row[]) {
  const list = !orderBy ? [] : Array.isArray(orderBy) ? orderBy : [orderBy];
  if (!list.length) return rows;
  return [...rows].sort((a, b) => {
    for (const o of list) {
      const [k, dir] = Object.entries(o)[0] as [string, string];
      const x = comparable(a[k]), y = comparable(b[k]);
      if (x === y) continue;
      if (x == null) return 1;
      if (y == null) return -1;
      return (x < y ? -1 : 1) * (dir === 'desc' ? -1 : 1);
    }
    return 0;
  });
}

function applyData(row: Row, data: Row) {
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    if (isPlain(v) && 'increment' in v) row[k] = (Number(row[k]) || 0) + Number(v.increment);
    else if (isPlain(v) && 'decrement' in v) row[k] = (Number(row[k]) || 0) - Number(v.decrement);
    else row[k] = v instanceof Date ? v.toISOString() : v;
  }
}

export type FindArgs = { where?: Row; select?: Row; orderBy?: Row | Row[]; take?: number; skip?: number; distinct?: string[] };

export function table(name: string, defaults: Row = {}, idField = 'id') {
  const file = `ap-${name}.json`;
  const all = async () => (await readJsonFile<Row[]>(file, [])).map(hydrate);
  const change = <T>(fn: (rows: Row[]) => T) => {
    let result: T;
    return updateJsonFile<Row[]>(file, [], (rows) => { result = fn(rows); return rows; }).then(() => result!);
  };
  const find = async (args: FindArgs = {}) => {
    let rows = sort((await all()).filter((r) => matches(r, args.where)), args.orderBy);
    if (args.distinct?.length) {
      const seen = new Set<string>();
      rows = rows.filter((r) => { const key = JSON.stringify(args.distinct!.map((k) => r[k])); if (seen.has(key)) return false; seen.add(key); return true; });
    }
    if (args.skip) rows = rows.slice(args.skip);
    if (args.take != null) rows = rows.slice(0, args.take);
    return rows.map((r) => pick(r, args.select)) as any[];
  };
  const api = {
    findMany: (args: FindArgs = {}) => find(args),
    findFirst: async (args: FindArgs = {}) => (await find({ ...args, take: 1 }))[0] ?? null,
    findUnique: async (args: { where: Row; select?: Row }) => (await find({ where: args.where, select: args.select, take: 1 }))[0] ?? null,
    count: async (args: { where?: Row } = {}) => (await all()).filter((r) => matches(r, args.where)).length,
    create: async (args: { data: Row }) => change((rows) => {
      const now = new Date().toISOString();
      const row: Row = { ...defaults, createdAt: now, updatedAt: now, ...dehydrate(args.data) };
      if (idField === 'id' && !row.id) row.id = cuid();
      rows.push(row);
      return hydrate(row);
    }),
    update: async (args: { where: Row; data: Row }) => change((rows) => {
      const row = rows.find((r) => matches(hydrate(r), args.where));
      if (!row) throw new Error(`${name}: record not found`);
      applyData(row, args.data);
      row.updatedAt = new Date().toISOString();
      return hydrate(row);
    }),
    updateMany: async (args: { where?: Row; data: Row }) => change((rows) => {
      let count = 0;
      for (const row of rows) if (matches(hydrate(row), args.where)) { applyData(row, args.data); row.updatedAt = new Date().toISOString(); count++; }
      return { count };
    }),
    upsert: async (args: { where: Row; update: Row; create: Row }) => change((rows) => {
      const now = new Date().toISOString();
      let row = rows.find((r) => matches(hydrate(r), args.where));
      if (row) { applyData(row, args.update); row.updatedAt = now; }
      else {
        row = { ...defaults, createdAt: now, updatedAt: now, ...dehydrate(args.create) };
        if (idField === 'id' && !row.id) row.id = cuid();
        rows.push(row);
      }
      return hydrate(row);
    }),
    delete: async (args: { where: Row }) => change((rows) => {
      const i = rows.findIndex((r) => matches(hydrate(r), args.where));
      if (i === -1) throw new Error(`${name}: record not found`);
      return hydrate(rows.splice(i, 1)[0]);
    }),
    groupBy: async (args: { by: string[]; where?: Row; _count?: unknown }) => {
      const groups = new Map<string, Row>();
      for (const r of (await all()).filter((x) => matches(x, args.where))) {
        const key = JSON.stringify(args.by.map((k) => r[k]));
        const g = groups.get(key) || { ...Object.fromEntries(args.by.map((k) => [k, r[k]])), _count: { _all: 0 } };
        g._count._all++;
        groups.set(key, g);
      }
      return [...groups.values()] as any[];
    },
    deleteMany: async (args: { where?: Row } = {}) => change((rows) => {
      const keep = rows.filter((r) => !matches(hydrate(r), args.where));
      const count = rows.length - keep.length;
      rows.splice(0, rows.length, ...keep);
      return { count };
    }),
  };
  return api;
}
