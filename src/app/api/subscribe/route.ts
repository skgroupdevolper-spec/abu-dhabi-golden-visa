import { NextResponse, type NextRequest } from 'next/server';
import { insert, list, type Subscriber } from '@/lib/server/collections';
import { newId, now } from '@/lib/server/store';
import { overLimit } from '@/lib/server/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (overLimit(req, 'subscribe', 8)) return NextResponse.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || '').trim().toLowerCase().slice(0, 160);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ ok: false }, { status: 400 });
  if (!(await list<Subscriber>('subscribers')).some((s) => s.email === email)) await insert<Subscriber>('subscribers', { id: newId(6), email, lang: String(b.lang || 'en').slice(0, 10), at: now() });
  return NextResponse.json({ ok: true });
}
