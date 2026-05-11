/** @type {import('next').NextConfig} */
const nextConfig = {
  // NEXT_PUBLIC_API_URL can be set at build time for external API hosts.
  // If not set, relative URLs are used and Nginx routes /v1/ to FastAPI.
  output: 'standalone',
}

export default nextConfig
