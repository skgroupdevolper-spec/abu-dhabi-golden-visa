import { getSecrets, getSite } from '@/lib/server/settings';

export const dynamic = 'force-dynamic';

/** Contact card: once a client saves it, WhatsApp shows the company name instead of the number. */
export async function GET() {
  const site = await getSite();
  const w = (await getSecrets()).whatsapp;
  const main = (site.whatsapp || '').replace(/\D/g, '');
  let auto = (w.senderNumber || '').replace(/\D/g, '');
  // The number automatic messages come from: read once from Meta, so the card covers that chat too.
  if (!auto && w.mode === 'cloud' && w.phoneNumberId && w.accessToken) {
    try {
      const r = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(w.phoneNumberId)}?fields=display_phone_number`, { headers: { Authorization: `Bearer ${w.accessToken}` }, signal: AbortSignal.timeout(6000) });
      const j = (await r.json().catch(() => ({}))) as { display_phone_number?: string };
      auto = (j.display_phone_number || '').replace(/\D/g, '');
    } catch { /* main number only */ }
  }
  const lines = [
    'BEGIN:VCARD', 'VERSION:3.0',
    'N:;Brightlink Management Consultancy;;;', 'FN:Brightlink Management Consultancy', 'ORG:Brightlink Management Consultancy',
    main ? `TEL;TYPE=CELL,VOICE,pref:+${main}` : '',
    auto && auto !== main ? `TEL;TYPE=WORK,VOICE:+${auto}` : '',
    site.email ? `EMAIL;TYPE=WORK:${site.email}` : '',
    'URL:https://www.abudhabigoldenvisa.com/',
    'END:VCARD',
  ].filter(Boolean);
  return new Response(lines.join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/vcard; charset=utf-8', 'Content-Disposition': 'attachment; filename="Brightlink.vcf"', 'Cache-Control': 'no-store' } });
}
