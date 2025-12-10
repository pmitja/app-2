"use client";

import { useEffect, useState } from "react";

import { AuthModal } from "@/components/auth-modal";
import { ProblemForm } from "@/components/problem-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category } from "@/lib/queries";

interface ProblemFormWrapperProps {
  categories: Category[];
  isAuthenticated: boolean;
}

export function ProblemFormWrapper({
  categories,
  isAuthenticated,
}: ProblemFormWrapperProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auto-open auth modal if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Submit a Problem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-4 py-8 text-center">
              <p className="text-lg">Please sign in to submit a problem</p>
              <p className="text-sm">
                You need to be authenticated to share problems with the
                community.
              </p>
            </div>
          </CardContent>
        </Card>

        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }

  return <ProblemForm categories={categories} />;
}
