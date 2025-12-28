"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { Sponsor, SponsorVariant } from "@/lib/sponsors";
import { cn } from "@/lib/utils";

// Gradient overlay colors for each variant
const variantGradients: Record<SponsorVariant, string> = {
  blue: "from-blue-900/10 via-blue-800/30 to-blue-900/70",
  purple: "from-purple-900/10 via-purple-800/30 to-purple-900/70",
  green: "from-green-900/10 via-green-800/30 to-green-900/70",
  red: "from-red-900/10 via-red-800/30 to-red-900/70",
  slate: "from-slate-900/10 via-slate-800/30 to-slate-900/70",
  amber: "from-amber-900/10 via-amber-800/30 to-amber-900/70",
};

// Border accent colors for each variant
const variantBorders: Record<SponsorVariant, string> = {
  blue: "border-blue-400/30",
  purple: "border-purple-400/30",
  green: "border-green-400/30",
  red: "border-red-400/30",
  slate: "border-slate-400/30",
  amber: "border-amber-400/30",
};

interface SponsorCardPremiumProps {
  sponsor: Sponsor & { backgroundImageUrl?: string };
  className?: string;
}

export function SponsorCardPremium({
  sponsor,
  className,
}: SponsorCardPremiumProps) {
  const { name, tagline, href, logo, variant, backgroundImageUrl } = sponsor;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative block overflow-hidden rounded-xl border-2 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
        variantBorders[variant],
        className,
      )}
      style={{ height: "calc((100svh - 5rem) / 6 - 1rem)" }}
    >
      {/* Background Image */}
      {backgroundImageUrl ? (
        <img
          src={backgroundImageUrl}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="bg-muted absolute inset-0" />
      )}

      {/* Gradient Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b",
          variantGradients[variant],
        )}
      />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between p-3 text-white lg:p-4">
        {/* Header with Badge and Logo */}
        <div className="flex items-start justify-between">
          <Badge
            variant="secondary"
            className="bg-white/90 text-[10px] tracking-wider uppercase text-purple-600 backdrop-blur-sm"
          >
            Sponsored
          </Badge>
          {logo && (
            <span className="bg-white/90 rounded-lg px-2 py-1 text-base backdrop-blur-sm lg:text-lg">
              {logo}
            </span>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-sm font-bold leading-tight text-white drop-shadow-lg lg:text-base">
            {name}
          </h3>

          {/* Bottom Section */}
          <div className="space-y-2">
            {/* Tagline - Hidden on smaller screens */}
            <p className="hidden text-xs leading-relaxed text-white/90 drop-shadow-md 2xl:block">
              {tagline}
            </p>

            {/* CTA */}
            <div className="flex items-center gap-2 text-xs font-medium text-white drop-shadow-md">
              <span className="group-hover:underline underline-offset-4">
                Learn more
              </span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

