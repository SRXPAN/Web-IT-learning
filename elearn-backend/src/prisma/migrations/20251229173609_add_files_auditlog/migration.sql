/*
  Warnings:

  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'SIGNED');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "fileId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
ADD COLUMN     "avatarId" TEXT;

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "bucket" TEXT NOT NULL DEFAULT 'elearn-files',
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "uploadedById" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_key_key" ON "File"("key");

-- CreateIndex
CREATE INDEX "File_uploadedById_idx" ON "File"("uploadedById");

-- CreateIndex
CREATE INDEX "File_visibility_idx" ON "File"("visibility");

-- CreateIndex
CREATE INDEX "File_mimeType_idx" ON "File"("mimeType");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
