/*
  Warnings:

  - You are about to drop the column `lang` on the `UiTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `UiTranslation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `UiTranslation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `translations` to the `UiTranslation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UiTranslation_key_lang_key";

-- AlterTable
ALTER TABLE "UiTranslation" DROP COLUMN "lang",
DROP COLUMN "value",
ADD COLUMN     "translations" JSONB NOT NULL;

-- CreateIndex
CREATE INDEX "Answer_userId_questionId_idx" ON "Answer"("userId", "questionId");

-- CreateIndex
CREATE INDEX "Answer_createdAt_idx" ON "Answer"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UiTranslation_key_key" ON "UiTranslation"("key");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
