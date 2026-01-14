"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Sponsor {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string | null;
  logo?: string | null;
  backgroundImageUrl?: string | null;
}

interface SponsorShowcaseCardProps {
  sponsor: Sponsor;
}

export function SponsorShowcaseCard({ sponsor }: SponsorShowcaseCardProps) {
  const hasBackground = !!sponsor.backgroundImageUrl;

  return (
    <a
      href={sponsor.ctaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card
        className={cn(
          "relative h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
          hasBackground ? "border-2" : "hover:border-primary",
        )}
      >
        {/* Background Image */}
        {hasBackground && (
          <>
            <img
              src={sponsor.backgroundImageUrl!}
              alt={`${sponsor.title} background`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </>
        )}

        {/* Content */}
        <div className={cn("relative", hasBackground && "text-white")}>
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-start justify-between">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  hasBackground && "bg-white/90 text-gray-900 backdrop-blur-sm",
                )}
              >
                Sponsored
              </Badge>
            </div>

            {(sponsor.imageUrl || sponsor.logo) && (
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg p-4",
                  hasBackground
                    ? "bg-white/20 backdrop-blur-sm"
                    : "bg-secondary/50",
                )}
              >
                {sponsor.imageUrl ? (
                  <img
                    src={sponsor.imageUrl}
                    alt={`${sponsor.title} logo`}
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-4xl select-none">{sponsor.logo}</div>
                )}
              </div>
            )}

            <CardTitle
              className={cn(
                "text-lg transition-colors",
                hasBackground
                  ? "text-white group-hover:text-white/90"
                  : "group-hover:text-primary",
              )}
            >
              {sponsor.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p
              className={cn(
                "text-sm leading-relaxed",
                hasBackground ? "text-white/90" : "text-muted-foreground",
              )}
            >
              {sponsor.description}
            </p>

            <div
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                hasBackground
                  ? "text-white group-hover:text-white/90"
                  : "text-primary",
              )}
            >
              <span>{sponsor.ctaText}</span>
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </CardContent>
        </div>
      </Card>
    </a>
  );
}
