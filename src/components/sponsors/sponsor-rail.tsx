"use client";

import { useEffect, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { Sponsor, SponsorPlacement } from "@/lib/sponsors";
import { getSponsorsByPlacement } from "@/lib/sponsors";
import { cn } from "@/lib/utils";

import { EmptySponsorCard } from "./empty-sponsor-card";
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
  showPromotionalCard?: boolean;
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

export function SponsorRail({
  placement,
  maxSponsors = 6,
  showPromotionalCard = false,
}: SponsorRailProps) {
  const { sponsors, isLoading } = useSponsors();
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [cardSponsors, setCardSponsors] = useState<CardData[]>([]);
  const [isNavVisible, setIsNavVisible] = useState(true);

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

  // Initialize card sponsors - show only as many cards as we have unique sponsors (up to maxSponsors)
  // Each card gets both a front and back sponsor pre-assigned
  useEffect(() => {
    if (sponsorPool.length === 0) return;

    const initialCards: CardData[] = [];
    const usedFrontIds: string[] = [];

    // Only show as many cards as we have unique sponsors (no duplicates)
    const cardCount = Math.min(maxSponsors, sponsorPool.length);
    for (let i = 0; i < cardCount; i++) {
      const frontSponsor = sponsorPool[i];
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

      // Calculate next state locally to use in timeout
      const nextFlippedState = new Set(flippedCards);
      cardsToFlip.forEach((idx) => {
        if (nextFlippedState.has(idx)) {
          nextFlippedState.delete(idx);
        } else {
          nextFlippedState.add(idx);
        }
      });

      // Update flipped state immediately to trigger animation
      setFlippedCards(nextFlippedState);

      // After flip animation completes (700ms), update the hidden side with a new sponsor
      setTimeout(() => {
        setCardSponsors((prev) => {
          // Calculate visible IDs based on the NEW flipped state (what the user sees now)
          const visibleIds = prev
            .map((card, idx) => {
              const isFlipped = nextFlippedState.has(idx);
              // If flipped (showing back), use back sponsor ID.
              // If back is null, SponsorCardPremium falls back to front, so use front ID.
              if (isFlipped) {
                return (
                  card.backSponsor?.sponsor.id || card.frontSponsor.sponsor.id
                );
              }
              return card.frontSponsor.sponsor.id;
            })
            .filter(Boolean) as string[];

          return prev.map((card, idx) => {
            if (!cardsToFlip.has(idx)) {
              return card;
            }

            const isNowFlipped = nextFlippedState.has(idx);
            const visibleSponsorId = isNowFlipped
              ? card.backSponsor?.sponsor.id || card.frontSponsor.sponsor.id
              : card.frontSponsor.sponsor.id;

            // We want a new sponsor for the HIDDEN side.
            // Exclude all currently visible IDs to avoid duplicates.
            const excludeIds = [...visibleIds];

            let newSponsor = getRandomSponsor(sponsorPool, excludeIds);

            // Fallback: if no unique sponsor available, find any different from visible
            if (!newSponsor && sponsorPool.length > 1) {
              newSponsor =
                sponsorPool.find((s) => s.sponsor.id !== visibleSponsorId) ||
                null;
            }

            if (isNowFlipped) {
              // We are currently showing the BACK. Update the FRONT (Hidden).
              return {
                ...card,
                frontSponsor: newSponsor || card.frontSponsor, // Keep old if no new one found (shouldn't happen with fallback)
              };
            } else {
              // We are currently showing the FRONT. Update the BACK (Hidden).
              return {
                ...card,
                backSponsor: newSponsor, // Can be null
              };
            }
          });
        });
      }, 700); // Match animation duration
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, [sponsorPool, cardSponsors.length, flippedCards]);

  // Track navigation visibility based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsNavVisible(window.scrollY < 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Calculate how many empty slots we have
  const emptyCardCount = Math.max(0, maxSponsors - cardSponsors.length);
  // Show promotional card if enabled and there are empty slots (including when there are 0 sponsors)
  const shouldShowPromotionalCard = showPromotionalCard && emptyCardCount > 0;

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-3",
        isNavVisible && "max-h-[calc(100svh-113px)]",
        !isNavVisible && "py-4",
      )}
    >
      {/* Render sponsor cards */}
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
      {/* Render ONE promotional card at the bottom if enabled */}
      {shouldShowPromotionalCard && (
        <EmptySponsorCard
          key="promotional"
          className="mt-auto h-auto flex-none"
        />
      )}
    </div>
  );
}
