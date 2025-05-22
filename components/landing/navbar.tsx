"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/upe-logo.png" alt="Logo UPE" width={100} height={40} className="h-10 w-auto" />
          </Link>
        </div>
        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-upe-blue"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex gap-4">
          <Link href="/login">
            <Button variant="outline" size="sm" className="border-upe-blue text-upe-blue hover:bg-upe-blue/10">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-upe-red hover:bg-upe-red/90 text-white">
              Cadastrar
            </Button>
          </Link>
        </div>
        <button className="flex items-center space-x-2 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden py-4 pb-8">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-upe-blue"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full border-upe-blue text-upe-blue hover:bg-upe-blue/10">
                  Entrar
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-upe-red hover:bg-upe-red/90 text-white">Cadastrar</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

const navItems = [
  {
    label: "Início",
    href: routes.home,
  },
  {
    label: "Sobre a CPA",
    href: routes.about,
  },
  {
    label: "Benefícios",
    href: routes.benefits,
  },
  {
    label: "Contato",
    href: routes.contact,
  },
]
