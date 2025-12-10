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
        "group flex w-[140px] flex-shrink-0 flex-row items-center gap-2 rounded-xl border-2 p-3 shadow-sm transition-all duration-300",
        variantClasses[variant],
        className,
      )}
    >
      {/* Logo */}
      {logo ? (
        <span className="bg-background/80 flex h-4 w-4 items-center justify-center rounded-lg text-3xl shadow-sm">
          {logo}
        </span>
      ) : (
        <div className="bg-background/60 h-4 w-4 rounded-lg" />
      )}

      {/* Sponsor name */}
      <h3 className="text-foreground text-center text-xs leading-tight font-bold">
        {name}
      </h3>
    </Link>
  );
}
