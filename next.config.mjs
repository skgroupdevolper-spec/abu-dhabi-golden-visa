/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
  // Client and team document uploads go through server actions.
  experimental: {
    serverActions: {
      bodySizeLimit: '16mb',
      // Forms post through proxies (Codespaces preview, xCloud, the app. subdomain): allow these origins.
      allowedOrigins: ['localhost:3000', '*.app.github.dev', '*.github.dev', 'abudhabigoldenvisa.com', '*.abudhabigoldenvisa.com'],
    },
  },
  // Familiar client addresses (as in Odoo-style portals): /web/login and /my open the customer dashboard.
  async redirects() {
    const ph = process.env.PORTAL_HOST;
    const main = ph ? { missing: [{ type: 'host', value: ph }] } : {};
    const app = ph ? [
      { source: '/web/login', destination: '/login/', permanent: false, has: [{ type: 'host', value: ph }] },
      { source: '/web', destination: '/login/', permanent: false, has: [{ type: 'host', value: ph }] },
      { source: '/my', destination: '/', permanent: false, has: [{ type: 'host', value: ph }] },
      { source: '/my/:path*', destination: '/', permanent: false, has: [{ type: 'host', value: ph }] },
    ] : [];
    return [
      ...app,
      { source: '/web/login', destination: '/portal/login/', permanent: false, ...main },
      { source: '/web', destination: '/portal/login/', permanent: false, ...main },
      { source: '/my', destination: '/portal/', permanent: false, ...main },
      { source: '/my/:path*', destination: '/portal/', permanent: false, ...main },
      { source: '/login', destination: '/portal/login/', permanent: false, ...main },
    ];
  },
  async headers() {
    return [
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] },
      { source: '/brand/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default nextConfig;
