import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { db, problemSolutions, sponsorSlots, users } from "@/lib/schema";
import { stripeServer } from "@/lib/stripe";

/**
 * Stripe Webhook Handler
 * 
 * IMPORTANT FOR LOCAL DEVELOPMENT:
 * Stripe cannot send webhooks directly to localhost. You MUST use Stripe CLI:
 * 
 * 1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 * 2. Login: stripe login
 * 3. Forward webhooks: stripe listen --forward-to localhost:3000/api/stripe/webhook
 * 4. Copy the webhook signing secret (starts with whsec_) from the CLI output
 * 5. Set STRIPE_WEBHOOK_SECRET_KEY in your .env file to the CLI secret (NOT the dashboard secret)
 * 
 * Test the endpoint: curl http://localhost:3000/api/stripe/webhook
 * 
 * For production: Configure webhook endpoint in Stripe Dashboard pointing to your production URL
 */

// Route configuration for webhook handling
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookHandler = async (req: NextRequest) => {
  // Validate webhook secret is configured
  if (!env.STRIPE_WEBHOOK_SECRET_KEY) {
    console.error("[Webhook] ❌ STRIPE_WEBHOOK_SECRET_KEY is not configured");
    console.error("[Webhook] For local dev, use: stripe listen --forward-to localhost:3000/api/stripe/webhook");
    return NextResponse.json(
      {
        error: {
          message: "Webhook secret not configured. For local dev, use Stripe CLI to forward webhooks.",
        },
      },
      { status: 500 },
    );
  }

  try {
    // Get raw body as ArrayBuffer for reliable signature verification
    const arrayBuffer = await req.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      console.error("[Webhook] Missing stripe-signature header");
      return NextResponse.json(
        {
          error: {
            message: "Missing stripe-signature header",
          },
        },
        { status: 400 },
      );
    }

    let event: Stripe.Event;

    try {
      event = stripeServer.webhooks.constructEvent(
        buf,
        sig,
        env.STRIPE_WEBHOOK_SECRET_KEY,
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        {
          error: {
            message: `Webhook signature verification failed: ${errorMessage}`,
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
        try {
          const session = event.data.object as Stripe.Checkout.Session;
          
          // Only proceed if payment was successful
          if (session.payment_status !== 'paid') {
            break;
          }
          
          // Check if this is a sponsor slot payment
          let sponsorSlotId: string | undefined = session.metadata?.sponsorSlotId;
          const paymentIntentId: string | undefined = session.payment_intent as string | undefined;

          // Fallback: If metadata is missing from session, try to retrieve it from payment intent
          if (!sponsorSlotId && paymentIntentId) {
            const paymentIntent = await stripeServer.paymentIntents.retrieve(paymentIntentId);
            sponsorSlotId = paymentIntent.metadata?.sponsorSlotId;
          }

          if (sponsorSlotId) {
            try {
              // Check if sponsor slot exists before updating
              const existingSlot = await db
                .select()
                .from(sponsorSlots)
                .where(eq(sponsorSlots.id, sponsorSlotId))
                .limit(1);

              if (!existingSlot[0]) {
                break;
              }

              if (existingSlot[0].status === 'active') {
                break;
              }

              // Activate the sponsor slot
              const result = await db
                .update(sponsorSlots)
                .set({
                  status: "active",
                  stripePaymentIntentId: paymentIntentId || null,
                })
                .where(eq(sponsorSlots.id, sponsorSlotId))
                .returning();

              // Revalidate relevant paths
              revalidatePath("/sponsors");
              revalidatePath("/");

            } catch (dbError) {
              throw dbError;
            }
          }
          
          // Check if this is a solution promotion payment
          if (session.metadata?.type === "solution_promotion") {
            const solutionId = session.metadata.solutionId;
            const problemId = session.metadata.problemId;
            const paymentIntentId = session.payment_intent as string;

            console.log(`[Webhook] Solution ID: ${solutionId}, Problem ID: ${problemId}`);

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
                `[Webhook] ❌ Cannot promote solution ${solutionId} - problem ${problemId} already has a featured solution`,
              );
              // In production, you might want to initiate a refund here
              break;
            }

            console.log(`[Webhook] Promoting solution ${solutionId} to featured...`);
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

          }
        } catch (error) {
          // Don't throw - let the webhook return success so Stripe doesn't retry
          // The error is logged for investigation
          console.error("Error processing solution promotion payment:", error);
        }
        break;
      }
      
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Check if this is a sponsor slot payment
        if (session.metadata?.sponsorSlotId) {
          const sponsorSlotId = session.metadata.sponsorSlotId;
          
          // Delete pending sponsor slot since payment failed
          await db
            .delete(sponsorSlots)
            .where(eq(sponsorSlots.id, sponsorSlotId));
          
        }
        break;
      }
      
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Check if this is a sponsor slot payment using payment intent metadata
        if (paymentIntent.metadata?.sponsorSlotId) {
          const sponsorSlotId = paymentIntent.metadata.sponsorSlotId;

          try {
            // Check if sponsor slot exists and is still pending
            const existingSlots = await db
              .select()
              .from(sponsorSlots)
              .where(eq(sponsorSlots.id, sponsorSlotId))
              .limit(1);
            
            const existingSlot = existingSlots[0];

            if (!existingSlot) {
              console.error(`[Webhook] Sponsor slot ${sponsorSlotId} not found in database`);
              break;
            }

            if (existingSlot.status === 'active') {
              break;
            }

            // Activate the sponsor slot
            const result = await db
              .update(sponsorSlots)
              .set({
                status: "active",
                stripePaymentIntentId: paymentIntent.id,
              })
              .where(eq(sponsorSlots.id, sponsorSlotId))
              .returning();

            // Revalidate relevant paths
            revalidatePath("/sponsors");
            revalidatePath("/");

          } catch (dbError) {
            console.error(`[Webhook] Database error activating sponsor slot ${sponsorSlotId}:`, dbError);
            throw dbError;
          }
        } else {
          console.log(`[Webhook] Payment intent ${paymentIntent.id} succeeded but no sponsorSlotId in metadata`);
        }
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Try to find the checkout session associated with this payment intent
        // Note: Stripe doesn't provide direct reverse lookup, so we check if metadata exists
        // Most cases will be handled by checkout.session.async_payment_failed event
        if (paymentIntent.metadata?.sponsorSlotId) {
          const sponsorSlotId = paymentIntent.metadata.sponsorSlotId;
          
          // Delete pending sponsor slot since payment failed
          await db
            .delete(sponsorSlots)
            .where(eq(sponsorSlots.id, sponsorSlotId));
          
          console.log(`[Webhook] Deleted pending sponsor slot ${sponsorSlotId} due to failed payment intent`);
        } else {
          // If metadata isn't available, log for monitoring
          // The checkout.session.async_payment_failed event should handle most cases
          console.log(`[Webhook] Payment intent ${paymentIntent.id} failed but no sponsorSlotId in metadata. This may be handled by checkout.session.async_payment_failed event.`);
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

// GET endpoint for testing webhook route accessibility
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is accessible",
    timestamp: new Date().toISOString(),
    webhookSecretConfigured: !!env.STRIPE_WEBHOOK_SECRET_KEY,
  });
}

export { webhookHandler as POST };
