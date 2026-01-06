"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptySponsorCardProps {
  className?: string;
}

export function EmptySponsorCard({ className }: EmptySponsorCardProps) {
  return (
    <div
      className={cn(
        "group flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-2 shadow-sm transition-all duration-300 hover:border-muted-foreground/50 hover:bg-muted/40 sm:p-2.5 md:p-3",
        className,
      )}
    >
      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center gap-3 text-center">
        {/* Icon */}
        <div className="text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 sm:h-14 sm:w-14">
          <svg
            className="h-6 w-6 sm:h-7 sm:w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          </svg>
        </div>

        {/* Text Content */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-foreground sm:text-sm">
            Promote your app
          </h3>
          <p className="text-muted-foreground text-[10px] leading-relaxed sm:text-xs">
            Get your startup in front of developers
          </p>
        </div>

        {/* CTA Button */}
        <Button
          asChild
          size="sm"
          variant="default"
          className="mt-1 w-full text-[10px] sm:text-xs"
        >
          <Link href="/sponsors">Become a sponsor</Link>
        </Button>
      </div>
    </div>
  );
}

