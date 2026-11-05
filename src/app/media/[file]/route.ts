import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { DATA_DIR } from '@/lib/server/store';

const TYPES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif', pdf: 'application/pdf', mp4: 'video/mp4' };

/** Public files from the admin media library. */
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const name = path.basename(file);
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (!TYPES[ext]) return new NextResponse('Not found', { status: 404 });
  try {
    const buf = await readFile(path.join(DATA_DIR, 'media', name));
    return new NextResponse(new Uint8Array(buf), { headers: { 'Content-Type': TYPES[ext], 'Cache-Control': 'public, max-age=31536000, immutable', ...(ext === 'svg' ? { 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" } : {}) } });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
