/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  images: {
    domains: [
      'picsum.photos',
      'fal.media',
      'storage.googleapis.com', 
      'lh3.googleusercontent.com', 
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fal.media',
        pathname: '/files/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    return config;
  },
}

module.exports = nextConfig
