"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";

import { AuthControls } from "@/components/auth-controls";
import { cn } from "@/lib/utils";

interface HeaderBarProps {
  session: Session | null;
}

export function HeaderBar({ session }: HeaderBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only show when at the very top
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="font-mono text-lg font-bold">
          ProblemHub
        </Link>

        <nav className="flex flex-1 items-center gap-4">
          {session?.user && (
            <Link
              href="/followed"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Following
            </Link>
          )}
          <Link
            href="/sponsors"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Advertise
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <AuthControls session={session} />
        </div>
      </div>
    </header>
  );
}
