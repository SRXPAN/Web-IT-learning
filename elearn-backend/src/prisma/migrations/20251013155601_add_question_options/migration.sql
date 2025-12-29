-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "optionId" TEXT;

-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "durationSec" SET DEFAULT 300;

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
