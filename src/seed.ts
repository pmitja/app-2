import "dotenv/config";

import { eq } from "drizzle-orm";

import { categories, db, developerStatuses, problemComments, problems, problemVotes, users } from "./lib/schema";
import { slugifyTitle } from "./lib/utils";

const DEFAULT_CATEGORIES = [
  { name: "Performance", emoji: "⚡", slug: "performance" },
  { name: "UI/UX", emoji: "🎨", slug: "ui-ux" },
  { name: "Database", emoji: "🗄️", slug: "database" },
  { name: "Security", emoji: "🔒", slug: "security" },
  { name: "DevOps", emoji: "🚀", slug: "devops" },
  { name: "Testing", emoji: "🧪", slug: "testing" },
  { name: "Analytics", emoji: "📊", slug: "analytics" },
];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Rarely"];
const PAIN_LEVELS = [1, 2, 3, 4, 5];

async function seed() {
  console.log("Seeding...");

  // 1. Create default categories if they don't exist
  let categoryList = await db.query.categories.findMany();
  
  if (categoryList.length === 0) {
    console.log("Creating default categories...");
    for (const cat of DEFAULT_CATEGORIES) {
      await db.insert(categories).values(cat).onConflictDoNothing();
    }
    categoryList = await db.query.categories.findMany();
    console.log(`Created ${categoryList.length} categories`);
  }

  // 2. Create a main user if not exists
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

  // 3. Create some problems
  const problemsData = [];
  const usedSlugs = new Set<string>();
  
  for (let i = 0; i < 20; i++) {
    const randomCategory = categoryList[Math.floor(Math.random() * categoryList.length)];
    const title = `Problem ${i + 1}: ${generateRandomTitle()}`;
    
    // Generate unique slug
    let slug = slugifyTitle(title);
    let counter = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slugifyTitle(title)}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);
    
    problemsData.push({
      userId: mainUser.id,
      title,
      description: `This is a detailed description for problem ${i + 1}. It explains the pain point deeply.`,
      slug,
      categoryId: randomCategory.id,
      painLevel: PAIN_LEVELS[Math.floor(Math.random() * PAIN_LEVELS.length)],
      frequency: FREQUENCIES[Math.floor(Math.random() * FREQUENCIES.length)],
      wouldPay: Math.random() > 0.5,
    });
  }

  const createdProblems = await db.insert(problems).values(problemsData).returning();
  console.log(`Created ${createdProblems.length} problems`);

  // 4. Add votes, comments, statuses
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
