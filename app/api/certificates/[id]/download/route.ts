import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { CertificateService } from "@/lib/certificate-service"
import fs from "fs/promises"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    const certificateId = params.id

    // Buscar certificado
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: { user: true }
    })

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificado não encontrado" },
        { status: 404 }
      )
    }

    // Verificar permissão (apenas o próprio usuário ou admin pode baixar)
    if (!session?.user || (session.user.email !== certificate.user.email && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      )
    }

    // Verificar se o arquivo existe
    const certificateService = new CertificateService()
    const exists = await certificateService.certificateExists(certificateId)

    if (!exists) {
      return NextResponse.json(
        { error: "Arquivo do certificado não encontrado" },
        { status: 404 }
      )
    }

    // Ler arquivo
    const pdfPath = certificateService.getCertificatePath(certificateId)
    const pdfBuffer = await fs.readFile(pdfPath)

    // Retornar PDF
    const response = new NextResponse(pdfBuffer)
    response.headers.set("Content-Type", "application/pdf")
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="certificado-${certificate.validationCode}.pdf"`
    )

    return response
  } catch (error) {
    console.error("Erro ao baixar certificado:", error)
    return NextResponse.json(
      { error: "Erro ao baixar certificado" },
      { status: 500 }
    )
  }
} 