import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/server/auth';
import { list, type Note } from '@/lib/server/collections';
import { listApplications, listLeads } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

/** Live counters for the admin bell (polled every few seconds). */
export async function GET() {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const [notes, leads, apps] = await Promise.all([list<Note>('notifications'), listLeads(), listApplications()]);
  const unread = notes.filter((n) => !n.read);
  return NextResponse.json({
    ok: true,
    notes: unread.length,
    leads: leads.filter((l) => l.status === 'new').length,
    messages: apps.reduce((n, a) => n + a.messages.filter((m) => m.by === 'client' && !m.read).length, 0),
    latest: unread.slice(0, 6).map((n) => ({ id: n.id, kind: n.kind, text: n.text, href: n.href, at: n.at })),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
