"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db, problemSolutions } from "@/lib/schema";
import { createSolutionSchema } from "@/lib/validation";

const PROMOTION_PRICE = 999; // $9.99 in cents

export async function createSolution(problemId: string, data: unknown) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to create a solution" };
    }

    // Check if user has developer role
    if (session.user.role !== "developer") {
      return { error: "Only developers can post solutions" };
    }

    // Validate input
    const validatedData = createSolutionSchema.parse(data);

    // If promoting now, check if another solution is already featured for this problem
    if (validatedData.promoteNow) {
      const existingFeatured = await db.query.problemSolutions.findFirst({
        where: and(
          eq(problemSolutions.problemId, problemId),
          eq(problemSolutions.isFeatured, true),
        ),
      });

      if (existingFeatured) {
        return {
          error:
            "This problem already has a featured solution. Please try promoting later if the featured spot becomes available.",
        };
      }
    }

    // Insert solution
    const [newSolution] = await db
      .insert(problemSolutions)
      .values({
        problemId,
        userId: session.user.id,
        title: validatedData.title,
        summary: validatedData.summary,
        imageUrl: validatedData.imageUrl,
        targetUrl: validatedData.targetUrl,
        isFeatured: false, // Will be set to true after payment
      })
      .returning({ id: problemSolutions.id });

    revalidatePath(`/problems`);

    // If promoteNow is true, return the solution ID to initiate checkout
    if (validatedData.promoteNow) {
      return {
        success: true,
        solutionId: newSolution.id,
        requiresPromotion: true,
      };
    }

    return { success: true, solutionId: newSolution.id };
  } catch (error) {
    console.error("Error creating solution:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create solution" };
  }
}

export async function promoteSolution(solutionId: string) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to promote a solution" };
    }

    // Check if user has developer role
    if (session.user.role !== "developer") {
      return { error: "Only developers can promote solutions" };
    }

    // Fetch the solution
    const solution = await db.query.problemSolutions.findFirst({
      where: eq(problemSolutions.id, solutionId),
    });

    if (!solution) {
      return { error: "Solution not found" };
    }

    // Check if user owns the solution
    if (solution.userId !== session.user.id) {
      return { error: "You can only promote your own solutions" };
    }

    // Check if solution is already featured
    if (solution.isFeatured) {
      return { error: "This solution is already featured" };
    }

    // Check if another solution is already featured for this problem
    const existingFeatured = await db.query.problemSolutions.findFirst({
      where: and(
        eq(problemSolutions.problemId, solution.problemId),
        eq(problemSolutions.isFeatured, true),
      ),
    });

    if (existingFeatured) {
      return {
        error:
          "This problem already has a featured solution. Please try again later.",
      };
    }

    // Return success with solution ID and problem ID for checkout
    return {
      success: true,
      solutionId: solution.id,
      problemId: solution.problemId,
      amount: PROMOTION_PRICE,
    };
  } catch (error) {
    console.error("Error promoting solution:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to promote solution" };
  }
}
