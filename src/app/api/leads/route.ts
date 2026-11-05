import { NextResponse, type NextRequest } from 'next/server';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIR = path.resolve(process.env.LEADS_DIR || './data');
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 8;
}

const clean = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Stores a website enquiry as one JSON line. Phase 3 moves this into the database and admin panel. */
export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (limited(ip)) return NextResponse.json({ ok: false, error: 'Too many requests. Please message us on WhatsApp.' }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const lead = {
    at: new Date().toISOString(),
    name: clean(body.name, 120),
    phone: clean(body.phone, 40),
    email: clean(body.email, 160),
    service: clean(body.service, 120),
    message: clean(body.message, 2000),
    source: clean(body.source, 40) || 'website',
    details: typeof body.details === 'object' && body.details ? JSON.stringify(body.details).slice(0, 2000) : '',
  };

  if (!lead.name || lead.phone.replace(/\D/g, '').length < 7) {
    return NextResponse.json({ ok: false, error: 'Please add your name and WhatsApp number.' }, { status: 400 });
  }

  try {
    await mkdir(DIR, { recursive: true });
    await appendFile(path.join(DIR, 'leads.jsonl'), JSON.stringify(lead) + '\n', 'utf8');
  } catch (e) {
    console.error('Lead not saved', e);
    return NextResponse.json({ ok: false, error: 'We could not save your request. Please message us on WhatsApp.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
