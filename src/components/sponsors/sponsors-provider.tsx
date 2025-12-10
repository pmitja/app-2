"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { getSponsorsForLayout } from "@/actions/sponsor-actions";
import type { Sponsor } from "@/lib/sponsors";

interface SponsorsContextValue {
  sponsors: Sponsor[];
  isLoading: boolean;
  error: string | null;
}

const SponsorsContext = createContext<SponsorsContextValue | undefined>(
  undefined,
);

// Mock sponsors for dev/demo when DB is empty
const MOCK_SPONSORS: Sponsor[] = [
  {
    id: "mock-1",
    name: "Ship faster with DebugBear",
    tagline: "Monitor performance & core web vitals for your SaaS.",
    href: "https://debugbear.com",
    logo: "🪲",
    variant: "blue",
    placement: ["RAIL_LEFT", "RAIL_RIGHT", "MOBILE_CAROUSEL_TOP"],
    priority: 0,
    active: true,
  },
  {
    id: "mock-2",
    name: "SavvyCal – Friendly scheduling",
    tagline: "Make scheduling meetings painless for both sides.",
    href: "https://savvycal.com",
    logo: "📆",
    variant: "purple",
    placement: ["RAIL_LEFT", "MOBILE_CAROUSEL_BOTTOM"],
    priority: 1,
    active: true,
  },
  {
    id: "mock-3",
    name: "Fathom Analytics",
    tagline: "Simple, privacy-first analytics for indie SaaS.",
    href: "https://usefathom.com",
    logo: "📈",
    variant: "green",
    placement: ["RAIL_RIGHT", "MOBILE_CAROUSEL_TOP"],
    priority: 2,
    active: true,
  },
  {
    id: "mock-4",
    name: "Postmark by ActiveCampaign",
    tagline: "Fast, reliable transactional email for apps.",
    href: "https://postmarkapp.com",
    logo: "✉️",
    variant: "amber",
    placement: ["RAIL_LEFT", "MOBILE_CAROUSEL_BOTTOM"],
    priority: 3,
    active: true,
  },
  {
    id: "mock-5",
    name: "Plausible Analytics",
    tagline: "Simple, open-source, lightweight analytics.",
    href: "https://plausible.io",
    logo: "📊",
    variant: "slate",
    placement: ["RAIL_RIGHT", "MOBILE_CAROUSEL_TOP"],
    priority: 4,
    active: true,
  },
  {
    id: "mock-6",
    name: "Cal.com – Open Scheduling",
    tagline: "Open source Calendly alternative for teams.",
    href: "https://cal.com",
    logo: "📅",
    variant: "blue",
    placement: ["RAIL_LEFT", "MOBILE_CAROUSEL_BOTTOM"],
    priority: 5,
    active: true,
  },
  {
    id: "mock-7",
    name: "Linear – Issue tracking",
    tagline: "The issue tracker you'll actually enjoy using.",
    href: "https://linear.app",
    logo: "⚡",
    variant: "purple",
    placement: ["RAIL_RIGHT", "MOBILE_CAROUSEL_TOP"],
    priority: 6,
    active: true,
  },
  {
    id: "mock-8",
    name: "Raycast – Productivity tool",
    tagline: "Blazingly fast, extendable launcher for Mac.",
    href: "https://raycast.com",
    logo: "🚀",
    variant: "red",
    placement: ["MOBILE_CAROUSEL_BOTTOM"],
    priority: 7,
    active: true,
  },
];

interface SponsorsProviderProps {
  children: React.ReactNode;
}

export function SponsorsProvider({ children }: SponsorsProviderProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getSponsorsForLayout();
        if (isMounted) {
          // TEMPORARY: Always use mock sponsors until DB is updated with carousel placements
          // TODO: Remove this and use DB sponsors after clearing old data
          console.log(
            "[SponsorsProvider] FORCED: Using mock sponsors:",
            MOCK_SPONSORS.length,
          );
          console.log(
            "[SponsorsProvider] Mock sponsor placements:",
            MOCK_SPONSORS.map((s) => ({
              name: s.name,
              placement: s.placement,
            })),
          );
          setSponsors(MOCK_SPONSORS);
        }
      } catch (err) {
        if (isMounted) {
          // Use mock sponsors on error
          console.log(
            "[SponsorsProvider] Error loading sponsors, using mock data",
          );
          console.log(
            "[SponsorsProvider] Mock sponsors count:",
            MOCK_SPONSORS.length,
          );
          setSponsors(MOCK_SPONSORS);
          setError(
            err instanceof Error ? err.message : "Failed to load sponsors",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SponsorsContext.Provider value={{ sponsors, isLoading, error }}>
      {children}
    </SponsorsContext.Provider>
  );
}

export function useSponsors() {
  const ctx = useContext(SponsorsContext);
  if (!ctx) {
    throw new Error("useSponsors must be used within a SponsorsProvider");
  }
  return ctx;
}
