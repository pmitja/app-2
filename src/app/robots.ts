import { MetadataRoute } from "next";

import { env } from "@/env.mjs";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.APP_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/followed",
          "/settings",
          "/reset-password",
          "/sponsors/checkout",
          "/sponsors/success",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
