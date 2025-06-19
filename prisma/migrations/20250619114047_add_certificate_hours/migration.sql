-- CreateEnum
CREATE TYPE "FunctionalRole" AS ENUM ('DOCENTE', 'DISCENTE', 'EGRESSO', 'TECNICO_UNIDADES_ENSINO', 'TECNICO_COMPLEXO_HOSPITALAR');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CSA';

-- DropIndex
DROP INDEX "Certificate_formId_idx";

-- DropIndex
DROP INDEX "Certificate_userId_idx";

-- DropIndex
DROP INDEX "ValidationLog_certificateId_idx";

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "certificateHours" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "functionalRoles" "FunctionalRole"[];
