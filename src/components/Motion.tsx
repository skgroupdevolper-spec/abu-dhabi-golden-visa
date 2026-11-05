'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

type Props = { level?: 'full' | 'subtle' | 'off'; textFx?: 'words' | 'letters' | 'fade' | 'none'; cursor?: boolean; smooth?: boolean };

/** Splits a heading into word (or letter) spans for the text effect; keeps line breaks and inner tags. */
function split(el: HTMLElement, mode: 'words' | 'letters') {
  if (el.dataset.split) return [] as HTMLElement[];
  el.dataset.split = '1';
  const out: HTMLElement[] = [];
  const walk = (node: Node) => {
    for (const n of Array.from(node.childNodes)) {
      if (n.nodeType === 3) {
        const parts = (n.textContent || '').split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const p of parts) {
          if (!p) continue;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); continue; }
          const w = document.createElement('span');
          w.className = 'tx-w';
          if (mode === 'letters' && p.length < 30) {
            for (const ch of Array.from(p)) { const c = document.createElement('span'); c.className = 'tx-i'; c.textContent = ch; w.appendChild(c); out.push(c); }
          } else { const i = document.createElement('span'); i.className = 'tx-i'; i.textContent = p; w.appendChild(i); out.push(i); }
          frag.appendChild(w);
        }
        n.parentNode?.replaceChild(frag, n);
      } else if (n.nodeType === 1 && (n as HTMLElement).matches('em.gold, .goldtext, .gtext')) {
        // Gold gradient text is animated as one piece so its gradient stays intact.
        const w = document.createElement('span');
        w.className = 'tx-w';
        n.parentNode?.insertBefore(w, n);
        w.appendChild(n);
        (n as HTMLElement).classList.add('tx-i');
        out.push(n as HTMLElement);
      } else if (n.nodeType === 1 && !['BR', 'SVG', 'IMG'].includes((n as HTMLElement).tagName)) walk(n);
    }
  };
  walk(el);
  return out;
}

// Smooth scroll, scroll reveals, heading text effects, parallax images, count-up numbers, card tilt,
// magnetic buttons, gold cursor and a reading progress bar. Levels and effects are set in Admin > Design.
// Everything starts from a visible state, and nothing runs for reduced motion.
export function Motion({ level = 'full', textFx = 'words', cursor = true, smooth = false }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (level === 'off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const full = level === 'full';
    let cleanup: (() => void)[] = [];
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      if (fine && smooth && full) {
        const { default: Lenis } = await import('lenis');
        if (cancelled) return;
        const l = new Lenis({ lerp: 0.35, smoothWheel: true, wheelMultiplier: 1.2 });
        l.on('scroll', () => ScrollTrigger.update());
        const tick = (t: number) => l.raf(t * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        cleanup.push(() => { gsap.ticker.remove(tick); l.destroy(); });
      }

      const ctx = gsap.context(() => {
        // Scroll reveals
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el, i) => {
          gsap.from(el, { y: full ? 36 : 16, opacity: full ? 1 : 0.4, duration: full ? 0.9 : 0.6, ease: 'expo.out', delay: (i % 3) * 0.06, scrollTrigger: { trigger: el, start: 'top 92%' } });
        });

        // Heading text effects (page title on load, section titles on scroll)
        if (textFx !== 'none') {
          const heads = gsap.utils.toArray<HTMLElement>('.phero h1, .bk-hero-h, .bh h2, .block > .bh h2, .cta-band h2, .bk-cta h2');
          heads.forEach((h, n) => {
            const first = n === 0 && h.matches('.phero h1, .bk-hero-h');
            if (textFx === 'fade') {
              gsap.from(h, { opacity: 0, filter: 'blur(8px)', y: 14, duration: 1, ease: 'power3.out', scrollTrigger: first ? undefined : { trigger: h, start: 'top 90%' } });
              return;
            }
            const parts = split(h, textFx);
            if (!parts.length) return;
            gsap.from(parts, { yPercent: 110, opacity: 0, rotate: textFx === 'letters' ? 6 : 2, duration: textFx === 'letters' ? 0.7 : 0.9, ease: 'expo.out', stagger: textFx === 'letters' ? 0.018 : 0.06, scrollTrigger: first ? undefined : { trigger: h, start: 'top 90%' } });
          });
        } else gsap.from('.phero h1', { y: 30, duration: 1, ease: 'expo.out' });

        // Icons draw themselves in when they scroll into view (outside header and menus).
        const icons = gsap.utils.toArray<SVGSVGElement>('main .si, footer .si').filter((s) => !s.closest('.top, .mega, .btn, .bell, [data-noanim]'));
        icons.forEach((s) => { const p = s.querySelector('path'); if (!p) return; try { s.style.setProperty('--ic-len', String(Math.ceil(p.getTotalLength()) + 2)); } catch { return; } s.classList.add('si-draw'); });
        ScrollTrigger.batch(icons.filter((s) => s.classList.contains('si-draw')), { start: 'top 94%', once: true, onEnter: (els) => els.forEach((e, i) => setTimeout(() => e.classList.add('si-drawn'), i * 70)) });
        cleanup.push(() => icons.forEach((s) => s.classList.remove('si-draw', 'si-drawn')));

        // Ticks and steps light up one by one while scrolling (lists, documents, requirements, timelines).
        const items = gsap.utils.toArray<HTMLElement>('main .ticks li, main .doc-grid li, main .req-grid li, main .timeline li, main .side-apply li, main .trust-row li, main .prose ul li, main .bk-facts li');
        items.forEach((li) => {
          li.classList.add('sk');
          ScrollTrigger.create({ trigger: li, start: 'top 82%', onEnter: () => li.classList.add('on'), onLeaveBack: () => li.classList.remove('on') });
        });
        cleanup.push(() => items.forEach((li) => li.classList.remove('sk', 'on')));
        gsap.utils.toArray<HTMLElement>('main .timeline').forEach((tl) => {
          tl.classList.add('sk');
          ScrollTrigger.create({ trigger: tl, start: 'top 75%', end: 'bottom 70%', scrub: true, onUpdate: (s) => tl.style.setProperty('--p', s.progress.toFixed(3)) });
        });

        if (!full) return;

        // Image reveal and gentle parallax
        gsap.utils.toArray<HTMLElement>('.phero-img img, .post-cover img, .bk-img, .bk-hero-im img, .bk-it img').forEach((img) => {
          gsap.fromTo(img, { clipPath: 'inset(12% 8% 12% 8% round 24px)', scale: 1.06 }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: img, start: 'top 88%' } });
          gsap.to(img, { yPercent: -4, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
        });

        // Cards and list rows rise in groups
        gsap.utils.toArray<HTMLElement>('.grid, .bk-cards, .doc-grid, .bk-stats, .bi-grid').forEach((g) => {
          const kids = Array.from(g.children) as HTMLElement[];
          if (kids.length > 1) gsap.from(kids, { y: 28, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: g, start: 'top 88%' } });
        });

        // Count-up numbers
        gsap.utils.toArray<HTMLElement>('.bk-stats b, .facts dd, .stat b, [data-count]').forEach((el) => {
          const raw = el.textContent || '';
          const m = raw.match(/[\d,]+(\.\d+)?/);
          if (!m || el.children.length) return;
          const target = Number(m[0].replace(/,/g, ''));
          if (!Number.isFinite(target) || target < 2) return;
          const dec = (m[1] || '').length - 1;
          const o = { v: 0 };
          gsap.to(o, { v: target, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' },
            onUpdate: () => { el.textContent = raw.replace(m[0], o.v.toLocaleString('en-US', { minimumFractionDigits: Math.max(0, dec), maximumFractionDigits: Math.max(0, dec) })); },
            onComplete: () => { el.textContent = raw; } });
        });

        // Reading progress bar
        const bar = document.querySelector<HTMLElement>('.read-bar');
        if (bar) gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
      });
      cleanup.push(() => ctx.revert());

      if (fine && full) {
        // Gold cursor
        const dot = document.querySelector<HTMLElement>('.cur-dot');
        const ring = document.querySelector<HTMLElement>('.cur-ring');
        if (cursor && dot && ring) {
          // Centre both on the pointer (GSAP x/y replace the CSS translate), follow almost instantly.
          gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
          const rx = gsap.quickTo(ring, 'x', { duration: 0.06, ease: 'power3' });
          const ry = gsap.quickTo(ring, 'y', { duration: 0.06, ease: 'power3' });
          const hide = () => document.body.classList.remove('c-on');
          document.addEventListener('pointerleave', hide);
          window.addEventListener('blur', hide);
          cleanup.push(() => { document.removeEventListener('pointerleave', hide); window.removeEventListener('blur', hide); });
          const move = (e: PointerEvent) => { document.body.classList.add('c-on'); gsap.set(dot, { x: e.clientX, y: e.clientY }); rx(e.clientX); ry(e.clientY); };
          const over = (e: PointerEvent) => {
            const t = e.target as HTMLElement;
            const v = !!t.closest('[data-view]');
            document.body.classList.toggle('c-view', v);
            document.body.classList.toggle('c-hover', !v && !!t.closest('a,button'));
          };
          window.addEventListener('pointermove', move, { passive: true });
          document.addEventListener('pointerover', over);
          cleanup.push(() => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerover', over); });
        }
        // Card spotlight and 3D tilt
        const spot = (e: PointerEvent) => {
          const c = (e.target as HTMLElement).closest<HTMLElement>('.card, .bk-card');
          if (!c) return;
          const r = c.getBoundingClientRect();
          const x = e.clientX - r.left, y = e.clientY - r.top;
          c.style.setProperty('--mx', `${x}px`);
          c.style.setProperty('--my', `${y}px`);
          gsap.to(c, { rotateY: ((x / r.width) - 0.5) * 6, rotateX: (0.5 - (y / r.height)) * 6, transformPerspective: 900, duration: 0.4, ease: 'power2.out' });
        };
        const leave = (e: PointerEvent) => {
          const c = (e.target as HTMLElement).closest?.('.card, .bk-card');
          if (c && !(e.relatedTarget instanceof Node && c.contains(e.relatedTarget))) gsap.to(c, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
        };
        document.addEventListener('pointermove', spot, { passive: true });
        document.addEventListener('pointerout', leave, { passive: true });
        cleanup.push(() => { document.removeEventListener('pointermove', spot); document.removeEventListener('pointerout', leave); });
        // Magnetic buttons
        const btns = Array.from(document.querySelectorAll<HTMLElement>('.btn-gold, .btn-red, .mag'));
        const mm = (e: PointerEvent) => {
          const b = e.currentTarget as HTMLElement; const r = b.getBoundingClientRect();
          gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.18, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 0.3, ease: 'power2.out' });
        };
        const ml = (e: PointerEvent) => gsap.to(e.currentTarget as HTMLElement, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        btns.forEach((b) => { b.addEventListener('pointermove', mm); b.addEventListener('pointerleave', ml); });
        cleanup.push(() => btns.forEach((b) => { b.removeEventListener('pointermove', mm); b.removeEventListener('pointerleave', ml); }));
      }
    })();

    return () => { cancelled = true; cleanup.forEach((f) => f()); cleanup = []; };
  }, [pathname, level, textFx, cursor, smooth]);

  return (
    <>
      {level === 'full' && <div className="read-bar" aria-hidden="true" />}
      {cursor && level === 'full' && <><div className="cur-ring" aria-hidden="true"><span>VIEW</span></div><div className="cur-dot" aria-hidden="true" /></>}
    </>
  );
}
