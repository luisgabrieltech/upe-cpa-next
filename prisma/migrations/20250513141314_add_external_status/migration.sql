-- CreateEnum
CREATE TYPE "ExternalStatus" AS ENUM ('HIDDEN', 'AVAILABLE', 'FROZEN', 'SCHEDULED');

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "externalStatus" "ExternalStatus" NOT NULL DEFAULT 'HIDDEN';
