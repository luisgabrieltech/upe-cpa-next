import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop()
    console.log("ID extraído para update:", id)
    const { active, role } = await req.json()
    const dataToUpdate: any = {}
    if (typeof active === 'boolean') dataToUpdate.active = active
    if (role && ["ADMIN", "USER"].includes(role)) dataToUpdate.role = role
    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: "Nenhum dado para atualizar" }, { status: 400 })
    }
    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return NextResponse.json(user)
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2025') {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }
    console.error("Erro ao ativar/inativar usuário:", error)
    return NextResponse.json({ message: "Erro ao atualizar status do usuário" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop()
    const user = await prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })
    return NextResponse.json({ message: "Usuário excluído com sucesso", user })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2025') {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }
    console.error("Erro ao excluir usuário:", error)
    return NextResponse.json({ message: "Erro ao excluir usuário" }, { status: 500 })
  }
} 