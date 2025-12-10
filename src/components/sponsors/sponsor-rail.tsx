"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { SponsorPlacement } from "@/lib/sponsors";
import { getSponsorsByPlacement } from "@/lib/sponsors";

import { SponsorCard } from "./sponsor-card";
import { useSponsors } from "./sponsors-provider";

interface SponsorRailProps {
  placement: Extract<SponsorPlacement, "RAIL_LEFT" | "RAIL_RIGHT">;
  maxSponsors?: number;
}

export function SponsorRail({ placement, maxSponsors = 3 }: SponsorRailProps) {
  const { sponsors, isLoading } = useSponsors();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: maxSponsors }).map((_, idx) => (
          <div
            key={idx}
            className="bg-card space-y-3 rounded-lg border p-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  const byPlacement = getSponsorsByPlacement(sponsors, placement).slice(
    0,
    maxSponsors,
  );

  if (byPlacement.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {byPlacement.map((sponsor) => (
        <SponsorCard key={sponsor.id} sponsor={sponsor} />
      ))}
    </div>
  );
}
