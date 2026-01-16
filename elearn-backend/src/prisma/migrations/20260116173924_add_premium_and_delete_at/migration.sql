-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
