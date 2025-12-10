"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { SponsorPlacement } from "@/lib/sponsors";
import { getSponsorsByPlacement } from "@/lib/sponsors";

import { SponsorCard } from "./sponsor-card";
import { useSponsors } from "./sponsors-provider";

const MOBILE_PLACEMENT: SponsorPlacement = "MOBILE_STACK";

export function MobileSponsorsStack() {
  const { sponsors, isLoading } = useSponsors();

  const byPlacement = getSponsorsByPlacement(sponsors, MOBILE_PLACEMENT).slice(
    0,
    4,
  );

  if (!isLoading && byPlacement.length === 0) {
    return null;
  }

  return (
    <section className="mb-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
          Sponsors
        </p>
        <Link
          href="/sponsors/checkout"
          className="text-muted-foreground text-[11px] font-medium underline-offset-4 hover:underline"
        >
          Advertise
        </Link>
      </div>

      {isLoading && byPlacement.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-muted/40 h-24 animate-pulse rounded-xl border border-dashed"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {byPlacement.map((sponsor) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
      )}

      {/* Extra CTA on mobile */}
      <div className="text-muted-foreground pt-1 text-right text-[11px] lg:hidden">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary h-7 px-0 text-[11px] font-medium"
        >
          <Link href="/sponsors/checkout">Advertise your product →</Link>
        </Button>
      </div>
    </section>
  );
}
