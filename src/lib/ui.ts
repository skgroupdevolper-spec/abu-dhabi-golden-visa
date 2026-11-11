// Interface texts of website widgets (booking, flight path, contact/about sections, quick facts…).
// Each text is looked up by its English wording; translations are made with AI in Admin > Languages
// and loaded by the website layout. Missing translations fall back to English.
declare global {
  // eslint-disable-next-line no-var
  var __ADGV_UI: Record<string, Record<string, string>> | undefined;
  // eslint-disable-next-line no-var
  var __ADGV_MISS: Set<string> | undefined;
  interface Window { __ADGV_UI?: Record<string, Record<string, string>> }
}

export function u(en: string, locale?: string): string {
  if (!locale || locale === 'en') return en;
  const all = typeof window !== 'undefined' ? window.__ADGV_UI : globalThis.__ADGV_UI;
  const t = all?.[locale]?.[en];
  // On the server, remember texts that have no translation yet; they are translated automatically in the background.
  if (!t && en && en.length < 600 && /[A-Za-z]{2}/.test(en)) {
    if (typeof window === 'undefined') (globalThis.__ADGV_MISS ??= new Set()).add(en);
    else report(en);
  }
  return t || en;
}

/* In the browser, texts shown without a translation are sent to the server in one small batch. */
let pending: Set<string> | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
function report(en: string) {
  (pending ??= new Set()).add(en);
  if (timer) return;
  timer = setTimeout(() => {
    const list = [...(pending ?? [])].slice(0, 100);
    pending = undefined; timer = undefined;
    try { navigator.sendBeacon?.('/api/ui-miss/', new Blob([JSON.stringify(list)], { type: 'application/json' })); } catch { /* ignore */ }
  }, 3000);
}
