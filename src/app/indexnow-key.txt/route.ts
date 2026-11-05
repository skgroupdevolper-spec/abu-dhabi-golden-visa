import { indexNowKey } from '@/lib/server/indexnow';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(await indexNowKey(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
