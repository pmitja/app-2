"use client";

import Link from "next/link";

import type { Sponsor, SponsorVariant } from "@/lib/sponsors";
import { cn } from "@/lib/utils";

const pillVariantClasses: Record<SponsorVariant, string> = {
  blue: "bg-blue-500/10 text-blue-950 dark:text-blue-100 border-blue-500/40",
  purple:
    "bg-purple-500/10 text-purple-950 dark:text-purple-100 border-purple-500/40",
  green:
    "bg-green-500/10 text-green-950 dark:text-green-100 border-green-500/40",
  red: "bg-red-500/10 text-red-950 dark:text-red-100 border-red-500/40",
  slate:
    "bg-slate-500/10 text-slate-950 dark:text-slate-100 border-slate-500/40",
  amber:
    "bg-amber-500/10 text-amber-950 dark:text-amber-100 border-amber-500/40",
};

interface SponsorPillProps {
  sponsor: Sponsor;
  className?: string;
}

export function SponsorPill({ sponsor, className }: SponsorPillProps) {
  const { name, tagline, href, logo, variant } = sponsor;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex max-w-xs min-w-[220px] items-center gap-2 rounded-full border px-3 py-1.5 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        pillVariantClasses[variant],
        className,
      )}
    >
      {logo ? (
        <img
          src={logo}
          alt={`${name} logo`}
          className="h-6 w-6 rounded-full object-cover object-center lg:h-12 lg:w-12"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      <div className="flex min-w-0 flex-col">
        <span className="truncate leading-tight font-semibold">{name}</span>
        <span className="truncate text-[11px] opacity-80">{tagline}</span>
      </div>
    </Link>
  );
}
