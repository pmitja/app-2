"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createSolutionPromotionCheckoutAction } from "@/actions/create-checkout-session";
import { promoteSolution } from "@/actions/solution-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProblemSolution } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface SolutionCardProps {
  solution: ProblemSolution;
  categorySlug: string;
  problemSlug: string;
  canPromote?: boolean;
  className?: string;
}

export function SolutionCard({
  solution,
  categorySlug,
  problemSlug,
  canPromote = false,
  className,
}: SolutionCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isPromoting, setIsPromoting] = useState(false);

  const handlePromote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsPromoting(true);

    startTransition(async () => {
      try {
        const result = await promoteSolution(solution.id);

        if (result.error) {
          toast.error(result.error);
          setIsPromoting(false);
          return;
        }

        if (result.success && result.solutionId && result.problemId) {
          // Create checkout session
          const checkoutResult = await createSolutionPromotionCheckoutAction(
            result.solutionId,
            result.problemId,
            categorySlug,
            problemSlug,
          );

          if (checkoutResult.url) {
            window.location.href = checkoutResult.url;
          }
        }
      } catch {
        toast.error("Failed to initiate promotion");
        setIsPromoting(false);
      }
    });
  };

  return (
    <Card
      className={cn(
        "group relative flex cursor-pointer flex-row items-center gap-3 overflow-hidden border p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
      as="a"
      href={solution.targetUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="bg-muted relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={solution.imageUrl}
          alt={solution.title}
          fill
          className="object-contain p-1.5 transition-transform group-hover:scale-105"
          sizes="64px"
        />
      </div>

      <CardContent className="flex-1 space-y-1.5 p-0">
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-sm leading-tight font-semibold">
            {solution.title}
          </h3>
          <p className="text-muted-foreground line-clamp-1 text-xs leading-relaxed">
            {solution.summary}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-4 w-4">
              <AvatarImage
                src={solution.author.image || undefined}
                alt={solution.author.name || "User"}
              />
              <AvatarFallback className="text-[8px]">
                {solution.author.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <p className="text-muted-foreground text-xs">
              {solution.author.name || "Anonymous"}
            </p>
          </div>

          {canPromote && solution.isOwner && (
            <Button
              size="sm"
              variant="outline"
              onClick={handlePromote}
              disabled={isPending || isPromoting}
              className="h-6 text-[10px]"
            >
              {isPromoting ? "..." : "$9.99"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
