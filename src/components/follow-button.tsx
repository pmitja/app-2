"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { toggleFollow } from "@/actions/problem-actions";
import { Button } from "@/components/ui/button";

interface FollowButtonProps {
  problemId: string;
  initialIsFollowing: boolean;
  isAuthenticated: boolean;
}

export function FollowButton({
  problemId,
  initialIsFollowing,
  isAuthenticated,
}: FollowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticIsFollowing, setOptimisticIsFollowing] = useOptimistic(
    initialIsFollowing,
    (state, newState: boolean) => newState,
  );

  const handleFollow = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to follow problems");
      return;
    }

    startTransition(async () => {
      // Optimistically update UI
      setOptimisticIsFollowing(!optimisticIsFollowing);

      const result = await toggleFollow(problemId);

      if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      onClick={handleFollow}
      variant={optimisticIsFollowing ? "default" : "outline"}
      size="sm"
      disabled={isPending}
    >
      {optimisticIsFollowing ? "Following" : "Follow"}
    </Button>
  );
}
