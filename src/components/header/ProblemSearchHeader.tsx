"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { Category } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface ProblemSearchHeaderProps {
  categories: Category[];
  initialQuery?: string;
  initialSort?: string;
  selectedCategory?: string | null;
}

export function ProblemSearchHeader({
  categories,
  initialQuery = "",
  initialSort = "votes",
  selectedCategory,
}: ProblemSearchHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isScrolled, setIsScrolled] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }, [debouncedSearch, router, searchParams]);

  // Scroll detection for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleCategoryClick = (category: string) => {
    updateFilter("category", category);
  };

  const handleSortChange = (value: string) => {
    updateFilter("sort", value);
  };

  const currentSort = searchParams.get("sort") || "votes";
  const currentCategory = selectedCategory || "all";

  return (
    <div
      className={cn(
        "sticky top-0 z-10 transition-all duration-300",
        isScrolled
          ? "bg-background/80 border-border border-b py-3 backdrop-blur-sm"
          : "bg-transparent py-8",
      )}
    >
      <div className="space-y-5">
        {/* Search and Sort Row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Bar */}
          <div
            className={cn(
              "border-input bg-background relative flex items-center rounded-full border shadow-sm transition-all duration-200",
              "focus-within:ring-ring/50 focus-within:ring-2",
              isScrolled
                ? "px-4 py-2 lg:max-w-md"
                : "px-6 py-3 lg:max-w-2xl lg:flex-1",
            )}
          >
            <Icons.search className="text-muted-foreground mr-3 size-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by title..."
              className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
              aria-label="Search problems"
            />
          </div>

          {/* Sort and Submit Row */}
          <div className="flex gap-2">
            {/* Sort Dropdown */}
            <Select
              value={currentSort}
              onValueChange={handleSortChange}
              disabled={isPending}
            >
              <SelectTrigger
                className={cn(
                  "w-full lg:w-[200px]",
                  isScrolled ? "h-9" : "h-10",
                )}
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="votes">Most Upvoted</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="pain">Highest Pain Level</SelectItem>
              </SelectContent>
            </Select>

            {/* Submit Problem Button */}
            <Button
              asChild
              size={isScrolled ? "sm" : "default"}
              className="flex-shrink-0"
            >
              <Link href="/problems/new">Submit Problem</Link>
            </Button>
          </div>
        </div>

        {/* Category Pills Row */}
        <div
          className={cn(
            "no-scrollbar flex gap-2 overflow-x-auto scroll-smooth lg:flex-wrap",
            "snap-x snap-mandatory pb-2 lg:snap-none lg:pb-0",
          )}
        >
          {/* All Categories Button */}
          <Button
            variant={currentCategory === "all" ? "default" : "outline"}
            size={isScrolled ? "sm" : "default"}
            onClick={() => handleCategoryClick("all")}
            disabled={isPending}
            className={cn(
              "flex-shrink-0 snap-start rounded-full transition-all duration-200",
              currentCategory !== "all" && "hover:scale-105",
            )}
          >
            All
          </Button>

          {/* Category Buttons */}
          {categories.map((category) => {
            const isActive = currentCategory === category.slug;

            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size={isScrolled ? "sm" : "default"}
                onClick={() => handleCategoryClick(category.slug)}
                disabled={isPending}
                className={cn(
                  "flex-shrink-0 snap-start rounded-full transition-all duration-200",
                  !isActive && "hover:scale-105",
                )}
              >
                <span>{category.emoji}</span>
                <span>{category.name}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
