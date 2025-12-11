import { ProblemSearchHeader } from "@/components/header/ProblemSearchHeader";
import { ProblemsListInfinite } from "@/components/problems-list-infinite";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { auth } from "@/lib/auth";
import { getCategories, getProblems } from "@/lib/queries";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    sort?: "votes" | "recent" | "pain";
    category?: string;
  }>;
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
      <div className="space-y-8">
        {/* Search Header with Categories and Sort */}
        <ProblemSearchHeader
          categories={categories}
          initialQuery={params.q}
          initialSort={params.sort}
          selectedCategory={params.category}
        />

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
