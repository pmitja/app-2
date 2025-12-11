import "dotenv/config";

import { eq } from "drizzle-orm";

import { categories, db, developerStatuses, problemComments, problems, problemSolutions, problemVotes, users } from "./lib/schema";
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

  // 2b. Create developer users
  const developerEmails = [
    "dev1@example.com",
    "dev2@example.com",
    "dev3@example.com",
    "dev4@example.com",
  ];
  const developerUsers: typeof users.$inferSelect[] = [];

  for (const email of developerEmails) {
    let devUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!devUser) {
      const [newDev] = await db
        .insert(users)
        .values({
          email,
          name: `Developer ${developerUsers.length + 1}`,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: "developer",
        })
        .returning();
      devUser = newDev!;
    }
    developerUsers.push(devUser);
  }
  console.log(`Created/found ${developerUsers.length} developer users`);

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
        type: "discussion",
        content: "This is a sample discussion comment about the problem.",
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

  // 5. Add solutions to some problems
  if (developerUsers.length > 0) {
    const solutionTitles = [
      "TaskFlow Pro - Complete Project Management",
      "SpeedDB - Lightning Fast Database Solution",
      "SecureAuth - Enterprise Authentication System",
      "DevOps Master - Automated Deployment Pipeline",
      "AnalyticsPro - Real-time Data Insights",
      "CloudSync - Seamless Data Synchronization",
      "APIGateway Plus - Advanced API Management",
      "MonitorX - Comprehensive System Monitoring",
    ];

    const solutionSummaries = [
      "Our solution streamlines your workflow with intuitive features and powerful automation. Built for teams of all sizes.",
      "Experience blazing-fast performance with our optimized architecture. Reduce query times by up to 10x.",
      "Enterprise-grade security with easy integration. Protect your users with advanced authentication features.",
      "Automate your entire deployment process with our CI/CD solution. Deploy with confidence every time.",
      "Get real-time insights into your data with beautiful visualizations and powerful analytics tools.",
      "Keep your data in sync across all platforms automatically. Never worry about data consistency again.",
      "Manage all your APIs from a single dashboard with advanced routing, rate limiting, and monitoring.",
      "Monitor your entire infrastructure in real-time with intelligent alerting and detailed performance metrics.",
    ];

    const unsplashImages = [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop",
    ];

    // Add solutions to first 3 problems
    const problemsWithSolutions = createdProblems.slice(0, 3);
    
    for (let i = 0; i < problemsWithSolutions.length; i++) {
      const problem = problemsWithSolutions[i];
      const solutionsCount = 2 + Math.floor(Math.random() * 2); // 2-3 solutions per problem

      for (let j = 0; j < solutionsCount; j++) {
        const randomDev = developerUsers[Math.floor(Math.random() * developerUsers.length)];
        if (!randomDev) continue;
        
        const titleIndex = (i * 3 + j) % solutionTitles.length;
        const isFeatured = j === 0 && Math.random() > 0.3; // First solution has 70% chance to be featured

        await db.insert(problemSolutions).values({
          problemId: problem.id,
          userId: randomDev.id,
          title: solutionTitles[titleIndex],
          summary: solutionSummaries[titleIndex],
          imageUrl: unsplashImages[titleIndex % unsplashImages.length],
          targetUrl: `https://example.com/solution-${titleIndex + 1}`,
          isFeatured,
          amount: isFeatured ? 999 : null,
          stripePaymentIntentId: isFeatured ? `pi_test_${Date.now()}${j}` : null,
        });
      }
    }

    console.log(`Added solutions to ${problemsWithSolutions.length} problems`);
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
