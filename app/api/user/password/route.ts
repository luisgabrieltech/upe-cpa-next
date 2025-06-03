import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { hash, compare } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    // Validar se as senhas foram fornecidas
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Senhas não fornecidas" }, { status: 400 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar senha atual
    const isPasswordValid = await compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Senha atual incorreta" }, { status: 400 })
    }

    // Hash da nova senha
    const hashedPassword = await hash(newPassword, 12)

    // Atualizar senha
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ message: "Senha alterada com sucesso" })
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json({ message: "Erro ao alterar senha" }, { status: 500 })
  }
} 