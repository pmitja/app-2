"use client";

import { SponsorCardPremium } from "@/components/sponsors/sponsor-card-premium";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Sponsor, SponsorVariant } from "@/lib/sponsors";

export default function PremiumSponsorCardsPage() {
  const variants: SponsorVariant[] = [
    "blue",
    "purple",
    "green",
    "red",
    "slate",
    "amber",
  ];

  // Demo sponsors with background images for each variant
  const demoSponsors: (Sponsor & {
    backgroundImageUrl: string;
  })[] = variants.map((variant, index) => ({
    id: `demo-${variant}`,
    name: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Sponsor Event`,
    tagline:
      "Join us for an amazing experience with hands-on workshops and networking.",
    href: "https://example.com",
    logo: ["🎨", "🚀", "🌟", "💎", "⚡", "🔥"][index],
    backgroundImageUrl: `https://images.unsplash.com/photo-${
      [
        "1557682250-33bd709cbe85", // Blue - hands/work
        "1522071820-d9009002a87b", // Purple - creative
        "1542831371-29b0f74f9713", // Green - nature/outdoors
        "1511795409-b0f75e1dc8e4", // Red - community
        "1521737604-5630d10b7957", // Slate - tech/modern
        "1511795409-b0f75e1dc8e5", // Amber - warm/inviting
      ][index]
    }?w=800&h=1200&fit=crop`,
    variant,
    placement: ["RAIL_LEFT"],
    priority: index,
    active: true,
  }));

  // Test with and without background images
  const standardSponsor: Sponsor = {
    id: "demo-standard",
    name: "Standard Card (No Background)",
    tagline: "This is how a standard card looks without a background image.",
    href: "https://example.com",
    logo: "📦",
    variant: "blue",
    placement: ["RAIL_LEFT"],
    priority: 0,
    active: true,
  };

  return (
    <div className="container mx-auto space-y-8 py-10">
      <div>
        <h1 className="text-2xl font-bold">
          Premium Sponsor Cards – Variant Testing
        </h1>
        <p className="text-muted-foreground text-sm">
          Preview all color variants with background images and responsive
          design.
        </p>
      </div>

      <Separator />

      {/* All Variants Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">All Color Variants (6 Cards)</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {demoSponsors.map((sponsor) => (
            <div key={sponsor.id}>
              <SponsorCardPremium sponsor={sponsor} />
              <p className="text-muted-foreground mt-2 text-xs">
                Variant: <span className="font-medium">{sponsor.variant}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Responsive Testing */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Responsive Preview</h2>
        <p className="text-muted-foreground text-sm">
          Cards automatically adapt to different screen sizes
        </p>
        <div className="grid gap-6">
          {/* Mobile view simulation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Mobile (Full Width)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm">
                <SponsorCardPremium sponsor={demoSponsors[0]} />
              </div>
            </CardContent>
          </Card>

          {/* Desktop view simulation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Desktop (Grid Layout)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {demoSponsors.slice(0, 3).map((sponsor) => (
                  <SponsorCardPremium key={sponsor.id} sponsor={sponsor} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Dark Mode Testing */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Dark Mode Compatibility</h2>
        <p className="text-muted-foreground text-sm">
          Gradient overlays adjust automatically for dark mode
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <SponsorCardPremium sponsor={demoSponsors[1]} />
          <SponsorCardPremium sponsor={demoSponsors[4]} />
        </div>
      </section>

      <Separator />

      {/* Edge Cases */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Edge Cases & Fallbacks</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Without background image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">No Background Image</CardTitle>
            </CardHeader>
            <CardContent>
              <SponsorCardPremium
                sponsor={{
                  ...standardSponsor,
                  backgroundImageUrl: undefined,
                }}
              />
            </CardContent>
          </Card>

          {/* With broken image URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Broken Image URL</CardTitle>
            </CardHeader>
            <CardContent>
              <SponsorCardPremium
                sponsor={{
                  ...demoSponsors[2],
                  backgroundImageUrl:
                    "https://invalid-url.example.com/image.jpg",
                }}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
