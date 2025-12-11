"use server";

import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { stripeServer } from "@/lib/stripe";

export const createCheckoutSessionAction = async () => {
  const session = await auth();

  if (!session?.user) {
    throw new Error("not-auth");
  }

  const checkoutSession = await stripeServer.checkout.sessions.create({
    mode: "subscription",
    customer: session.user.stripeCustomerId,
    line_items: [
      {
        price: env.STRIPE_SUBSCRIPTION_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${env.APP_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: env.APP_URL,
  });

  return { id: checkoutSession.id, url: checkoutSession.url };
};

export const createSolutionPromotionCheckoutAction = async (
  solutionId: string,
  problemId: string,
  categorySlug: string,
  problemSlug: string,
) => {
  const session = await auth();

  if (!session?.user) {
    throw new Error("not-auth");
  }

  if (session.user.role !== "developer") {
    throw new Error("Only developers can promote solutions");
  }

  const checkoutSession = await stripeServer.checkout.sessions.create({
    mode: "payment",
    customer: session.user.stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Solution Promotion",
            description: "Promote your solution to the featured spot",
          },
          unit_amount: 999, // $9.99
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "solution_promotion",
      solutionId,
      problemId,
      userId: session.user.id,
    },
    success_url: `${env.APP_URL}/problems/${categorySlug}/${problemSlug}?promoted=true`,
    cancel_url: `${env.APP_URL}/problems/${categorySlug}/${problemSlug}`,
  });

  return { id: checkoutSession.id, url: checkoutSession.url };
};
