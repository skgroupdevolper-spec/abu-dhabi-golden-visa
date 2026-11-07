// Footer decoration, drawn like a desert photo at sunset (dark silhouettes, no cartoon colours): two date palms with long arching, feathered fronds that sway in
// the breeze, golden desert dunes, and a camel with its rider walking across the desert without end
// (it leaves one side and comes back again). Pure SVG + CSS: no images, no JavaScript.
// Decorative only (aria-hidden); smaller on phones; still for people who prefer less motion.

/** One frond: an arching midrib (gravity pulls the tip down) with feathered leaflets on both sides. */
function frond(len: number, droop: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([t * len, -Math.sin(t * Math.PI * 0.55) * len * 0.22 + t * t * droop]); }
  const rib = `M0 0 ${pts.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')}`;
  let leaves = '';
  for (let i = 2; i < 24; i++) {
    const [x, y] = pts[i], [x2, y2] = pts[i + 1] ?? pts[i];
    const ang = Math.atan2(y2 - y, x2 - x), t = i / 24;
    const l = (1 - t * 0.75) * len * 0.2 + 4;
    for (const side of [-1, 1]) for (const k of [0, 1]) {
      // two rows of stiff, narrow leaflets per side (as on a real date palm), hanging with gravity
      const a = ang + side * (0.8 + k * 0.32) + 0.4, ll = l * (k ? 0.82 : 1) * (0.9 + ((i * 7 + k * 3) % 5) * 0.05);
      leaves += `M${x.toFixed(1)} ${y.toFixed(1)} q ${(Math.cos(a) * ll * 0.5).toFixed(1)} ${(Math.sin(a) * ll * 0.5 + 2).toFixed(1)} ${(Math.cos(a) * ll).toFixed(1)} ${(Math.sin(a) * ll + 4).toFixed(1)} `;
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
        <linearGradient id={`tr-${side}`} x1="0" x2="1"><stop offset="0" stopColor="#2a1d0c" /><stop offset=".45" stopColor="#4d3818" /><stop offset=".7" stopColor="#3a2a12" /><stop offset="1" stopColor="#1f1508" /></linearGradient>
        <pattern id={`bark-${side}`} width="14" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
          <path d="M0 12 L7 4 L14 12 M0 6 L7 -2 L14 6" stroke="#7a5a2a" strokeWidth="1.3" fill="none" opacity=".35" />
        </pattern>
        <linearGradient id={`lf-${side}`} x1="0" x2="1"><stop offset="0" stopColor="#1c2512" /><stop offset=".7" stopColor="#2f3d1c" /><stop offset="1" stopColor="#47562a" /></linearGradient>
      </defs>
      <g className="fs-tree">
        {/* trunk: tapered, slightly bent, diamond leaf-base texture */}
        <path id={`trunk-${side}`} d="M150 458 C 154 380, 142 300, 156 210 C 160 180, 164 150, 162 132 L 180 132 C 184 152, 180 182, 176 212 C 164 302, 176 380, 172 458 Z" fill={`url(#tr-${side})`} />
        <path d="M150 458 C 154 380, 142 300, 156 210 C 160 180, 164 150, 162 132 L 180 132 C 184 152, 180 182, 176 212 C 164 302, 176 380, 172 458 Z" fill={`url(#bark-${side})`} />
        {/* old dry fronds under the crown */}
        <path d="M168 140 q -30 30 -46 70 M172 140 q 28 34 40 72" stroke="#3a2a12" strokeWidth="2.4" fill="none" opacity=".8" />
        {/* date bunches hanging from the crown */}
        <g className="fs-dates">
          {[[150, 150], [192, 152]].map(([x, y], k) => (
            <g key={k}>
              <path d={`M${x + 8} ${y - 12} q ${k ? 6 : -6} 10 ${k ? 2 : -2} 24`} stroke="#7a5520" strokeWidth="1.6" fill="none" />
              {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={x + ((i % 4) - 1.5) * 5.4 + (Math.floor(i / 4) % 2) * 2} cy={y + Math.floor(i / 4) * 6.5} rx="3" ry="4" fill={['#5c2a0c', '#74360f', '#4a210a', '#8a4514'][i % 4]} />)}
            </g>
          ))}
        </g>
        {/* crown of fronds: each sways on its own */}
        <g transform="translate(171 132)">
          {FRONDS.map((f, i) => (
            <g key={i} className="fs-fr" style={{ ['--a' as string]: `${f.a}deg`, ['--d' as string]: `${(i % 6) * 0.4}s` }}>
              <path d={f.leaves} stroke={`url(#lf-${side})`} strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d={f.rib} stroke="#1f2a12" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            </g>
          ))}
          <ellipse rx="12" ry="8" fill="#20160a" />
        </g>
      </g>
    </svg>
  );
}

/** Dromedary with a rider, side view, drawn as a dark sunset silhouette (true proportions: long legs with
 *  knee knobs, one hump, S-shaped neck). It walks with the camel's real "pacing" gait: both legs on the
 *  same side swing together, and each lower leg folds at the knee as it comes forward. */
function Leg({ x, hind, far, ph }: { x: number; hind?: boolean; far?: boolean; ph: number }) {
  const top = hind ? 96 : 100, knee = hind ? 128 : 124;
  const upper = hind
    ? `M${x - 9} ${top - 4} C ${x + 6} ${top - 6}, ${x + 12} ${top + 4}, ${x + 6} ${knee} L ${x - 3} ${knee} C ${x - 4} ${top + 16}, ${x - 10} ${top + 8}, ${x - 9} ${top - 4} Z`
    : `M${x - 6} ${top - 4} L ${x + 6} ${top - 4} C ${x + 6} ${top + 10}, ${x + 3} ${knee - 8}, ${x + 3} ${knee} L ${x - 3} ${knee} C ${x - 3} ${knee - 8}, ${x - 6} ${top + 10}, ${x - 6} ${top - 4} Z`;
  const kx = hind ? x + 1.5 : x;
  return (
    <g className={`cm-up${far ? ' far' : ''}`} style={{ transformOrigin: `${x}px ${top}px`, animationDelay: `${ph}s` }}>
      <path d={upper} />
      <ellipse cx={kx} cy={knee} rx="4.2" ry="4.6" />
      <g className="cm-low" style={{ transformOrigin: `${kx}px ${knee}px`, animationDelay: `${ph}s` }}>
        <path d={`M${kx - 2.6} ${knee} L ${kx + 2.6} ${knee} L ${kx + 2.2} ${knee + 20} L ${kx + 3.4} ${knee + 22} L ${kx - 2.6} ${knee + 22} L ${kx - 2.4} ${knee + 20} Z`} />
        <path d={`M${kx - 4} ${knee + 21} C ${kx - 4} ${knee + 25}, ${kx + 8} ${knee + 26}, ${kx + 8} ${knee + 23} L ${kx + 3} ${knee + 20} Z`} />
      </g>
    </g>
  );
}

function Camel() {
  return (
    <svg className="fs-camel" viewBox="0 -24 220 176" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="cm-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a3215" /><stop offset="1" stopColor="#24180a" /></linearGradient>
        <linearGradient id="cm-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6b4c22" /><stop offset="1" stopColor="#3b2a12" /></linearGradient>
      </defs>
      <g className="cm-body">
        {/* far legs: a shade lighter, so the depth reads */}
        <g fill="url(#cm-f)"><Leg x={140} far ph={-0.6} /><Leg x={58} hind far ph={-0.6} /></g>
        <g fill="url(#cm-g)">
          {/* tail with a tuft */}
          <path d="M47 80 C 40 86, 39 96, 41 106 L 44 106 C 43 96, 45 88, 50 83 Z" />
          <path d="M39 104 C 37 110, 41 114, 43 114 C 46 112, 46 107, 44 104 Z" />
          {/* body, hump, neck and head in one outline */}
          <path d="M46 78 C 50 62, 62 54, 74 50 C 84 30, 108 26, 118 46 C 124 56, 134 60, 146 66 C 158 72, 164 82, 170 78 C 176 74, 177 56, 181 45 C 183 38, 189 35, 196 37 L 205 41 C 209 43, 209 49, 204 50 L 197 52 C 191 54, 189 58, 189 64 C 189 80, 182 96, 168 102 C 160 106, 150 106, 144 104 C 120 110, 92 110, 72 104 C 60 102, 52 98, 48 92 C 44 88, 44 82, 46 78 Z" />
          <path d="M188 37 L 190 30 L 193 36 Z" />{/* ear */}
          <Leg x={146} ph={0} /><Leg x={64} hind ph={0} />
        </g>
        <circle cx="195.5" cy="42" r="1.1" fill="#c9a25a" opacity=".7" />{/* eye glint */}
        {/* saddle blanket over the hump with hanging tassels */}
        <g fill="#2a1c0b">
          <path d="M80 44 C 88 26, 110 24, 116 42 L 120 58 C 106 64, 88 64, 76 58 Z" opacity=".9" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${80 + i * 7.5} 60 l -1 9 l 3 0 Z`} />)}
        </g>
        {/* rider: kandura, ghutra blowing back, hand on the rein */}
        <g className="cm-rider" fill="#1d1408" style={{ transformOrigin: '98px 34px' }}>
          <path d="M98 30 C 106 32, 112 36, 113 44 L 111 60 L 106 60 L 107 45 C 104 40, 100 38, 96 38 Z" />{/* leg over the saddle */}
          <path d="M89 34 C 87 20, 91 7, 99 3 C 106 5, 108 18, 106 34 L 104 44 L 88 44 Z" />{/* torso in a kandura */}
          <path d="M104 12 C 112 15, 118 20, 123 26 L 121 28 C 115 23, 109 19, 102 17 Z" />{/* arm */}
          <circle cx="101" cy="-5" r="6.2" />
          <path d="M94 -9 C 96 -17, 108 -16, 108 -9 L 106 -1 C 101 1, 96 5, 89 13 C 86 8, 89 0, 94 -9 Z" className="cm-scarf" />
        </g>
        <path d="M122 27 Q 160 52 202 47" stroke="#1d1408" strokeWidth=".9" fill="none" />{/* rein */}
      </g>
      <ellipse cx="104" cy="150" rx="66" ry="3.5" fill="#6b4a12" opacity=".22" />
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
