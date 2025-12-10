import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { categories, db, problems } from "@/lib/schema";

/**
 * Middleware to handle redirects from old UUID-based problem URLs to new slug-based URLs
 * Example: /problems/{uuid} -> /problems/{categorySlug}/{problemSlug}
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a problem detail page with potential UUID
  const problemMatch = pathname.match(/^\/problems\/([^/]+)$/);

  if (problemMatch) {
    const identifier = problemMatch[1];

    // Check if it looks like a UUID (8-4-4-4-12 format)
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (uuidPattern.test(identifier)) {
      try {
        // Fetch the problem by UUID
        const problem = await db.query.problems.findFirst({
          where: eq(problems.id, identifier),
        });

        if (problem && problem.slug) {
          // Fetch the category to get its slug
          const category = await db.query.categories.findFirst({
            where: eq(categories.id, problem.categoryId),
          });

          if (category) {
            // Construct the new slug-based URL
            const newUrl = new URL(request.url);
            newUrl.pathname = `/problems/${category.slug}/${problem.slug}`;

            // Permanent redirect (301) for SEO
            return NextResponse.redirect(newUrl, { status: 301 });
          }
        }
      } catch (error) {
        console.error("Error redirecting UUID to slug:", error);
        // If there's an error, let Next.js handle it normally (will show 404)
      }
    }
  }

  // Continue to the next middleware or route handler
  return NextResponse.next();
}

// Configure which routes should run this middleware
export const config = {
  matcher: [
    "/problems/:path*",
    // Exclude API routes, static files, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
