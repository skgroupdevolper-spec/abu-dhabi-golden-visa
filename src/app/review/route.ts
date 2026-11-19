import { NextResponse } from 'next/server';
import { getSecrets, getSite } from '@/lib/server/settings';

// "Leave a Google review" button in the WhatsApp review request: opens your Google review page
// (Admin > WhatsApp > Google review link), or your Google Maps listing when none is set.
export const dynamic = 'force-dynamic';
export async function GET() {
  const w = (await getSecrets()).whatsapp;
  const site = await getSite();
  const url = [w.reviewUrl, site.mapsUrl].find((u) => typeof u === 'string' && /^https:\/\//.test(u)) || 'https://www.google.com/maps';
  return NextResponse.redirect(url, 302);
}
