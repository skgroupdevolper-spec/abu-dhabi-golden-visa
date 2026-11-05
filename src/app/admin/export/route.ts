import { NextResponse, type NextRequest } from 'next/server';
import { currentAdmin } from '@/lib/server/auth';
import { readJsonFile } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
const FILES = ['settings.json', 'leads.json', 'applications.json', 'customers.json', 'team.json', 'subscribers.json', 'notifications.json', 'whatsapp-log.json', 'posts.json', 'content.json', 'faqs.json', 'testimonials.json', 'partners.json', 'media.json', 'chats.json', 'translations.json', 'autopub.json'];

const csv = (rows: Record<string, unknown>[], cols: string[]) =>
  [cols.join(','), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`).join(','))].join('\n');

export async function GET(req: NextRequest) {
  const me = await currentAdmin();
  if (!me || (me.role !== 'owner' && me.role !== 'admin')) return new NextResponse('Not allowed', { status: 403 });
  const f = req.nextUrl.searchParams.get('f');
  const stamp = new Date().toISOString().slice(0, 10);
  if (f === 'backup') {
    const files: Record<string, unknown> = {};
    for (const n of FILES) files[n] = await readJsonFile(n, null);
    return new NextResponse(JSON.stringify({ kind: 'adgv-backup', at: new Date().toISOString(), files }), { headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="adgv-backup-${stamp}.json"`, 'Cache-Control': 'no-store' } });
  }
  let body = '';
  if (f === 'leads') body = csv(await readJsonFile<Record<string, unknown>[]>('leads.json', []), ['at', 'name', 'phone', 'email', 'service', 'source', 'status', 'message', 'note']);
  else if (f === 'subscribers') body = csv(await readJsonFile<Record<string, unknown>[]>('subscribers.json', []), ['at', 'email', 'lang']);
  else if (f === 'customers') body = csv(await readJsonFile<Record<string, unknown>[]>('customers.json', []), ['createdAt', 'name', 'email', 'phone', 'lang', 'active']);
  else if (f === 'applications') {
    const apps = await readJsonFile<{ ref: string; createdAt: string; client: Record<string, string>; route: string; stage: number; location: string }[]>('applications.json', []);
    body = csv(apps.map((a) => ({ ref: a.ref, createdAt: a.createdAt, name: a.client.name, phone: a.client.phone, email: a.client.email, route: a.route, location: a.location, stage: a.stage + 1 })), ['ref', 'createdAt', 'name', 'phone', 'email', 'route', 'location', 'stage']);
  } else return new NextResponse('Unknown export', { status: 400 });
  return new NextResponse('﻿' + body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${f}-${stamp}.csv"`, 'Cache-Control': 'no-store' } });
}
