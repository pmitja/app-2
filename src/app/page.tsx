import type { Metadata } from "next";

import { ProblemSearchHeader } from "@/components/header/ProblemSearchHeader";
import { ProblemsListInfinite } from "@/components/problems-list-infinite";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { CollectionPageSchema } from "@/components/structured-data/collection-page-schema";
import { auth } from "@/lib/auth";
import { getCategories, getProblems } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    sort?: "votes" | "recent" | "pain";
    category?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Find Real Problems to Solve",
    description:
      "Discover real problems to solve or post problems you're facing. Problem Dock connects people with problems and developers seeking validated problems to build solutions for. Find problems before building products that won't sell.",
    alternates: {
      canonical: siteConfig.url,
    },
    openGraph: {
      title: "Find Real Problems to Solve",
      description:
        "Discover real problems to solve or post problems you're facing. Connect problems with developers building solutions.",
      url: siteConfig.url,
      siteName: siteConfig.title,
      images: [
        {
          url: "/opengraph-image.jpg",
          width: 1200,
          height: 630,
          alt: siteConfig.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Find Real Problems to Solve",
      description:
        "Discover real problems to solve or post problems you're facing. Connect problems with developers building solutions.",
      images: ["/opengraph-image.jpg"],
    },
  };
}

const HomePage = async ({ searchParams }: HomePageProps) => {
  const params = await searchParams;
  const session = await auth();
  const [problems, categories] = await Promise.all([
    getProblems({
      q: params.q,
      sort: params.sort || "votes",
      category: params.category,
      userId: session?.user?.id,
    }),
    getCategories(),
  ]);

  return (
    <>
      <CollectionPageSchema itemCount={problems.length} />
      <div className="space-y-8">
        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Find Real Problems to Solve
          </h1>
          <p className="text-muted-foreground max-w-3xl text-lg">
            Problem Dock connects people with real problems and developers
            seeking validated problems to solve. Post problems you&apos;re
            facing, or discover real problems before building products that
            won&apos;t sell. Build solutions for problems that actually exist.
          </p>
        </div>

        {/* Search Header with Categories and Sort */}
        <ProblemSearchHeader categories={categories} initialQuery={params.q} />

        {/* Problems List with Infinite Scroll */}
        <ProblemsListInfinite
          initialProblems={problems}
          isAuthenticated={!!session?.user}
        />
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </>
  );
};

export default HomePage;
