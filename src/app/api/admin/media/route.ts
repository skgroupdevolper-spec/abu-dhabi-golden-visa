import { NextResponse, type NextRequest } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EDIT, currentAdmin } from '@/lib/server/auth';
import { insert, list } from '@/lib/server/collections';
import type { MediaItem } from '@/lib/server/content';
import { DATA_DIR, newId, now } from '@/lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const OK = /\.(png|jpe?g|webp|gif|svg|avif|mp4)$/i;

/** Media library for the page builder and blog editor. */
export async function GET() {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const items = (await list<MediaItem>('media')).filter((m) => /^image\//.test(m.type) || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(m.file));
  return NextResponse.json({ ok: true, items: [
    ...items.map((m) => ({ url: `/media/${m.file}`, name: m.name, alt: m.alt })),
    { url: '/images/hero-woman.webp', name: 'Hero woman (built in)', alt: '' },
    { url: '/brand/coin.webp', name: 'Gold coin (built in)', alt: '' },
    { url: '/brand/logo.webp', name: 'Logo (built in)', alt: '' },
  ] });
}

export async function POST(req: NextRequest) {
  const me = await currentAdmin();
  if (!me || !EDIT.includes(me.role)) return NextResponse.json({ ok: false, error: 'Please sign in again.' }, { status: 401 });
  const f = await req.formData().catch(() => null);
  const file = f?.get('file');
  if (!file || typeof file === 'string' || !file.size || file.size > 20 * 1024 * 1024) return NextResponse.json({ ok: false, error: 'Choose an image up to 20 MB.' }, { status: 400 });
  const clean = file.name.normalize('NFKD').replace(/[^\w.\- ]+/g, '').replace(/\s+/g, '-').slice(-60);
  if (!OK.test(clean)) return NextResponse.json({ ok: false, error: 'Use PNG, JPG, WEBP, GIF, SVG or AVIF.' }, { status: 400 });
  const name = `${newId(4)}-${clean}`;
  await mkdir(path.join(DATA_DIR, 'media'), { recursive: true });
  await writeFile(path.join(DATA_DIR, 'media', name), Buffer.from(await file.arrayBuffer()));
  const alt = String(f?.get('alt') ?? '').slice(0, 200);
  await insert<MediaItem>('media', { id: newId(6), file: name, name: file.name.slice(0, 100), type: file.type, size: file.size, alt, at: now() });
  return NextResponse.json({ ok: true, url: `/media/${name}`, name: file.name, alt });
}
