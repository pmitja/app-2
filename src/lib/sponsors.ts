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
  logo: string | null;
  variant: string;
  placements: string;
  priority: number | null;
  status: string;
  month: string;
}): Sponsor {
  return {
    id: row.id,
    name: row.title,
    tagline: row.description,
    href: row.ctaUrl,
    logo: row.logo ?? undefined,
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
  return sponsors
    .filter((s) => s.active && s.placement.includes(placement))
    .sort((a, b) => a.priority - b.priority);
}
