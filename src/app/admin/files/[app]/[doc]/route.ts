import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/server/auth';
import { readUpload, typeOf } from '@/lib/server/files';
import { getApplication } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ app: string; doc: string }> }) {
  if (!(await currentAdmin())) return new NextResponse('Not signed in', { status: 401 });
  const { app, doc } = await params;
  const a = await getApplication(app);
  const d = a?.documents.find((x) => x.id === doc);
  if (!a || !d) return new NextResponse('Not found', { status: 404 });
  const buf = await readUpload(a.id, d);
  return new NextResponse(new Uint8Array(buf), { headers: { 'Content-Type': typeOf(d.file), 'Content-Disposition': `attachment; filename="${d.file.replace(/^[a-f0-9]+-/, '')}"`, 'Cache-Control': 'private, no-store' } });
}
