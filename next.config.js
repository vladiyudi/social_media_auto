/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    PORT: process.env.PORT || '8080'
  },
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'fal.media',
      }
    ],
  },
}

module.exports = nextConfig
