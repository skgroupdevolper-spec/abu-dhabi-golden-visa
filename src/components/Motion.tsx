'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Smooth scroll (desktop only), scroll reveals, instant gold cursor, magnetic buttons and card
// spotlight. Everything starts from a visible state, and nothing runs for reduced motion.
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let cleanup: (() => void)[] = [];
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      if (fine) {
        const { default: Lenis } = await import('lenis');
        if (cancelled) return;
        const l = new Lenis({ lerp: 0.22, smoothWheel: true, wheelMultiplier: 1.1 });
        l.on('scroll', () => ScrollTrigger.update());
        const tick = (t: number) => l.raf(t * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        cleanup.push(() => {
          gsap.ticker.remove(tick);
          l.destroy();
        });
      }

      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el, i) => {
          gsap.from(el, { y: 50, opacity: 0.25, duration: 1, ease: 'expo.out', delay: (i % 3) * 0.06, scrollTrigger: { trigger: el, start: 'top 92%' } });
        });
        gsap.from('.phero h1', { y: 40, opacity: 0.3, duration: 1.1, ease: 'expo.out' });
      });
      cleanup.push(() => ctx.revert());

      if (fine) {
        const dot = document.querySelector<HTMLElement>('.cur-dot');
        const ring = document.querySelector<HTMLElement>('.cur-ring');
        if (dot && ring) {
          const rx = gsap.quickTo(ring, 'x', { duration: 0.12, ease: 'power2' });
          const ry = gsap.quickTo(ring, 'y', { duration: 0.12, ease: 'power2' });
          const move = (e: PointerEvent) => {
            document.body.classList.add('c-on');
            gsap.set(dot, { x: e.clientX, y: e.clientY });
            rx(e.clientX);
            ry(e.clientY);
          };
          const over = (e: PointerEvent) => {
            const t = e.target as HTMLElement;
            const v = !!t.closest('[data-view]');
            document.body.classList.toggle('c-view', v);
            document.body.classList.toggle('c-hover', !v && !!t.closest('a,button'));
          };
          window.addEventListener('pointermove', move, { passive: true });
          document.addEventListener('pointerover', over);
          cleanup.push(() => {
            window.removeEventListener('pointermove', move);
            document.removeEventListener('pointerover', over);
          });
        }
        const spot = (e: PointerEvent) => {
          const c = (e.target as HTMLElement).closest<HTMLElement>('.card');
          if (!c) return;
          const r = c.getBoundingClientRect();
          c.style.setProperty('--mx', `${e.clientX - r.left}px`);
          c.style.setProperty('--my', `${e.clientY - r.top}px`);
        };
        document.addEventListener('pointermove', spot, { passive: true });
        cleanup.push(() => document.removeEventListener('pointermove', spot));
      }
    })();

    return () => {
      cancelled = true;
      cleanup.forEach((f) => f());
      cleanup = [];
    };
  }, [pathname]);

  return (
    <>
      <div className="cur-ring" aria-hidden="true"><span>VIEW</span></div>
      <div className="cur-dot" aria-hidden="true" />
    </>
  );
}
