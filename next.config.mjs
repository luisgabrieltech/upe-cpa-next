/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: '/sistemacpa',  // ← Comentado temporariamente
  // assetPrefix: '/sistemacpa',  // ← Comentado temporariamente
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
