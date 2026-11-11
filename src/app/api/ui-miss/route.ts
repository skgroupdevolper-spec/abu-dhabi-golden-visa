// Receives website texts that a visitor saw without a translation (sent by u() in the browser).
// They are added to the list that is translated automatically every few minutes.
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

declare global { var __ADGV_MISS_N: { hour: number; n: number } | undefined }

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    if (!Array.isArray(body)) return NextResponse.json({ ok: false }, { status: 400 });
    // At most 3,000 new texts an hour, so the queue cannot be flooded.
    const hour = Math.floor(Date.now() / 3_600_000);
    const c = (globalThis.__ADGV_MISS_N = globalThis.__ADGV_MISS_N?.hour === hour ? globalThis.__ADGV_MISS_N : { hour, n: 0 });
    const miss = (globalThis.__ADGV_MISS ??= new Set());
    for (const x of body.slice(0, 100)) {
      if (c.n >= 3000) break;
      if (typeof x === 'string' && x.length > 1 && x.length < 600 && /[A-Za-z]{2}/.test(x) && !/[<>]/.test(x) && !miss.has(x)) { miss.add(x); c.n++; }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
