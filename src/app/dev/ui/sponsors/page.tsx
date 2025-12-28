"use client";

import { useState, useTransition } from "react";

import {
  getSponsorsForLayout,
  seedDemoSponsors,
} from "@/actions/sponsor-actions";
import { SponsorCard } from "@/components/sponsors/sponsor-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Sponsor } from "@/lib/sponsors";

export default function DevSponsorsPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  const handleSeed = () => {
    startTransition(async () => {
      setMessage(null);
      setError(null);
      const result = await seedDemoSponsors();
      if (!result.success) {
        setError(result.error ?? "Failed to seed sponsors");
      } else {
        setMessage(result.message ?? "Seeded demo sponsors");
        // Refresh sponsors list after seeding
        const sponsorsResult = await getSponsorsForLayout();
        if (sponsorsResult.success) {
          setSponsors(sponsorsResult.data);
        }
      }
    });
  };

  const handleLoadExisting = () => {
    startTransition(async () => {
      setMessage(null);
      setError(null);
      const sponsorsResult = await getSponsorsForLayout();
      if (!sponsorsResult.success) {
        setError(sponsorsResult.error ?? "Failed to load sponsors");
      } else {
        setSponsors(sponsorsResult.data);
        setMessage("Loaded current layout sponsors");
      }
    });
  };

  return (
    <div className="container mx-auto space-y-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sponsors Layout – Dev Debug</h1>
          <p className="text-muted-foreground text-sm">
            Seed demo sponsors and inspect what the global layout will render.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleLoadExisting}
            disabled={isPending}
          >
            Load current sponsors
          </Button>
          <Button onClick={handleSeed} disabled={isPending}>
            {isPending ? "Seeding..." : "Seed demo sponsors"}
          </Button>
        </div>
      </div>

      {message && (
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <Separator />

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sponsors.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-sm">No sponsors loaded yet</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Click &quot;Seed demo sponsors&quot; or &quot;Load current
              sponsors&quot; to preview layout data.
            </CardContent>
          </Card>
        ) : (
          sponsors.map((sponsor) => (
            <div key={sponsor.id}>
              <SponsorCard sponsor={sponsor} />
              <p className="text-muted-foreground mt-2 text-[11px]">
                Placements: {sponsor.placement.join(", ")} · Variant:{" "}
                {sponsor.variant} · Priority: {sponsor.priority}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
