import "dotenv/config";

import { eq } from "drizzle-orm";

import { db, problems } from "../lib/schema";
import { slugifyTitle } from "../lib/utils";

async function migrateProblemsToSlugs() {
  console.log("Starting slug migration for existing problems...");

  // Fetch all problems
  const allProblems = await db.query.problems.findMany({
    orderBy: (problems, { asc }) => [asc(problems.createdAt)],
  });

  console.log(`Found ${allProblems.length} problems to migrate`);

  // Track used slugs to handle duplicates
  const usedSlugs = new Set<string>();
  let updatedCount = 0;

  for (const problem of allProblems) {
    // Skip if already has a slug
    if (problem.slug) {
      console.log(`Problem "${problem.title}" already has slug: ${problem.slug}`);
      usedSlugs.add(problem.slug);
      continue;
    }

    // Generate base slug from title
    const baseSlug = slugifyTitle(problem.title);
    let uniqueSlug = baseSlug;
    let counter = 2;

    // Check for duplicates and append number if needed
    while (usedSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Update the problem with the new slug
    await db
      .update(problems)
      .set({ slug: uniqueSlug })
      .where(eq(problems.id, problem.id));

    usedSlugs.add(uniqueSlug);
    updatedCount++;

    console.log(`✓ Updated problem "${problem.title}" with slug: ${uniqueSlug}`);
  }

  console.log(`\nMigration complete! Updated ${updatedCount} problems.`);
  process.exit(0);
}

migrateProblemsToSlugs().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
