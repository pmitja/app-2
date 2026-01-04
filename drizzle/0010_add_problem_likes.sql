CREATE TABLE IF NOT EXISTS "problem_like" (
  "id" text PRIMARY KEY NOT NULL,
  "problemId" text NOT NULL REFERENCES "problem"("id") ON DELETE CASCADE,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  UNIQUE("problemId", "userId")
);

