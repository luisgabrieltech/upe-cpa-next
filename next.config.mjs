/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/sistemacpa',
  assetPrefix: '/sistemacpa',
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
