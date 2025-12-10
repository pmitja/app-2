import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";

import { BackToProblemsButton } from "@/components/back-to-problems-button";
import { CommentForm } from "@/components/comment-form";
import { DeveloperStatusForm } from "@/components/developer-status-form";
import { FollowButton } from "@/components/follow-button";
import { ProblemCreatedToast } from "@/components/problem-created-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoteButton } from "@/components/vote-button";
import { auth } from "@/lib/auth";
import { getProblemDetailBySlug } from "@/lib/queries";

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
  const solutionComments = problem.comments.filter(
    (c) => c.type === "solution",
  );

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

      {/* Developer status form */}
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
      />

      {/* Developer statuses */}
      {problem.developerStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Developer Activity</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Comments section */}
      <Card>
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="discussion" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="discussion">
                Discussion ({discussionComments.length})
              </TabsTrigger>
              <TabsTrigger value="solutions">
                Solutions ({solutionComments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussion" className="space-y-4 pt-4">
              <CommentForm
                problemId={problem.id}
                type="discussion"
                isAuthenticated={!!session?.user}
              />

              {discussionComments.length > 0 ? (
                discussionComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="space-y-2 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium">
                        {comment.author.name || "Anonymous"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center text-sm">
                  No discussions yet. Be the first to comment!
                </p>
              )}
            </TabsContent>

            <TabsContent value="solutions" className="space-y-4 pt-4">
              <CommentForm
                problemId={problem.id}
                type="solution"
                isAuthenticated={!!session?.user}
              />

              {solutionComments.length > 0 ? (
                solutionComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="space-y-2 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium">
                        {comment.author.name || "Anonymous"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center text-sm">
                  No solutions proposed yet. Share your ideas!
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
