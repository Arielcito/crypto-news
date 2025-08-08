const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
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
        // Cache favicons with shorter duration for easier updates
        source: '/favicons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development' 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // Cache static assets aggressively (1 year with immutable)
        source: '/:path*\\.(png|jpg|jpeg|svg|ico|js|css|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development'
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
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

module.exports = withBundleAnalyzer(nextConfig); 