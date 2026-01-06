"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { db, sponsorSlots, users } from "@/lib/schema";
import { mapSponsorSlotToSponsor } from "@/lib/sponsors";
import { stripeServer } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { sponsorSlotSchema } from "@/lib/validation";

const SPONSOR_PRICE = 9900; // $99 in cents
const MAX_SPONSORS_PER_MONTH = 12; // 6 left rail + 6 right rail

// Get the next available month in YYYY-MM format
function getNextMonth(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const year = nextMonth.getFullYear();
  const month = String(nextMonth.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Get previous month in YYYY-MM format
function getPreviousMonth(): string {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = prevMonth.getFullYear();
  const month = String(prevMonth.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Get the active month for sponsors based on current date
// Sponsors from a month should be shown until the 1st of the next month
// Example: January sponsors show until February 1st (inclusive)
function getActiveSponsorMonth(): string {
  const now = new Date();
  const dayOfMonth = now.getDate();
  
  // If today is the 1st, show previous month's sponsors
  // Otherwise, show current month's sponsors
  if (dayOfMonth === 1) {
    return getPreviousMonth();
  }
  return getCurrentMonth();
}


// Create Stripe checkout session for sponsor slot
export async function createSponsorCheckout(formData: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to purchase a sponsor slot",
      };
    }

    // Validate form data
    const validatedData = sponsorSlotSchema.parse(formData);

    // Check if the month is full
    const [{ value: sponsorCount }] = await db
      .select({ value: count() })
      .from(sponsorSlots)
      .where(
        and(
          eq(sponsorSlots.month, validatedData.month),
          eq(sponsorSlots.status, "active"),
        ),
      );

    if (sponsorCount >= MAX_SPONSORS_PER_MONTH) {
      return { 
        success: false, 
        error: `This month is full. Maximum ${MAX_SPONSORS_PER_MONTH} sponsors allowed per month.`,
      };
    }

    // Create pending sponsor slot
    const imageUrl = validatedData.imageUrl && validatedData.imageUrl.trim() !== "" 
      ? validatedData.imageUrl 
      : null;
    const backgroundImageUrl = validatedData.backgroundImageUrl && validatedData.backgroundImageUrl.trim() !== "" 
      ? validatedData.backgroundImageUrl 
      : null;
    
    const [sponsorSlot] = await db
      .insert(sponsorSlots)
      .values({
        userId: session.user.id,
        month: validatedData.month,
        title: validatedData.title,
        description: validatedData.description,
        ctaText: validatedData.ctaText,
        ctaUrl: validatedData.ctaUrl,
        imageUrl,
        backgroundImageUrl,
        // Set logo to same value as imageUrl for consistency
        logo: imageUrl,
        variant: "blue",
        placements: "RAIL_LEFT,RAIL_RIGHT,MOBILE_STACK",
        priority: 0,
        status: "pending",
        amount: SPONSOR_PRICE,
      })
      .returning();

    // Get base URL for checkout redirects
    const successUrl = absoluteUrl("/sponsors/success?session_id={CHECKOUT_SESSION_ID}")
    const cancelUrl = absoluteUrl("/sponsors/checkout")

    // Create Stripe checkout session
    const checkoutSession = await stripeServer.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: env.STRIPE_SPONSOR_SLOT_PRICE_ID,
          quantity: 1,
        },
      ],
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      customer_email: session.user.email || undefined,
      metadata: {
        sponsorSlotId: sponsorSlot.id,
        userId: session.user.id,
      },
      payment_intent_data: {
        metadata: {
          sponsorSlotId: sponsorSlot.id,
          userId: session.user.id,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { success: true, checkoutUrl: checkoutSession.url };
  } catch (error) {
    console.error("Error creating sponsor checkout:", error);
    return { 
      success: false, 
      error:
        error instanceof Error
          ? error.message
          : "Failed to create checkout session",
    };
  }
}

// Get sponsor availability for current and next months
// Uses active sponsor month for display, but actual calendar months for booking
export async function getSponsorAvailability() {
  try {
    // Use active sponsor month (may be previous month if today is the 1st)
    // This is the month whose sponsors are currently being displayed
    const currentMonth = getActiveSponsorMonth();
    
    // Get actual current calendar month - this is what we book for
    const actualCurrentMonth = getCurrentMonth();
    
    // Always book for the current calendar month
    const bookingMonth = actualCurrentMonth;

    // Count active sponsors for current month (the month whose sponsors are being displayed)
    const [{ value: currentCount }] = await db
      .select({ value: count() })
      .from(sponsorSlots)
      .where(
        and(
          eq(sponsorSlots.month, currentMonth),
          eq(sponsorSlots.status, "active"),
        ),
      );

    // Count active sponsors for booking month (the current calendar month available for booking)
    const [{ value: bookingCount }] = await db
      .select({ value: count() })
      .from(sponsorSlots)
      .where(
        and(
          eq(sponsorSlots.month, bookingMonth),
          eq(sponsorSlots.status, "active"),
        ),
      );

    return {
      success: true,
      data: {
        currentMonth,
        currentCount,
        nextMonth: bookingMonth, // The current calendar month available for booking
        nextCount: bookingCount,
        maxSponsors: MAX_SPONSORS_PER_MONTH,
        nextMonthAvailable: bookingCount < MAX_SPONSORS_PER_MONTH,
      },
    };
  } catch (error) {
    console.error("Error getting sponsor availability:", error);
    return { 
      success: false, 
      error: "Failed to get availability data",
    };
  }
}

// Get active sponsors for a specific month (used by AdRail / legacy UI)
// If no month is provided, uses the active sponsor month based on current date
export async function getActiveSponsors(month?: string) {
  try {
    const targetMonth = month || getActiveSponsorMonth();

    const selectFields = {
      id: sponsorSlots.id,
      title: sponsorSlots.title,
      description: sponsorSlots.description,
      ctaText: sponsorSlots.ctaText,
      ctaUrl: sponsorSlots.ctaUrl,
      imageUrl: sponsorSlots.imageUrl,
      backgroundImageUrl: sponsorSlots.backgroundImageUrl,
      month: sponsorSlots.month,
      status: sponsorSlots.status,
      logo: sponsorSlots.logo,
      variant: sponsorSlots.variant,
      placements: sponsorSlots.placements,
      priority: sponsorSlots.priority,
    };

    const activeSponsors = await db
      .select(selectFields)
      .from(sponsorSlots)
      .where(
        and(
          eq(sponsorSlots.month, targetMonth),
          eq(sponsorSlots.status, "active"),
        ),
      );

    return {
      success: true,
      data: activeSponsors,
    };
  } catch (error) {
    console.error("Error getting active sponsors:", error);
    return { 
      success: false, 
      error: "Failed to get active sponsors",
      data: [],
    };
  }
}

// Get sponsors mapped to layout model (used by global Sponsors UI)
// Shows sponsors for the active month based on current date
// Sponsors from a month are shown until the 1st of the next month
export async function getSponsorsForLayout() {
  try {
    const activeMonth = getActiveSponsorMonth();

    // Explicitly select all fields needed for mapping
    const selectFields = {
      id: sponsorSlots.id,
      title: sponsorSlots.title,
      description: sponsorSlots.description,
      ctaText: sponsorSlots.ctaText,
      ctaUrl: sponsorSlots.ctaUrl,
      imageUrl: sponsorSlots.imageUrl,
      backgroundImageUrl: sponsorSlots.backgroundImageUrl,
      logo: sponsorSlots.logo,
      variant: sponsorSlots.variant,
      placements: sponsorSlots.placements,
      priority: sponsorSlots.priority,
      status: sponsorSlots.status,
      month: sponsorSlots.month,
    };

    // Get sponsors for the active month
    const rows = await db
      .select(selectFields)
      .from(sponsorSlots)
      .where(
        and(
          eq(sponsorSlots.month, activeMonth),
          eq(sponsorSlots.status, "active"),
        ),
      );

    const sponsors = rows.map((row) => mapSponsorSlotToSponsor(row));

    return {
      success: true,
      data: sponsors,
    };
  } catch (error) {
    console.error("Error getting sponsors for layout:", error);
    return {
      success: false,
      error: "Failed to get sponsors for layout",
      data: [],
    };
  }
}

// Seed demo sponsors for dev/testing
export async function seedDemoSponsors() {
  try {
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        error: "Seeding is disabled in production",
      };
    }

    const currentMonth = getCurrentMonth();

    // Check if there are already active sponsors for current month
    const [{ value: existingCount }] = await db
      .select({ value: count() })
      .from(sponsorSlots)
      .where(
        and(
          eq(sponsorSlots.month, currentMonth),
          eq(sponsorSlots.status, "active"),
        ),
      );

    if (existingCount > 0) {
      return {
        success: true,
        message: "Sponsors already exist for current month",
      };
    }

    const demoSponsors = [
      {
        title: "Ship faster with DebugBear",
        description: "Monitor performance & core web vitals for your SaaS.",
        ctaText: "Try DebugBear",
        ctaUrl: "https://debugbear.com",
        imageUrl: null,
        backgroundImageUrl: null,
        logo: "🪲",
        variant: "blue",
        placements: "RAIL_LEFT,RAIL_RIGHT,MOBILE_CAROUSEL_TOP",
        priority: 0,
      },
      {
        title: "SavvyCal – Friendly scheduling",
        description: "Make scheduling meetings painless for both sides.",
        ctaText: "Book with SavvyCal",
        ctaUrl: "https://savvycal.com",
        imageUrl: null,
        backgroundImageUrl: null,
        logo: "📆",
        variant: "purple",
        placements: "RAIL_LEFT,MOBILE_CAROUSEL_BOTTOM",
        priority: 1,
      },
      {
        title: "Fathom Analytics",
        description: "Simple, privacy-first analytics for indie SaaS.",
        ctaText: "View Fathom",
        ctaUrl: "https://usefathom.com",
        imageUrl: null,
        backgroundImageUrl: null,
        logo: "📈",
        variant: "green",
        placements: "RAIL_RIGHT,MOBILE_CAROUSEL_TOP",
        priority: 2,
      },
      {
        title: "Postmark by ActiveCampaign",
        description: "Fast, reliable transactional email for apps.",
        ctaText: "Explore Postmark",
        ctaUrl: "https://postmarkapp.com",
        imageUrl: null,
        backgroundImageUrl: null,
        logo: "✉️",
        variant: "amber",
        placements: "RAIL_LEFT,MOBILE_CAROUSEL_BOTTOM",
        priority: 3,
      },
      {
        title: "Plausible Analytics",
        description: "Simple, open-source, lightweight analytics.",
        ctaText: "Try Plausible",
        ctaUrl: "https://plausible.io",
        imageUrl: null,
        backgroundImageUrl: null,
        logo: "📊",
        variant: "slate",
        placements: "RAIL_RIGHT,MOBILE_CAROUSEL_TOP",
        priority: 4,
      },
      {
        title: "Cal.com – Open Scheduling",
        description: "Open source Calendly alternative for teams.",
        ctaText: "Book with Cal",
        ctaUrl: "https://cal.com",
        imageUrl: null,
        backgroundImageUrl: null,
        logo: "📅",
        variant: "blue",
        placements: "RAIL_LEFT,MOBILE_CAROUSEL_BOTTOM",
        priority: 5,
      },
      {
        title: "Linear – Issue tracking",
        description: "The issue tracker you'll actually enjoy using.",
        ctaText: "Try Linear",
        ctaUrl: "https://linear.app",
        imageUrl: null,
        backgroundImageUrl: null,
        logo: "⚡",
        variant: "purple",
        placements: "RAIL_RIGHT,MOBILE_CAROUSEL_TOP",
        priority: 6,
      },
      {
        title: "Raycast – Productivity tool",
        description: "Blazingly fast, extendable launcher for Mac.",
        ctaText: "Download Raycast",
        ctaUrl: "https://raycast.com",
        imageUrl: null,
        backgroundImageUrl: null,
        logo: "🚀",
        variant: "red",
        placements: "MOBILE_CAROUSEL_BOTTOM",
        priority: 7,
      },
    ];

    // Attach demo sponsors to the first existing user so we don't rely on a fake ID
    const [seedUser] = await db.select().from(users).limit(1);

    if (!seedUser) {
      return {
        success: false,
        error: "Cannot seed sponsors because no users exist yet",
      };
    }

    await db.insert(sponsorSlots).values(
      demoSponsors.map((s, index) => ({
        userId: seedUser.id,
        month: currentMonth,
        title: s.title,
        description: s.description,
        ctaText: s.ctaText,
        ctaUrl: s.ctaUrl,
        imageUrl: s.imageUrl,
        backgroundImageUrl: s.backgroundImageUrl,
        logo: s.logo,
        variant: s.variant,
        placements: s.placements,
        priority: index,
        status: "active",
        amount: SPONSOR_PRICE,
      })),
    );

    return {
      success: true,
      message: "Seeded demo sponsors for current month",
    };
  } catch (error) {
    console.error("Error seeding demo sponsors:", error);
    return {
      success: false,
      error: "Failed to seed demo sponsors",
    };
  }
}

// Activate sponsor slot after successful payment (called by webhook)
export async function activateSponsorSlot(
  sponsorSlotId: string,
  stripePaymentIntentId: string,
) {
  try {
    await db
      .update(sponsorSlots)
      .set({
        status: "active",
        stripePaymentIntentId,
      })
      .where(eq(sponsorSlots.id, sponsorSlotId));

    revalidatePath("/sponsors");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error activating sponsor slot:", error);
    return { 
      success: false, 
      error: "Failed to activate sponsor slot",
    };
  }
}
