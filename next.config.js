/** @type {import('next').NextConfig} */
const nextConfig = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://crypto-news-ctky4y2te-arielcitos-projects.vercel.app'),
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
  }
};

module.exports = nextConfig; 