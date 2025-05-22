"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { AlertTriangle } from "lucide-react"
import { routes } from "@/lib/routes"

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center bg-muted/30 px-4">
        <div className="flex flex-col items-center gap-6 max-w-lg text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-upe-red/10 mb-2">
            <AlertTriangle className="h-12 w-12 text-upe-red" />
          </div>
          <h1 className="text-4xl font-bold text-upe-blue">Ops! Algo deu errado...</h1>
          <p className="text-lg text-muted-foreground">
            A página que você tentou acessar não existe, foi removida ou você não tem permissão para visualizá-la.
          </p>
          <Link href={routes.home}>
            <Button className="bg-upe-blue hover:bg-upe-darkblue text-white px-8 py-2 mt-2">
              Voltar para a página inicial
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
} 