"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Sponsor {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string | null;
}

interface SponsorShowcaseCardProps {
  sponsor: Sponsor;
}

export function SponsorShowcaseCard({ sponsor }: SponsorShowcaseCardProps) {
  return (
    <a
      href={sponsor.ctaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="hover:border-primary h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between">
            <Badge variant="secondary" className="text-xs">
              Sponsored
            </Badge>
          </div>

          {sponsor.imageUrl && (
            <div className="bg-secondary/50 flex items-center justify-center rounded-lg p-4">
              <img
                src={sponsor.imageUrl}
                alt={`${sponsor.title} logo`}
                className="max-h-16 max-w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <CardTitle className="group-hover:text-primary text-lg transition-colors">
            {sponsor.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {sponsor.description}
          </p>

          <div className="text-primary flex items-center gap-2 text-sm font-medium">
            <span>{sponsor.ctaText}</span>
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
