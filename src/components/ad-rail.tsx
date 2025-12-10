"use client";

import { useEffect, useState } from "react";

import { getActiveSponsors } from "@/actions/sponsor-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MOCK_ADS = [
  {
    id: "1",
    title: "Premium Dev Tools",
    description: "Boost your productivity with our suite of developer tools",
    ctaText: "Learn More",
    ctaUrl: "/sponsors",
    imageUrl: null,
  },
  {
    id: "2",
    title: "Cloud Hosting",
    description: "Deploy your apps in seconds with our cloud platform",
    ctaText: "Get Started",
    ctaUrl: "/sponsors",
    imageUrl: null,
  },
  {
    id: "3",
    title: "API Services",
    description: "Integrate powerful APIs into your applications",
    ctaText: "View Docs",
    ctaUrl: "/sponsors",
    imageUrl: null,
  },
];

type Sponsor = {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string | null;
};

export function AdRail() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active sponsors
  useEffect(() => {
    const fetchSponsors = async () => {
      setIsLoading(true);
      const result = await getActiveSponsors();
      if (result.success && result.data && result.data.length > 0) {
        setSponsors(result.data);
      } else {
        // Fall back to mock ads if no sponsors
        setSponsors(MOCK_ADS);
      }
      setIsLoading(false);
    };
    fetchSponsors();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="space-y-2 pb-3">
              <div className="bg-secondary h-4 w-20 animate-pulse rounded" />
              <div className="bg-secondary h-5 w-3/4 animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-secondary h-12 animate-pulse rounded" />
              <div className="bg-secondary h-8 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sponsors.length === 0) {
    return null;
  }

  // Show max 3 sponsors
  const displaySponsors = sponsors.slice(0, 3);

  return (
    <div className="space-y-4">
      {displaySponsors.map((sponsor) => (
        <Card key={sponsor.id} className="overflow-hidden">
          <CardHeader className="space-y-2 pb-3">
            <div className="flex items-start justify-between">
              <Badge variant="secondary" className="text-xs">
                Sponsored
              </Badge>
            </div>
            <CardTitle className="text-sm">{sponsor.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sponsor.imageUrl && (
              <div className="bg-secondary flex items-center justify-center rounded p-2">
                <img
                  src={sponsor.imageUrl}
                  alt={`${sponsor.title} logo`}
                  className="max-h-12 max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
            <p className="text-muted-foreground text-xs">
              {sponsor.description}
            </p>
            <Button size="sm" variant="outline" className="w-full" asChild>
              <a
                href={sponsor.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sponsor.ctaText}
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
