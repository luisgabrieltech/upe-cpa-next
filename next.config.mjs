/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: '/sistemacpa',  // ← Mantém comentado (nginx gerencia)
  assetPrefix: '/sistemacpa',  // ← Para CSS/JS carregarem corretamente
  trailingSlash: false,
  serverExternalPackages: ['pdfkit'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Não incluir módulos do Node.js no bundle do cliente
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
}

export default nextConfig
