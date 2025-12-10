import "dotenv/config";

import { eq } from "drizzle-orm";

import { db, developerStatuses, problemComments, problems, problemVotes, users } from "./lib/schema";

const CATEGORIES = ["Performance", "UI/UX", "Database", "Security", "DevOps", "Testing", "Analytics"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Rarely"];
const PAIN_LEVELS = [1, 2, 3, 4, 5];

async function seed() {
  console.log("Seeding...");

  // 1. Create a main user if not exists
  let mainUser = await db.query.users.findFirst({
    where: eq(users.email, "demo@example.com"),
  });

  if (!mainUser) {
    const [newUser] = await db
      .insert(users)
      .values({
        email: "demo@example.com",
        name: "Demo User",
        image: "https://github.com/shadcn.png",
        role: "user",
      })
      .returning();
    mainUser = newUser;
    console.log("Created demo user");
  }

  // 2. Create some problems
  const problemsData = [];
  for (let i = 0; i < 20; i++) {
    problemsData.push({
      userId: mainUser.id,
      title: `Problem ${i + 1}: ${generateRandomTitle()}`,
      description: `This is a detailed description for problem ${i + 1}. It explains the pain point deeply.`,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      painLevel: PAIN_LEVELS[Math.floor(Math.random() * PAIN_LEVELS.length)],
      frequency: FREQUENCIES[Math.floor(Math.random() * FREQUENCIES.length)],
      wouldPay: Math.random() > 0.5,
    });
  }

  const createdProblems = await db.insert(problems).values(problemsData).returning();
  console.log(`Created ${createdProblems.length} problems`);

  // 3. Add votes, comments, statuses
  for (const problem of createdProblems) {
    // Votes
    if (Math.random() > 0.3) {
      await db.insert(problemVotes).values({
        problemId: problem.id,
        userId: mainUser.id,
      }).onConflictDoNothing();
    }

    // Comments
    if (Math.random() > 0.5) {
      await db.insert(problemComments).values({
        problemId: problem.id,
        userId: mainUser.id,
        type: Math.random() > 0.5 ? "discussion" : "solution",
        content: "This is a sample comment about the problem.",
      });
    }

    // Dev status
    if (Math.random() > 0.8) {
       await db.insert(developerStatuses).values({
        problemId: problem.id,
        userId: mainUser.id,
        status: Math.random() > 0.5 ? "exploring" : "building",
       }).onConflictDoNothing();
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

function generateRandomTitle() {
  const adjs = ["Slow", "Broken", "Confusing", "Expensive", "Missing", "Complex"];
  const nouns = ["Database", "API", "Dashboard", "Login", "Deployment", "Analytics", "Search"];
  return `${adjs[Math.floor(Math.random() * adjs.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
