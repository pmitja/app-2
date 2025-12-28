"use client";

import type { Sponsor } from "@/lib/sponsors";

import { SponsorCardPremium } from "./sponsor-card-premium";

interface SponsorCardProps {
  sponsor: Sponsor & { backgroundImageUrl?: string; month?: string };
  className?: string;
}

export function SponsorCard({ sponsor, className }: SponsorCardProps) {
  // Always use premium card design for all sponsors
  return <SponsorCardPremium sponsor={sponsor} className={className} />;
}
