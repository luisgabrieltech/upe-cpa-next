import { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        magic: { label: "Magic", type: "boolean" }
      },
      async authorize(credentials) {
        try {
          console.log("Tentativa de login para:", credentials?.email)
          
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
            
            console.log("Login mágico bem-sucedido para:", user.email)
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
            console.log("Usuário não encontrado:", credentials.email)
            throw new Error("Usuário não encontrado")
          }
          
          const isPasswordValid = await compare(credentials.password, user.password)
          if (!isPasswordValid) {
            console.log("Senha incorreta para:", credentials.email)
            throw new Error("Senha incorreta")
          }
          
          if (user.active === false) {
            console.log("Conta inativada:", credentials.email)
            throw new Error("Conta inativada")
          }
          
          console.log("Login bem-sucedido para:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error("Erro no authorize:", error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          console.log("JWT callback - user:", user.email)
          return {
            ...token,
            id: user.id,
            role: user.role
          }
        }
        return token
      } catch (error) {
        console.error("Erro no callback JWT:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        console.log("Session callback - token:", token.sub)
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
            role: token.role as string
          }
        }
      } catch (error) {
        console.error("Erro no callback session:", error)
        return session
      }
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error"
  },
  events: {
    async signIn(message) {
      console.log("Event signIn:", message.user?.email)
    },
    async signOut(message) {
      console.log("Event signOut:", message.token?.sub)
    },
    async session(message) {
      console.log("Event session:", message.session?.user?.email)
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 