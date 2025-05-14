import type { Metadata } from 'next'
import './globals.css'
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: 'CPA - UPE',
  description: 'Plataforma 2.0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
