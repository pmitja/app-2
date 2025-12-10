"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleDeveloperRole } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeveloperRoleToggleProps {
  currentRole: string;
}

export function DeveloperRoleToggle({ currentRole }: DeveloperRoleToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);
  const router = useRouter();
  const isDeveloper = currentRole === "developer";

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleDeveloperRole();

      if (result.error) {
        toast.error(result.error);
      } else {
        const newRole = result.newRole;
        toast.success(
          `Role updated to ${newRole === "developer" ? "Developer" : "User"}!`,
        );
        setShowRefreshMessage(true);
      }
    });
  };

  const handleRefresh = () => {
    router.refresh();
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm">
            {isDeveloper
              ? "You currently have developer access to the platform."
              : "Become a developer to unlock additional features."}
          </p>

          {!isDeveloper && (
            <div className="text-muted-foreground space-y-2 text-sm">
              <p className="font-medium">Developer benefits:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Set your status on problems (Exploring or Building)</li>
                <li>Share solution URLs and get visibility</li>
                <li>Connect with users who need your expertise</li>
                <li>Build your reputation as a problem solver</li>
              </ul>
            </div>
          )}

          {showRefreshMessage && (
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
              <p className="text-sm font-medium">Role Updated!</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Please refresh the page to see your new role in effect.
              </p>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Refresh Page
              </Button>
            </div>
          )}

          {!showRefreshMessage && (
            <Button
              onClick={handleToggle}
              disabled={isPending}
              variant={isDeveloper ? "outline" : "default"}
            >
              {isPending
                ? "Updating..."
                : isDeveloper
                  ? "Switch to User Role"
                  : "Become a Developer"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
