import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    // Buscar usuário pelo token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Token inválido ou expirado" },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await hash(password, 12)

    // Atualizar senha e limpar tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null
      }
    })

    return NextResponse.json(
      { message: "Senha redefinida com sucesso" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao redefinir senha:", error)
    return NextResponse.json(
      { message: "Erro ao redefinir senha" },
      { status: 500 }
    )
  }
} 