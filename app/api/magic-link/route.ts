import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { addMinutes } from "date-fns"
import { mapCargoToFunctionalRole, isValidFunctionalRole } from "@/lib/user-utils"

export async function POST(req: Request) {
  try {
    const { name, email, matricula, cargo } = await req.json()
    
    // Validações
    if (!name || !name.trim()) {
      return NextResponse.json({ message: "Nome é obrigatório" }, { status: 400 })
    }
    
    if (!email && !matricula) {
      return NextResponse.json({ message: "E-mail ou matrícula é obrigatório" }, { status: 400 })
    }
    
    if (!cargo || !isValidFunctionalRole(cargo)) {
      return NextResponse.json({ message: "Cargo é obrigatório e deve ser válido" }, { status: 400 })
    }

    // Buscar usuário existente
    let user = null
    
    if (email) {
      user = await prisma.user.findUnique({ where: { email } })
    }
    
    if (!user && matricula) {
      user = await prisma.user.findFirst({
        where: {
          extraData: {
            path: ["registration"],
            equals: matricula
          }
        }
      })
    }

    // Mapear cargo para functional role
    const functionalRole = mapCargoToFunctionalRole(cargo)

    // Se usuário não existe, criar novo
    if (!user) {
      const userData = {
        name: name.trim(),
        email: email || `matricula.${matricula}@servidor.upe.br`,
        password: randomBytes(16).toString("hex"),
        role: "USER",
        extraData: {
          registration: matricula || null,
          functionalRoles: [functionalRole],
          createdVia: "magic-login"
        }
      }
      
      user = await prisma.user.create({ data: userData })
      console.log(`✅ Novo usuário criado via magic login: ${user.email}`)
    } else {
      // Atualizar dados do usuário existente
      const updatedExtraData = {
        ...user.extraData,
        registration: matricula || user.extraData?.registration || null,
        functionalRoles: [functionalRole], // Atualizar com o cargo selecionado
        lastMagicLogin: new Date().toISOString()
      }
      
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name.trim(), // Atualizar nome se fornecido
          extraData: updatedExtraData
        }
      })
      console.log(`✅ Usuário atualizado via magic login: ${user.email}`)
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
    const baseUrl = process.env.NEXTAUTH_URL
    if (!baseUrl) {
      console.error("NEXTAUTH_URL não está configurada")
      return NextResponse.json({ message: "Erro de configuração" }, { status: 500 })
    }
    console.log("URL Base do Magic Link:", baseUrl)
    const link = `${baseUrl}/magic-auth?token=${token}`
    return NextResponse.json({ link })
  } catch (error) {
    console.error("Erro ao gerar magic link:", error)
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