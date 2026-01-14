import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProblemSearchHeader } from "@/components/header/ProblemSearchHeader";
import { ProblemsListInfinite } from "@/components/problems-list-infinite";
import { CollectionPageSchema } from "@/components/structured-data/collection-page-schema";
import { auth } from "@/lib/auth";
import { getCategories, getCategoryBySlug, getProblems } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
  searchParams: Promise<{
    q?: string;
    sort?: "votes" | "recent" | "pain";
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const title = `Find ${category.name} Problems to Solve`;
  const description = `Discover real ${category.name.toLowerCase()} problems to solve or post problems you're facing. Problem Dock connects people with ${category.name.toLowerCase()} problems and developers seeking validated problems to build solutions for.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/problems/${categorySlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/problems/${categorySlug}`,
      siteName: siteConfig.title,
      images: [
        {
          url: "/opengraph-image.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image.jpg"],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { categorySlug } = await params;
  const paramsSearch = await searchParams;
  const session = await auth();

  const [category, problems, categories] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getProblems({
      q: paramsSearch.q,
      sort: paramsSearch.sort || "votes",
      category: categorySlug,
      userId: session?.user?.id,
    }),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <>
      <CollectionPageSchema itemCount={problems.length} />
      <div className="space-y-8">
        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Find {category.emoji} {category.name} Problems to Solve
          </h1>
          <p className="text-muted-foreground max-w-3xl text-lg">
            Discover real {category.name.toLowerCase()} problems to solve or
            post problems you&apos;re facing. Problem Dock connects people with{" "}
            {category.name.toLowerCase()} problems and developers seeking
            validated problems to solve. Build solutions for{" "}
            {category.name.toLowerCase()} problems that actually exist.
          </p>
        </div>

        {/* Search Header with Categories and Sort */}
        <ProblemSearchHeader
          categories={categories}
          initialQuery={paramsSearch.q}
          initialCategorySlug={categorySlug}
        />

        {/* Problems List with Infinite Scroll */}
        <ProblemsListInfinite
          initialProblems={problems}
          isAuthenticated={!!session?.user}
        />
      </div>
    </>
  );
}
