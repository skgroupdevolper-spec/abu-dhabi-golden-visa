import { NextResponse } from 'next/server';
import { getFees } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

/** Current government fee schedule (edited in the admin dashboard). Used by the calculator. */
export async function GET() {
  return NextResponse.json(await getFees(), { headers: { 'Cache-Control': 'public, max-age=60' } });
}
