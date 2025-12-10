"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Session } from "next-auth";
import { useState, useTransition } from "react";

import { AuthControls } from "@/components/auth-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderBarProps {
  session: Session | null;
}

export function HeaderBar({ session }: HeaderBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (searchQuery) {
        params.set("q", searchQuery);
      } else {
        params.delete("q");
      }
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="font-mono text-lg font-bold">
          ProblemHub
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          <Link
            href="/sponsors"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Sponsor
          </Link>
        </nav>

        <form onSubmit={handleSearch} className="max-w-md flex-1">
          <Input
            type="search"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            disabled={isPending}
          />
        </form>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/problems/new">Submit Problem</Link>
          </Button>
          <AuthControls session={session} />
        </div>
      </div>
    </header>
  );
}
