import { Bookmark } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProblemsList } from "@/components/problems-list";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getFollowedProblems } from "@/lib/queries";

export const metadata = {
  title: "Followed Problems",
  description: "Problems you are following",
};

export default async function FollowedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const problems = await getFollowedProblems(session.user.id);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bookmark className="h-8 w-8" />
          Followed Problems
        </h1>
        <p className="text-muted-foreground">
          Problems you&apos;re following to stay updated on new solutions and discussions.
        </p>
      </div>

      {problems.length > 0 ? (
        <ProblemsList problems={problems} isAuthenticated />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl bg-muted/30">
          <Bookmark className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold mb-2">No followed problems yet</h2>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            When you follow problems, they&apos;ll appear here. Follow problems to get notified when developers post solutions.
          </p>
          <Button asChild>
            <Link href="/">Browse Problems</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

