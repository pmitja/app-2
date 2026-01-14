import { Bookmark } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <Bookmark className="h-8 w-8" />
          Followed Problems
        </h1>
        <p className="text-muted-foreground">
          Problems you&apos;re following to stay updated on new solutions and
          discussions.
        </p>
      </div>

      {/* Problem Cards Skeleton - Matching ProblemsList structure */}
      <div className="flex flex-col space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden p-0">
            <div className="flex items-stretch">
              {/* Main Content */}
              <CardContent className="flex-1 p-4">
                {/* Header: Avatar, Username, Timestamp, Like */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-6" />
                </div>

                {/* Content: Title and Description */}
                <div className="mb-3">
                  <Skeleton className="mb-1.5 h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-5/6" />
                </div>

                {/* Badges */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                {/* Footer: Separator + Actions */}
                <Separator className="mb-3" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>

              {/* Vote Sidebar */}
              <div className="bg-muted/30 flex w-16 flex-col items-center justify-center border-l">
                <Skeleton className="mb-1 h-6 w-6" />
                <Skeleton className="h-4 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
