import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").at(-2)
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }
    // Gerar token de redefinição
    const token = crypto.randomBytes(32).toString("hex")
    const tokenExp = new Date(Date.now() + 1000 * 60 * 60) // 1 hora
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExp: tokenExp,
      },
    })
    // Enviar e-mail com link de redefinição
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password/${token}`
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: "Redefinição de senha",
      html: `<p>Olá, ${user.name}!<br>Você solicitou a redefinição de senha.<br><a href='${resetUrl}'>Clique aqui para redefinir sua senha</a>.<br>Se não foi você, ignore este e-mail.</p>`
    })
    return NextResponse.json({ message: "E-mail de redefinição enviado com sucesso" })
  } catch (error) {
    console.error("Erro ao enviar e-mail de redefinição:", error)
    return NextResponse.json({ message: "Erro ao enviar e-mail de redefinição" }, { status: 500 })
  }
} 