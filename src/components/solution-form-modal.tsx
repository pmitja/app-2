"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SolutionForm } from "@/components/solution-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SolutionFormModalProps {
  problemId: string;
  categorySlug: string;
  problemSlug: string;
  isAuthenticated: boolean;
  isDeveloper: boolean;
}

export function SolutionFormModal({
  problemId,
  categorySlug,
  problemSlug,
  isAuthenticated,
  isDeveloper,
}: SolutionFormModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  if (!isAuthenticated || !isDeveloper) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add solution</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Your Solution</DialogTitle>
            <DialogDescription>
              Share your solution with an engaging card that links to your
              product or service.
            </DialogDescription>
          </DialogHeader>
          <SolutionForm
            problemId={problemId}
            categorySlug={categorySlug}
            problemSlug={problemSlug}
            isAuthenticated={isAuthenticated}
            isDeveloper={isDeveloper}
            inModal={true}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
