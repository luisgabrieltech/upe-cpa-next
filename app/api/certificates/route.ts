import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        form: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedCertificates = certificates.map((cert) => ({
      id: cert.id,
      formTitle: cert.form.title,
      completedAt: cert.createdAt,
    }));

    return NextResponse.json(formattedCertificates);
  } catch (error) {
    console.error("Erro ao buscar certificados:", error);
    return NextResponse.json(
      { message: "Erro ao buscar certificados" },
      { status: 500 }
    );
  }
} 