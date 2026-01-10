"use client";

import Link from "next/link";

import type { SponsorPlacement } from "@/lib/sponsors";
import { getSponsorsByPlacement } from "@/lib/sponsors";
import { cn } from "@/lib/utils";

import { SponsorCarouselCard } from "./sponsor-carousel-card";
import { useSponsors } from "./sponsors-provider";

interface SponsorCarouselProps {
  placement: Extract<
    SponsorPlacement,
    "MOBILE_CAROUSEL_TOP" | "MOBILE_CAROUSEL_BOTTOM"
  >;
  direction: "ltr" | "rtl";
}

export function SponsorCarousel({
  placement,
  direction,
}: SponsorCarouselProps) {
  const { sponsors, isLoading } = useSponsors();

  const byPlacement = getSponsorsByPlacement(sponsors, placement);

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="bg-muted/30 w-full overflow-hidden py-4">
        <div className="flex gap-4 px-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-muted/60 h-32 w-[240px] flex-shrink-0 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  // If no sponsors for this placement, show "Promote your app" cards
  if (byPlacement.length === 0) {
    const emptyCards = Array.from({ length: 8 }); // Show 8 cards for smooth scroll

    return (
      <div
        className={cn(
          "relative w-full overflow-hidden bg-neutral-100 py-4 dark:bg-black",
          placement === "MOBILE_CAROUSEL_TOP"
            ? "border-b-2 border-[#333]"
            : "border-t-2 border-[#333]",
        )}
      >
        {/* Gradient overlays for smooth edges */}
        <div className="from-background pointer-events-none absolute top-0 left-0 z-10 h-full w-16 bg-gradient-to-r to-transparent" />
        <div className="from-background pointer-events-none absolute top-0 right-0 z-10 h-full w-16 bg-gradient-to-l to-transparent" />

        <div className="relative">
          <div
            className="flex gap-4"
            style={{
              animation: `scroll-${direction} 40s linear infinite`,
              willChange: "transform",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.animationPlayState = "paused";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animationPlayState = "running";
            }}
          >
            {emptyCards.map((_, idx) => (
              <Link
                key={idx}
                href="/sponsors"
                className={cn(
                  "group border-muted-foreground/30 bg-muted/30 hover:border-muted-foreground/50 hover:bg-muted/40 flex max-h-[73px] w-[240px] flex-shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed p-3 shadow-sm transition-all duration-300",
                )}
              >
                {/* Icon */}
                <div className="text-muted-foreground bg-muted/50 flex h-8 w-8 items-center justify-center rounded-full">
                  <svg
                    className="h-4 w-4"
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
                <h3 className="text-foreground text-center text-xs font-semibold">
                  Promote your app
                </h3>
                <p className="text-muted-foreground text-center text-[10px] leading-tight">
                  Get your startup in front of developers
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes scroll-ltr {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          @keyframes scroll-rtl {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    );
  }

  // Duplicate items for seamless infinite scroll
  // We need at least 2 full sets to avoid gaps
  const duplicatedSponsors = [
    ...byPlacement,
    ...byPlacement,
    ...byPlacement,
    ...byPlacement,
  ];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-neutral-100 py-4 dark:bg-black",
        placement === "MOBILE_CAROUSEL_TOP"
          ? "border-b-2 border-[#333]"
          : "border-t-2 border-[#333]",
      )}
    >
      {/* Gradient overlays for smooth edges */}
      <div className="from-background pointer-events-none absolute top-0 left-0 z-10 h-full w-16 bg-gradient-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute top-0 right-0 z-10 h-full w-16 bg-gradient-to-l to-transparent" />

      <div className="relative">
        <div
          className="flex gap-4"
          style={{
            animation: `scroll-${direction} 40s linear infinite`,
            willChange: "transform",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.animationPlayState = "paused";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.animationPlayState = "running";
          }}
        >
          {duplicatedSponsors.map((sponsor, idx) => (
            <SponsorCarouselCard
              key={`${sponsor.id}-${idx}`}
              sponsor={sponsor}
            />
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scroll-ltr {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-rtl {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
