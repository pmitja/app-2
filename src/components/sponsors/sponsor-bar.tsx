"use client";

import { Badge } from "@/components/ui/badge";
import type { SponsorPlacement } from "@/lib/sponsors";
import { ENABLE_SPONSOR_BARS, getSponsorsByPlacement } from "@/lib/sponsors";

import { SponsorPill } from "./sponsor-pill";
import { useSponsors } from "./sponsors-provider";

interface SponsorBarProps {
  placement: Extract<SponsorPlacement, "TOP_BAR" | "BOTTOM_BAR">;
}

export function SponsorBar({ placement }: SponsorBarProps) {
  const { sponsors, isLoading } = useSponsors();

  if (!ENABLE_SPONSOR_BARS) return null;

  const byPlacement = getSponsorsByPlacement(sponsors, placement).slice(0, 8);

  if (!isLoading && byPlacement.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/40 mb-4 flex flex-col gap-2 rounded-xl border px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="border-dashed text-[10px] tracking-wide uppercase"
        >
          Sponsors
        </Badge>
        <span className="text-muted-foreground text-[11px]">
          Tools and teams supporting this project
        </span>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {isLoading && byPlacement.length === 0
          ? Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-muted h-8 max-w-xs min-w-[200px] animate-pulse rounded-full"
              />
            ))
          : byPlacement.map((sponsor) => (
              <SponsorPill key={sponsor.id} sponsor={sponsor} />
            ))}
      </div>
    </div>
  );
}
