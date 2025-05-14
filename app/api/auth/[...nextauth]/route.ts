import { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        magic: { label: "Magic", type: "boolean" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Credenciais inválidas")
        }
        // Login mágico: se vier 'magic', não exige senha
        if (credentials.magic) {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })
          if (!user) throw new Error("Usuário não encontrado")
          if (user.active === false) throw new Error("Conta inativada")
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
        // Login tradicional
        if (!credentials?.password) {
          throw new Error("Credenciais inválidas")
        }
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })
        if (!user) {
          throw new Error("Usuário não encontrado")
        }
        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error("Senha incorreta")
        }
        if (user.active === false) {
          throw new Error("Conta inativada")
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role
        }
      }
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 