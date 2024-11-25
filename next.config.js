/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    PORT: process.env.PORT || '8080'
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:8080']
    }
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
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/knbl-sma/**',
      }
    ],
    unoptimized: true
  },
}

module.exports = nextConfig
