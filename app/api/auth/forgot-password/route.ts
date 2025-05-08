import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: "E-mail não encontrado" },
        { status: 404 }
      )
    }

    // Gerar token de recuperação
    const resetToken = randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

    // Salvar token no banco
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExp: resetTokenExpiry
      }
    })

    // Enviar e-mail
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`
    
    await sendEmail({
      to: email,
      subject: "Recuperação de senha - CPA-UPE",
      html: `
        <h1>Recuperação de senha</h1>
        <p>Olá ${user.name},</p>
        <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou a recuperação de senha, ignore este e-mail.</p>
      `
    })

    return NextResponse.json(
      { message: "E-mail de recuperação enviado" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao processar recuperação de senha:", error)
    return NextResponse.json(
      { message: "Erro ao processar recuperação de senha" },
      { status: 500 }
    )
  }
} 