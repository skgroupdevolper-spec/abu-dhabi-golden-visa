'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Calculator } from './Calculator';

export const CALC_EVENT = 'adgv:calc';

/** Opens the cost calculator in a pop-up from anywhere: any element with data-open-calc
 *  (optionally data-route="0..5"), or window.dispatchEvent(new CustomEvent('adgv:calc', { detail: route })). */
export function CalcModal() {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState<number | null>(null);
  const [n, setN] = useState(0);
  const last = useRef<HTMLElement | null>(null);

  const show = useCallback((r: number | null, from?: HTMLElement | null) => {
    last.current = from ?? null;
    setRoute(r);
    setN((x) => x + 1);
    setOpen(true);
    document.documentElement.classList.add('calc-open');
    if (from && window.__adgvDrop) {
      const b = from.getBoundingClientRect();
      window.__adgvDrop(b.left + b.width / 2, b.top + b.height / 2, 0.08, -1.2);
    }
  }, []);
  const hide = useCallback(() => {
    setOpen(false);
    document.documentElement.classList.remove('calc-open');
    last.current?.focus();
  }, []);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-open-calc]');
      if (!t) return;
      e.preventDefault();
      const r = t.dataset.route;
      show(r === undefined || r === '' ? null : Number(r), t);
    };
    const ev = (e: Event) => show((e as CustomEvent<number | null>).detail ?? null);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && hide();
    document.addEventListener('click', click);
    window.addEventListener(CALC_EVENT, ev);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('click', click);
      window.removeEventListener(CALC_EVENT, ev);
      document.removeEventListener('keydown', key);
    };
  }, [show, hide]);

  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Golden Visa cost calculator" onClick={(e) => e.target === e.currentTarget && hide()}>
      <div className="wz" data-lenis-prevent>
        <div className="wz-top">
          <img decoding="async" src="/brand/logo.webp" alt="Abu Dhabi Golden Visa" width={150} height={34} />
          <button type="button" onClick={hide} aria-label="Close calculator">✕</button>
        </div>
        <div className="wz-body">
          <Calculator key={n} initialRoute={route} bare />
        </div>
      </div>
    </div>
  );
}
