// Interface texts of website widgets (booking, flight path, contact/about sections, quick facts…).
// Each text is looked up by its English wording; translations are made with AI in Admin > Languages
// and loaded by the website layout. Missing translations fall back to English.
declare global {
  // eslint-disable-next-line no-var
  var __ADGV_UI: Record<string, Record<string, string>> | undefined;
  interface Window { __ADGV_UI?: Record<string, Record<string, string>> }
}

export function u(en: string, locale?: string): string {
  if (!locale || locale === 'en') return en;
  const all = typeof window !== 'undefined' ? window.__ADGV_UI : globalThis.__ADGV_UI;
  return all?.[locale]?.[en] || en;
}
