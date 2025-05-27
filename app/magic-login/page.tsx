"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { routes } from "@/lib/routes"
import { getApiUrl } from "@/lib/api-utils"

function MagicLoginContent() {
  const [email, setEmail] = useState("")
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
    try {
      const res = await fetch(getApiUrl('magic-link'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok && data.link) {
        setMagicLink(data.link)
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
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Login via Magic Link (Acesso restrito)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Gerando..." : "Gerar Magic Link"}
            </Button>
          </form>
          {magicLink && (
            <div className="mt-4 p-2 bg-green-100 rounded text-green-800 text-sm break-all">
              <b>Magic Link:</b> <a href={magicLink} className="underline">{magicLink}</a>
            </div>
          )}
          {error && (
            <div className="mt-4 p-2 bg-red-100 rounded text-red-800 text-sm">{error}</div>
          )}
        </CardContent>
      </Card>
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