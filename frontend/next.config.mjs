import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const ALLOWED_DEV_ORIGINS = (
  process.env.NEXT_ALLOWED_DEV_ORIGINS || 'http://122.248.193.215:4000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: resolve(__dirname, '..'),
  allowedDevOrigins: ALLOWED_DEV_ORIGINS,
  async rewrites() {
    return [
      { source: '/auth/:path*', destination: `${API_URL}/auth/:path*` },
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
      { source: '/erp-sync/:path*', destination: `${API_URL}/erp-sync/:path*` },
      { source: '/health', destination: `${API_URL}/health` },
    ]
  },
}

export default nextConfig
