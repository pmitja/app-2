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
          if (result.success && result.data) {
            console.log(
              "[SponsorsProvider] Loaded sponsors from database:",
              result.data.length,
            );
            console.log(
              "[SponsorsProvider] Sponsors with background images:",
              result.data.map((s) => ({
                name: s.name,
                backgroundImageUrl: s.backgroundImageUrl,
                hasBackground: !!s.backgroundImageUrl,
              })),
            );
            setSponsors(result.data);
          } else {
            console.warn(
              "[SponsorsProvider] No sponsors found or error:",
              result.error,
            );
            setSponsors([]);
            if (result.error) {
              setError(result.error);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("[SponsorsProvider] Error loading sponsors:", err);
          setSponsors([]);
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
