"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { ArrowLeft, Check, Eye, EyeOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { routes } from "@/lib/routes"
import { getAuthApiUrl } from "@/lib/api-utils"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userType: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      setPasswordFeedback([])
      return
    }

    const feedback = []
    let strength = 0

    if (password.length >= 8) {
      strength += 25
    } else {
      feedback.push("Pelo menos 8 caracteres")
    }

    if (/[A-Z]/.test(password)) {
      strength += 25
    } else {
      feedback.push("Pelo menos uma letra maiúscula")
    }

    if (/[0-9]/.test(password)) {
      strength += 25
    } else {
      feedback.push("Pelo menos um número")
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 25
    } else {
      feedback.push("Pelo menos um caractere especial")
    }

    setPasswordStrength(strength)
    setPasswordFeedback(feedback)
  }, [password])

  useEffect(() => {
    setPasswordMatch(password === confirmPassword)
  }, [password, confirmPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError(null)

    // Validação do formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormError("Por favor, insira um endereço de email válido")
      setIsLoading(false)
      return
    }

    // Validação de campos obrigatórios
    if (!formData.firstName || !formData.lastName || !formData.userType) {
      setFormError("Por favor, preencha todos os campos obrigatórios")
      setIsLoading(false)
      return
    }

    // Validação de senha
    if (!password) {
      setFormError("Por favor, insira uma senha")
      setIsLoading(false)
      return
    }

    if (!passwordMatch) {
      setFormError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (passwordStrength < 100) {
      setFormError("A senha não atende aos requisitos mínimos de segurança")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(getAuthApiUrl('register'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password,
          userType: formData.userType,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        let errorMessage = data.message || "Erro ao criar conta"
        if (data.message?.includes("email")) {
          errorMessage = "Este email já está cadastrado"
        } else if (data.message?.includes("password")) {
          errorMessage = "A senha não atende aos requisitos de segurança"
        }
        setFormError(errorMessage)
        setIsLoading(false)
        return
      }

      // Fazer login automático após o registro
      const result = await signIn("credentials", {
        email: formData.email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setFormError("Sua conta foi criada, mas houve um erro ao fazer login. Por favor, faça login manualmente.")
        router.push(routes.auth.login)
        return
      }

      router.push(routes.dashboard.home)
      router.refresh()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Ocorreu um erro ao criar sua conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href={routes.home}
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para o início
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
      >
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Crie sua conta</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados abaixo para se cadastrar</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Cadastro</CardTitle>
            <CardDescription>Crie sua conta para participar das avaliações da CPA-UPE</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">Nome</Label>
                  <Input
                    id="first-name"
                    placeholder="João"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Sobrenome</Label>
                  <Input
                    id="last-name"
                    placeholder="Silva"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail institucional</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@upe.br"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-type">Tipo de usuário</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value) => setFormData({ ...formData, userType: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu vínculo com a UPE" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Estudante</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="staff">Técnico Administrativo</SelectItem>
                    <SelectItem value="external">Comunidade Externa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
                  </Button>
                </div>
                {password && (
                  <div className="space-y-2">
                    <Progress value={passwordStrength} className="h-2" />
                    <div className="grid grid-cols-2 gap-2">
                      {passwordFeedback.map((feedback, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <X className="h-3 w-3 text-red-500" />
                          <span className="text-muted-foreground">{feedback}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showConfirmPassword ? "Esconder senha" : "Mostrar senha"}</span>
                  </Button>
                </div>
                {confirmPassword && !passwordMatch && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
              </div>
              {formError && (
                <div className="text-red-600 text-sm text-center mb-2">
                  {formError}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-upe-blue hover:bg-upe-darkblue"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Cadastrar"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link href={routes.auth.login} className="text-upe-blue hover:underline">
                  Entrar
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
