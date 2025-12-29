-- AlterTable
ALTER TABLE "UiTranslation" ADD COLUMN     "description" TEXT,
ADD COLUMN     "namespace" TEXT NOT NULL DEFAULT 'common';

-- CreateTable
CREATE TABLE "TranslationVersion" (
    "id" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranslationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TranslationVersion_namespace_key" ON "TranslationVersion"("namespace");

-- CreateIndex
CREATE INDEX "UiTranslation_namespace_idx" ON "UiTranslation"("namespace");
