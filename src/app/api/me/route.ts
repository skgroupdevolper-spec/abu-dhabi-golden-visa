// Who is signed in to the client portal (used by the online application to skip account details).
import { NextResponse } from 'next/server';
import { currentCustomer } from '@/lib/server/portal';

export const dynamic = 'force-dynamic';

export async function GET() {
  const me = await currentCustomer();
  if (!me) return NextResponse.json({ signedIn: false }, { headers: { 'cache-control': 'no-store' } });
  return NextResponse.json({ signedIn: true, name: me.name, email: me.email, phone: me.phone }, { headers: { 'cache-control': 'no-store' } });
}
