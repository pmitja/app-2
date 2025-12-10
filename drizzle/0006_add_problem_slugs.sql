-- Add slug column to problem table (without unique constraint initially)
ALTER TABLE "problem" ADD COLUMN "slug" text;

-- Note: Unique constraint will be added after slug migration script runs
-- CREATE UNIQUE INDEX "problem_slug_idx" ON "problem"("slug");
