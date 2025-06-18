"use client"

import { useState } from "react"
import { Search, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { isValidValidationCode } from "@/lib/certificates"
import { getApiUrl } from "@/lib/api-utils"

interface ValidationResult {
  isValid: boolean
  certificate?: {
    validationCode: string
    issuedAt: string
    metadata: {
      completionDate: string
      formTitle: string
      formDescription?: string
      userName: string
      userEmail: string
      workload?: string
    }
  }
  error?: string
}

export default function ValidarPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    // Validação básica do formato
    if (!isValidValidationCode(code)) {
      setError("Código inválido. Use o formato: UPE-CPA-XXXXX-YYYY")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(getApiUrl(`certificates/validate/${code}`))
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao validar certificado")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao validar certificado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-upe-blue">Validação de Certificados</h1>
          <p className="mt-2 text-gray-600">
            Digite o código de validação para verificar a autenticidade do certificado
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verificar Certificado</CardTitle>
            <CardDescription>
              O código de validação está presente no certificado no formato: UPE-CPA-XXXXX-YYYY
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="UPE-CPA-12345-2024"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !code}>
                  {isLoading ? "Validando..." : "Validar"}
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-md">
                  <XCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}

              {result && (
                <div className="mt-6 space-y-6">
                  <div className={`flex items-center gap-2 p-4 rounded-md ${
                    result.isValid ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  }`}>
                    {result.isValid ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        <p>Certificado válido e autêntico</p>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" />
                        <p>Certificado inválido ou não encontrado</p>
                      </>
                    )}
                  </div>

                  {result.isValid && result.certificate && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Informações do Certificado</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-medium">Participante</h3>
                          <p className="text-gray-600">{result.certificate.metadata.userName}</p>
                        </div>
                        <div>
                          <h3 className="font-medium">Formulário</h3>
                          <p className="text-gray-600">{result.certificate.metadata.formTitle}</p>
                          {result.certificate.metadata.formDescription && (
                            <p className="text-sm text-gray-500 mt-1">
                              {result.certificate.metadata.formDescription}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium">Data de Conclusão</h3>
                            <p className="text-gray-600">
                              {new Date(result.certificate.metadata.completionDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium">Data de Emissão</h3>
                            <p className="text-gray-600">
                              {new Date(result.certificate.issuedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {result.certificate.metadata.workload && (
                          <div>
                            <h3 className="font-medium">Carga Horária</h3>
                            <p className="text-gray-600">{result.certificate.metadata.workload}</p>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">Código de Validação</h3>
                          <p className="text-gray-600 font-mono">{result.certificate.validationCode}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 