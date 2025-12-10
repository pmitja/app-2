import { and, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";

import {
    categories,
    db,
    developerStatuses,
    problemComments,
    problemFollows,
    problems,
    problemVotes,
    users,
} from "./schema";

export interface GetProblemsParams {
  q?: string;
  sort?: "votes" | "recent" | "pain";
  category?: string;
  limit?: number;
  offset?: number;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  slug: string;
}

export interface ProblemWithVotes {
  id: string;
  userId: string;
  title: string;
  description: string;
  slug: string;
  category: {
    id: string;
    name: string;
    emoji: string;
    slug: string;
  };
  painLevel: number;
  frequency: string;
  wouldPay: boolean;
  createdAt: Date;
  voteCount: number;
  author: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export async function getProblems(
  params: GetProblemsParams = {},
): Promise<ProblemWithVotes[]> {
  const { q, sort = "votes", category, limit = 20, offset = 0 } = params;

  // Build where conditions
  const conditions = [];

  if (q) {
    conditions.push(ilike(problems.title, `%${q}%`));
  }

  if (category && category !== "all") {
    // Handle multiple categories separated by commas (OR logic)
    const categoryArray = category.split(",").map(c => c.trim()).filter(Boolean);
    if (categoryArray.length > 0) {
      conditions.push(inArray(categories.slug, categoryArray));
    }
  }

  // Create a subquery to count votes for each problem
  const voteCountSubquery = db
    .select({
      problemId: problemVotes.problemId,
      count: count().as("vote_count"),
    })
    .from(problemVotes)
    .groupBy(problemVotes.problemId)
    .as("vote_counts");

  // Main query with joins
  const query = db
    .select({
      id: problems.id,
      userId: problems.userId,
      title: problems.title,
      description: problems.description,
      slug: problems.slug,
      categoryId: problems.categoryId,
      categoryName: categories.name,
      categoryEmoji: categories.emoji,
      categorySlug: categories.slug,
      painLevel: problems.painLevel,
      frequency: problems.frequency,
      wouldPay: problems.wouldPay,
      createdAt: problems.createdAt,
      voteCount: sql<number>`COALESCE(${voteCountSubquery.count}, 0)`,
      authorName: users.name,
      authorEmail: users.email,
      authorImage: users.image,
    })
    .from(problems)
    .leftJoin(voteCountSubquery, eq(problems.id, voteCountSubquery.problemId))
    .leftJoin(users, eq(problems.userId, users.id))
    .leftJoin(categories, eq(problems.categoryId, categories.id));

  // Apply where conditions if any
  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  // Apply sorting
  switch (sort) {
    case "votes":
      query.orderBy(desc(sql`COALESCE(${voteCountSubquery.count}, 0)`));
      break;
    case "recent":
      query.orderBy(desc(problems.createdAt));
      break;
    case "pain":
      query.orderBy(desc(problems.painLevel));
      break;
  }

  // Apply pagination
  query.limit(limit);
  query.offset(offset);

  const results = await query;

  // Transform results to match the interface
  return results.map((row) => ({
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    slug: row.slug || "",
    category: {
      id: row.categoryId,
      name: row.categoryName || "",
      emoji: row.categoryEmoji || "",
      slug: row.categorySlug || "",
    },
    painLevel: row.painLevel,
    frequency: row.frequency,
    wouldPay: row.wouldPay,
    createdAt: row.createdAt,
    voteCount: Number(row.voteCount) || 0,
    author: {
      name: row.authorName,
      email: row.authorEmail,
      image: row.authorImage,
    },
  }));
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  const result = await db.query.categories.findMany({
    orderBy: [categories.name],
  });
  
  return result.map(cat => ({
    id: cat.id,
    name: cat.name,
    emoji: cat.emoji,
    slug: cat.slug,
  }));
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

export async function searchSimilarCategories(name: string): Promise<Category[]> {
  if (!name || name.trim().length === 0) {
    return [];
  }

  const searchTerm = name.trim().toLowerCase();
  const allCategories = await getCategories();

  // Find exact and substring matches
  const exactMatches: Array<Category & { score: number }> = [];
  const fuzzyMatches: Array<Category & { score: number }> = [];

  for (const category of allCategories) {
    const categoryLower = category.name.toLowerCase();
    
    // Exact match
    if (categoryLower === searchTerm) {
      exactMatches.push({ ...category, score: 0 });
    }
    // Substring match
    else if (categoryLower.includes(searchTerm) || searchTerm.includes(categoryLower)) {
      exactMatches.push({ ...category, score: 1 });
    }
    // Fuzzy match (distance <= 2)
    else {
      const distance = levenshteinDistance(searchTerm, categoryLower);
      if (distance <= 2) {
        fuzzyMatches.push({ ...category, score: distance + 10 }); // Add 10 to score to sort after exact matches
      }
    }
  }

  // Combine and sort: exact matches first, then fuzzy matches
  const combined = [...exactMatches, ...fuzzyMatches].sort((a, b) => a.score - b.score);
  
  // Remove score property and return
  return combined.map(({ score, ...category }) => category);
}

export async function createCategory(name: string, emoji: string): Promise<Category> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  const [newCategory] = await db
    .insert(categories)
    .values({
      name: name.trim(),
      emoji,
      slug,
    })
    .returning();

  return {
    id: newCategory.id,
    name: newCategory.name,
    emoji: newCategory.emoji,
    slug: newCategory.slug,
  };
}

export interface ProblemComment {
  id: string;
  content: string;
  type: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface DeveloperStatus {
  id: string;
  status: string;
  solutionUrl: string | null;
  createdAt: Date;
  developer: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface ProblemDetail {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    emoji: string;
  };
  painLevel: number;
  frequency: string;
  wouldPay: boolean;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  voteCount: number;
  userHasVoted: boolean;
  userIsFollowing: boolean;
  comments: ProblemComment[];
  developerStatuses: DeveloperStatus[];
  userDeveloperStatus: {
    status: string;
    solutionUrl: string | null;
  } | null;
}

export async function getProblemDetail(
  problemId: string,
  userId?: string,
): Promise<ProblemDetail | null> {
  // Fetch the problem
  const problem = await db.query.problems.findFirst({
    where: eq(problems.id, problemId),
  });

  if (!problem) {
    return null;
  }

  // Fetch author
  const author = await db.query.users.findFirst({
    where: eq(users.id, problem.userId),
  });

  // Fetch category
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, problem.categoryId),
  });

  // Count votes
  const voteCountResult = await db
    .select({ count: count() })
    .from(problemVotes)
    .where(eq(problemVotes.problemId, problemId));
  const voteCount = voteCountResult[0]?.count ?? 0;

  // Check if user has voted
  let userHasVoted = false;
  if (userId) {
    const userVote = await db.query.problemVotes.findFirst({
      where: and(
        eq(problemVotes.problemId, problemId),
        eq(problemVotes.userId, userId),
      ),
    });
    userHasVoted = !!userVote;
  }

  // Check if user is following
  let userIsFollowing = false;
  if (userId) {
    const userFollow = await db.query.problemFollows.findFirst({
      where: and(
        eq(problemFollows.problemId, problemId),
        eq(problemFollows.userId, userId),
      ),
    });
    userIsFollowing = !!userFollow;
  }

  // Fetch comments with authors
  const commentsData = await db
    .select({
      id: problemComments.id,
      content: problemComments.content,
      type: problemComments.type,
      createdAt: problemComments.createdAt,
      authorId: users.id,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(problemComments)
    .leftJoin(users, eq(problemComments.userId, users.id))
    .where(eq(problemComments.problemId, problemId))
    .orderBy(desc(problemComments.createdAt));

  const comments: ProblemComment[] = commentsData.map((comment) => ({
    id: comment.id,
    content: comment.content,
    type: comment.type,
    createdAt: comment.createdAt,
    author: {
      id: comment.authorId || "",
      name: comment.authorName,
      image: comment.authorImage,
    },
  }));

  // Fetch developer statuses with user info
  const statusesData = await db
    .select({
      id: developerStatuses.id,
      status: developerStatuses.status,
      solutionUrl: developerStatuses.solutionUrl,
      createdAt: developerStatuses.createdAt,
      devId: users.id,
      devName: users.name,
      devImage: users.image,
    })
    .from(developerStatuses)
    .leftJoin(users, eq(developerStatuses.userId, users.id))
    .where(eq(developerStatuses.problemId, problemId))
    .orderBy(desc(developerStatuses.createdAt));

  const developerStatusesList: DeveloperStatus[] = statusesData.map(
    (status) => ({
      id: status.id,
      status: status.status,
      solutionUrl: status.solutionUrl,
      createdAt: status.createdAt,
      developer: {
        id: status.devId || "",
        name: status.devName,
        image: status.devImage,
      },
    }),
  );

  // Get current user's developer status
  let userDeveloperStatus = null;
  if (userId) {
    const userStatus = await db.query.developerStatuses.findFirst({
      where: and(
        eq(developerStatuses.problemId, problemId),
        eq(developerStatuses.userId, userId),
      ),
    });
    if (userStatus) {
      userDeveloperStatus = {
        status: userStatus.status,
        solutionUrl: userStatus.solutionUrl,
      };
    }
  }

  return {
    id: problem.id,
    userId: problem.userId,
    title: problem.title,
    description: problem.description,
    category: {
      id: category?.id || "",
      name: category?.name || "",
      emoji: category?.emoji || "",
    },
    painLevel: problem.painLevel,
    frequency: problem.frequency,
    wouldPay: problem.wouldPay,
    createdAt: problem.createdAt,
    author: {
      id: author?.id || "",
      name: author?.name || null,
      email: author?.email || null,
      image: author?.image || null,
    },
    voteCount: Number(voteCount),
    userHasVoted,
    userIsFollowing,
    comments,
    developerStatuses: developerStatusesList,
    userDeveloperStatus,
  };
}

export async function getProblemDetailBySlug(
  categorySlug: string,
  problemSlug: string,
  userId?: string,
): Promise<ProblemDetail | null> {
  // First, fetch the category
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });

  if (!category) {
    return null;
  }

  // Fetch the problem by slug and categoryId
  const problem = await db.query.problems.findFirst({
    where: and(
      eq(problems.slug, problemSlug),
      eq(problems.categoryId, category.id),
    ),
  });

  if (!problem) {
    return null;
  }

  // Reuse the existing getProblemDetail logic by calling it with the problem ID
  return getProblemDetail(problem.id, userId);
}
