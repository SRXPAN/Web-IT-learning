/*
  Warnings:

  - You are about to drop the column `contentKeyId` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `titleKeyId` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `textKeyId` on the `Option` table. All the data in the column will be lost.
  - You are about to drop the column `explanationKeyId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `textKeyId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `titleKeyId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `descKeyId` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `titleKeyId` on the `Topic` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_contentKeyId_fkey";

-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_titleKeyId_fkey";

-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_textKeyId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_explanationKeyId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_textKeyId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_titleKeyId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_descKeyId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_titleKeyId_fkey";

-- DropIndex
DROP INDEX "Material_contentKeyId_idx";

-- DropIndex
DROP INDEX "Material_titleKeyId_idx";

-- DropIndex
DROP INDEX "Option_textKeyId_idx";

-- DropIndex
DROP INDEX "Question_explanationKeyId_idx";

-- DropIndex
DROP INDEX "Question_textKeyId_idx";

-- DropIndex
DROP INDEX "Quiz_titleKeyId_idx";

-- DropIndex
DROP INDEX "Topic_descKeyId_idx";

-- DropIndex
DROP INDEX "Topic_titleKeyId_idx";

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "contentKeyId",
DROP COLUMN "titleKeyId";

-- AlterTable
ALTER TABLE "Option" DROP COLUMN "textKeyId";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "explanationKeyId",
DROP COLUMN "textKeyId";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "titleKeyId";

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "descKeyId",
DROP COLUMN "titleKeyId";
