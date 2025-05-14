-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "visibleToRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "visibleToUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
