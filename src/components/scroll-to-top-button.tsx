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

  if (!isVisible) return null;

  return (
    <div className="sticky bottom-6 z-40 flex justify-end pb-4 pt-8">
      <Button
        onClick={scrollToTop}
        size="icon"
        className="rounded-full shadow-lg"
        aria-label="Scroll to top"
      >
        <Icons.arrowUp className="size-5" />
      </Button>
    </div>
  );
}
