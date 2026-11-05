import { ImageResponse } from 'next/og';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { DATA_DIR } from '@/lib/server/store';
import path from 'node:path';

export const runtime = 'nodejs';

let bg: string | null = null, coin: string | null = null;
async function assets() {
  if (!bg) bg = `data:image/jpeg;base64,${(await readFile(path.join(process.cwd(), 'public/images/cover-bg.jpg'))).toString('base64')}`;
  if (!coin) coin = `data:image/png;base64,${(await readFile(path.join(process.cwd(), 'public/brand/coin-pdf.png'))).toString('base64')}`;
  return { bg, coin };
}

/** Article cover (1200×630) in the site style: cream and gold, skyline, title, category and site name. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const title = (u.searchParams.get('t') || 'Abu Dhabi Golden Visa').slice(0, 110);
  const cat = (u.searchParams.get('c') || 'Golden Visa guide').slice(0, 40);
  const words = title.split(' ');
  const cut = Math.max(1, Math.ceil(words.length * 0.55));
  const a = words.slice(0, cut).join(' '), b = words.slice(cut).join(' ');
  const size = title.length > 70 ? 54 : title.length > 45 ? 62 : 72;
  // Each cover is drawn once, then served from disk (fast, no re-rendering).
  const key = createHash('sha1').update(`v1|${title}|${cat}`).digest('hex').slice(0, 20);
  const file = path.join(DATA_DIR, 'cache', 'covers', `${key}.png`);
  const headers = { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' };
  try { return new Response(new Uint8Array(await readFile(file)), { headers }); } catch { /* not drawn yet */ }
  const { bg: img, coin: c } = await assets();
  const res = new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(120deg,#fffaf0 0%,#f8edd0 55%,#f1dc94 100%)', position: 'relative', fontFamily: 'sans-serif' }}>
        <img src={img} width={1200} height={630} style={{ position: 'absolute', left: 0, top: 0, width: 1200, height: 630, objectFit: 'cover', opacity: 0.22 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: 760, height: 630, display: 'flex', background: 'linear-gradient(90deg,rgba(255,250,240,0.97) 0%,rgba(255,250,240,0.9) 70%,rgba(255,250,240,0) 100%)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '44px 56px 0', position: 'relative' }}>
          <img src={c} width={58} height={58} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, color: '#0d0d0d' }}>ABU DHABI GOLDEN VISA</span>
            <span style={{ fontSize: 16, color: '#8a6a12', letterSpacing: 2 }}>LONG-TERM UAE RESIDENCY</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 56px', marginTop: 46, maxWidth: 860, position: 'relative' }}>
          <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '8px 18px', borderRadius: 999, background: '#0d0d0d', color: '#f1dc94', fontSize: 20, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{cat}</div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 22, fontSize: size, fontWeight: 800, lineHeight: 1.06, letterSpacing: -1 }}>
            <span style={{ color: '#0d0d0d' }}>{a}</span>
            {b ? <span style={{ color: '#a77b0f' }}>{b}</span> : null}
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 74, display: 'flex', alignItems: 'center', gap: 30, padding: '0 56px', background: '#0d0d0d', color: '#f5efe0', fontSize: 20 }}>
          <span>10-year residency</span><span style={{ color: '#d4af37' }}>•</span><span>Family included</span><span style={{ color: '#d4af37' }}>•</span><span>Fees itemised</span>
          <span style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 999, background: 'linear-gradient(90deg,#8a6a12,#d4af37,#f1dc94)', color: '#0d0d0d', fontWeight: 800 }}>abudhabigoldenvisa.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
  const buf = new Uint8Array(await res.arrayBuffer());
  void mkdir(path.dirname(file), { recursive: true }).then(() => writeFile(file, buf)).catch(() => {});
  return new Response(buf, { headers });
}
