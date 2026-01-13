-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "contentCache" JSONB,
ADD COLUMN     "titleCache" JSONB,
ADD COLUMN     "urlCache" JSONB;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "titleCache" JSONB;

-- Create GIN indexes for fast JSONB search on cache fields
CREATE INDEX "Topic_titleCache_idx" ON "Topic" USING GIN ("titleCache");
CREATE INDEX "Topic_descCache_idx" ON "Topic" USING GIN ("descCache");
CREATE INDEX "Material_titleCache_idx" ON "Material" USING GIN ("titleCache");
CREATE INDEX "Material_contentCache_idx" ON "Material" USING GIN ("contentCache");
CREATE INDEX "Material_urlCache_idx" ON "Material" USING GIN ("urlCache");
CREATE INDEX "Quiz_titleCache_idx" ON "Quiz" USING GIN ("titleCache");
