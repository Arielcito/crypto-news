/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      }
    ],
  },
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  // Force the domain to be detected from the host header in production
  env: {
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN || process.env.VERCEL_URL || 'localhost',
  },
  // Optimized caching for static assets
  async headers() {
    return [
      {
        // Cache static assets like favicons for 1 year
        source: '/favicons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache logos and images for 1 day but allow revalidation
        source: '/:path*\\.(png|jpg|jpeg|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  // Add rewrites to handle domain-specific routing if needed
  async rewrites() {
    return [];
  },
  // Logging for production debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig; 