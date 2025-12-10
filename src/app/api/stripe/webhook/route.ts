import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { db, sponsorSlots, users } from "@/lib/schema";
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
