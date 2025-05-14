import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        active: true,
        extraData: true,
        responses: {
          select: {
            id: true,
            value: true,
            createdAt: true,
            form: {
              select: {
                id: true,
                title: true,
              }
            },
            question: {
              select: {
                text: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ message: "Erro ao buscar usuários" }, { status: 500 })
  }
} 