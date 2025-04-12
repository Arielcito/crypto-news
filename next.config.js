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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://crypto-news-7iqshbwpy-arielcitos-projects.vercel.app'),
};

module.exports = nextConfig; 