import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n';

const PORTAL_HOST = (process.env.PORTAL_HOST || 'app.abudhabigoldenvisa.com').toLowerCase();

/**
 * English lives at "/" with no prefix, other languages at "/xx/".
 * Internally every page sits under /[locale]/, so unprefixed paths are rewritten to /en/.
 * Requests to the portal host are served the client portal; /admin is the team dashboard.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const { pathname } = url;

  const first = pathname.split('/')[1];

  // Customer dashboard subdomain: everything is served from /portal.
  if (host === PORTAL_HOST) {
    if (first === 'admin') { const h = new Headers(req.headers); h.set('x-admin-path', pathname.endsWith('/') ? pathname : `${pathname}/`); return NextResponse.next({ request: { headers: h } }); }
    if (first === 'portal') return NextResponse.next();
    url.pathname = `/portal${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Dashboards have their own pages (no language prefix). The admin path is passed on for section permissions.
  if (first === 'admin') { const h = new Headers(req.headers); h.set('x-admin-path', pathname.endsWith('/') ? pathname : `${pathname}/`); return NextResponse.next({ request: { headers: h } }); }
  if (first === 'portal') return NextResponse.next();

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
