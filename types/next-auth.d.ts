import { Role, FunctionalRole } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    role: Role
    functionalRoles?: FunctionalRole[]
  }

  interface Session {
    user: User & {
      role: Role
      functionalRoles?: FunctionalRole[]
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    functionalRoles?: FunctionalRole[]
  }
} 