-- Adicionar campo generatesCertificate na tabela Form
ALTER TABLE "Form" ADD COLUMN "generatesCertificate" BOOLEAN NOT NULL DEFAULT false;

-- Criar tabela Certificate
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "validationCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hash" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- Criar tabela ValidationLog
CREATE TABLE "ValidationLog" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidationLog_pkey" PRIMARY KEY ("id")
);

-- Criar índices
CREATE UNIQUE INDEX "Certificate_validationCode_key" ON "Certificate"("validationCode");
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");
CREATE INDEX "Certificate_formId_idx" ON "Certificate"("formId");
CREATE INDEX "ValidationLog_certificateId_idx" ON "ValidationLog"("certificateId");

-- Adicionar foreign keys
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ValidationLog" ADD CONSTRAINT "ValidationLog_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE; 