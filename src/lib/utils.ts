import { type ClassValue, clsx } from "clsx";
import { eq } from "drizzle-orm";
import { twMerge } from "tailwind-merge";

import { db, problems } from "./schema";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns A slugified version of the text
 */
export function slugifyTitle(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug for a problem by checking existing slugs in the database
 * If the base slug exists, append a number (e.g., slug-2, slug-3)
 * @param title - The problem title
 * @returns A unique slug
 */
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugifyTitle(title);
  
  // Check if base slug exists
  const existingProblem = await db.query.problems.findFirst({
    where: eq(problems.slug, baseSlug),
  });

  if (!existingProblem) {
    return baseSlug;
  }

  // If base slug exists, try appending numbers until we find a unique one
  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (true) {
    const existing = await db.query.problems.findFirst({
      where: eq(problems.slug, uniqueSlug),
    });
    
    if (!existing) {
      return uniqueSlug;
    }
    
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
}
