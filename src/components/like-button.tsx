"use client";

import { Heart } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { toggleLike } from "@/actions/problem-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  problemId: string;
  initialLikeCount: number;
  initialHasLiked: boolean;
  isAuthenticated: boolean;
}

export function LikeButton({
  problemId,
  initialLikeCount,
  initialHasLiked,
  isAuthenticated,
}: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic(
    { count: initialLikeCount, hasLiked: initialHasLiked },
    (state, newHasLiked: boolean) => ({
      count: newHasLiked ? state.count + 1 : state.count - 1,
      hasLiked: newHasLiked,
    }),
  );

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to like");
      return;
    }

    startTransition(async () => {
      // Optimistically update UI
      setOptimisticState(!optimisticState.hasLiked);

      const result = await toggleLike(problemId);

      if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      onClick={handleLike}
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      disabled={isPending}
    >
      <Heart
        size={20}
        className={cn(
          "transition-colors",
          optimisticState.hasLiked
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground hover:text-foreground"
        )}
      />
    </Button>
  );
}

