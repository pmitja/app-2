-- Migration: Update to fixed 20 categories
-- This migration replaces all existing categories with a fixed set of 20 categories

-- Step 1: Insert new categories with deterministic IDs
INSERT INTO "category" ("id", "name", "emoji", "slug") VALUES
  ('cat-artificial-intelligence', 'Artificial Intelligence', '🤖', 'artificial-intelligence'),
  ('cat-saas', 'SaaS', '☁️', 'saas'),
  ('cat-developer-tools', 'Developer Tools', '⚙️', 'developer-tools'),
  ('cat-fintech', 'Fintech', '💰', 'fintech'),
  ('cat-productivity', 'Productivity', '✅', 'productivity'),
  ('cat-marketing', 'Marketing', '📣', 'marketing'),
  ('cat-ecommerce', 'E-commerce', '🛒', 'ecommerce'),
  ('cat-design-tools', 'Design Tools', '🎨', 'design-tools'),
  ('cat-no-code', 'No-Code', '🔧', 'no-code'),
  ('cat-analytics', 'Analytics', '📊', 'analytics'),
  ('cat-education', 'Education', '🎓', 'education'),
  ('cat-health-fitness', 'Health & Fitness', '💪', 'health-fitness'),
  ('cat-social-media', 'Social Media', '📱', 'social-media'),
  ('cat-content-creation', 'Content Creation', '📝', 'content-creation'),
  ('cat-sales', 'Sales', '💼', 'sales'),
  ('cat-customer-support', 'Customer Support', '🎧', 'customer-support'),
  ('cat-recruiting-hr', 'Recruiting & HR', '👥', 'recruiting-hr'),
  ('cat-real-estate', 'Real Estate', '🏠', 'real-estate'),
  ('cat-travel', 'Travel', '✈️', 'travel'),
  ('cat-security', 'Security', '🔒', 'security')
ON CONFLICT ("id") DO NOTHING;

-- Step 2: Update existing problems to map to new categories (best effort matching)
-- Map old categories to new ones based on name similarity
UPDATE "problem" SET "categoryId" = 'cat-analytics' 
  WHERE "categoryId" IN (SELECT "id" FROM "category" WHERE "name" ILIKE '%analytic%');

UPDATE "problem" SET "categoryId" = 'cat-security' 
  WHERE "categoryId" IN (SELECT "id" FROM "category" WHERE "name" ILIKE '%security%');

UPDATE "problem" SET "categoryId" = 'cat-developer-tools' 
  WHERE "categoryId" IN (SELECT "id" FROM "category" WHERE "name" ILIKE '%devops%' OR "name" ILIKE '%testing%');

UPDATE "problem" SET "categoryId" = 'cat-design-tools' 
  WHERE "categoryId" IN (SELECT "id" FROM "category" WHERE "name" ILIKE '%ui%' OR "name" ILIKE '%ux%' OR "name" ILIKE '%design%');

UPDATE "problem" SET "categoryId" = 'cat-developer-tools' 
  WHERE "categoryId" IN (SELECT "id" FROM "category" WHERE "name" ILIKE '%database%' OR "name" ILIKE '%performance%');

-- Step 3: Set all remaining unmapped problems to default category (Developer Tools)
UPDATE "problem" SET "categoryId" = 'cat-developer-tools' 
  WHERE "categoryId" NOT IN (
    'cat-artificial-intelligence', 'cat-saas', 'cat-developer-tools', 'cat-fintech',
    'cat-productivity', 'cat-marketing', 'cat-ecommerce', 'cat-design-tools',
    'cat-no-code', 'cat-analytics', 'cat-education', 'cat-health-fitness',
    'cat-social-media', 'cat-content-creation', 'cat-sales', 'cat-customer-support',
    'cat-recruiting-hr', 'cat-real-estate', 'cat-travel', 'cat-security'
  );

-- Step 4: Delete old categories (this will work because all problems are now mapped to new categories)
DELETE FROM "category" WHERE "id" NOT IN (
  'cat-artificial-intelligence', 'cat-saas', 'cat-developer-tools', 'cat-fintech',
  'cat-productivity', 'cat-marketing', 'cat-ecommerce', 'cat-design-tools',
  'cat-no-code', 'cat-analytics', 'cat-education', 'cat-health-fitness',
  'cat-social-media', 'cat-content-creation', 'cat-sales', 'cat-customer-support',
  'cat-recruiting-hr', 'cat-real-estate', 'cat-travel', 'cat-security'
);
