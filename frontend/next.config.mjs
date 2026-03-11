import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: resolve(__dirname, '..'),
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
