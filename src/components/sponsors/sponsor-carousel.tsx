"use client";

import type { SponsorPlacement } from "@/lib/sponsors";
import { getSponsorsByPlacement } from "@/lib/sponsors";

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

  // Debug logging
  console.log(
    `[SponsorCarousel ${placement}] Total sponsors:`,
    sponsors.length,
  );
  console.log(
    `[SponsorCarousel ${placement}] Filtered sponsors:`,
    byPlacement.length,
  );
  console.log(`[SponsorCarousel ${placement}] Is loading:`, isLoading);
  console.log(
    `[SponsorCarousel ${placement}] Filtered sponsor names:`,
    byPlacement.map((s) => s.name),
  );

  // If no sponsors for this placement, show a debug message
  if (!isLoading && byPlacement.length === 0) {
    return (
      <div className="w-full bg-red-500/10 p-4 text-center text-sm text-red-600 dark:text-red-400">
        <div className="font-semibold">
          Debug: No sponsors found for {placement}
        </div>
        <div className="mt-1 text-xs">
          Total sponsors loaded: {sponsors.length}
        </div>
        <div className="mt-1 text-xs">
          Check browser console for detailed logs
        </div>
      </div>
    );
  }

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

  // Duplicate items for seamless infinite scroll
  // We need at least 2 full sets to avoid gaps
  const duplicatedSponsors = [
    ...byPlacement,
    ...byPlacement,
    ...byPlacement,
    ...byPlacement,
  ];

  return (
    <div className="from-muted/20 relative w-full overflow-hidden bg-gradient-to-b to-transparent py-4">
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
