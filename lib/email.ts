import nodemailer from "nodemailer"

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error)
    throw new Error("Erro ao enviar e-mail")
  }
} 