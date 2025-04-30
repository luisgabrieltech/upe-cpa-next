"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Bell, FileText, Home, Settings, Menu, X, ShieldCheck, Users, ClipboardList, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const currentUser = {
  name: "Luis Gabriel",
  email: "luis.gabriel@upe.br",
  role: "admin", // Pode ser: "user", "admin", "coordenador", "cpa"
  avatar: "/avatar.png",
}

const hasAdminAccess = (role: string) => {
  return ["admin", "coordenador", "cpa"].includes(role)
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isAdmin = hasAdminAccess(currentUser.role)

  const isMenuItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname === href || (pathname.startsWith(href + "/") && pathname !== "/dashboard")
  }


  const isAdminItemActive = (href: string) => {
    if (href === "/dashboard/admin") {
      return pathname === "/dashboard/admin"
    }
    if (href === "/dashboard/admin/formularios") {
      return pathname === "/dashboard/admin/formularios" || pathname.startsWith("/dashboard/admin/formularios/")
    }
    if (href === "/dashboard/admin/usuarios") {
      return pathname === "/dashboard/admin/usuarios" || pathname.startsWith("/dashboard/admin/usuarios/")
    }
    if (href === "/dashboard/admin/relatorios") {
      return pathname === "/dashboard/admin/relatorios" || pathname.startsWith("/dashboard/admin/relatorios/")
    }
    return false
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:block">
        <div className="fixed h-screen w-64 flex flex-col border-r bg-white overflow-hidden">
          <div className="flex h-16 items-center border-b px-4 flex-shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/upe-logo.png" alt="Logo UPE" width={80} height={32} className="h-8 w-auto" />
              <span className="text-lg font-medium">CPA</span>
            </Link>
          </div>

          <div className="flex flex-col overflow-y-auto flex-1">
            <div className="p-4 text-sm font-medium">Menu</div>
            <nav className="px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isMenuItemActive(item.href)
                      ? "bg-upe-blue text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-upe-blue"
                  } ${item.disabled ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.badge && <Badge className="ml-auto bg-upe-red text-white">{item.badge}</Badge>}
                </Link>
              ))}
            </nav>

            {isAdmin && (
              <>
                <Separator className="my-2" />
                <div className="p-4 text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-upe-blue" />
                  <span>Administração</span>
                </div>
                <nav className="px-2">
                  {adminItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isAdminItemActive(item.href)
                          ? "bg-upe-blue text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-upe-blue"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </>
            )}
          </div>

          <div className="border-t p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt="Avatar" />
                <AvatarFallback className="bg-upe-blue text-white">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground">{currentUser.email}</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block w-64 flex-shrink-0"></div>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b bg-white px-4 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Image src="/upe-logo.png" alt="Logo UPE" width={80} height={32} className="h-8 w-auto" />
                  <span className="text-lg font-medium">CPA</span>
                </Link>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 text-sm font-medium">Menu</div>
              <nav className="px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isMenuItemActive(item.href)
                        ? "bg-upe-blue text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-upe-blue"
                    } ${item.disabled ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.badge && <Badge className="ml-auto bg-upe-red text-white">{item.badge}</Badge>}
                  </Link>
                ))}
              </nav>

              {isAdmin && (
                <>
                  <Separator className="my-2" />
                  <div className="p-4 text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-upe-blue" />
                    <span>Administração</span>
                  </div>
                  <nav className="px-2">
                    {adminItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          isAdminItemActive(item.href)
                            ? "bg-upe-blue text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-upe-blue"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </nav>
                </>
              )}

              <div className="absolute bottom-4 left-4 right-4 border-t pt-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt="Avatar" />
                    <AvatarFallback className="bg-upe-blue text-white">
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{currentUser.name}</span>
                    <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 ml-4">
            <Image src="/upe-logo.png" alt="Logo UPE" width={60} height={24} className="h-6 w-auto" />
            <span className="text-lg font-medium">CPA</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-upe-red text-[10px] font-medium text-white">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 font-medium">Notificações</div>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto p-2">
                  <p className="text-sm text-muted-foreground">Você tem 3 notificações não lidas</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt="Avatar" />
              <AvatarFallback className="bg-upe-blue text-white">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 bg-gray-50 w-full overflow-auto">{children}</main>
      </div>
    </div>
  )
}

const navItems = [
  {
    label: "Início",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Avaliações",
    href: "/dashboard/avaliacoes",
    icon: FileText,
    badge: "2",
  },
  {
    label: "Votações",
    href: "/dashboard/votacoes",
    icon: FileText,
    disabled: true,
  },
  {
    label: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
  },
]

const adminItems = [
  {
    label: "Painel Administrativo",
    href: "/dashboard/admin",
    icon: BarChart3,
  },
  {
    label: "Relatórios",
    href: "/dashboard/admin/relatorios",
    icon: BarChart3,
  },
  {
    label: "Gestão de Formulários",
    href: "/dashboard/admin/formularios",
    icon: ClipboardList,
  },
  {
    label: "Gestão de Usuários",
    href: "/dashboard/admin/usuarios",
    icon: Users,
  },
]
