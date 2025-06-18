import { prisma } from '@/lib/prisma';
import { generateValidationCode, generateCertificateHash, formatCertificateMetadata, CertificateMetadata } from './certificates';
import { generateCertificatePDF } from './certificate-template';
import { routes } from './routes';
import path from 'path';
import fs from 'fs/promises';
import { CertificateMetadata as NewCertificateMetadata } from '@/types/certificate';

export interface CertificateMetadata {
  completionDate: string;
  formTitle: string;
  formDescription?: string;
  userName: string;
  userEmail: string;
  workload?: string;
}

export class CertificateService {
  private certificatesDir: string;

  public constructor() {
    this.certificatesDir = path.join(process.cwd(), 'public', 'certificates');
    this.ensureCertificatesDir();
  }

  /**
   * Inicializa o serviço, criando diretórios necessários
   */
  private async ensureCertificatesDir(): Promise<void> {
    try {
      await fs.access(this.certificatesDir);
    } catch {
      await fs.mkdir(this.certificatesDir, { recursive: true });
    }
  }

  /**
   * Gera um novo certificado para um formulário concluído
   */
  public async generateCertificate(userId: string, formId: string): Promise<string> {
    // Buscar dados do usuário e formulário
    const [user, form] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.form.findUnique({ where: { id: formId } })
    ]);

    if (!user || !form) {
      throw new Error('Usuário ou formulário não encontrado');
    }

    if (!form.generatesCertificate) {
      throw new Error('Este formulário não gera certificado');
    }

    // Verificar se já existe certificado
    const existingCertificate = await prisma.certificate.findFirst({
      where: { userId, formId }
    });

    if (existingCertificate) {
      return existingCertificate.id;
    }

    // Gerar código de validação
    const validationCode = generateValidationCode(formId, userId);

    // Preparar metadados
    const metadata: NewCertificateMetadata = {
      completionDate: new Date().toISOString(),
      formTitle: form.title,
      formDescription: form.description,
      userName: user.name,
      userEmail: user.email,
      workload: form.estimatedTime
    };

    // Gerar hash para validação
    const hash = generateCertificateHash({
      userId,
      formId,
      validationCode,
      issuedAt: new Date()
    });

    // Criar registro no banco
    const certificate = await prisma.certificate.create({
      data: {
        validationCode,
        userId,
        formId,
        hash,
        metadata
      }
    });

    // Gerar PDF
    const validationUrl = `${process.env.NEXT_PUBLIC_APP_URL}${routes.home}/validar?code=${validationCode}`;
    const pdfBuffer = await generateCertificatePDF({
      metadata,
      validationCode,
      validationUrl
    });

    // Salvar PDF
    const pdfPath = path.join(this.certificatesDir, `${certificate.id}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);

    return certificate.id;
  }

  /**
   * Valida um certificado pelo código
   */
  public async validateCertificate(validationCode: string, ipAddress?: string, userAgent?: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { validationCode },
      include: {
        user: { select: { name: true, email: true } },
        form: { select: { title: true, description: true } }
      }
    });

    if (!certificate) {
      throw new Error('Certificado não encontrado');
    }

    // Registrar log de validação
    await prisma.validationLog.create({
      data: {
        certificateId: certificate.id,
        ipAddress,
        userAgent
      }
    });

    return certificate;
  }

  /**
   * Retorna o caminho do arquivo PDF de um certificado
   */
  public getCertificatePath(certificateId: string): string {
    return path.join(this.certificatesDir, `${certificateId}.pdf`);
  }

  /**
   * Verifica se um certificado existe
   */
  public async certificateExists(certificateId: string): Promise<boolean> {
    try {
      await fs.access(this.getCertificatePath(certificateId));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Exclui um certificado
   */
  public async deleteCertificate(certificateId: string): Promise<void> {
    const pdfPath = this.getCertificatePath(certificateId);
    try {
      await fs.unlink(pdfPath);
    } catch (error) {
      console.error('Erro ao excluir arquivo do certificado:', error);
    }
  }
} 