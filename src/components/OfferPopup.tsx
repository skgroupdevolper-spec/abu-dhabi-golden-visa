'use client';

import { useEffect, useState } from 'react';
import { SITE } from '@/lib/site';

export function OfferPopup() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!SITE.features.offer) return;
    try { if (localStorage.getItem('adgv-offer') === SITE.offer.title) return; } catch {}
    const t = window.setTimeout(() => setShow(true), Math.max(0, SITE.offer.delaySeconds) * 1000);
    return () => window.clearTimeout(t);
  }, []);
  if (!show) return null;
  const close = () => { setShow(false); try { localStorage.setItem('adgv-offer', SITE.offer.title); } catch {} };
  return (
    <div className="offer" role="dialog" aria-label={SITE.offer.title}>
      <button type="button" className="x" aria-label="Close" onClick={close}>✕</button>
      <img src="/brand/coin.webp" alt="" width={70} height={70} />
      <div><b>{SITE.offer.title}</b><p>{SITE.offer.text}</p><a className="btn btn-gold" href={SITE.offer.link} onClick={close}>{SITE.offer.button}</a></div>
    </div>
  );
}
