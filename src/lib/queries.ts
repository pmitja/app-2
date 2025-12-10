import { and, count, desc, eq, ilike, sql } from "drizzle-orm";
import {
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
}

export interface ProblemWithVotes {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
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
  const { q, sort = "votes", category } = params;

  // Build where conditions
  const conditions = [];

  if (q) {
    conditions.push(ilike(problems.title, `%${q}%`));
  }

  if (category && category !== "all") {
    conditions.push(eq(problems.category, category));
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
      category: problems.category,
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
    .leftJoin(users, eq(problems.userId, users.id));

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

  const results = await query;

  // Transform results to match the interface
  return results.map((row) => ({
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    category: row.category,
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

export const CATEGORIES = [
  "Performance",
  "UI/UX",
  "Database",
  "Security",
  "DevOps",
  "Testing",
  "Analytics",
] as const;

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
  category: string;
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
    category: problem.category,
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
