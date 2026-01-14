"use client";

import { useTheme } from "next-themes";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      size="icon"
      variant="ghost"
      className="h-10 w-10 rounded-full"
      aria-label="Toggle theme"
    >
      <Icons.sun className="dark:hidden size-5" />
      <Icons.moon className="hidden dark:block size-5" />
    </Button>
  );
};
