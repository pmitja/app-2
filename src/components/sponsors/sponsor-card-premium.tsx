"use client";

import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import type { Sponsor, SponsorVariant } from "@/lib/sponsors";
import { cn } from "@/lib/utils";

// Gradient overlay colors for each variant
const variantGradients: Record<SponsorVariant, string> = {
  blue: "from-blue-900/10 via-blue-800/30 to-blue-900/70",
  purple: "from-purple-900/10 via-purple-800/30 to-purple-900/70",
  green: "from-green-900/10 via-green-800/30 to-green-900/70",
  red: "from-red-900/10 via-red-800/30 to-red-900/70",
  slate: "from-slate-900/10 via-slate-800/30 to-slate-900/70",
  amber: "from-amber-900/10 via-amber-800/30 to-amber-900/70",
};

// Border accent colors for each variant
const variantBorders: Record<SponsorVariant, string> = {
  blue: "border-blue-400/30",
  purple: "border-purple-400/30",
  green: "border-green-400/30",
  red: "border-red-400/30",
  slate: "border-slate-400/30",
  amber: "border-amber-400/30",
};

interface SponsorCardPremiumProps {
  sponsor: Sponsor & { backgroundImageUrl?: string };
  backSponsor?: Sponsor & { backgroundImageUrl?: string };
  className?: string;
  isFlipped?: boolean;
}

export function SponsorCardPremium({
  sponsor,
  backSponsor,
  className,
  isFlipped = false,
}: SponsorCardPremiumProps) {
  // Use back sponsor if provided and flipped, otherwise use front sponsor
  const frontSponsor = sponsor;
  const displayBackSponsor = backSponsor || sponsor;
  const flipContainerRef = useRef<HTMLDivElement>(null);
  const frontContentRef = useRef<HTMLDivElement>(null);
  const backContentRef = useRef<HTMLDivElement>(null);

  // GSAP animation for flip with content fade
  useEffect(() => {
    if (!flipContainerRef.current) return;

    // Animate the flip
    gsap.to(flipContainerRef.current, {
      rotationY: isFlipped ? 180 : 0,
      duration: 0.7,
      ease: "power2.inOut",
    });

    // Fade out the content that's going away, fade in the content that's coming
    if (isFlipped) {
      // Flipping to back: fade out front, fade in back
      if (frontContentRef.current) {
        gsap.to(frontContentRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
        });
      }
      if (backContentRef.current) {
        gsap.fromTo(
          backContentRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, delay: 0.4, ease: "power2.out" },
        );
      }
    } else {
      // Flipping to front: fade out back, fade in front
      if (backContentRef.current) {
        gsap.to(backContentRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
        });
      }
      if (frontContentRef.current) {
        gsap.fromTo(
          frontContentRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, delay: 0.4, ease: "power2.out" },
        );
      }
    }
  }, [isFlipped]);

  return (
    <div
      className={cn("relative", className)}
      style={{ perspective: "1000px" }}
    >
      <div
        ref={flipContainerRef}
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front Face */}
        <CardFace sponsor={frontSponsor} isBack={false} contentRef={frontContentRef} />
        {/* Back Face */}
        <CardFace sponsor={displayBackSponsor} isBack={true} contentRef={backContentRef} />
      </div>
    </div>
  );
}

interface CardFaceProps {
  sponsor: Sponsor & { backgroundImageUrl?: string };
  isBack: boolean;
  contentRef?: React.RefObject<HTMLDivElement | null>;
}

function CardFace({ sponsor, isBack, contentRef }: CardFaceProps) {
  const { name, href, logo, variant, backgroundImageUrl } = sponsor;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group absolute inset-0 block overflow-hidden rounded-xl border-2 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
        variantBorders[variant],
        isBack && "rotate-y-180",
      )}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: isBack ? "rotateY(180deg)" : "rotateY(0deg)",
      }}
    >
      {/* Background Image */}
      {backgroundImageUrl ? (
        <img
          src={backgroundImageUrl}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="bg-muted absolute inset-0" />
      )}

      {/* Gradient Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b",
          variantGradients[variant],
        )}
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative flex h-full flex-col justify-between p-2 text-white sm:p-2.5 md:p-3"
      >
        {/* Header with Badge and Logo */}
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="secondary"
            className="bg-white/90 text-[9px] tracking-wider text-purple-600 uppercase backdrop-blur-sm"
          >
            Sponsored
          </Badge>
          {logo && (
            <span className="rounded-lg bg-white/90 px-1.5 py-0.5 text-sm backdrop-blur-sm sm:text-base">
              {logo}
            </span>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-1.5">
          {/* Title */}
          <h3 className="text-xs leading-tight font-bold text-white drop-shadow-lg sm:text-sm">
            {name}
          </h3>

          {/* Bottom Section */}
          <div className="space-y-1.5">
            {/* CTA */}
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-white drop-shadow-md sm:text-xs">
              <span className="underline-offset-2 group-hover:underline">
                Learn more
              </span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
