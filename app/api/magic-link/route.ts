import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { addMinutes } from "date-fns"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ message: "E-mail obrigatório" }, { status: 400 })
    // Buscar usuário
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Criar usuário automaticamente
      user = await prisma.user.create({
        data: {
          email,
          name: "",
          password: randomBytes(16).toString("hex"),
          extraData: {},
        },
      })
    }
    // Gerar token
    const token = randomBytes(32).toString("hex")
    const expires = addMinutes(new Date(), 10) // 10 minutos de validade
    // Salvar token temporário no campo extraData
    await prisma.user.update({
      where: { id: user.id },
      data: {
        extraData: {
          ...user.extraData,
          magicToken: token,
          magicTokenExpires: expires.toISOString(),
        },
      },
    })
    // Montar link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const link = `${baseUrl}/magic-auth?token=${token}`
    return NextResponse.json({ link })
  } catch (error) {
    return NextResponse.json({ message: "Erro ao gerar magic link" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    if (!token) return NextResponse.json({ message: "Token ausente" }, { status: 400 })
    // Buscar usuário pelo token
    const user = await prisma.user.findFirst({
      where: {
        extraData: {
          path: ["magicToken"],
          equals: token,
        },
      },
    })
    if (!user) return NextResponse.json({ message: "Token inválido" }, { status: 400 })
    const expires = user.extraData?.magicTokenExpires
    if (!expires || new Date(expires) < new Date()) {
      return NextResponse.json({ message: "Token expirado" }, { status: 400 })
    }
    // Limpar token após uso
    await prisma.user.update({
      where: { id: user.id },
      data: {
        extraData: {
          ...user.extraData,
          magicToken: null,
          magicTokenExpires: null,
        },
      },
    })
    // Retornar dados do usuário para login
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    return NextResponse.json({ message: "Erro ao autenticar magic link" }, { status: 500 })
  }
} 