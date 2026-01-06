/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';
const defaultApiUrl = process.env.NEXT_PUBLIC_API_URL || (isProduction
  ? 'https://lantern-ai.onrender.com'
  : 'http://localhost:3002');

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Environment variables baked in at build time
  env: {
    NEXT_PUBLIC_API_URL: defaultApiUrl,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || (isProduction ? 'production' : 'development'),
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || 'true'
  }
}

module.exports = nextConfig
