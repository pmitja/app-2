import { MetadataRoute } from "next";

import { env } from "@/env.mjs";
import { getProblems } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.APP_URL || "http://localhost:3000";

  // Fetch all problems with unlimited limit for sitemap
  const problems = await getProblems({ limit: 10000, offset: 0 });

  // Generate problem URLs
  const problemUrls: MetadataRoute.Sitemap = problems.map((problem) => ({
    url: `${baseUrl}/problems/${problem.category.slug}/${problem.slug}`,
    lastModified: problem.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/problems/new`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...problemUrls,
  ];
}
