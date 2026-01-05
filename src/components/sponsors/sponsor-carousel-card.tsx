"use client";

import Link from "next/link";

import type { Sponsor, SponsorVariant } from "@/lib/sponsors";
import { cn } from "@/lib/utils";

const variantClasses: Record<SponsorVariant, string> = {
  blue: "border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20",
  purple: "border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20",
  green: "border-green-500/50 bg-green-500/10 hover:bg-green-500/20",
  red: "border-red-500/50 bg-red-500/10 hover:bg-red-500/20",
  slate: "border-slate-500/50 bg-slate-500/10 hover:bg-slate-500/20",
  amber: "border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20",
};

interface SponsorCarouselCardProps {
  sponsor: Sponsor;
  className?: string;
}

export function SponsorCarouselCard({
  sponsor,
  className,
}: SponsorCarouselCardProps) {
  const { name, href, logo, variant } = sponsor;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex max-h-[73px] w-[140px] flex-shrink-0 flex-row items-center gap-2 overflow-hidden rounded-xl border-2 p-3 shadow-sm transition-all duration-300",
        variantClasses[variant],
        className,
      )}
    >
      {/* Logo */}
      {logo ? (
        <img
          src={logo}
          alt={`${name} logo`}
          className="h-6 min-w-6 rounded-lg object-cover object-center shadow-sm"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="bg-background/60 h-6 w-6 rounded-lg" />
      )}

      {/* Sponsor name */}
      <h3 className="text-foreground line-clamp-2 text-center text-xs leading-tight font-bold">
        {name}
      </h3>
    </Link>
  );
}
