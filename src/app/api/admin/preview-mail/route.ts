import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/server/auth';
import { docCfg } from '@/lib/server/doccfg';
import { renderMail } from '@/lib/server/mail';

export const dynamic = 'force-dynamic';

/** Sample client email with the saved email settings (Admin > Emails & PDFs). */
export async function GET() {
  if (!(await currentAdmin())) return new NextResponse('Not allowed', { status: 401 });
  const html = renderMail('Status update ADGV-0001: Eligibility confirmed', `Hello Sample Client,\n\nGood news: your application moved to the next step.\n\nReference: ADGV-0001\nStatus: Eligibility confirmed\nNext step: We send your written quote.\nExpected: 14 Nov 2026\n\nFollow your application, pay and download documents here:\nhttps://app.abudhabigoldenvisa.com/\n\nKind regards,\nAbu Dhabi Golden Visa`, (await docCfg()).mail, { badge: 'Eligibility confirmed' });
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
