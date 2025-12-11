import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { db, problemSolutions, sponsorSlots, users } from "@/lib/schema";
import { stripeServer } from "@/lib/stripe";

const webhookHandler = async (req: NextRequest) => {
  try {
    const buf = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripeServer.webhooks.constructEvent(
        buf,
        sig,
        env.STRIPE_WEBHOOK_SECRET_KEY,
      );
    } catch (err) {
      return NextResponse.json(
        {
          error: {
            message: `Webhook Error - ${err}`,
          },
        },
        { status: 400 },
      );
    }

    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await db
          .update(users)
          .set({ isActive: true })
          .where(eq(users.stripeCustomerId, subscription.customer as string));
        break;
      }
      
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Check if this is a sponsor slot payment
        if (session.metadata?.sponsorSlotId) {
          const sponsorSlotId = session.metadata.sponsorSlotId;
          const paymentIntentId = session.payment_intent as string;

          // Activate the sponsor slot
          await db
            .update(sponsorSlots)
            .set({
              status: "active",
              stripePaymentIntentId: paymentIntentId,
            })
            .where(eq(sponsorSlots.id, sponsorSlotId));

          console.log(`Activated sponsor slot: ${sponsorSlotId}`);
        }
        
        // Check if this is a solution promotion payment
        if (session.metadata?.type === "solution_promotion") {
          const solutionId = session.metadata.solutionId;
          const problemId = session.metadata.problemId;
          const paymentIntentId = session.payment_intent as string;

          // First, check if there's already a featured solution for this problem
          const existingFeatured = await db.query.problemSolutions.findFirst({
            where: and(
              eq(problemSolutions.problemId, problemId),
              eq(problemSolutions.isFeatured, true),
            ),
          });

          // If there's already a featured solution, refund the payment (edge case)
          if (existingFeatured) {
            console.error(
              `Cannot promote solution ${solutionId} - problem ${problemId} already has a featured solution`,
            );
            // In production, you might want to initiate a refund here
            break;
          }

          // Promote the solution to featured
          await db
            .update(problemSolutions)
            .set({
              isFeatured: true,
              stripePaymentIntentId: paymentIntentId,
              amount: 999, // $9.99 in cents
            })
            .where(eq(problemSolutions.id, solutionId));

          // Revalidate the problem page
          revalidatePath(`/problems`);

          console.log(`Promoted solution to featured: ${solutionId}`);
        }
        break;
      }
      
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      {
        error: {
          message: "Internal Server Error",
        },
      },
      { status: 500 },
    );
  }
};

export { webhookHandler as POST };
