export const basePath = '/'

export const routes = {
  home: basePath + '/',
  login: basePath + '/login',
  register: basePath + '/register',
  about: basePath + '/#about',
  benefits: basePath + '/#benefits',
  contact: basePath + '/#contact',
} as const

export type RouteKey = keyof typeof routes 