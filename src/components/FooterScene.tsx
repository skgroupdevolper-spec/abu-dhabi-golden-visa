// Footer decoration: two date palms (left and right) with long arching, feathered fronds that sway in
// the breeze, golden desert dunes, and a camel with its rider walking across the desert without end
// (it leaves one side and comes back again). Pure SVG + CSS: no images, no JavaScript.
// Decorative only (aria-hidden); smaller on phones; still for people who prefer less motion.

/** One frond: an arching midrib (gravity pulls the tip down) with feathered leaflets on both sides. */
function frond(len: number, droop: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([t * len, -Math.sin(t * Math.PI * 0.55) * len * 0.22 + t * t * droop]); }
  const rib = `M0 0 ${pts.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')}`;
  let leaves = '';
  for (let i = 3; i < 24; i++) {
    const [x, y] = pts[i], [x2, y2] = pts[i + 1] ?? pts[i];
    const ang = Math.atan2(y2 - y, x2 - x), t = i / 24;
    const l = (1 - t * 0.75) * len * 0.2 + 4;
    for (const side of [-1, 1]) {
      const a = ang + side * 0.95 + 0.35; // leaflets point forward and hang a little
      leaves += `M${x.toFixed(1)} ${y.toFixed(1)} q ${(Math.cos(a) * l * 0.5).toFixed(1)} ${(Math.sin(a) * l * 0.5 + 2).toFixed(1)} ${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l + 3).toFixed(1)} `;
    }
  }
  return { rib, leaves };
}
const FRONDS = [
  { a: -100, len: 120, droop: 10 }, { a: -70, len: 135, droop: 30 }, { a: -40, len: 150, droop: 55 }, { a: -12, len: 155, droop: 80 },
  { a: 14, len: 150, droop: 95 }, { a: 38, len: 135, droop: 100 }, { a: -130, len: 130, droop: 30 }, { a: -160, len: 148, droop: 60 },
  { a: 172, len: 155, droop: 85 }, { a: 146, len: 145, droop: 100 }, { a: 118, len: 125, droop: 95 }, { a: -88, len: 105, droop: 4 },
].map((f) => ({ ...f, ...frond(f.len, f.droop) }));

function Palm({ side }: { side: 'l' | 'r' }) {
  return (
    <svg className={`fs-palm ${side}`} viewBox="0 0 340 460" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`tr-${side}`} x1="0" x2="1"><stop offset="0" stopColor="#5d4318" /><stop offset=".45" stopColor="#9a7536" /><stop offset=".7" stopColor="#7d5c25" /><stop offset="1" stopColor="#4a340f" /></linearGradient>
        <pattern id={`bark-${side}`} width="14" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
          <path d="M0 12 L7 4 L14 12 M0 6 L7 -2 L14 6" stroke="#3e2b0b" strokeWidth="1.6" fill="none" opacity=".55" />
        </pattern>
        <linearGradient id={`lf-${side}`} x1="0" x2="1"><stop offset="0" stopColor="#2f5a24" /><stop offset=".7" stopColor="#4e7d33" /><stop offset="1" stopColor="#7a9e4a" /></linearGradient>
      </defs>
      <g className="fs-tree">
        {/* trunk: tapered, slightly bent, diamond leaf-base texture */}
        <path id={`trunk-${side}`} d="M150 458 C 154 380, 142 300, 156 210 C 160 180, 164 150, 162 132 L 180 132 C 184 152, 180 182, 176 212 C 164 302, 176 380, 172 458 Z" fill={`url(#tr-${side})`} />
        <path d="M150 458 C 154 380, 142 300, 156 210 C 160 180, 164 150, 162 132 L 180 132 C 184 152, 180 182, 176 212 C 164 302, 176 380, 172 458 Z" fill={`url(#bark-${side})`} />
        {/* old dry fronds under the crown */}
        <path d="M168 140 q -30 30 -46 70 M172 140 q 28 34 40 72" stroke="#8a6a2c" strokeWidth="3" fill="none" opacity=".7" />
        {/* date bunches hanging from the crown */}
        <g className="fs-dates">
          {[[150, 150], [192, 152]].map(([x, y], k) => (
            <g key={k}>
              <path d={`M${x + 8} ${y - 12} q ${k ? 6 : -6} 10 ${k ? 2 : -2} 24`} stroke="#c79a3a" strokeWidth="2" fill="none" />
              {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={x + ((i % 4) - 1.5) * 5.4 + (Math.floor(i / 4) % 2) * 2} cy={y + Math.floor(i / 4) * 6.5} rx="3" ry="4" fill={['#a3521a', '#c46a21', '#8c4113', '#d98a2b'][i % 4]} />)}
            </g>
          ))}
        </g>
        {/* crown of fronds: each sways on its own */}
        <g transform="translate(171 132)">
          {FRONDS.map((f, i) => (
            <g key={i} className="fs-fr" style={{ ['--a' as string]: `${f.a}deg`, ['--d' as string]: `${(i % 6) * 0.4}s` }}>
              <path d={f.leaves} stroke={`url(#lf-${side})`} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d={f.rib} stroke="#3d5f22" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ))}
          <ellipse rx="13" ry="9" fill="#4a3810" />
        </g>
      </g>
    </svg>
  );
}

/** Camel with a rider in a headscarf, side view; legs and neck move while it walks. */
function Camel() {
  return (
    <svg className="fs-camel" viewBox="0 0 200 150" aria-hidden="true" focusable="false">
      <g className="cm-body">
        {/* far legs (darker) */}
        <g className="cm-leg l2" style={{ transformOrigin: '62px 92px' }}><path d="M58 92 L56 120 L60 140 L65 140 L63 120 L66 92 Z" fill="#6e4a1c" /></g>
        <g className="cm-leg l4" style={{ transformOrigin: '128px 92px' }}><path d="M124 92 L122 120 L127 140 L132 140 L129 120 L133 92 Z" fill="#6e4a1c" /></g>
        {/* body with hump */}
        <path d="M40 92 C 38 72, 52 66, 66 66 C 76 44, 104 40, 116 62 C 126 64, 140 68, 146 82 C 150 92, 142 100, 128 100 L 56 100 C 46 100, 41 97, 40 92 Z" fill="#9b6a2b" />
        <path d="M66 66 C 76 44, 104 40, 116 62" fill="none" stroke="#b9853f" strokeWidth="3" opacity=".7" />
        {/* tail */}
        <path d="M41 86 q -8 6 -6 18" stroke="#7b5220" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* neck and head */}
        <g className="cm-neck" style={{ transformOrigin: '142px 82px' }}>
          <path d="M138 80 C 150 70, 156 50, 160 36 C 162 28, 172 24, 182 28 L 186 34 C 184 38, 178 38, 174 38 C 170 48, 164 70, 150 90 Z" fill="#9b6a2b" />
          <circle cx="176" cy="31" r="1.6" fill="#2b1a08" />
          <path d="M168 26 l 2 -5 l 3 5" fill="#8a5c22" />
          <path d="M150 52 q -10 -8 -18 4" stroke="#c0392b" strokeWidth="2" fill="none" />{/* rein */}
        </g>
        {/* saddle blanket */}
        <path d="M74 64 C 84 56, 102 54, 110 62 L 112 78 C 100 82, 82 82, 72 78 Z" fill="#b5261e" />
        <path d="M72 78 C 82 82, 100 82, 112 78" stroke="#f2d27a" strokeWidth="2.5" fill="none" />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${76 + i * 6.5} 80 l 0 7`} stroke="#f2d27a" strokeWidth="1.6" />)}
        {/* rider: white kandura, red-and-white ghutra */}
        <g className="cm-rider" style={{ transformOrigin: '92px 62px' }}>
          <path d="M84 62 C 82 46, 86 30, 94 26 C 102 28, 104 44, 102 62 Z" fill="#f7f4ec" stroke="#ddd5c2" strokeWidth="1" />
          <path d="M90 60 L 86 82 L 92 82 L 96 62 Z" fill="#efe9da" />
          <path d="M98 36 q 14 4 22 14" stroke="#e8c39e" strokeWidth="4" strokeLinecap="round" fill="none" />{/* arm to the rein */}
          <circle cx="95" cy="20" r="7" fill="#c98f5e" />
          <path d="M86 20 C 86 10, 104 8, 104 18 L 106 30 C 100 24, 92 24, 86 32 Z" fill="#f4f1ea" />
          <path d="M87 14 C 92 9, 100 9, 104 14" stroke="#c0392b" strokeWidth="2.4" fill="none" />
          <path d="M87 13 C 92 8, 100 8, 104 13" stroke="#111" strokeWidth="1.6" fill="none" />{/* agal */}
        </g>
        {/* near legs */}
        <g className="cm-leg l1" style={{ transformOrigin: '54px 92px' }}><path d="M50 92 L48 120 L52 140 L58 140 L56 120 L60 92 Z" fill="#8a5c22" /></g>
        <g className="cm-leg l3" style={{ transformOrigin: '136px 92px' }}><path d="M132 92 L130 120 L135 140 L141 140 L138 120 L142 92 Z" fill="#8a5c22" /></g>
      </g>
      <ellipse cx="96" cy="142" rx="56" ry="4" fill="#7a5512" opacity=".25" />
    </svg>
  );
}

export function FooterScene() {
  return (
    <div className="fscene" aria-hidden="true">
      <Palm side="l" />
      <Palm side="r" />
      <svg className="fs-dunes" viewBox="0 0 1440 150" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="dune1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2d27a" /><stop offset="1" stopColor="#e0b555" /></linearGradient>
          <linearGradient id="dune2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6bd62" /><stop offset="1" stopColor="#c99a3a" /></linearGradient>
          <linearGradient id="dune3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d4a548" /><stop offset="1" stopColor="#a87b25" /></linearGradient>
        </defs>
        <path className="d1" d="M0 70 C 160 30, 300 40, 460 66 S 760 30, 940 58 S 1260 34, 1440 60 L 1440 150 L 0 150 Z" fill="url(#dune1)" opacity=".55" />
        <path className="d2" d="M0 100 C 200 66, 360 78, 540 96 S 860 70, 1060 92 S 1300 80, 1440 90 L 1440 150 L 0 150 Z" fill="url(#dune2)" opacity=".8" />
        <path className="d3" d="M0 128 C 240 108, 420 118, 640 126 S 1000 110, 1200 122 S 1360 118, 1440 124 L 1440 150 L 0 150 Z" fill="url(#dune3)" />
      </svg>
      <div className="fs-walk"><Camel /></div>
      <span className="fs-sand" />
    </div>
  );
}
