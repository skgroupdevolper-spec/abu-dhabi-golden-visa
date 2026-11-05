import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n';

const PORTAL_HOST = (process.env.PORTAL_HOST || 'app.abudhabigoldenvisa.com').toLowerCase();

/**
 * English lives at "/" with no prefix, other languages at "/xx/".
 * Internally every page sits under /[locale]/, so unprefixed paths are rewritten to /en/.
 * Requests to the portal host are served the client portal.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const { pathname } = url;

  if (host === PORTAL_HOST) {
    url.pathname = `/${DEFAULT_LOCALE}/portal${pathname === '/' ? '/' : pathname}`;
    if (!url.pathname.endsWith('/')) url.pathname += '/';
    return NextResponse.rewrite(url);
  }

  const first = pathname.split('/')[1];

  // /en/... is never public: send it to the unprefixed address.
  if (first === DEFAULT_LOCALE) {
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || '/';
    return NextResponse.redirect(url, 308);
  }

  if (isLocale(first)) return NextResponse.next();

  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, the API, metadata routes and any file with an extension.
  matcher: ['/((?!_next|api|sitemap\\.xml|robots\\.txt|icon\\.png|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)'],
};
