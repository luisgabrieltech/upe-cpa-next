import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { CertificateService } from "@/lib/certificate-service"
import fs from "fs/promises"
import path from "path"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const certificateId = params.id

    if (!certificateId) {
      return NextResponse.json(
        { message: "ID do certificado não fornecido" },
        { status: 400 }
      )
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      select: { userId: true, form: { select: { title: true } } },
    })

    if (!certificate) {
      return NextResponse.json(
        { message: "Certificado não encontrado" },
        { status: 404 }
      )
    }

    // Apenas o dono do certificado ou um admin pode baixar
    if (session?.user.role !== "ADMIN" && session?.user.id !== certificate.userId) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 })
    }

    const service = new CertificateService()
    const pdfPath = service.getCertificatePath(certificateId)

    try {
      await fs.access(pdfPath)
    } catch (error) {
      return NextResponse.json(
        { message: "Arquivo do certificado não encontrado no servidor" },
        { status: 404 }
      )
    }

    const pdfBuffer = await fs.readFile(pdfPath)
    const formTitle = certificate.form.title.replace(/\s/g, '_') // Prepara o nome do arquivo

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado_${formTitle}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Erro ao baixar certificado:", error)
    return NextResponse.json(
      { message: "Erro interno ao processar o download do certificado" },
      { status: 500 }
    )
  }
} 