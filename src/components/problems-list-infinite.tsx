"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ProblemsList } from "@/components/problems-list";
import type { ProblemWithVotes } from "@/lib/queries";

interface ProblemsListInfiniteProps {
  initialProblems: ProblemWithVotes[];
  isAuthenticated: boolean;
}

export function ProblemsListInfinite({
  initialProblems,
  isAuthenticated,
}: ProblemsListInfiniteProps) {
  const [problems, setProblems] = useState(initialProblems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProblems.length === 20);
  const observerTarget = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Reset when filters change
  useEffect(() => {
    setProblems(initialProblems);
    setHasMore(initialProblems.length === 20);
  }, [initialProblems, searchParams]);

  // Fetch more problems
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const params = new URLSearchParams(searchParams);
    params.set("limit", "20");
    params.set("offset", problems.length.toString());

    try {
      const response = await fetch(`/api/problems?${params}`);
      const data = await response.json();

      setProblems((prev) => [...prev, ...data.problems]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Failed to load more problems:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, searchParams, problems.length]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <>
      <ProblemsList problems={problems} isAuthenticated={isAuthenticated} />

      {/* Loading indicator */}
      {isLoading && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Loading more problems...</p>
        </div>
      )}

      {/* Observer target */}
      <div ref={observerTarget} className="h-10" />

      {/* End message */}
      {!hasMore && problems.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            No more problems to load
          </p>
        </div>
      )}
    </>
  );
}
