import { and, eq, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/env.mjs";
import { db, sponsorSlots } from "@/lib/schema";

// Get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * POST /api/sponsors/cleanup
 * 
 * Expires all active sponsor slots from previous months.
 * Requires X-API-Key header matching CLEANUP_API_KEY environment variable.
 * 
 * This endpoint should be called at the start of each month via:
 * - Manual API call
 * - External cron service (cron-job.org, EasyCron, etc.)
 * - CI/CD pipeline
 */
export async function POST(request: NextRequest) {
  try {
    // Check API key authentication
    const apiKey = request.headers.get("X-API-Key");

    if (!apiKey || apiKey !== env.CLEANUP_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid or missing API key",
        },
        { status: 401 }
      );
    }

    const currentMonth = getCurrentMonth();

    // Find all active sponsors from previous months
    const expiredSponsors = await db
      .select()
      .from(sponsorSlots)
      .where(
        and(
          eq(sponsorSlots.status, "active"),
          lt(sponsorSlots.month, currentMonth)
        )
      );

    if (expiredSponsors.length === 0) {
      return NextResponse.json({
        success: true,
        expired: 0,
        message: "No sponsor slots to expire",
        currentMonth,
      });
    }

    // Update their status to "expired"
    await db
      .update(sponsorSlots)
      .set({ status: "expired" })
      .where(
        and(
          eq(sponsorSlots.status, "active"),
          lt(sponsorSlots.month, currentMonth)
        )
      );

    return NextResponse.json({
      success: true,
      expired: expiredSponsors.length,
      message: `Expired ${expiredSponsors.length} sponsor slot${expiredSponsors.length === 1 ? "" : "s"} from previous months`,
      currentMonth,
      expiredMonths: [...new Set(expiredSponsors.map((s) => s.month))].sort(),
    });
  } catch (error) {
    console.error("Error expiring sponsor slots:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to expire sponsor slots",
      },
      { status: 500 }
    );
  }
}

