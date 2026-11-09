'use client';

// 3D globe of our offices: a dotted Earth (canvas, no libraries) that turns by itself, a gold airplane
// flying office to office along great-circle routes, pulsing office markers and a list you can click.
// Drag to turn the globe. Pauses off screen; still image when the visitor prefers reduced motion.
import { useEffect, useRef, useState } from 'react';
import { u } from '@/lib/ui';

export type Office = { country: string; city: string; lat: number; lng: number; note?: string };

const R2D = 180 / Math.PI, D2R = Math.PI / 180;
type V = [number, number, number];
const vec = (lat: number, lng: number): V => { const a = lat * D2R, b = lng * D2R; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
/** Point on the great circle between a and b at t (0..1). */
function slerp(a: V, b: V, t: number): V {
  if (!a || !b) return a || b || [0, 0, 1];
  const d = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  if (d < 1e-6) return a;
  const s = Math.sin(d), k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
}
const latLng = (v: V) => [Math.asin(Math.max(-1, Math.min(1, v[1]))) * R2D, Math.atan2(v[0], v[2]) * R2D] as const;

export function OfficeGlobe({ offices, locale = 'en', label = 'offices' }: { offices: Office[]; locale?: string; label?: 'offices' | 'world' }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [leg, setLeg] = useState(0);
  const focus = useRef<number | null>(null);

  useEffect(() => {
    const c = cv.current;
    if (!c || offices.length < 2) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let dots: [number, number][] = [];
    let raf = 0, visible = true, last = performance.now(), running = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    import('@/lib/land-dots').then(({ LAND }) => {
      const n = LAND.split(',').map(Number);
      dots = Array.from({ length: n.length / 2 }, (_, i) => [n[i * 2] / 10, n[i * 2 + 1] / 10]);
    });
    const V3 = offices.map((o) => vec(o.lat, o.lng));
    let rotLng = -offices[0].lng + 25, tilt = 18; // view angles in degrees
    let drag: { x: number; y: number; l: number; t: number } | null = null, idleUntil = 0;
    let t = 0; // flight progress across all legs
    const legDur = 4.2; // seconds per flight

    const size = () => {
      const r = c.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(r.width * dpr); c.height = Math.round(r.width * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return r.width;
    };
    let W = size();
    const ro = new ResizeObserver(() => { W = size(); });
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !running) { last = performance.now(); running = true; raf = requestAnimationFrame(frame); } }, { threshold: 0.05 });
    io.observe(c);

    /** Rotate a unit vector into view space; returns screen x, y and depth z (z > 0 faces us). */
    const proj = (v: V, lift = 1) => {
      if (!v) return { x: -99, y: -99, z: -1 };
      const L = rotLng * D2R, T = tilt * D2R;
      const x1 = v[0] * Math.cos(L) + v[2] * Math.sin(L), z1 = -v[0] * Math.sin(L) + v[2] * Math.cos(L);
      const y2 = v[1] * Math.cos(T) - z1 * Math.sin(T), z2 = v[1] * Math.sin(T) + z1 * Math.cos(T);
      const r = (W / 2) * 0.86 * lift;
      return { x: W / 2 + x1 * r, y: W / 2 - y2 * r, z: z2 };
    };

    function frame(now: number) {
      running = false;
      if (!visible) return;
      if (!Number.isFinite(now)) now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!reduce && Number.isFinite(dt)) t += dt / legDur;
      if (!Number.isFinite(t)) t = 0;
      const k = ((Math.floor(t) % offices.length) + offices.length) % offices.length, f = t - Math.floor(t);
      const ease = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      const a = V3[k], b = V3[(k + 1) % offices.length];
      const pv = slerp(a, b, ease);
      setLeg((p) => (p === k ? p : k));
      // camera follows the plane unless the visitor is dragging or picked an office
      if (!drag && now > idleUntil) {
        const target = focus.current !== null ? offices[focus.current] : (() => { const [la, ln] = latLng(pv); return { lat: la, lng: ln }; })();
        let d = (-target.lng - rotLng) % 360; if (d > 180) d -= 360; if (d < -180) d += 360;
        rotLng += d * Math.min(1, dt * 1.6);
        tilt += (Math.max(-30, Math.min(40, target.lat * 0.55)) - tilt) * Math.min(1, dt * 1.2);
      }
      try { draw(k, ease, pv, now); } catch { /* never break the page */ }
      if (!reduce && !running) { running = true; raf = requestAnimationFrame(frame); }
    }

    function draw(k: number, ease: number, pv: V, now: number) {
      const cx = W / 2, R = (W / 2) * 0.86;
      ctx!.clearRect(0, 0, W, W);
      // glow + sphere
      const glow = ctx!.createRadialGradient(cx, cx, R * 0.9, cx, cx, R * 1.16);
      glow.addColorStop(0, 'rgba(212,175,55,.35)'); glow.addColorStop(1, 'rgba(212,175,55,0)');
      ctx!.fillStyle = glow; ctx!.beginPath(); ctx!.arc(cx, cx, R * 1.16, 0, 7); ctx!.fill();
      const sph = ctx!.createRadialGradient(cx - R * 0.35, cx - R * 0.4, R * 0.1, cx, cx, R);
      sph.addColorStop(0, '#2a2108'); sph.addColorStop(0.55, '#0f0d08'); sph.addColorStop(1, '#050505');
      ctx!.fillStyle = sph; ctx!.beginPath(); ctx!.arc(cx, cx, R, 0, 7); ctx!.fill();
      // land dots
      for (const [la, ln] of dots) {
        const p = proj(vec(la, ln));
        if (p.z <= 0) continue;
        ctx!.fillStyle = `rgba(242,210,122,${0.25 + p.z * 0.65})`;
        const s = 0.6 + p.z * 1.1;
        ctx!.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      // routes (all legs faint, current leg bright up to the plane)
      const route = (i: number, upto: number, alpha: number, width: number) => {
        const A = V3[i], B = V3[(i + 1) % offices.length];
        ctx!.beginPath(); let started = false;
        for (let s = 0; s <= 60; s++) {
          const q = (s / 60) * upto, p = proj(slerp(A, B, q), 1 + Math.sin(Math.PI * q) * 0.18);
          if (p.z < -0.15) { started = false; continue; }
          if (!started) { ctx!.moveTo(p.x, p.y); started = true; } else ctx!.lineTo(p.x, p.y);
        }
        ctx!.strokeStyle = `rgba(242,210,122,${alpha})`; ctx!.lineWidth = width; ctx!.stroke();
      };
      ctx!.setLineDash([3, 5]);
      offices.forEach((_, i) => route(i, 1, 0.28, 1.2));
      ctx!.setLineDash([]);
      route(k, ease, 0.95, 2.2);
      // office markers
      offices.forEach((o, i) => {
        const p = proj(V3[i]);
        if (p.z <= 0.02) return;
        const pulse = (now / 1000 + i * 0.4) % 1.6 / 1.6;
        ctx!.strokeStyle = `rgba(242,210,122,${(1 - pulse) * 0.9})`; ctx!.lineWidth = 1.5;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, 4 + pulse * 14, 0, 7); ctx!.stroke();
        ctx!.fillStyle = '#f2d27a'; ctx!.beginPath(); ctx!.arc(p.x, p.y, 4.2, 0, 7); ctx!.fill();
        ctx!.fillStyle = '#0d0d0d'; ctx!.beginPath(); ctx!.arc(p.x, p.y, 1.8, 0, 7); ctx!.fill();
        const label = o.city ? `${o.city}, ${o.country}` : o.country;
        ctx!.font = '700 12px system-ui, sans-serif';
        const w = ctx!.measureText(label).width + 16;
        const lx = Math.min(W - w - 4, Math.max(4, p.x + 10)), ly = p.y - 28;
        ctx!.globalAlpha = Math.min(1, p.z * 2.5);
        ctx!.fillStyle = 'rgba(13,13,13,.85)'; ctx!.strokeStyle = 'rgba(242,210,122,.6)'; ctx!.lineWidth = 1;
        ctx!.beginPath(); ctx!.roundRect(lx, ly, w, 22, 11); ctx!.fill(); ctx!.stroke();
        ctx!.fillStyle = '#fff'; ctx!.fillText(label, lx + 8, ly + 15);
        ctx!.globalAlpha = 1;
      });
      // airplane: position on the lifted arc, nose along the route
      const lift = 1 + Math.sin(Math.PI * ease) * 0.18;
      const p = proj(pv, lift), ahead = proj(slerp(V3[k], V3[(k + 1) % offices.length], Math.min(1, ease + 0.01)), 1 + Math.sin(Math.PI * Math.min(1, ease + 0.01)) * 0.18);
      if (p.z > -0.1) {
        const ang = Math.atan2(ahead.y - p.y, ahead.x - p.x);
        ctx!.save(); ctx!.translate(p.x, p.y); ctx!.rotate(ang + Math.PI / 2);
        ctx!.shadowColor = 'rgba(212,175,55,.9)'; ctx!.shadowBlur = 14;
        ctx!.fillStyle = '#ffffff';
        ctx!.beginPath();
        // simple airliner silhouette pointing up (nose at -y)
        ctx!.moveTo(0, -13); ctx!.lineTo(2.2, -6); ctx!.lineTo(2.2, -2); ctx!.lineTo(12, 3); ctx!.lineTo(12, 5.5); ctx!.lineTo(2.2, 2.5);
        ctx!.lineTo(2, 8.5); ctx!.lineTo(5, 11); ctx!.lineTo(5, 12.5); ctx!.lineTo(0, 11); ctx!.lineTo(-5, 12.5); ctx!.lineTo(-5, 11); ctx!.lineTo(-2, 8.5);
        ctx!.lineTo(-2.2, 2.5); ctx!.lineTo(-12, 5.5); ctx!.lineTo(-12, 3); ctx!.lineTo(-2.2, -2); ctx!.lineTo(-2.2, -6); ctx!.closePath();
        ctx!.fill(); ctx!.restore();
      }
    }

    // drag to turn
    const down = (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, l: rotLng, t: tilt }; c.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { if (!drag) return; rotLng = drag.l + (e.clientX - drag.x) * 0.4; tilt = Math.max(-60, Math.min(60, drag.t + (e.clientY - drag.y) * 0.3)); if (reduce) draw(0, 0, V3[0], performance.now()); };
    const up = () => { drag = null; idleUntil = performance.now() + 2500; };
    c.addEventListener('pointerdown', down); c.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    running = true; raf = requestAnimationFrame(frame);
    if (reduce) setTimeout(() => draw(0, 0, V3[0], performance.now()), 300);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); c.removeEventListener('pointerdown', down); c.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [offices]);

  const pick = (i: number) => { focus.current = i; setTimeout(() => { if (focus.current === i) focus.current = null; }, 4000); };
  const next = (leg + 1) % offices.length;
  return (
    <div className="oglobe">
      <div className="og-stage">
        <canvas ref={cv} className="og-cv" role="img" aria-label={`${label === 'world' ? 'Globe with cities around the world' : 'Globe with our offices'}: ${offices.map((o) => o.city || o.country).join(', ')}`} />
        {offices.length > 1 && <p className="og-now" aria-live="polite">✈ {label === 'world' ? `${offices[leg]?.city} → ${offices[next]?.city}` : `${offices[leg]?.country} → ${offices[next]?.country}`}</p>}
      </div>
      <ul className={`og-list${label === 'world' ? ' og-world' : ''}`}>
        {offices.map((o, i) => (
          <li key={i} className={i === leg || i === next ? 'on' : ''}>
            <button type="button" onClick={() => pick(i)}>
              <span className="og-pin" aria-hidden="true" />
              <span>{label === 'world' ? <><b>{o.city}</b><small>{u(o.country, locale)}</small></> : <><b>{u(o.country, locale)}</b>{o.city && <small>{o.city}</small>}</>}{o.note && <small className="og-note">{u(o.note, locale)}</small>}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
