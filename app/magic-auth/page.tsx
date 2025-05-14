"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function MagicAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setStatus("error")
      setMessage("Token ausente na URL.")
      return
    }
    const authenticate = async () => {
      setStatus("loading")
      setMessage("")
      const res = await fetch(`/api/magic-link?token=${token}`)
      const data = await res.json()
      if (res.ok && data.user) {
        // Login automático via NextAuth (credentials)
        await signIn("credentials", {
          redirect: false,
          email: data.user.email,
          magic: true,
        })
        setStatus("success")
        setTimeout(() => router.push("/dashboard"), 1500)
      } else {
        setStatus("error")
        setMessage(data.message || "Token inválido ou expirado.")
      }
    }
    authenticate()
  }, [searchParams, router])

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6 flex justify-center items-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Autenticando...</CardTitle>
          </CardHeader>
          <CardContent>
            {status === "loading" && <p>Validando magic link, aguarde...</p>}
            {status === "success" && <p className="text-green-700">Login realizado! Redirecionando...</p>}
            {status === "error" && <p className="text-red-700">{message}</p>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 