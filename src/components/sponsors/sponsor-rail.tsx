"use client";

import { useEffect, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { Sponsor, SponsorPlacement } from "@/lib/sponsors";
import { getSponsorsByPlacement } from "@/lib/sponsors";

import { FlippableSponsorCard } from "./flippable-sponsor-card";
import { useSponsors } from "./sponsors-provider";

type SponsorData = { sponsor: Sponsor; backgroundImageUrl?: string };

// CardData stores both front and back sponsors for each card slot
type CardData = {
  frontSponsor: SponsorData;
  backSponsor: SponsorData | null;
};

interface SponsorRailProps {
  placement: Extract<SponsorPlacement, "RAIL_LEFT" | "RAIL_RIGHT">;
  maxSponsors?: number;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get a random sponsor from pool that's not in the current set
function getRandomSponsor(
  pool: SponsorData[],
  excludeIds: string[],
): SponsorData | null {
  const available = pool.filter((s) => !excludeIds.includes(s.sponsor.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function SponsorRail({ placement, maxSponsors = 6 }: SponsorRailProps) {
  const { sponsors, isLoading } = useSponsors();
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [cardSponsors, setCardSponsors] = useState<CardData[]>([]);

  // Get all available sponsors for this placement
  const sponsorPool = useMemo(() => {
    if (isLoading) return [];
    const byPlacement = getSponsorsByPlacement(sponsors, placement);
    console.log(`[SponsorRail ${placement}] Total sponsors:`, sponsors.length);
    console.log(
      `[SponsorRail ${placement}] Filtered sponsors:`,
      byPlacement.length,
    );
    console.log(
      `[SponsorRail ${placement}] Sponsor placements:`,
      sponsors.map((s) => ({ name: s.name, placements: s.placement })),
    );
    return shuffleArray(byPlacement).map((sponsor) => ({
      sponsor,
      backgroundImageUrl: sponsor.backgroundImageUrl,
    }));
  }, [sponsors, placement, isLoading]);

  // Initialize card sponsors randomly - always show exactly 6 cards
  // Each card gets both a front and back sponsor pre-assigned
  useEffect(() => {
    if (sponsorPool.length === 0) return;

    const initialCards: CardData[] = [];
    const usedFrontIds: string[] = [];

    // Assign front sponsors first
    for (let i = 0; i < maxSponsors; i++) {
      const frontSponsor = sponsorPool[i % sponsorPool.length];
      usedFrontIds.push(frontSponsor.sponsor.id);
      initialCards.push({
        frontSponsor,
        backSponsor: null, // Will be assigned below
      });
    }

    // Assign back sponsors (different from front and from other displayed cards if possible)
    for (let i = 0; i < initialCards.length; i++) {
      const currentFrontId = initialCards[i].frontSponsor.sponsor.id;
      const excludeIds = [...usedFrontIds];
      const backSponsor = getRandomSponsor(sponsorPool, excludeIds);

      // If no unique sponsor, try to find any different from this card's front
      if (!backSponsor && sponsorPool.length > 1) {
        const alternative = sponsorPool.find(
          (s) => s.sponsor.id !== currentFrontId,
        );
        initialCards[i].backSponsor = alternative || null;
      } else {
        initialCards[i].backSponsor = backSponsor;
      }
    }

    setCardSponsors(initialCards);
  }, [sponsorPool, maxSponsors]);

  // Auto-rotation timer
  useEffect(() => {
    if (sponsorPool.length === 0 || cardSponsors.length === 0) return;

    const interval = setInterval(() => {
      // Randomly select 1-2 cards to flip
      const numCardsToFlip = Math.random() < 0.5 ? 1 : 2;
      const cardIndices = Array.from(
        { length: cardSponsors.length },
        (_, i) => i,
      );
      shuffleArray(cardIndices);

      const cardsToFlip = new Set<number>();
      for (let i = 0; i < Math.min(numCardsToFlip, cardIndices.length); i++) {
        cardsToFlip.add(cardIndices[i]);
      }

      // Update flipped state immediately to trigger animation
      setFlippedCards((prev) => {
        const newSet = new Set(prev);
        cardsToFlip.forEach((idx) => {
          if (newSet.has(idx)) {
            newSet.delete(idx);
          } else {
            newSet.add(idx);
          }
        });
        return newSet;
      });

      // After flip animation completes (700ms), swap front/back and assign new back sponsors
      setTimeout(() => {
        setCardSponsors((prev) => {
          // Calculate which IDs will be visible after the swap (for exclusion)
          const newCards = prev.map((cardData, idx) => {
            if (!cardsToFlip.has(idx)) {
              // Non-flipped cards stay exactly the same
              return cardData;
            }

            // For flipped cards: swap front and back, then assign a new back
            const newFront = cardData.backSponsor || cardData.frontSponsor;
            return {
              frontSponsor: newFront,
              backSponsor: cardData.frontSponsor, // Old front becomes temporary back
            };
          });

          // Now assign new back sponsors for the flipped cards only
          // Collect all front sponsor IDs that will be displayed
          const allDisplayedIds = newCards.map((c) => c.frontSponsor.sponsor.id);

          return newCards.map((cardData, idx) => {
            if (!cardsToFlip.has(idx)) {
              return cardData;
            }

            // Get a new back sponsor that's different from this card's front and other displayed fronts
            const excludeIds = [cardData.frontSponsor.sponsor.id, ...allDisplayedIds];
            const newBackSponsor = getRandomSponsor(sponsorPool, excludeIds);

            // If no unique sponsor available, find any different from this card's front
            if (!newBackSponsor && sponsorPool.length > 1) {
              const alternative = sponsorPool.find(
                (s) => s.sponsor.id !== cardData.frontSponsor.sponsor.id,
              );
              return {
                ...cardData,
                backSponsor: alternative || null,
              };
            }

            return {
              ...cardData,
              backSponsor: newBackSponsor,
            };
          });
        });
      }, 700); // Match animation duration
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, [sponsorPool, cardSponsors.length]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-3">
        {Array.from({ length: maxSponsors }).map((_, idx) => (
          <div
            key={idx}
            className="bg-card flex min-h-0 flex-1 flex-col justify-between rounded-lg border p-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (cardSponsors.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {cardSponsors.map((cardData, idx) => {
        const isFlipped = flippedCards.has(idx);

        return (
          <FlippableSponsorCard
            key={`card-${idx}`}
            frontSponsor={cardData.frontSponsor.sponsor}
            backSponsor={cardData.backSponsor?.sponsor}
            isFlipped={isFlipped}
            className="min-h-0 flex-1"
          />
        );
      })}
    </div>
  );
}
