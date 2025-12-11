"use client";

import { ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

import { setDeveloperStatus } from "@/actions/problem-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeveloperStatusFormProps {
  problemId: string;
  currentStatus?: "exploring" | "building" | null;
  currentSolutionUrl?: string | null;
  isAuthenticated: boolean;
  isDeveloper: boolean;
  withCard?: boolean;
}

export function DeveloperStatusForm({
  problemId,
  currentStatus,
  currentSolutionUrl,
  isAuthenticated,
  isDeveloper,
  withCard = true,
}: DeveloperStatusFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<
    "exploring" | "building" | null
  >(currentStatus || null);
  const [solutionUrl, setSolutionUrl] = useState(currentSolutionUrl || "");
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: "exploring" | "building") => {
    if (!isAuthenticated) {
      toast.error("Please sign in to set developer status");
      return;
    }

    if (!isDeveloper) {
      toast.error("You must be a developer to set status on problems");
      return;
    }

    startTransition(async () => {
      const result = await setDeveloperStatus(problemId, {
        status,
        solutionUrl: solutionUrl.trim() || "",
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        setSelectedStatus(status);
        toast.success(
          `Status updated to ${status === "exploring" ? "🔍 Exploring" : "🔨 Building"}`,
        );
      }
    });
  };

  const renderSection = (title: string, content: ReactNode) =>
    withCard ? (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    ) : (
      <div className="space-y-4">{content}</div>
    );

  if (!isAuthenticated) {
    return renderSection(
      "Developer Status",
      <p className="text-muted-foreground text-sm">
        Please sign in to set your developer status on this problem.
      </p>,
    );
  }

  if (!isDeveloper) {
    return renderSection(
      "Developer Status",
      <p className="text-muted-foreground text-sm">
        Want to work on solving this problem? Contact support to become a
        developer and gain access to developer features.
      </p>,
    );
  }

  return renderSection(
    "Set Your Developer Status",
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleStatusChange("exploring")}
          variant={selectedStatus === "exploring" ? "default" : "outline"}
          disabled={isPending}
          className="flex items-center gap-2"
        >
          🔍 Exploring
        </Button>
        <Button
          onClick={() => handleStatusChange("building")}
          variant={selectedStatus === "building" ? "default" : "outline"}
          disabled={isPending}
          className="flex items-center gap-2"
        >
          🔨 Building
        </Button>
      </div>

      {selectedStatus && (
        <div className="space-y-2">
          <Label htmlFor="solutionUrl">Solution URL (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="solutionUrl"
              type="url"
              value={solutionUrl}
              onChange={(e) => setSolutionUrl(e.target.value)}
              placeholder="https://github.com/username/solution"
              disabled={isPending}
            />
            <Button
              onClick={() => handleStatusChange(selectedStatus)}
              disabled={isPending}
              variant="secondary"
            >
              {isPending ? "Updating..." : "Update URL"}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Share a link to your solution, repository, or demo
          </p>
        </div>
      )}

      {selectedStatus && (
        <p className="text-muted-foreground text-sm">
          Current status:{" "}
          <span className="font-medium">
            {selectedStatus === "exploring" ? "🔍 Exploring" : "🔨 Building"}
          </span>
        </p>
      )}
    </div>,
  );
}
