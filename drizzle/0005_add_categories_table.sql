-- Create categories table
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL UNIQUE,
	"emoji" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- Insert default categories
INSERT INTO "category" ("id", "name", "emoji", "slug") VALUES
	('cat-performance', 'Performance', '⚡', 'performance'),
	('cat-ui-ux', 'UI/UX', '🎨', 'ui-ux'),
	('cat-database', 'Database', '🗄️', 'database'),
	('cat-security', 'Security', '🔒', 'security'),
	('cat-devops', 'DevOps', '🚀', 'devops'),
	('cat-testing', 'Testing', '🧪', 'testing'),
	('cat-analytics', 'Analytics', '📊', 'analytics');

-- Add categoryId column to problem table
ALTER TABLE "problem" ADD COLUMN "categoryId" text;

-- Migrate existing data: map old category text to new categoryId
UPDATE "problem" SET "categoryId" = 'cat-performance' WHERE "category" = 'Performance';
UPDATE "problem" SET "categoryId" = 'cat-ui-ux' WHERE "category" = 'UI/UX';
UPDATE "problem" SET "categoryId" = 'cat-database' WHERE "category" = 'Database';
UPDATE "problem" SET "categoryId" = 'cat-security' WHERE "category" = 'Security';
UPDATE "problem" SET "categoryId" = 'cat-devops' WHERE "category" = 'DevOps';
UPDATE "problem" SET "categoryId" = 'cat-testing' WHERE "category" = 'Testing';
UPDATE "problem" SET "categoryId" = 'cat-analytics' WHERE "category" = 'Analytics';

-- Make categoryId NOT NULL and add foreign key constraint
ALTER TABLE "problem" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "problem" ADD CONSTRAINT "problem_categoryId_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE restrict ON UPDATE no action;

-- Drop old category column
ALTER TABLE "problem" DROP COLUMN "category";
