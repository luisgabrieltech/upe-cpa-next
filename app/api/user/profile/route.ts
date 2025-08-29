import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        extraData: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    // Extrair functional roles do extraData
    const functionalRoles = user.extraData?.functionalRoles || []

    // Retornar usuário com functional roles no nível raiz
    const userWithFunctionalRoles = {
      ...user,
      functionalRoles
    }

    return NextResponse.json(userWithFunctionalRoles)
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    return NextResponse.json({ message: "Erro ao buscar perfil" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { name, extraData } = await req.json()

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        extraData: extraData || {},
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        extraData: true,
      },
    })

    // Extrair functional roles do extraData
    const functionalRoles = user.extraData?.functionalRoles || []

    // Retornar usuário com functional roles no nível raiz
    const userWithFunctionalRoles = {
      ...user,
      functionalRoles
    }

    return NextResponse.json(userWithFunctionalRoles)
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json({ message: "Erro ao atualizar perfil" }, { status: 500 })
  }
} 