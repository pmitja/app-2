-- Create problem_solution table
CREATE TABLE "problem_solution" (
  "id" text PRIMARY KEY NOT NULL,
  "problemId" text NOT NULL REFERENCES "problem"("id") ON DELETE CASCADE,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "summary" text NOT NULL,
  "imageUrl" text NOT NULL,
  "targetUrl" text NOT NULL,
  "isFeatured" boolean DEFAULT false NOT NULL,
  "stripePaymentIntentId" text,
  "amount" integer,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

-- Create partial unique index to ensure only one featured solution per problem
CREATE UNIQUE INDEX "problem_solution_featured_idx" ON "problem_solution"("problemId") WHERE "isFeatured" = true;

-- Create index on problemId for faster queries
CREATE INDEX "problem_solution_problemId_idx" ON "problem_solution"("problemId");

-- Create index on userId for faster queries
CREATE INDEX "problem_solution_userId_idx" ON "problem_solution"("userId");
