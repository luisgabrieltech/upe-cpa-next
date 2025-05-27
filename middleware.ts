import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { routes } from "@/lib/routes"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith(routes.dashboard.admin.home)
    
    if (isAdminRoute && token?.role !== "ADMIN") {
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
    "/sistemacpa/dashboard/:path*",
    "/sistemacpa/api/admin/:path*"
  ]
} 