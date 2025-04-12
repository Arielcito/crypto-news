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
    // Disable instrumentation hook to prevent regex stack issues
    instrumentationHook: false,
    // Simplify build pattern matching
    webpackBuildWorker: false,
  },
  // Use server components for dynamic routes
  output: 'standalone',
  // Limit the regexp patterns during build
  transpilePackages: [],
  // Prevent excessive module resolution and matching
  webpack: (config) => {
    // Optimized cache settings
    config.cache = {
      ...config.cache,
      maxGenerations: 1,
    };
    
    // Limit module resolution depth
    config.resolve.symlinks = false;
    
    return config;
  },
};

module.exports = nextConfig; 