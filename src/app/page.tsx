import { ProblemsFilters } from "@/components/problems-filters";
import { ProblemsList } from "@/components/problems-list";
import { Separator } from "@/components/ui/separator";
import { getProblems } from "@/lib/queries";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    sort?: "votes" | "recent" | "pain";
    category?: string;
  }>;
}

const HomePage = async ({ searchParams }: HomePageProps) => {
  const params = await searchParams;
  const problems = await getProblems({
    q: params.q,
    sort: params.sort || "votes",
    category: params.category,
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
        <p className="text-muted-foreground">
          Discover and upvote the problems that matter most to you
        </p>
      </div>

      <Separator />

      {/* Filters */}
      <ProblemsFilters />

      {/* Problems List */}
      <ProblemsList problems={problems} />

      {/* Results count */}
      {problems.length > 0 && (
        <div className="text-muted-foreground py-4 text-center text-sm">
          Showing {problems.length} problem{problems.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default HomePage;
