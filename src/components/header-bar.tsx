"use client";

import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthControls } from "@/components/auth-controls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderBarProps {
  session: Session | null;
}

export function HeaderBar({ session }: HeaderBarProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

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
        "bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Left: Logo */}
        <div className="flex flex-1 justify-start">
          <Link
            href="/"
            className="flex items-center gap-4 overflow-hidden font-mono text-lg font-bold"
          >
            <Image
              src="/problem-dock__logo.webp"
              alt="Problem Dock logo"
              width={48}
              height={48}
              className="max-h-[64px] rounded-xl object-contain text-black dark:text-white"
            />
            <span className="text-black dark:text-white">
              Problem <span className="text-primary">Dock</span>
            </span>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden items-center justify-center gap-2 md:flex">
          <Button
            variant={isActive("/") ? "secondary" : "ghost"}
            className="rounded-full"
            asChild
          >
            <Link href="/">Home</Link>
          </Button>
          {session?.user && (
            <Button
              variant={isActive("/followed") ? "secondary" : "ghost"}
              className="rounded-full"
              asChild
            >
              <Link href="/followed">Following</Link>
            </Button>
          )}
          <Button
            variant={isActive("/sponsors") ? "secondary" : "ghost"}
            className="rounded-full"
            asChild
          >
            <Link href="/sponsors">Advertise</Link>
          </Button>
        </nav>

        {/* Right: Auth Controls */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <AuthControls session={session} />
        </div>
      </div>
    </header>
  );
}
