'use client';

// Shows every AED price on the page in the currency the visitor picked (header menu), using the live
// rates injected by the layout. Amounts in other currencies are marked ≈ (approximate).
// The text is changed in place (same text node), so React keeps working normally; inputs, the cost
// calculator (it converts itself) and [data-nofx] areas are left alone.
import { useEffect } from 'react';
import { RATES, siteFx } from '@/lib/fees';
import { CURRENCY_EVENT, getCurrency } from './Header';

const RE = /AED\s?(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)|(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)\s?AED/g;
const SKIP = 'script,style,textarea,input,select,option,code,pre,[data-nofx],[contenteditable]';
type Rec = { orig: string; out: string };

export function PriceFx() {
  useEffect(() => {
    const seen = new Map<Text, Rec>();
    let code = getCurrency(), timer: ReturnType<typeof setTimeout> | null = null;

    const render = (orig: string) => {
      const r = (siteFx() ?? RATES)[code];
      if (!r || code === 'AED') return orig;
      return orig.replace(RE, (m, a, b) => {
        const n = Number(String(a ?? b).replace(/,/g, ''));
        if (!Number.isFinite(n)) return m;
        const v = n * r.rate;
        return `≈ ${r.symbol}${v.toLocaleString('en-US', { maximumFractionDigits: v < 100 ? 2 : 0 })}`;
      });
    };
    const apply = (t: Text, rec: Rec) => { rec.out = render(rec.orig); if (t.nodeValue !== rec.out) t.nodeValue = rec.out; };

    const scan = () => {
      for (const [t] of seen) if (!t.isConnected) seen.delete(t);
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (/AED/.test(n.nodeValue ?? '') && !n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
      });
      while (w.nextNode()) {
        const t = w.currentNode as Text, rec = seen.get(t);
        if (rec) { if (t.nodeValue !== rec.out) rec.orig = t.nodeValue ?? ''; apply(t, rec); continue; } // React changed it: new original
        RE.lastIndex = 0;
        if (!RE.test(t.nodeValue ?? '')) continue;
        const r2: Rec = { orig: t.nodeValue ?? '', out: '' };
        seen.set(t, r2); apply(t, r2);
      }
    };
    const repaint = () => { for (const [t, rec] of seen) if (t.isConnected) apply(t, rec); };

    scan();
    const onCur = (e: Event) => { code = (e as CustomEvent<string>).detail || getCurrency(); repaint(); scan(); };
    window.addEventListener(CURRENCY_EVENT, onCur);
    const mo = new MutationObserver((list) => {
      // Ignore the changes we made ourselves.
      if (list.every((m) => m.type === 'characterData' && seen.get(m.target as Text)?.out === m.target.nodeValue)) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(scan, 200);
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => { window.removeEventListener(CURRENCY_EVENT, onCur); mo.disconnect(); if (timer) clearTimeout(timer); };
  }, []);
  return null;
}
