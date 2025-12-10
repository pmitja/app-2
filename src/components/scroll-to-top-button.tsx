"use client";

import { useEffect, useState } from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed right-20 bottom-6 z-40 rounded-full shadow-lg transition-all duration-300",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-16 opacity-0",
      )}
      aria-label="Scroll to top"
    >
      <Icons.arrowUp className="size-5" />
    </Button>
  );
}
