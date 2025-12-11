"use client";

import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProblemSolution } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface FeaturedSolutionCardProps {
  solution: ProblemSolution;
  className?: string;
}

export function FeaturedSolutionCard({
  solution,
  className,
}: FeaturedSolutionCardProps) {
  return (
    <Card
      as="a"
      className={cn(
        "group border-primary/30 from-primary/5 via-background to-background relative flex cursor-pointer flex-row items-center gap-4 overflow-hidden border-2 bg-gradient-to-br p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl",
        className,
      )}
      href={solution.targetUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Badge variant="default" className="absolute top-4 left-4 z-10 shadow-md">
        ⭐ Featured Solution
      </Badge>

      <div className="bg-muted relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={solution.imageUrl}
          alt={solution.title}
          fill
          className="object-contain p-3 transition-transform group-hover:scale-105"
          sizes="128px"
          priority
        />
      </div>

      <CardContent className="flex-1 space-y-4 p-0">
        <div className="space-y-3">
          <h2 className="line-clamp-2 text-2xl leading-tight font-bold">
            {solution.title}
          </h2>
          <p className="text-muted-foreground line-clamp-4 text-base leading-relaxed">
            {solution.summary}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={solution.author.image || undefined}
                alt={solution.author.name || "User"}
              />
              <AvatarFallback>
                {solution.author.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold">
                {solution.author.name || "Anonymous"}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(solution.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <div className="bg-primary/10 text-primary group-hover:bg-primary/20 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition">
            <span>Explore Solution</span>
            <span className="transition group-hover:translate-x-1">→</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
