-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('UA', 'PL', 'EN');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "lang" "Lang" NOT NULL DEFAULT 'EN';
