import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { routes } from "@/lib/routes"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Verifica se é uma rota administrativa
    const isAdminRoute = pathname.startsWith("/dashboard/admin")
    
    // Se não for rota administrativa, permite o acesso (outras verificações são feitas em outro lugar)
    if (!isAdminRoute) {
      return NextResponse.next()
    }

    // ADMIN tem acesso total a todas as rotas administrativas
    if (token?.role === "ADMIN") {
      return NextResponse.next()
    }

    // CSA tem acesso apenas à gestão de formulários
    if (token?.role === "CSA") {
      // Verifica se a rota atual é a de formulários
      const isFormRoute = pathname.startsWith("/dashboard/admin/formularios")
      
      if (isFormRoute) {
        return NextResponse.next()
      }
      
      // Se não for rota de formulários, redireciona para o dashboard
      return NextResponse.redirect(new URL(routes.dashboard.home, req.url))
    }

    // Para qualquer outro role, redireciona para o dashboard
    return NextResponse.redirect(new URL(routes.dashboard.home, req.url))
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*"
  ]
} 