import { formatDistanceToNow } from "date-fns";
import { Banknote, Repeat, Thermometer } from "lucide-react";
import type { Metadata } from "next";
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
import { ProblemSchema } from "@/components/structured-data/problem-schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VoteButton } from "@/components/vote-button";
import { auth } from "@/lib/auth";
import { getProblemDetailBySlug, getProblemSolutions } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

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

export async function generateMetadata({
  params,
}: ProblemDetailPageProps): Promise<Metadata> {
  const { categorySlug, slug } = await params;
  const problem = await getProblemDetailBySlug(categorySlug, slug);

  if (!problem) {
    return {
      title: "Problem Not Found",
    };
  }

  const url = `${siteConfig.url}/problems/${categorySlug}/${slug}`;
  const description =
    problem.description.length > 160
      ? `${problem.description.substring(0, 157)}...`
      : problem.description;

  return {
    title: problem.title,
    description: description,
    keywords: [
      problem.category.name,
      "real problem",
      "validated problem",
      "problem to solve",
      "developer opportunity",
      "problem discovery",
      "find problems",
      "build solutions",
      ...siteConfig.keywords,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: problem.title,
      description: description,
      url: url,
      siteName: siteConfig.title,
      images: [
        {
          url: "/opengraph-image.jpg",
          width: 1200,
          height: 630,
          alt: problem.title,
        },
      ],
      type: "article",
      publishedTime: problem.createdAt.toISOString(),
      authors: [problem.author.name || "Anonymous"],
      tags: [problem.category.name],
    },
    twitter: {
      card: "summary_large_image",
      title: problem.title,
      description: description,
      images: ["/opengraph-image.jpg"],
    },
  };
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

  const problemUrl = `${siteConfig.url}/problems/${categorySlug}/${slug}`;

  return (
    <div className="space-y-6">
      <ProblemSchema
        title={problem.title}
        description={problem.description}
        url={problemUrl}
        category={problem.category.name}
        categorySlug={categorySlug}
        author={problem.author}
        createdAt={problem.createdAt}
        voteCount={problem.voteCount}
        commentCount={problem.comments.length}
        solutionCount={
          solutions.featured
            ? 1 + solutions.others.length
            : solutions.others.length
        }
      />
      <ProblemCreatedToast />

      {/* Back Button */}
      <BackToProblemsButton />

      {/* Hero Section */}
      <div className="space-y-4 pb-6">
        <div className="flex flex-wrap items-start gap-4">
          <h1 className="flex-1 text-4xl font-bold tracking-tight lg:text-5xl">
            {problem.title}
          </h1>
          <Badge variant="secondary" className="px-4 py-2 text-base">
            {problem.category.emoji} {problem.category.name}
          </Badge>
        </div>

        {/* Author info with Avatar */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={problem.author.image || undefined}
              alt={problem.author.name || "Anonymous"}
            />
            <AvatarFallback>
              {problem.author.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {problem.author.name || "Anonymous"}
            </span>
            <span className="text-muted-foreground text-xs">
              Posted{" "}
              {formatDistanceToNow(new Date(problem.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Content Column */}
        <div className="space-y-6 lg:col-span-8">
          {/* Problem Description */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {problem.description}
              </p>
            </CardContent>
          </Card>

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

        {/* Sidebar Column */}
        <div className="space-y-6 lg:col-span-4">
          <div className="sticky top-4 space-y-6">
            {/* Action Buttons Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>

            {/* Problem Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Problem Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pain Level */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="text-primary h-4 w-4" />
                    <span className="text-sm font-medium">Pain Level</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Intensity</span>
                      <span className="font-semibold">
                        {problem.painLevel}/5
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full transition-all"
                        style={{ width: `${(problem.painLevel / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Frequency */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Repeat className="text-primary h-4 w-4" />
                    <span className="text-sm font-medium">Frequency</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="w-full justify-center py-2"
                  >
                    {problem.frequency}
                  </Badge>
                </div>

                {/* Would Pay */}
                {problem.wouldPay && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium">
                          Willingness to Pay
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="w-full justify-center border-green-500 py-2 text-green-700 dark:text-green-400"
                      >
                        💰 Would Pay
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Developer Status Form (only visible to developers) */}
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

            {/* Developer Statuses */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
