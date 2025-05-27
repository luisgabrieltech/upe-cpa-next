'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider 
      basePath="/sistemacpa/api/auth"
      refetchInterval={5 * 60} // 5 minutos
    >
      {children}
    </NextAuthSessionProvider>
  )
} 