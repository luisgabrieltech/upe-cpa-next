import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { name, email, password, userType } = await req.json()

    // Validações básicas
    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { message: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    // Processar cargos funcionais
    const functionalRoles = userType.split(",").filter(Boolean)
    
    if (functionalRoles.length === 0) {
      return NextResponse.json(
        { message: "Pelo menos um cargo funcional deve ser selecionado" },
        { status: 400 }
      )
    }

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Este e-mail já está em uso" },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await hash(password, 12)

    // Criar usuário com os cargos funcionais (temporariamente no extraData)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // Por padrão, novos usuários são USER
        extraData: {
          functionalRoles: functionalRoles
        }
      }
    })

    // Remover a senha do objeto retornado
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: "Usuário criado com sucesso", user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json(
      { message: "Erro ao criar usuário" },
      { status: 500 }
    )
  }
} 