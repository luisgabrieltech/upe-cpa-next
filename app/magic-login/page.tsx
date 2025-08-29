"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, User, IdCard, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { routes } from "@/lib/routes"
import { getApiUrl } from "@/lib/api-utils"
import { FUNCTIONAL_ROLES_OPTIONS } from "@/lib/user-utils"

function MagicLoginContent() {
  const [name, setName] = useState("")
  const [identificationType, setIdentificationType] = useState("email")
  const [email, setEmail] = useState("")
  const [matricula, setMatricula] = useState("")
  const [cargo, setCargo] = useState("TECNICO_COMPLEXO_HOSPITALAR") // Pré-selecionado
  const [magicLink, setMagicLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMagicLink("")

    // Validações
    if (!name.trim()) {
      setError("Nome é obrigatório")
      setLoading(false)
      return
    }

    const hasEmail = identificationType === "email" && email.trim()
    const hasMatricula = identificationType === "matricula" && matricula.trim()

    if (!hasEmail && !hasMatricula) {
      setError("Por favor, informe seu e-mail ou matrícula")
      setLoading(false)
      return
    }

    if (!cargo) {
      setError("Por favor, selecione um cargo")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(getApiUrl('magic-link'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(),
          email: identificationType === "email" ? email.trim() : undefined,
          matricula: identificationType === "matricula" ? matricula.trim() : undefined,
          cargo 
        }),
      })
      const data = await res.json()
      if (res.ok && data.link) {
        setMagicLink(data.link)
        toast({
          title: "✅ Link gerado com sucesso!",
          description: "Clique no link abaixo para acessar o sistema.",
        })
      } else {
        setError(data.message || "Erro ao gerar magic link")
      }
    } catch (err) {
      setError("Erro ao gerar magic link")
    }
    setLoading(false)
  }

  return (
    <div className="w-full p-4 md:p-6 flex justify-center items-center min-h-screen bg-muted">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-upe-blue">
              <User className="h-6 w-6" />
              Acesso Rápido - Servidores UPE
            </CardTitle>
            <CardDescription>
              Especialmente para Técnicos do Complexo Hospitalar<br/>
              Acesso simplificado para servidores da universidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-upe-blue" />
                  Nome completo *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              {/* Escolha do Tipo de Identificação */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-upe-blue" />
                  Como você prefere se identificar? *
                </Label>
                <RadioGroup 
                  value={identificationType} 
                  onValueChange={setIdentificationType}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email-option" />
                    <Label htmlFor="email-option" className="cursor-pointer">E-mail</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="matricula" id="matricula-option" />
                    <Label htmlFor="matricula-option" className="cursor-pointer">Matrícula</Label>
                  </div>
                </RadioGroup>

                {/* Campo de E-mail */}
                {identificationType === "email" && (
                  <Input
                    type="email"
                    placeholder="Digite seu e-mail institucional"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="mt-2"
                  />
                )}

                {/* Campo de Matrícula */}
                {identificationType === "matricula" && (
                  <Input
                    type="text"
                    placeholder="Digite sua matrícula"
                    value={matricula}
                    onChange={e => setMatricula(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Cargo */}
              <div className="space-y-2">
                <Label htmlFor="cargo" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-upe-blue" />
                  Cargo *
                </Label>
                <Select value={cargo} onValueChange={setCargo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNCTIONAL_ROLES_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-upe-blue hover:bg-upe-blue/90 text-white" 
                disabled={loading}
              >
                {loading ? "Gerando..." : "🚀 Gerar Link de Acesso"}
              </Button>
            </form>

            {/* Magic Link Resultado */}
            {magicLink && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="text-center space-y-3">
                  <h3 className="font-medium text-green-800">✨ Seu Link de Acesso:</h3>
                  <div className="p-3 bg-white border rounded-lg">
                    <a 
                      href={magicLink} 
                      className="text-upe-blue hover:text-upe-blue/80 font-medium break-all"
                      target="_self"
                    >
                      {magicLink}
                    </a>
                  </div>
                  <p className="text-sm text-green-700">
                    👆 Clique no link acima para acessar o sistema
                  </p>
                </div>
              </motion.div>
            )}

            {/* Erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-700 text-sm">❌ {error}</p>
              </motion.div>
            )}

            {/* Link para login tradicional */}
            <div className="mt-6 text-center">
              <Link 
                href={routes.auth.login} 
                className="text-sm text-muted-foreground hover:text-upe-blue transition-colors"
              >
                ← Voltar para login tradicional
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function MagicLoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full p-4 md:p-6 flex justify-center items-center min-h-screen bg-muted">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Iniciando página...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <MagicLoginContent />
    </Suspense>
  )
} 