"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageCircle, MoreVertical, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { LikeButton } from "@/components/like-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VoteButton } from "@/components/vote-button";
import type { ProblemWithVotes } from "@/lib/queries";

interface ProblemsListProps {
  problems: ProblemWithVotes[];
  isAuthenticated?: boolean;
}

export function ProblemsList({
  problems,
  isAuthenticated = false,
}: ProblemsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleShare = (e: React.MouseEvent, problem: ProblemWithVotes) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/problems/${problem.category.slug}/${problem.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

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
          <Card
            key={problem.id}
            role="link"
            tabIndex={0}
            className="cursor-pointer overflow-hidden p-0 transition-shadow hover:shadow-md"
            onClick={() => router.push(href)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(href);
              }
            }}
          >
            <div className="flex items-stretch">
              {/* Main Content */}
              <CardContent className="flex-1 p-4">
                {/* Header: Avatar, Username, Timestamp, Like, Menu */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {problem.author.image && (
                        <AvatarImage
                          src={problem.author.image}
                          alt={problem.author.name || "User"}
                        />
                      )}
                      <AvatarFallback className="bg-muted text-sm font-medium">
                        {problem.author.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-foreground text-sm font-semibold">
                        {problem.author.name || "Anonymous"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(problem.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LikeButton
                      problemId={problem.id}
                      initialLikeCount={problem.likeCount}
                      initialHasLiked={problem.userHasLiked}
                      isAuthenticated={isAuthenticated}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical
                        size={20}
                        className="text-muted-foreground"
                      />
                    </Button>
                  </div>
                </div>

                {/* Content: Title and Description */}
                <div className="mb-3">
                  <h3 className="text-foreground mb-1.5 text-base leading-snug font-semibold">
                    {problem.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                    {problem.description}
                  </p>
                </div>

                {/* Badges */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {problem.category.emoji} {problem.category.name}
                  </Badge>
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
                  {hasSolutions && (
                    <Badge
                      variant="default"
                      className="border-green-700 bg-green-600 font-semibold text-white hover:bg-green-700"
                    >
                      ✓ Solved
                    </Badge>
                  )}
                </div>

                {/* Featured Solution (if exists) */}
                {hasFeaturedSolution && problem.featuredSolution && (
                  <button
                    type="button"
                    className="mb-3 w-full space-y-2 text-left"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                      }
                    }}
                    tabIndex={-1}
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
                  </button>
                )}

                {/* Footer: Separator + Actions */}
                <Separator className="mb-3" />
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground gap-1.5 px-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(href);
                    }}
                  >
                    <MessageCircle size={16} />
                    {problem.commentCount} Comments
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground gap-1.5 px-0"
                    onClick={(e) => handleShare(e, problem)}
                  >
                    <Share2 size={16} />
                    Share
                  </Button>
                </div>
              </CardContent>

              {/* Vote Sidebar */}
              <VoteButton
                problemId={problem.id}
                initialVoteCount={problem.voteCount}
                initialHasVoted={problem.userHasVoted}
                isAuthenticated={isAuthenticated}
                variant="sidebar"
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
