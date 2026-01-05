import { ProblemFormWrapper } from "@/components/problem-form-wrapper";
import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/queries";

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
