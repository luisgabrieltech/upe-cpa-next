import PDFDocument from 'pdfkit';
import { CertificateMetadata } from './certificates';
import QRCode from 'qrcode';
import { routes } from './routes';

interface CertificateTemplateOptions {
  metadata: CertificateMetadata;
  validationCode: string;
  validationUrl: string;
}

export async function generateCertificatePDF(options: CertificateTemplateOptions): Promise<Buffer> {
  const { metadata, validationCode, validationUrl } = options;
  
  // Criar novo documento PDF
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40
    }
  });

  // Buffer para armazenar o PDF
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  
  // Gerar QR Code
  const qrCodeDataUrl = await QRCode.toDataURL(validationUrl);

  // Cabeçalho (usando fonte padrão)
  doc.fontSize(24)
     .text('UNIVERSIDADE DE PERNAMBUCO', { align: 'center' });
  
  doc.moveDown(0.5)
     .fontSize(18)
     .text('COMISSÃO PRÓPRIA DE AVALIAÇÃO', { align: 'center' });

  // Título
  doc.moveDown(2)
     .fontSize(28)
     .text('CERTIFICADO', { align: 'center' });

  // Conteúdo principal
  doc.moveDown(2)
     .fontSize(14)
     .text('Certificamos que', { align: 'center' });

  doc.moveDown(0.5)
     .fontSize(20)
     .text(metadata.userName, { align: 'center' });

  doc.moveDown(1)
     .fontSize(14)
     .text(`concluiu ${metadata.formTitle}`, { align: 'center' });

  if (metadata.formDescription) {
    doc.moveDown(0.5)
       .fontSize(12)
       .text(metadata.formDescription, { align: 'center' });
  }

  // Data e carga horária
  doc.moveDown(1)
     .fontSize(12)
     .text(`Concluído em ${new Date(metadata.completionDate).toLocaleDateString('pt-BR')}`, { align: 'center' });

  if (metadata.workload) {
    doc.moveDown(0.5)
       .text(`Carga horária: ${metadata.workload}`, { align: 'center' });
  }

  // Código de validação
  doc.moveDown(2)
     .fontSize(10)
     .text('Código de validação:', { align: 'center' })
     .moveDown(0.2)
     .text(validationCode, { align: 'center' });

  // QR Code
  const qrSize = 100;
  doc.image(qrCodeDataUrl, doc.page.width - qrSize - 50, doc.page.height - qrSize - 50, {
    width: qrSize
  });

  // Texto de validação
  doc.fontSize(8)
     .text(
       'Para verificar a autenticidade deste certificado, acesse:',
       50,
       doc.page.height - 60,
       { align: 'left' }
     )
     .text(validationUrl, { align: 'left', underline: true });

  // Finalizar documento
  doc.end();

  // Retornar buffer do PDF
  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
} 