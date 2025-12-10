"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Sponsor, SponsorVariant } from "@/lib/sponsors";
import { cn } from "@/lib/utils";

const variantClasses: Record<SponsorVariant, string> = {
  blue: "border-blue-500/40 bg-blue-500/5",
  purple: "border-purple-500/40 bg-purple-500/5",
  green: "border-green-500/40 bg-green-500/5",
  red: "border-red-500/40 bg-red-500/5",
  slate: "border-slate-500/40 bg-slate-500/5",
  amber: "border-amber-500/40 bg-amber-500/5",
};

interface SponsorCardProps {
  sponsor: Sponsor;
  className?: string;
}

export function SponsorCard({ sponsor, className }: SponsorCardProps) {
  const { name, tagline, href, logo, variant } = sponsor;

  return (
    <Card
      className={cn(
        "group overflow-hidden border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        variantClasses[variant],
        className,
      )}
    >
      <Link href={href} target="_blank" rel="noopener noreferrer">
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center justify-between text-xs">
            <Badge
              variant="secondary"
              className="text-[10px] tracking-wide uppercase"
            >
              Sponsored
            </Badge>
            {logo ? (
              <span className="bg-background/60 rounded px-2 py-1 text-xs font-medium">
                {logo}
              </span>
            ) : null}
          </div>
          <CardTitle className="text-sm leading-snug font-semibold">
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-3 pb-4 text-xs">
          <p className="leading-relaxed">{tagline}</p>
          <div className="text-primary text-[11px] font-medium underline-offset-4 group-hover:underline">
            Learn more →
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
