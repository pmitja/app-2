import { Bookmark } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bookmark className="h-8 w-8" />
          Followed Problems
        </h1>
        <p className="text-muted-foreground">
          Problems you&apos;re following to stay updated on new solutions and discussions.
        </p>
      </div>

      <div className="flex flex-col space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden p-0">
            <div className="flex items-stretch">
              <CardContent className="flex-1 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-3" />
                <div className="flex gap-2 mb-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-px w-full mb-3" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
              <div className="flex w-16 flex-col items-center justify-center border-l bg-muted/30">
                <Skeleton className="h-6 w-6 mb-1" />
                <Skeleton className="h-4 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

