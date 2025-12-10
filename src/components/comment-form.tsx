"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createComment } from "@/actions/problem-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  problemId: string;
  type: "discussion" | "solution";
  isAuthenticated: boolean;
}

export function CommentForm({
  problemId,
  type,
  isAuthenticated,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    startTransition(async () => {
      const result = await createComment(problemId, {
        content: content.trim(),
        type,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          type === "discussion"
            ? "Discussion comment posted!"
            : "Solution comment posted!",
        );
        setContent("");
      }
    });
  };

  const placeholder =
    type === "discussion"
      ? "Share your thoughts about this problem..."
      : "Share your solution ideas or approaches...";

  const buttonText =
    type === "discussion" ? "Post Discussion" : "Post Solution";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={!isAuthenticated || isPending}
        className="min-h-[100px]"
      />
      {!isAuthenticated && (
        <p className="text-muted-foreground text-sm">
          Please sign in to post comments
        </p>
      )}
      <Button type="submit" disabled={!isAuthenticated || isPending}>
        {isPending ? "Posting..." : buttonText}
      </Button>
    </form>
  );
}
