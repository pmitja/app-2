"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  db,
  problemComments,
  problemCommentVotes,
} from "@/lib/schema";
import { createCommentSchema } from "@/lib/validation";
import { z } from "zod";

export async function createComment(
  problemId: string,
  data: z.infer<typeof createCommentSchema> & { parentId?: string }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to comment" };
    }

    const validatedData = createCommentSchema.parse(data);

    await db.insert(problemComments).values({
      problemId,
      userId: session.user.id,
      content: validatedData.content,
      type: validatedData.type,
      parentId: data.parentId,
    });

    revalidatePath(`/problems/${problemId}`); // Or the specific slug path if needed
    revalidatePath("/problems/[categorySlug]/[slug]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error creating comment:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create comment" };
  }
}

export async function voteComment(commentId: string, voteType: "like" | "dislike") {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to vote" };
    }

    const existingVote = await db.query.problemCommentVotes.findFirst({
      where: and(
        eq(problemCommentVotes.commentId, commentId),
        eq(problemCommentVotes.userId, session.user.id)
      ),
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if same type (toggle off)
        await db
          .delete(problemCommentVotes)
          .where(
            and(
              eq(problemCommentVotes.commentId, commentId),
              eq(problemCommentVotes.userId, session.user.id)
            )
          );
      } else {
        // Change vote type
        await db
          .update(problemCommentVotes)
          .set({ voteType })
          .where(
            and(
              eq(problemCommentVotes.commentId, commentId),
              eq(problemCommentVotes.userId, session.user.id)
            )
          );
      }
    } else {
      // Create new vote
      await db.insert(problemCommentVotes).values({
        commentId,
        userId: session.user.id,
        voteType,
      });
    }

    // We don't necessarily need to revalidate path for every like if we do optimistic updates,
    // but good to have for consistency on refresh.
    // Finding the problemId for the comment would require a query if we want to be specific,
    // or we can just rely on the client to revalidate.
    // However, server actions usually want to revalidate.
    // Let's find the problem ID to revalidate the correct page.
    
    // For now, assume client handles optimistic UI, and we might not need hard revalidate 
    // if we don't want to query problemId every time. 
    // But to be safe:
    /*
    const comment = await db.query.problemComments.findFirst({
      where: eq(problemComments.id, commentId),
      columns: { problemId: true }
    });
    if (comment) {
       revalidatePath(`/problems/${comment.problemId}`); 
    }
    */
    
    // Actually, generic revalidate is often enough or we skip it if client is optimistic.
    // I'll stick to returning success and letting client handle optimistic state.
    
    return { success: true };
  } catch (error) {
    console.error("Error voting on comment:", error);
    return { error: "Failed to vote" };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const comment = await db.query.problemComments.findFirst({
      where: eq(problemComments.id, commentId),
    });

    if (!comment) {
      return { error: "Comment not found" };
    }

    if (comment.userId !== session.user.id) {
      // Add admin check if needed
      return { error: "Unauthorized" };
    }

    await db.delete(problemComments).where(eq(problemComments.id, commentId));
    
    // Revalidate
    // We can fetch problem details to invalidate correct path, or generic
    revalidatePath("/problems/[categorySlug]/[slug]", "page");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { error: "Failed to delete comment" };
  }
}

