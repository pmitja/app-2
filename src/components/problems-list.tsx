"use client";

import Image from "next/image";
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

        const hasSolutions = problem.solutionCount > 0;
        const hasFeaturedSolution = problem.featuredSolution !== null;

        return (
          <Link key={problem.id} href={href}>
            <Card className="relative cursor-pointer overflow-hidden transition-shadow hover:shadow-md">
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
                    {hasSolutions && (
                      <Badge
                        variant="default"
                        className="border-green-700 bg-green-600 font-semibold text-white hover:bg-green-700"
                      >
                        ✓ Solved
                      </Badge>
                    )}
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
              <CardContent className="space-y-3 pt-0">
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
                {hasFeaturedSolution && problem.featuredSolution && (
                  <div
                    className="space-y-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="default"
                        className="bg-primary/10 text-primary border-primary/20 text-xs font-medium"
                      >
                        💡 Featured Solution
                      </Badge>
                    </div>
                    <Link
                      href={problem.featuredSolution.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Card className="group border-primary/20 hover:border-primary/40 flex flex-row items-center gap-3 border-2 p-3 transition-colors">
                        <div className="bg-muted relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={problem.featuredSolution.imageUrl}
                            alt={problem.featuredSolution.title}
                            fill
                            className="object-contain p-1.5 transition-transform group-hover:scale-105"
                            sizes="64px"
                          />
                          <Badge
                            variant="default"
                            className="absolute -top-1 -right-1 z-10 h-5 px-1.5 text-[10px] shadow-md"
                          >
                            ⭐
                          </Badge>
                        </div>
                        <CardContent className="flex-1 space-y-1 p-0">
                          <h4 className="line-clamp-1 text-sm font-semibold">
                            {problem.featuredSolution.title}
                          </h4>
                          <p className="text-muted-foreground line-clamp-1 text-xs">
                            {problem.featuredSolution.summary}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {problem.featuredSolution.author.image && (
                              <div className="relative h-4 w-4 overflow-hidden rounded-full">
                                <Image
                                  src={problem.featuredSolution.author.image}
                                  alt={
                                    problem.featuredSolution.author.name ||
                                    "Author"
                                  }
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span className="text-muted-foreground text-xs">
                              {problem.featuredSolution.author.name ||
                                "Anonymous"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
