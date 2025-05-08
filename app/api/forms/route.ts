import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const forms = await prisma.form.findMany({
      include: {
        questions: true,
        createdBy: { select: { name: true, email: true } },
        responses: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(forms)
  } catch (error) {
    return NextResponse.json({ message: "Erro ao buscar formulários" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }
    const data = await req.json()
    const { title, description, category, status, deadline, questions, estimatedTime } = data
    const form = await prisma.form.create({
      data: {
        title,
        description,
        category,
        status,
        deadline: deadline ? new Date(deadline) : null,
        estimatedTime,
        createdBy: { connect: { id: session.user.id } },
        questions: {
          create: questions.map((q: any, idx: number) => ({
            text: q.text,
            type: q.type,
            required: q.required,
            options: q.options || [],
            rows: q.rows || [],
            columns: q.columns || [],
            order: idx,
          })),
        },
      },
      include: { questions: true },
    })
    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Erro ao criar formulário" }, { status: 500 })
  }
} 