const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      }
    ],
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@vercel/blob', 'undici'],
  },
  env: {
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN || process.env.VERCEL_URL || 'localhost',
  },
  async headers() {
    return [
      {
        source: '/favicons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isProd
              ? 'public, max-age=86400, stale-while-revalidate=604800'
              : 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/:path*\\.(png|jpg|jpeg|svg|ico|js|css|woff|woff2|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: isProd
              ? 'public, max-age=31536000, immutable'
              : 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [];
  },
  ...(isProd
    ? {}
    : {
        logging: {
          fetches: {
            fullUrl: true,
          },
        },
      }),
};

module.exports = withBundleAnalyzer(nextConfig);
