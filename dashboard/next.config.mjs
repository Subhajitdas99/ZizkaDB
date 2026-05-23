/** @type {import('next').NextConfig} */
const apiUpstream = process.env.API_REWRITE_TARGET || 'http://127.0.0.1:8000'

const nextConfig = {
  // NEXT_PUBLIC_API_URL can be set at build time for external API hosts.
  // If not set, relative URLs are used and Nginx routes /v1/ to FastAPI.
  output: 'standalone',
  async rewrites() {
    // Fallback when /api-explorer hits Next instead of nginx → FastAPI
    return [
      { source: '/api-explorer', destination: `${apiUpstream}/api-explorer` },
      { source: '/api-explorer/:path*', destination: `${apiUpstream}/api-explorer/:path*` },
      { source: '/openapi.json', destination: `${apiUpstream}/openapi.json` },
    ]
  },
}

export default nextConfig
