"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";

import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { getSolutionNotificationEmail } from "@/lib/email-templates";
import {
    createCategory,
    searchSimilarCategories,
} from "@/lib/queries";
import {
    categories,
    db,
    developerStatuses,
    problemComments,
    problemFollows,
    problems,
    problemVotes,
    users,
} from "@/lib/schema";
import { generateUniqueSlug } from "@/lib/utils";
import {
    createCommentSchema,
    createProblemSchema,
    setDeveloperStatusSchema,
} from "@/lib/validation";

const resend = new Resend(env.RESEND_API_KEY);

export async function getSimilarCategories(name: string) {
  try {
    const similarCategories = await searchSimilarCategories(name);
    return { success: true, categories: similarCategories };
  } catch (error) {
    console.error("Error searching categories:", error);
    return { error: "Failed to search categories" };
  }
}

export async function createProblem(data: unknown) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to create a problem" };
    }

    // Validate input
    const validatedData = createProblemSchema.parse(data);

    // Determine categoryId
    let categoryId: string;
    
    if (validatedData.category.type === "existing") {
      categoryId = validatedData.category.categoryId;
    } else {
      // Check for similar categories
      const similarCategories = await searchSimilarCategories(validatedData.category.name);
      
      if (similarCategories.length > 0) {
        // Return suggestion to use existing category
        return {
          error: `A similar category "${similarCategories[0].name}" already exists. Please use it instead.`,
          suggestion: similarCategories[0],
        };
      }
      
      // Create new category
      const newCategory = await createCategory(
        validatedData.category.name,
        validatedData.category.emoji
      );
      categoryId = newCategory.id;
    }

    // Generate unique slug from title
    const slug = await generateUniqueSlug(validatedData.title);

    // Insert problem
    const [newProblem] = await db
      .insert(problems)
      .values({
        userId: session.user.id,
        categoryId,
        title: validatedData.title,
        description: validatedData.description,
        slug,
        painLevel: validatedData.painLevel,
        frequency: validatedData.frequency,
        wouldPay: validatedData.wouldPay,
      })
      .returning({ id: problems.id, slug: problems.slug });

    // Fetch category slug for redirect
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });

    revalidatePath("/");
    
    // Redirect to the new problem detail page with slug-based URL
    if (category) {
      redirect(`/problems/${category.slug}/${newProblem.slug}`);
    } else {
      // Fallback to old URL structure if category not found
      redirect(`/problems/${newProblem.id}`);
    }
  } catch (error) {
    console.error("Error creating problem:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create problem" };
  }
}

export async function toggleVote(problemId: string) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to vote" };
    }

    // Check if user already voted
    const existingVote = await db.query.problemVotes.findFirst({
      where: and(
        eq(problemVotes.problemId, problemId),
        eq(problemVotes.userId, session.user.id),
      ),
    });

    if (existingVote) {
      // Remove vote
      await db
        .delete(problemVotes)
        .where(
          and(
            eq(problemVotes.problemId, problemId),
            eq(problemVotes.userId, session.user.id),
          ),
        );
      
      revalidatePath(`/problems/${problemId}`);
      revalidatePath("/");
      return { success: true, voted: false };
    } else {
      // Add vote
      await db.insert(problemVotes).values({
        problemId,
        userId: session.user.id,
      });
      
      revalidatePath(`/problems/${problemId}`);
      revalidatePath("/");
      return { success: true, voted: true };
    }
  } catch (error) {
    console.error("Error toggling vote:", error);
    return { error: "Failed to toggle vote" };
  }
}

export async function toggleFollow(problemId: string) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to follow" };
    }

    // Check if user already follows
    const existingFollow = await db.query.problemFollows.findFirst({
      where: and(
        eq(problemFollows.problemId, problemId),
        eq(problemFollows.userId, session.user.id),
      ),
    });

    if (existingFollow) {
      // Remove follow
      await db
        .delete(problemFollows)
        .where(
          and(
            eq(problemFollows.problemId, problemId),
            eq(problemFollows.userId, session.user.id),
          ),
        );
      
      revalidatePath(`/problems/${problemId}`);
      return { success: true, following: false };
    } else {
      // Add follow
      await db.insert(problemFollows).values({
        problemId,
        userId: session.user.id,
      });
      
      revalidatePath(`/problems/${problemId}`);
      return { success: true, following: true };
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    return { error: "Failed to toggle follow" };
  }
}

export async function createComment(problemId: string, data: unknown) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to comment" };
    }

    // Validate input
    const validatedData = createCommentSchema.parse(data);

    // Insert comment
    await db.insert(problemComments).values({
      problemId,
      userId: session.user.id,
      content: validatedData.content,
      type: validatedData.type,
    });

    revalidatePath(`/problems/${problemId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating comment:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create comment" };
  }
}

export async function setDeveloperStatus(problemId: string, data: unknown) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to set developer status" };
    }

    // Check if user has developer role
    if (session.user.role !== "developer") {
      return { error: "You must be a developer to set status on problems" };
    }

    // Validate input
    const validatedData = setDeveloperStatusSchema.parse(data);

    // Check if user already has a status for this problem
    const existingStatus = await db.query.developerStatuses.findFirst({
      where: and(
        eq(developerStatuses.problemId, problemId),
        eq(developerStatuses.userId, session.user.id),
      ),
    });

    if (existingStatus) {
      // Update existing status
      await db
        .update(developerStatuses)
        .set({
          status: validatedData.status,
          solutionUrl: validatedData.solutionUrl || null,
        })
        .where(
          and(
            eq(developerStatuses.problemId, problemId),
            eq(developerStatuses.userId, session.user.id),
          ),
        );
    } else {
      // Insert new status
      await db.insert(developerStatuses).values({
        problemId,
        userId: session.user.id,
        status: validatedData.status,
        solutionUrl: validatedData.solutionUrl || null,
      });
    }

    // Send email notifications to followers if solution URL is provided
    if (validatedData.solutionUrl && validatedData.solutionUrl.trim()) {
      // Query problem details
      const problem = await db.query.problems.findFirst({
        where: eq(problems.id, problemId),
      });

      if (problem) {
        // Query followers with their user details
        const followers = await db
          .select({
            userId: problemFollows.userId,
            userName: users.name,
            userEmail: users.email,
          })
          .from(problemFollows)
          .leftJoin(users, eq(problemFollows.userId, users.id))
          .where(eq(problemFollows.problemId, problemId));

        // Send emails to followers (excluding the developer)
        const emailPromises = followers
          .filter(
            (f) => f.userId !== session.user.id && f.userEmail && f.userName,
          )
          .map(async (follower) => {
            try {
              const emailTemplate = getSolutionNotificationEmail({
                problemTitle: problem.title,
                problemUrl: `${env.APP_URL}/problems/${problemId}`,
                solutionUrl: validatedData.solutionUrl!,
                developerName: session.user.name || "A developer",
                followerName: follower.userName || undefined,
              });

              await resend.emails.send({
                from: env.EMAIL_FROM,
                to: follower.userEmail!,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text,
              });

              console.log(
                `Solution notification sent to ${follower.userEmail}`,
              );
            } catch (emailError) {
              console.error(
                `Failed to send email to ${follower.userEmail}:`,
                emailError,
              );
            }
          });

        // Send all emails (fire and forget - don't block the response)
        Promise.all(emailPromises).catch((err) => {
          console.error("Error sending solution notifications:", err);
        });
      }
    }

    revalidatePath(`/problems/${problemId}`);
    return { success: true };
  } catch (error) {
    console.error("Error setting developer status:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to set developer status" };
  }
}
