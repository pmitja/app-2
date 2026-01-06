import type { Metadata } from "next";

import { ProblemFormWrapper } from "@/components/problem-form-wrapper";
import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Submit a Problem",
  description:
    "Post a problem you're facing. Developers are looking for real, validated problems to solve. Share your challenges and connect with developers who want to build solutions for real problems.",
  alternates: {
    canonical: `${siteConfig.url}/problems/new`,
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Submit a Problem",
    description:
      "Post a problem you're facing. Developers are looking for real, validated problems to solve.",
    url: `${siteConfig.url}/problems/new`,
    siteName: siteConfig.title,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Submit a Problem",
    description:
      "Post a problem you're facing. Developers are looking for real, validated problems to solve.",
  },
};

export default async function NewProblemPage() {
  const session = await auth();
  const categories = await getCategories();

  return (
    <div className="mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Submit a Problem</h1>
        <p className="text-muted-foreground">
          Share a problem you&apos;re facing so the community can help find
          solutions.
        </p>
      </div>

      <ProblemFormWrapper
        categories={categories}
        isAuthenticated={!!session?.user}
      />
    </div>
  );
}
