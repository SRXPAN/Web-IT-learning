-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "contentJson" JSONB,
ADD COLUMN     "titleJson" JSONB;

-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "textJson" JSONB;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "explanationJson" JSONB,
ADD COLUMN     "textJson" JSONB;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "titleJson" JSONB;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "descJson" JSONB,
ADD COLUMN     "nameJson" JSONB;

-- CreateTable
CREATE TABLE "UiTranslation" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "lang" "Lang" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UiTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyGoalTemplate" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "translations" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyGoalTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeakSpotTemplate" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "translations" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeakSpotTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementTemplate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "translations" JSONB NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AchievementTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "id" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "translations" JSONB NOT NULL,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UiTranslation_key_idx" ON "UiTranslation"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UiTranslation_key_lang_key" ON "UiTranslation"("key", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "AchievementTemplate_code_key" ON "AchievementTemplate"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_category_key" ON "CategoryTranslation"("category");
