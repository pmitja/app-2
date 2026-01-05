import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

import { BackToProblemsButton } from "@/components/back-to-problems-button";
import { CommentSection } from "@/components/comments/comment-section";
import { DeveloperStatusForm } from "@/components/developer-status-form";
import { FeaturedSolutionCard } from "@/components/featured-solution-card";
import { FollowButton } from "@/components/follow-button";
import { ProblemCreatedToast } from "@/components/problem-created-toast";
import { SolutionCard } from "@/components/solution-card";
import { SolutionFormModal } from "@/components/solution-form-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VoteButton } from "@/components/vote-button";
import { auth } from "@/lib/auth";
import { getProblemDetailBySlug, getProblemSolutions } from "@/lib/queries";

function AccordionSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group bg-card rounded-lg border shadow-sm">
      <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 text-sm font-semibold marker:content-none">
        <span>{title}</span>
        <svg
          aria-hidden
          className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25 12 15.75 4.5 8.25"
          />
        </svg>
      </summary>
      <div className="border-t px-4 py-4">{children}</div>
    </details>
  );
}

interface ProblemDetailPageProps {
  params: Promise<{
    categorySlug: string;
    slug: string;
  }>;
}

export default async function ProblemDetailPage({
  params,
}: ProblemDetailPageProps) {
  const { categorySlug, slug } = await params;
  const session = await auth();
  const problem = await getProblemDetailBySlug(
    categorySlug,
    slug,
    session?.user?.id,
  );

  if (!problem) {
    notFound();
  }

  const discussionComments = problem.comments.filter(
    (c) => c.type === "discussion",
  );

  // Fetch solutions
  const solutions = await getProblemSolutions(problem.id, session?.user?.id);

  return (
    <div className="space-y-6">
      <ProblemCreatedToast />

      {/* Back Button */}
      <BackToProblemsButton />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="flex-1 text-3xl font-bold tracking-tight">
            {problem.title}
          </h1>
          <Badge variant="secondary" className="text-sm">
            {problem.category.emoji} {problem.category.name}
          </Badge>
        </div>

        {/* Meta information */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <span>
            Posted by {problem.author.name || "Anonymous"}{" "}
            {formatDistanceToNow(new Date(problem.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      <Separator />

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <VoteButton
          problemId={problem.id}
          initialVoteCount={problem.voteCount}
          initialHasVoted={problem.userHasVoted}
          isAuthenticated={!!session?.user}
        />
        <FollowButton
          problemId={problem.id}
          initialIsFollowing={problem.userIsFollowing}
          isAuthenticated={!!session?.user}
        />
      </div>

      {/* Problem details */}
      <Card>
        <CardHeader>
          <CardTitle>Problem Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-sm">
              Pain Level: {problem.painLevel}/5
            </Badge>
            <Badge variant="outline" className="text-sm">
              {problem.frequency}
            </Badge>
            {problem.wouldPay && (
              <Badge
                variant="outline"
                className="border-green-500 text-sm text-green-700 dark:text-green-400"
              >
                💰 Would Pay
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Developer status form (only visible to developers) */}
      {session?.user?.role === "developer" && (
        <AccordionSection title="Set Your Developer Status">
          <DeveloperStatusForm
            problemId={problem.id}
            currentStatus={
              problem.userDeveloperStatus?.status as
                | "exploring"
                | "building"
                | undefined
            }
            currentSolutionUrl={problem.userDeveloperStatus?.solutionUrl}
            isAuthenticated={!!session?.user}
            isDeveloper={session?.user?.role === "developer"}
            withCard={false}
          />
        </AccordionSection>
      )}

      {/* Developer statuses */}
      {problem.developerStatuses.length > 0 && (
        <AccordionSection title="Developer Activity">
          <div className="space-y-3">
            {problem.developerStatuses.map((status) => (
              <div
                key={status.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <Badge
                  variant={
                    status.status === "building" ? "default" : "secondary"
                  }
                >
                  {status.status === "building"
                    ? "🔨 Building"
                    : "🔍 Exploring"}
                </Badge>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    {status.developer.name || "Anonymous Developer"}
                  </p>
                  {status.solutionUrl && (
                    <a
                      href={status.solutionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm underline"
                    >
                      View Solution →
                    </a>
                  )}
                  <p className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(status.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Solutions section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Solutions (
              {solutions.featured
                ? 1 + solutions.others.length
                : solutions.others.length}
              )
            </CardTitle>
            <SolutionFormModal
              problemId={problem.id}
              categorySlug={categorySlug}
              problemSlug={slug}
              isAuthenticated={!!session?.user}
              isDeveloper={session?.user?.role === "developer"}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Featured Solution */}
          {solutions.featured && (
            <div className="space-y-2">
              <FeaturedSolutionCard solution={solutions.featured} />
            </div>
          )}

          {/* Other Solutions */}
          {solutions.others.length > 0 && (
            <div className="space-y-4">
              {solutions.featured && (
                <div className="flex items-center gap-2">
                  <Separator className="flex-1" />
                  <span className="text-muted-foreground text-sm font-medium">
                    Other Solutions
                  </span>
                  <Separator className="flex-1" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {solutions.others.map((solution) => (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    categorySlug={categorySlug}
                    problemSlug={slug}
                    canPromote={!solutions.featured}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!solutions.featured && solutions.others.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed py-12 text-center">
              <p className="text-sm font-medium">
                No solutions yet. Be the first to share yours!
              </p>
              {session?.user?.role !== "developer" && (
                <p className="text-xs">
                  Developer role required to post solutions.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discussion section */}
      <Card>
        <CardContent className="p-6">
          <CommentSection
            problemId={problem.id}
            comments={discussionComments}
            isAuthenticated={!!session?.user}
            currentUserId={session?.user?.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
