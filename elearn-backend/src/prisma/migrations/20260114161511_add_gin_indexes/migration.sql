/*
  Warnings:

  - You are about to drop the `I18nKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `I18nValue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "I18nValue" DROP CONSTRAINT "I18nValue_keyId_fkey";

-- DropTable
DROP TABLE "I18nKey";

-- DropTable
DROP TABLE "I18nValue";

-- CreateIndex (GIN indexes for JSON fields to enable fast search)
CREATE INDEX "Topic_titleCache_idx" ON "Topic" USING GIN ("titleCache");
CREATE INDEX "Material_titleCache_idx" ON "Material" USING GIN ("titleCache");
CREATE INDEX "Material_urlCache_idx" ON "Material" USING GIN ("urlCache");
CREATE INDEX "Material_contentCache_idx" ON "Material" USING GIN ("contentCache");
CREATE INDEX "Quiz_titleCache_idx" ON "Quiz" USING GIN ("titleCache");
