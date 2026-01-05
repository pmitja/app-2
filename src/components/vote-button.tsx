"use client";

import { ArrowBigUp, Upload } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { toggleVote } from "@/actions/problem-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  problemId: string;
  initialVoteCount: number;
  initialHasVoted: boolean;
  isAuthenticated: boolean;
  variant?: "compact" | "default" | "sidebar";
}

export function VoteButton({
  problemId,
  initialVoteCount,
  initialHasVoted,
  isAuthenticated,
  variant = "default",
}: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic(
    { count: initialVoteCount, hasVoted: initialHasVoted },
    (state, newHasVoted: boolean) => ({
      count: newHasVoted ? state.count + 1 : state.count - 1,
      hasVoted: newHasVoted,
    }),
  );

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }

    startTransition(async () => {
      // Optimistically update UI
      setOptimisticState(!optimisticState.hasVoted);

      const result = await toggleVote(problemId);

      if (result.error) {
        toast.error(result.error);
      }
    });
  };

  if (variant === "sidebar") {
    return (
      <button
        onClick={handleVote}
        disabled={isPending}
        className={cn(
          "flex w-16 flex-col items-center justify-center gap-2 self-stretch rounded-r-lg border-l bg-black/5 transition-colors dark:bg-white/10",
          optimisticState.hasVoted
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
          isPending && "cursor-not-allowed opacity-50",
        )}
      >
        <ArrowBigUp
          size={32}
          className={cn(
            "transition-all",
            optimisticState.hasVoted && "fill-primary scale-110",
          )}
        />
        <span className="text-lg font-bold">{optimisticState.count}</span>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        onClick={handleVote}
        variant="ghost"
        size="sm"
        className={cn(
          "gap-1.5 px-0",
          optimisticState.hasVoted
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        disabled={isPending}
      >
        <Upload size={16} />
        <span className="font-medium">{optimisticState.count}</span>
        Upvote
      </Button>
    );
  }

  return (
    <Button
      onClick={handleVote}
      variant={optimisticState.hasVoted ? "default" : "outline"}
      size="sm"
      className="flex h-auto flex-col gap-1 px-4 py-2"
      disabled={isPending}
    >
      <span className="text-xl font-bold">▲</span>
      <span className="text-xs">{optimisticState.count}</span>
    </Button>
  );
}
