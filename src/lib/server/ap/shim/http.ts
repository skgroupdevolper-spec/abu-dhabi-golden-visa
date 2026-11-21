import 'server-only';
// Request helpers for the publisher's API routes: JSON replies and the admin check (owner or admin).
import { NextResponse } from 'next/server';
import { FULL, currentAdmin } from '../../auth';

export function ok(data: any = { ok: true }, status = 200) {
  return NextResponse.json(data, { status });
}
export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
export { refreshSite } from './api';
export async function requireAdmin() {
  const me = await currentAdmin();
  return me && FULL.includes(me.role) ? { email: me.email, role: 'ADMIN' } : null;
}
