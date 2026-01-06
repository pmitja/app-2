"use server";

import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { stripeServer } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

// Get base URL for checkout redirects
function getSuccessUrl(categorySlug: string, problemSlug: string) {
  return absoluteUrl(`/problems/${categorySlug}/${problemSlug}?promoted=true`)
}
function getCancelUrl(categorySlug: string, problemSlug: string) {
  return absoluteUrl(`/problems/${categorySlug}/${problemSlug}`)
}

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

  const successUrl = getSuccessUrl(categorySlug, problemSlug);
  const cancelUrl = getCancelUrl(categorySlug, problemSlug);

  const checkoutSession = await stripeServer.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
      billing_address_collection: "auto",
      customer_email: session.user.email || undefined,
    line_items: [
      {
        price: env.STRIPE_SOLUTION_PROMOTION_PRICE_ID,
        quantity: 1,
      },
    ],
    metadata: {
      type: "solution_promotion",
      solutionId,
      problemId,
      userId: session.user.id,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { id: checkoutSession.id, url: checkoutSession.url };
};
