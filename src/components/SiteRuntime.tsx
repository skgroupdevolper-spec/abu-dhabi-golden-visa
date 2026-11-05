'use client';

import { useEffect } from 'react';

/** Injects the admin's tracking code (head and end of body) once per visit. */
export function TrackingCode({ head, body }: { head: string; body: string }) {
  useEffect(() => {
    const add = (html: string, target: HTMLElement, mark: string) => {
      if (!html.trim() || document.querySelector(`[data-adgv="${mark}"]`)) return;
      const tpl = document.createElement('template');
      tpl.innerHTML = html;
      tpl.content.childNodes.forEach((n) => {
        if (n.nodeName === 'SCRIPT') {
          const src = n as HTMLScriptElement, s = document.createElement('script');
          for (const a of Array.from(src.attributes)) s.setAttribute(a.name, a.value);
          s.text = src.text;
          s.dataset.adgv = mark;
          target.appendChild(s);
        } else if (n.nodeType === 1) {
          (n as HTMLElement).dataset.adgv = mark;
          target.appendChild(n.cloneNode(true));
        }
      });
    };
    add(head, document.head, 'head');
    add(body, document.body, 'body');
  }, [head, body]);
  return null;
}
