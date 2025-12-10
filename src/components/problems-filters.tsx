"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/queries";

export function ProblemsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get("sort") || "votes";
  const currentCategory = searchParams.get("category") || "all";

  const updateFilter = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all" && value !== "votes") {
        params.set(key, value);
      } else if (key === "sort") {
        params.delete(key); // Remove if default (votes)
      } else {
        params.delete(key); // Remove if "all"
      }
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Select
        value={currentSort}
        onValueChange={(value) => updateFilter("sort", value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="votes">Most Upvoted</SelectItem>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="pain">Highest Pain Level</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentCategory}
        onValueChange={(value) => updateFilter("category", value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
