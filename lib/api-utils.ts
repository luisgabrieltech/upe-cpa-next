import { basePath } from './routes'

/**
 * Gera URL da API com o basePath correto
 * @param path - Caminho da API (ex: '/forms', 'user/profile')
 * @returns URL completa da API (ex: '/sistemacpa/api/forms')
 */
export function getApiUrl(path: string): string {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${basePath}/api/${cleanPath}`
}

/**
 * Gera URL da API de autenticação com o basePath correto
 * @param path - Caminho da API de auth (ex: '/register', 'forgot-password')
 * @returns URL completa da API de auth (ex: '/sistemacpa/api/auth/register')
 */
export function getAuthApiUrl(path: string): string {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${basePath}/api/auth/${cleanPath}`
}

/**
 * Gera URL de imagem com o basePath correto
 * @param path - Caminho da imagem (ex: '/upe-logo.png', 'avatar.png')
 * @returns URL completa da imagem (ex: '/sistemacpa/upe-logo.png')
 */
export function getImageUrl(path: string): string {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${basePath}/${cleanPath}`
} 