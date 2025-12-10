"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProblemWithVotes } from "@/lib/queries";

interface ProblemsListProps {
  problems: ProblemWithVotes[];
}

export function ProblemsList({ problems }: ProblemsListProps) {
  const searchParams = useSearchParams();
  if (problems.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-lg">
          No problems found. Be the first to submit one!
        </p>
        <Button asChild className="mt-4">
          <Link href="/problems/new">Submit a Problem</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {problems.map((problem) => {
        // Preserve current filters in the URL for back navigation
        const currentFilters = searchParams.toString();
        const href = `/problems/${problem.category.slug}/${problem.slug}${currentFilters ? `?from=${encodeURIComponent(currentFilters)}` : ""}`;

        return (
          <Link key={problem.id} href={href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-xl">{problem.title}</CardTitle>
                      <Badge variant="secondary">
                        {problem.category.emoji} {problem.category.name}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {problem.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex h-auto flex-col gap-1 px-3 py-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="text-lg font-bold">▲</span>
                    <span className="text-xs">{problem.voteCount}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-xs">
                    Pain Level: {problem.painLevel}/5
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {problem.frequency}
                  </Badge>
                  {problem.wouldPay && (
                    <Badge
                      variant="outline"
                      className="border-green-500 text-xs text-green-700 dark:text-green-400"
                    >
                      💰 Would Pay
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
