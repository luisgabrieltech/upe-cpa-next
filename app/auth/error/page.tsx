'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Erro de configuração do servidor'
      case 'AccessDenied':
        return 'Acesso negado'
      case 'Verification':
        return 'Token de verificação inválido'
      case 'Default':
        return 'Erro de autenticação'
      default:
        return error || 'Erro desconhecido'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Erro de Autenticação
          </CardTitle>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-600">
              <strong>Código do erro:</strong> {error}
            </div>
          )}
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/login">
                Tentar novamente
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                Voltar ao início
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Carregando...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
} 