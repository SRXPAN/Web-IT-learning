-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "explanation" TEXT;

-- CreateIndex
CREATE INDEX "Answer_userId_idx" ON "Answer"("userId");

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

-- CreateIndex
CREATE INDEX "Material_topicId_idx" ON "Material"("topicId");

-- CreateIndex
CREATE INDEX "Option_questionId_idx" ON "Option"("questionId");

-- CreateIndex
CREATE INDEX "Question_quizId_idx" ON "Question"("quizId");

-- CreateIndex
CREATE INDEX "Quiz_topicId_idx" ON "Quiz"("topicId");

-- CreateIndex
CREATE INDEX "Topic_category_idx" ON "Topic"("category");

-- CreateIndex
CREATE INDEX "Topic_parentId_idx" ON "Topic"("parentId");
