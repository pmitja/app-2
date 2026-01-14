import type { Metadata } from "next";

import { ProblemSearchHeader } from "@/components/header/ProblemSearchHeader";
import { HeroSection } from "@/components/hero-section";
import { ProblemsListInfinite } from "@/components/problems-list-infinite";
import { CollectionPageSchema } from "@/components/structured-data/collection-page-schema";
import { auth } from "@/lib/auth";
import { getCategories, getProblems } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
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
      <div className="space-y-12">
        {/* Hero Section */}
        <HeroSection />

        {/* Search Header with Categories and Sort */}
        <ProblemSearchHeader categories={categories} initialQuery={params.q} />

        {/* Problems List with Infinite Scroll */}
        <ProblemsListInfinite
          initialProblems={problems}
          isAuthenticated={!!session?.user}
        />
      </div>
    </>
  );
};

export default HomePage;
