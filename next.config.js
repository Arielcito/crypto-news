/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: process.env.WORDPRESS_HOSTNAME,
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: `${process.env.WORDPRESS_URL}/wp-admin`,
        permanent: true,
      },
    ];
  },
  // Add options to reduce static generation complexity
  staticPageGenerationTimeout: 180,
  experimental: {
    // This helps prevent regex stack overflows
    instrumentationHook: false,
    // Limit resource use during static generation
    cpus: Math.max(1, Math.min(4, require('os').cpus().length / 2)),
  }
};

module.exports = nextConfig; 