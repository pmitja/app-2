"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { toggleVote } from "@/actions/problem-actions";
import { Button } from "@/components/ui/button";

interface VoteButtonProps {
  problemId: string;
  initialVoteCount: number;
  initialHasVoted: boolean;
  isAuthenticated: boolean;
}

export function VoteButton({
  problemId,
  initialVoteCount,
  initialHasVoted,
  isAuthenticated,
}: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic(
    { count: initialVoteCount, hasVoted: initialHasVoted },
    (state, newHasVoted: boolean) => ({
      count: newHasVoted ? state.count + 1 : state.count - 1,
      hasVoted: newHasVoted,
    }),
  );

  const handleVote = () => {
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
