import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { FULL, currentAdmin } from '@/lib/server/auth';
import { getSite, saveSite } from '@/lib/server/settings';
import type { MenuGroup, MenuItem } from '@/lib/settings-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const t = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const links = (v: unknown) => (Array.isArray(v) ? v : []).map((l) => ({ label: t(l?.label, 80), href: t(l?.href, 300), note: t(l?.note, 80) || undefined })).filter((l) => l.label && l.href).slice(0, 40);
const groups = (v: unknown): MenuGroup[] => (Array.isArray(v) ? v : []).map((g) => ({ title: t(g?.title, 80), links: links(g?.links) })).filter((g) => g.title && g.links.length).slice(0, 12);

/** Saves the main menu and footer columns (empty = built-in menu). */
export async function POST(req: NextRequest) {
  const me = await currentAdmin();
  if (!me || !FULL.includes(me.role)) return NextResponse.json({ ok: false, error: 'Please sign in again.' }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  const menu: MenuItem[] = (Array.isArray(b.menu) ? b.menu : []).map((m: MenuItem) => ({ label: t(m?.label, 60), href: t(m?.href, 300) || '/', groups: groups(m?.groups).length ? groups(m?.groups) : undefined })).filter((m: MenuItem) => m.label).slice(0, 14);
  const cur = await getSite();
  await saveSite({ nav: { ...cur.nav, menu, footerCols: groups(b.footerCols) } });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
