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
    return [
      { source: '/web/login', destination: '/portal/login/', permanent: false },
      { source: '/web', destination: '/portal/login/', permanent: false },
      { source: '/my', destination: '/portal/', permanent: false },
      { source: '/my/:path*', destination: '/portal/', permanent: false },
      { source: '/login', destination: '/portal/login/', permanent: false },
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
        ],
      },
    ];
  },
};

export default nextConfig;
