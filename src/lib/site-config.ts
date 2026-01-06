import { env } from "@/env.mjs";

export const siteConfig = {
  title: "Problem Dock",
  description:
    "Problem Dock - A platform connecting people with real problems and developers seeking validated problems to solve. Post problems you're facing, or discover real problems before building. Developers can find validated problems here instead of building products that won't sell. Join a marketplace where problems meet solutions.",
  keywords: [
    "Problem Dock",
    "Problem Validation",
    "Developer Marketplace",
    "Find Problems to Solve",
    "Validated Problems",
    "Problem Discovery",
    "Developer Problems",
    "Real Problems",
    "Problem Solving Platform",
    "Developer Community",
    "Problem-Solution Marketplace",
    "Validate Ideas",
    "Product Validation",
    "Technical Problems",
    "Developer Opportunities",
    "Problem Research",
    "Build Solutions",
    "Problem-Solution Match",
  ],
  url: env.APP_URL,
  googleSiteVerificationId: env.GOOGLE_SITE_VERIFICATION_ID || "",
};
