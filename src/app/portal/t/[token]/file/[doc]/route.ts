import { NextResponse } from 'next/server';
import { readUpload } from '@/lib/server/files';
import { getApplicationByToken } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ token: string; doc: string }> }) {
  const { token, doc } = await params;
  const a = await getApplicationByToken(token);
  const d = a?.documents.find((x) => x.id === doc && (x.by === 'client' || x.shared));
  if (!a || !d) return new NextResponse('Not found', { status: 404 });
  const buf = await readUpload(a.id, d);
  return new NextResponse(new Uint8Array(buf), { headers: { 'Content-Type': d.type, 'Content-Disposition': `attachment; filename="${d.file.replace(/^[a-f0-9]+-/, '')}"`, 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' } });
}
