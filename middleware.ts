import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { routes } from "@/lib/routes"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith(routes.dashboard.admin.home)
    const isFormManagementRoute = req.nextUrl.pathname.startsWith("/dashboard/admin/formularios") ||
                                 req.nextUrl.pathname.startsWith("/dashboard/admin/relatorios")
    
    if (isAdminRoute) {
      // ADMIN tem acesso total
      if (token?.role === "ADMIN") {
        return NextResponse.next()
      }
      
      // CSA tem acesso apenas a gestão de formulários e relatórios
      if ((token?.role as string) === "CSA" && isFormManagementRoute) {
        return NextResponse.next()
      }
      
      // Negar acesso para outros casos
      return NextResponse.redirect(new URL(routes.dashboard.home, req.url))
    }
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