import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Tipo para metadados do certificado
 */
export interface CertificateMetadata {
  completionDate: string;
  formTitle: string;
  formDescription?: string;
  userEmail: string;
  userName: string;
  workload?: string; // Carga horária, se aplicável
}

/**
 * Gera um código de validação único para o certificado
 */
export function generateValidationCode(formId: string, userId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const hash = crypto.createHash('sha256')
    .update(`${formId}${userId}${timestamp}${random}`)
    .digest('hex')
    .substring(0, 5);
  
  return `UPE-CPA-${hash}-${timestamp.substring(0, 4)}`.toUpperCase();
}

/**
 * Gera um hash para validação do certificado
 */
export function generateCertificateHash(data: {
  userId: string;
  formId: string;
  validationCode: string;
  issuedAt: Date;
}): string {
  return crypto.createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

/**
 * Gera o PDF do certificado
 */
export async function generateCertificatePDF(data: {
  metadata: CertificateMetadata;
  validationCode: string;
  validationUrl: string;
}): Promise<Buffer> {
  const { metadata, validationCode, validationUrl } = data;
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 50
  });

  // Cabeçalho (usando fonte padrão)
  doc.fontSize(24)
    .text('UNIVERSIDADE DE PERNAMBUCO', { align: 'center' })
    .moveDown(0.5);

  doc.fontSize(20)
    .text('COMISSÃO PRÓPRIA DE AVALIAÇÃO', { align: 'center' })
    .moveDown(1);

  // Título
  doc.fontSize(28)
    .text('CERTIFICADO', { align: 'center' })
    .moveDown(2);

  // Conteúdo
  doc.fontSize(14)
    .text(`Certificamos que ${metadata.userName} participou da avaliação "${metadata.formTitle}"`, {
      align: 'center'
    })
    .moveDown(0.5);

  if (metadata.formDescription) {
    doc.fontSize(12)
      .text(metadata.formDescription, {
        align: 'center'
      })
      .moveDown(0.5);
  }

  if (metadata.workload) {
    doc.text(`Carga horária: ${metadata.workload}`, {
      align: 'center'
    })
    .moveDown(0.5);
  }

  // Data
  const date = new Date(metadata.completionDate);
  doc.text(`Recife, ${date.toLocaleDateString('pt-BR')}`, {
    align: 'center'
  })
  .moveDown(2);

  // Código de validação
  doc.fontSize(10)
    .text(`Código de validação: ${validationCode}`, {
      align: 'center'
    })
    .moveDown(0.5);

  // QR Code
  const qrCodeBuffer = await QRCode.toBuffer(validationUrl);
  doc.image(qrCodeBuffer, doc.page.width - 150, doc.page.height - 150, {
    width: 100
  });

  // Finalizar PDF
  doc.end();

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

/**
 * Extrai informações do código de validação
 * @param code - Código de validação
 * @returns object com as partes do código
 */
export function parseValidationCode(code: string): {
  sequential: string;
  year: string;
} | null {
  const pattern = /^UPE-CPA-\d{5}-\d{4}$/;
  if (!pattern.test(code)) return null;

  const parts = code.split('-');
  return {
    sequential: parts[2],
    year: parts[3]
  };
}

/**
 * Valida e formata os metadados do certificado
 * @param metadata - Metadados do certificado
 * @returns CertificateMetadata formatado
 */
export function formatCertificateMetadata(metadata: Partial<CertificateMetadata>): CertificateMetadata {
  if (!metadata.completionDate) throw new Error('Data de conclusão é obrigatória');
  if (!metadata.formTitle) throw new Error('Título do formulário é obrigatório');
  if (!metadata.userEmail) throw new Error('Email do usuário é obrigatório');
  if (!metadata.userName) throw new Error('Nome do usuário é obrigatório');

  return {
    completionDate: new Date(metadata.completionDate).toISOString(),
    formTitle: metadata.formTitle,
    formDescription: metadata.formDescription || '',
    userEmail: metadata.userEmail,
    userName: metadata.userName,
    workload: metadata.workload || ''
  };
} 