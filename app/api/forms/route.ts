import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (id) {
      const form = await prisma.form.findUnique({
        where: { id },
        include: { questions: true, createdBy: { select: { name: true, email: true } }, responses: true },
      })
      if (!form) return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
      return NextResponse.json(form)
    }
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
    const { id, title, description, category, status, deadline, questions, estimatedTime } = data

    // Se tiver ID, é uma atualização
    if (id) {
      // Primeiro, deletar todas as questões existentes
      await prisma.question.deleteMany({
        where: { formId: id }
      })

      // Depois, atualizar o formulário e criar as novas questões
      const form = await prisma.form.update({
        where: { id },
        data: {
          title,
          description,
          category,
          status,
          deadline: deadline ? new Date(deadline) : null,
          estimatedTime,
          questions: {
            create: questions.map((q: any, idx: number) => ({
              id: q.id,
              text: q.text,
              type: q.type,
              required: q.required,
              options: q.options || [],
              rows: q.rows || [],
              columns: q.columns || [],
              order: idx,
              conditional: q.conditional || null,
            })),
          },
        },
        include: { questions: true },
      })
      return NextResponse.json(form)
    }

    // Se não tiver ID, é uma criação
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
            id: q.id,
            text: q.text,
            type: q.type,
            required: q.required,
            options: q.options || [],
            rows: q.rows || [],
            columns: q.columns || [],
            order: idx,
            conditional: q.conditional || null,
          })),
        },
      },
      include: { questions: true },
    })
    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Erro ao salvar formulário" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action")
    const data = await req.json()

    if (action === "visibility") {
      const { id, visibleToRoles, visibleToUserIds, externalStatus } = data
      if (!id) return NextResponse.json({ message: "ID do formulário é obrigatório" }, { status: 400 })
      const form = await prisma.form.update({
        where: { id },
        data: {
          visibleToRoles: visibleToRoles || [],
          visibleToUserIds: visibleToUserIds || [],
          ...(externalStatus ? { externalStatus } : {}),
        },
      })
      return NextResponse.json(form)
    } else if (action === "external-status") {
      const { id, status } = data
      if (!id) return NextResponse.json({ message: "ID do formulário é obrigatório" }, { status: 400 })
      const form = await prisma.form.update({
        where: { id },
        data: { externalStatus: status },
      })
      return NextResponse.json(form)
    } else {
      const { id, status } = data
      const form = await prisma.form.update({
        where: { id },
        data: { status },
      })
      return NextResponse.json(form)
    }
  } catch (error) {
    return NextResponse.json({ message: "Erro ao atualizar formulário" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }
    const { id } = await req.json()
    console.log("Tentando excluir formulário com id:", id)
    // Deletar respostas associadas ao formulário
    await prisma.response.deleteMany({ where: { formId: id } })
    // Deletar perguntas associadas ao formulário
    await prisma.question.deleteMany({ where: { formId: id } })
    // Agora sim, deletar o formulário
    await prisma.form.delete({ where: { id } })
    return NextResponse.json({ message: "Formulário excluído" })
  } catch (error) {
    console.error("Erro ao excluir formulário:", error)
    return NextResponse.json({ message: "Erro ao excluir formulário", error: String(error) }, { status: 500 })
  }
} 