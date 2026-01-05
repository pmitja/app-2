import * as schema from '@/lib/schema';
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

// Use DATABASE_URL for seeding (usually the pooled connection string)
const databaseUrl = process.env.DATABASE_URL!;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

const CATEGORIES = [
  { name: 'SaaS', emoji: '🚀', slug: 'saas' },
  { name: 'Productivity', emoji: '⚡', slug: 'productivity' },
  { name: 'Developer Tools', emoji: '🛠️', slug: 'developer-tools' },
  { name: 'Marketing', emoji: '📢', slug: 'marketing' },
  { name: 'Community', emoji: '🤝', slug: 'community' },
  { name: 'Finance', emoji: '💰', slug: 'finance' },
  { name: 'Health & Wellness', emoji: '🌿', slug: 'health-wellness' },
  { name: 'Education', emoji: '🎓', slug: 'education' },
];

const PROBLEMS = [
  {
    title: 'Cross-platform invoicing for freelancers',
    description: 'Freelancers often juggle multiple clients across different platforms. We need a unified dashboard that can aggregate tasks and generate invoices automatically, supporting multiple currencies and payment gateways without the bloat of enterprise ERPs.',
    categorySlug: 'finance',
    painLevel: 8,
    frequency: 'monthly',
    wouldPay: true,
  },
  {
    title: 'Slack/Discord notification fatigue manager',
    description: 'I am in too many communities and work Slacks. I miss important mentions because I muted everything. I need a smart aggregator that uses AI to highlight only the messages that actually require my attention or mention specific keywords, summarizing the rest.',
    categorySlug: 'productivity',
    painLevel: 9,
    frequency: 'daily',
    wouldPay: true,
  },
  {
    title: 'API documentation maintainer',
    description: 'Docs always get out of date. I want a tool that hooks into my CI/CD, analyzes code changes (OpenAPI/Swagger), and automatically suggests updates to the documentation or even opens a PR with the changes. It should also check for broken links in the docs.',
    categorySlug: 'developer-tools',
    painLevel: 7,
    frequency: 'weekly',
    wouldPay: true,
  },
  {
    title: 'Influencer media kit generator',
    description: 'Micro-influencers struggle to create professional media kits to pitch to brands. A simple tool where they connect their Instagram/TikTok/YouTube, and it auto-generates a live, updating media kit with engagement stats and demographics would be huge.',
    categorySlug: 'marketing',
    painLevel: 6,
    frequency: 'monthly',
    wouldPay: false,
  },
  {
    title: 'Local event aggregator for remote workers',
    description: 'Remote work is lonely. Meetup is too broad. I want a specific aggregator for co-working sessions, coffee chats, and tech talks specifically for remote workers in my city. Needs to verify that events are actually active.',
    categorySlug: 'community',
    painLevel: 5,
    frequency: 'weekly',
    wouldPay: false,
  },
  {
    title: 'GDPR Compliance Checker for Small Sites',
    description: 'Small side projects often ignore GDPR because it is confusing. A simple scanner that checks a URL, detects cookies and tracking scripts, and tells you exactly what to put in your privacy policy or cookie banner would save a lot of headaches.',
    categorySlug: 'developer-tools',
    painLevel: 8,
    frequency: 'once',
    wouldPay: true,
  },
  {
    title: 'Subscription fatigue manager',
    description: 'I forget what SaaS tools I am subscribed to. A tool that scans my bank statements (via Plaid/Stripe) and lists all recurring subscriptions, with a one-click "cancel" or "remind me before renewal" feature.',
    categorySlug: 'finance',
    painLevel: 7,
    frequency: 'monthly',
    wouldPay: true,
  },
  {
    title: 'Changelog as a Service',
    description: 'Maintaining a changelog is tedious. I want a widget that I embed in my app. I push updates via API or a dashboard, and it shows a beautiful "What\'s New" popup to users, with support for images and reactions.',
    categorySlug: 'saas',
    painLevel: 4,
    frequency: 'weekly',
    wouldPay: true,
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🌱 Starting seed...');

  // 0. Clean up existing problems
  console.log('🧹 Clearing existing problems...');
  await db.delete(schema.problems);

  // 1. Ensure Anonymous User
  let user = await db.query.users.findFirst({
    where: eq(schema.users.email, 'anonymous@example.com'),
  });

  if (!user) {
    console.log('Creating Anonymous user...');
    const [newUser] = await db.insert(schema.users).values({
      name: 'Anonymous',
      email: 'anonymous@example.com',
      role: 'user',
      isActive: true,
    }).returning();
    user = newUser;
  } else {
    console.log('Anonymous user found.');
  }

  // 2. Upsert Categories
  console.log('Seeding categories...');
  const categoryMap = new Map<string, string>(); // slug -> id

  for (const cat of CATEGORIES) {
    const existing = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, cat.slug),
    });

    if (existing) {
      categoryMap.set(cat.slug, existing.id);
    } else {
      const [newCat] = await db.insert(schema.categories).values(cat).returning();
      categoryMap.set(cat.slug, newCat.id);
      console.log(`Created category: ${cat.name}`);
    }
  }

  // 3. Insert Problems
  console.log('Seeding problems...');
  for (const prob of PROBLEMS) {
    const slug = slugify(prob.title);
    
    // Check if problem exists
    const existing = await db.query.problems.findFirst({
      where: eq(schema.problems.slug, slug),
    });

    if (existing) {
      console.log(`Skipping existing problem: ${prob.title}`);
      continue;
    }

    const categoryId = categoryMap.get(prob.categorySlug);
    if (!categoryId) {
      console.warn(`Category not found for problem: ${prob.title} (${prob.categorySlug})`);
      continue;
    }

    await db.insert(schema.problems).values({
      userId: user!.id,
      categoryId,
      title: prob.title,
      description: prob.description,
      slug,
      painLevel: prob.painLevel,
      frequency: prob.frequency,
      wouldPay: prob.wouldPay,
    });
    console.log(`Created problem: ${prob.title}`);
  }

  console.log('✅ Seed completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
