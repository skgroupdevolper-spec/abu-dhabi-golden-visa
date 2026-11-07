// Footer decoration: two date palms (left and right) whose fronds sway in the breeze, and a strip of
// golden desert dunes with small ghaf trees along the bottom. Pure SVG + CSS: no images, no JavaScript.
// Decorative only (aria-hidden); smaller and softer on phones; still for people who prefer less motion.

const FRONDS = [-78, -52, -28, -6, 16, 40, 64, 88, 112, 150, 196, 232];

function Palm({ side }: { side: 'l' | 'r' }) {
  return (
    <svg className={`fs-palm ${side}`} viewBox="0 0 260 420" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`trunk-${side}`} x1="0" x2="1"><stop offset="0" stopColor="#7a5a1c" /><stop offset=".5" stopColor="#a8822e" /><stop offset="1" stopColor="#6b4c14" /></linearGradient>
        <linearGradient id={`leaf-${side}`} x1="0" x2="1"><stop offset="0" stopColor="#3f6b2a" /><stop offset=".6" stopColor="#5f8f3a" /><stop offset="1" stopColor="#8fb35a" /></linearGradient>
      </defs>
      <g className="fs-tree">
        {/* trunk: gently curved, with ring marks */}
        <path d="M128 418 C 132 340, 118 260, 132 170 C 136 150, 138 128, 134 112 L 146 112 C 150 130, 148 152, 144 172 C 132 262, 146 342, 142 418 Z" fill={`url(#trunk-${side})`} />
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${125 + (i % 2)} ${400 - i * 21} q 10 -6 20 0`} stroke="#5a3f10" strokeWidth="2" fill="none" opacity=".45" />)}
        {/* date clusters */}
        <g className="fs-dates">
          {[[120, 128], [156, 130]].map(([x, y], k) => (
            <g key={k}>{Array.from({ length: 9 }, (_, i) => <circle key={i} cx={x + ((i % 3) - 1) * 6} cy={y + Math.floor(i / 3) * 7} r="3.6" fill={i % 2 ? '#b8641c' : '#d98a2b'} />)}</g>
          ))}
        </g>
        {/* fronds, each sways on its own */}
        <g transform="translate(140 112)">
          {FRONDS.map((a, i) => (
            <g key={i} className="fs-fr" style={{ ['--a' as string]: `${a}deg`, ['--d' as string]: `${(i % 5) * 0.35}s` }}>
              <path d="M0 0 C 40 -18, 82 -12, 118 14 C 84 2, 44 2, 0 6 Z" fill={`url(#leaf-${side})`} />
              {Array.from({ length: 9 }, (_, j) => <path key={j} d={`M${12 + j * 11} ${-3 + j * 0.8} l ${6 + j * 0.4} ${-10 + j * 0.9} M${12 + j * 11} ${2 + j * 1.1} l ${7} ${9 - j * 0.3}`} stroke="#4d7a2f" strokeWidth="2" strokeLinecap="round" />)}
            </g>
          ))}
          <circle r="9" fill="#5b4413" />
        </g>
      </g>
    </svg>
  );
}

function Ghaf({ x, s = 1 }: { x: number; s?: number }) {
  return (
    <g transform={`translate(${x} 0) scale(${s})`} className="fs-ghaf">
      <path d="M0 0 C 1 -10, -2 -18, 1 -28 M1 -20 L -6 -26 M1 -16 L 8 -23" stroke="#6b4c14" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="1" cy="-34" rx="16" ry="8" fill="#6f8f3a" opacity=".9" />
      <ellipse cx="-7" cy="-29" rx="9" ry="5" fill="#5f7f2f" opacity=".9" />
      <ellipse cx="10" cy="-29" rx="9" ry="5" fill="#7f9f45" opacity=".9" />
    </g>
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
        <g transform="translate(0 92)"><Ghaf x={220} s={0.9} /><Ghaf x={640} s={1.15} /><Ghaf x={1010} s={0.8} /><Ghaf x={1270} s={1} /></g>
        <path className="d3" d="M0 128 C 240 108, 420 118, 640 126 S 1000 110, 1200 122 S 1360 118, 1440 124 L 1440 150 L 0 150 Z" fill="url(#dune3)" />
      </svg>
      <span className="fs-sand" />
    </div>
  );
}
