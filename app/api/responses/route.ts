import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { CertificateService } from "@/lib/certificate-service"
import { Question } from "@/types/prisma"

interface ResponseData {
  formId: string;
  questionId: string;
  value: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }
    const { responses } = await req.json()
    if (!Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ message: "Nenhuma resposta enviada" }, { status: 400 })
    }
    const formId = responses[0].formId
    // Buscar perguntas obrigatórias do formulário
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { questions: true },
    })
    if (!form) {
      return NextResponse.json({ message: "Formulário não encontrado" }, { status: 404 })
    }
    const obrigatorias = form.questions.filter((q: Question) => q.required).map((q: Question) => q.id)
    const respondidas = responses.map((r: ResponseData) => r.questionId)
    const faltando = obrigatorias.filter((qid: string) => !respondidas.includes(qid))
    if (faltando.length > 0) {
      return NextResponse.json({ message: "Responda todas as perguntas obrigatórias." }, { status: 400 })
    }
    // Impedir duplicidade
    for (const r of responses) {
      const jaRespondeu = await prisma.response.findUnique({
        where: {
          userId_formId_questionId: {
            userId: session.user.id,
            formId: r.formId,
            questionId: r.questionId,
          },
        },
      })
      if (jaRespondeu) {
        return NextResponse.json({ message: "Você já respondeu esta avaliação." }, { status: 400 })
      }
    }
    // Salvar respostas
    await prisma.$transaction(
      responses.map((r: ResponseData) =>
        prisma.response.create({
          data: {
            userId: session.user.id,
            formId: r.formId,
            questionId: r.questionId,
            value: r.value,
          },
        })
      )
    )

    // Se o formulário gera certificado, gerar automaticamente
    if (form.generatesCertificate) {
      try {
        const certificateService = new CertificateService();
        await certificateService.generateCertificate(session.user.id, formId);
      } catch (error) {
        console.error('Erro ao gerar certificado:', error);
        // Não retornar erro para o usuário, pois as respostas foram salvas com sucesso
      }
    }

    return NextResponse.json({ message: "Respostas salvas com sucesso!" })
  } catch (error) {
    console.error('Erro ao salvar respostas:', error);
    return NextResponse.json({ message: "Erro ao salvar respostas" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userParam = searchParams.get("user")
    let userId: string | null = null
    if (userParam === "me") {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json([], { status: 200 })
      }
      userId = session.user.id
    }
    if (!userId) {
      return NextResponse.json([], { status: 200 })
    }
    const responses = await prisma.response.findMany({
      where: { userId },
    })
    return NextResponse.json(responses)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
} 