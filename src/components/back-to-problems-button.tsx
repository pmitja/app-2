"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function BackToProblemsButton() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  // Construct the back URL with preserved filters
  const backUrl = from ? `/?${from}` : "/";

  return (
    <Button variant="ghost" size="sm" asChild className="mb-4">
      <Link href={backUrl}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Problems
      </Link>
    </Button>
  );
}
