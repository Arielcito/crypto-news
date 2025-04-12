import { NextConfig } from 'next';

const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },

  output: 'standalone',
};

export default config; 