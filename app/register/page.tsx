"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Check, Eye, EyeOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([])

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
    if (!confirmPassword) {
      setPasswordMatch(true)
      return
    }
    setPasswordMatch(password === confirmPassword)
  }, [password, confirmPassword])

  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500"
    if (passwordStrength < 100) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para o início
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]"
      >
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Criar uma conta</h1>
          <p className="text-sm text-muted-foreground">Preencha os campos abaixo para se cadastrar no sistema</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Cadastro</CardTitle>
            <CardDescription>Crie sua conta para participar das avaliações da CPA-UPE</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Nome</Label>
                <Input id="first-name" placeholder="João" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Sobrenome</Label>
                <Input id="last-name" placeholder="Silva" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail institucional</Label>
              <Input id="email" type="email" placeholder="nome@upe.br" autoComplete="email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-type">Tipo de usuário</Label>
              <Select>
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
                  <div className="flex items-center gap-2">
                    <Progress value={passwordStrength} className={`h-2 ${getStrengthColor()}`} />
                    <span className="text-xs font-medium">
                      {passwordStrength === 0
                        ? "Muito fraca"
                        : passwordStrength <= 25
                          ? "Fraca"
                          : passwordStrength <= 50
                            ? "Média"
                            : passwordStrength <= 75
                              ? "Boa"
                              : "Forte"}
                    </span>
                  </div>
                  {passwordFeedback.length > 0 && (
                    <ul className="space-y-1">
                      {passwordFeedback.map((feedback, index) => (
                        <li key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <X className="h-3 w-3 text-red-500" />
                          {feedback}
                        </li>
                      ))}
                    </ul>
                  )}
                  {passwordStrength === 100 && (
                    <p className="flex items-center gap-1 text-xs text-green-500">
                      <Check className="h-3 w-3" /> Senha forte
                    </p>
                  )}
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
              {confirmPassword && !passwordMatch && <p className="text-xs text-red-500">As senhas não coincidem</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-upe-blue hover:bg-upe-darkblue">Cadastrar</Button>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Image src="/google-logo.png" alt="Google" width={18} height={18} className="mr-2" />
              Google
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-upe-blue hover:underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
