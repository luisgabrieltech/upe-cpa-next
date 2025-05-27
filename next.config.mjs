/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: '/sistemacpa',  // ← Mantém comentado (nginx gerencia)
  assetPrefix: '/sistemacpa',  // ← Para CSS/JS carregarem corretamente
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
