import { env } from "@/env.mjs";

export const siteConfig = {
  title: "Problem Dock",
  description:
    "Problem Dock - A platform for developers to share, discover, and solve real-world problems. Connect with other developers, post solutions, and collaborate on challenging technical issues.",
  keywords: ["Problem Dock", "Developer Problems", "Solutions", "Coding Challenges", "Technical Issues", "Developer Community"],
  url: env.APP_URL,
  googleSiteVerificationId: env.GOOGLE_SITE_VERIFICATION_ID || "",
};
