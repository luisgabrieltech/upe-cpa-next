import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { isValidValidationCode } from "@/lib/certificates"

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code

    // Validação básica do formato
    if (!isValidValidationCode(code)) {
      return NextResponse.json(
        { isValid: false, error: "Código inválido" },
        { status: 400 }
      )
    }

    // Buscar certificado
    const certificate = await prisma.certificate.findUnique({
      where: { validationCode: code },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        form: {
          select: {
            title: true,
            description: true,
          },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json(
        { isValid: false, error: "Certificado não encontrado" },
        { status: 404 }
      )
    }

    // Registrar log de validação
    const headersList = headers()
    await prisma.validationLog.create({
      data: {
        certificateId: certificate.id,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json({
      isValid: true,
      certificate: {
        validationCode: certificate.validationCode,
        issuedAt: certificate.issuedAt,
        metadata: certificate.metadata,
      },
    })
  } catch (error) {
    console.error("Erro ao validar certificado:", error)
    return NextResponse.json(
      { isValid: false, error: "Erro ao validar certificado" },
      { status: 500 }
    )
  }
} 