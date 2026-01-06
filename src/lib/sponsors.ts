export type SponsorPlacement =
  | "RAIL_LEFT"
  | "RAIL_RIGHT"
  | "TOP_BAR"
  | "BOTTOM_BAR"
  | "MOBILE_STACK"
  | "MOBILE_CAROUSEL_TOP"
  | "MOBILE_CAROUSEL_BOTTOM";

export type SponsorVariant =
  | "blue"
  | "purple"
  | "green"
  | "red"
  | "slate"
  | "amber";

export type Sponsor = {
  id: string;
  name: string;
  tagline: string;
  href: string;
  logo?: string; // emoji or short text fallback
  backgroundImageUrl?: string; // optional background image for premium cards
  variant: SponsorVariant;
  placement: SponsorPlacement[];
  priority: number;
  active: boolean;
};

export const ENABLE_SPONSOR_BARS = false;

export function parsePlacements(dbPlacements: string | null): SponsorPlacement[] {
  if (!dbPlacements) return ["RAIL_LEFT"];

  const parts = dbPlacements
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean) as string[];

  const valid: SponsorPlacement[] = [];

  for (const part of parts) {
    if (
      part === "RAIL_LEFT" ||
      part === "RAIL_RIGHT" ||
      part === "TOP_BAR" ||
      part === "BOTTOM_BAR" ||
      part === "MOBILE_STACK" ||
      part === "MOBILE_CAROUSEL_TOP" ||
      part === "MOBILE_CAROUSEL_BOTTOM"
    ) {
      valid.push(part);
    }
  }

  // Always ensure at least one placement so the sponsor can render somewhere
  return valid.length > 0 ? valid : ["RAIL_LEFT"];
}

export function mapSponsorSlotToSponsor(row: {
  id: string;
  title: string;
  description: string;
  ctaUrl: string;
  ctaText?: string | null;
  logo: string | null;
  imageUrl?: string | null;
  backgroundImageUrl?: string | null;
  variant: string;
  placements: string;
  priority: number | null;
  status: string;
  month: string;
}): Sponsor {
  // Use imageUrl if provided, otherwise fall back to logo
  // imageUrl is typically a full URL, logo might be emoji or short text
  const logoValue = row.imageUrl ?? row.logo ?? undefined;

  return {
    id: row.id,
    name: row.title,
    tagline: row.description,
    href: row.ctaUrl,
    logo: logoValue,
    backgroundImageUrl: row.backgroundImageUrl ?? undefined,
    variant: (row.variant as SponsorVariant) || "blue",
    placement: parsePlacements(row.placements ?? undefined),
    priority: row.priority ?? 0,
    active: row.status === "active",
  };
}

export type SponsorsByPlacement = Record<SponsorPlacement, Sponsor[]>;

export function getSponsorsByPlacement(
  sponsors: Sponsor[],
  placement: SponsorPlacement,
): Sponsor[] {
  // For mobile carousels, always use desktop rail sponsors to ensure consistency
  // Mobile should show the same sponsors as desktop
  if (placement === "MOBILE_CAROUSEL_TOP" || placement === "MOBILE_CAROUSEL_BOTTOM") {
    return sponsors
      .filter((s) => s.active && (s.placement.includes("RAIL_LEFT") || s.placement.includes("RAIL_RIGHT")))
      .sort((a, b) => a.priority - b.priority);
  }

  // For other placements, use exact matches
  return sponsors
    .filter((s) => s.active && s.placement.includes(placement))
    .sort((a, b) => a.priority - b.priority);
}
