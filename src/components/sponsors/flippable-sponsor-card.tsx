"use client";

import type { Sponsor } from "@/lib/sponsors";

import { SponsorCardPremium } from "./sponsor-card-premium";

interface FlippableSponsorCardProps {
  frontSponsor: Sponsor & { backgroundImageUrl?: string };
  backSponsor?: Sponsor & { backgroundImageUrl?: string };
  className?: string;
  isFlipped: boolean;
}

export function FlippableSponsorCard({
  frontSponsor,
  backSponsor,
  className,
  isFlipped,
}: FlippableSponsorCardProps) {
  return (
    <SponsorCardPremium
      sponsor={frontSponsor}
      backSponsor={backSponsor}
      className={className}
      isFlipped={isFlipped}
    />
  );
}

