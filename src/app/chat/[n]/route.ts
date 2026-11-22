import { NextResponse, type NextRequest } from 'next/server';

// Short link used by the company WhatsApp alert button ("Chat with client"): /chat/971501234567 opens
// a WhatsApp chat with that number. Meta does not allow wa.me links directly in template buttons.
export async function GET(_: NextRequest, { params }: { params: Promise<{ n: string }> }) {
  const d = (await params).n.replace(/\D/g, '');
  if (d.length < 8 || d.length > 15) return NextResponse.redirect((process.env.NEXT_PUBLIC_SITE_URL || 'https://www.abudhabigoldenvisa.com').replace(/\/$/, '') + '/', 302);
  return NextResponse.redirect(`https://wa.me/${d}`, 302);
}
