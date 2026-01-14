import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-12">
      {/* Hero Section Skeleton */}
      <div className="mx-auto mt-4 text-center md:mt-0">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>

        {/* Main Headline */}
        <div className="mx-auto mb-6 max-w-3xl text-center">
          <Skeleton className="mx-auto h-12 w-full sm:h-14 md:h-16" />
        </div>

        {/* Subheadline */}
        <Skeleton className="mx-auto mb-8 h-6 w-full max-w-2xl" />
      </div>

      {/* Search Header Skeleton */}
      <div className="sticky top-[85px] z-11 space-y-5 lg:top-0">
        {/* Search and Sort Row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Bar */}
          <div className="border-input bg-background relative flex items-center rounded-full border px-6 py-3 shadow-sm lg:flex-1">
            <Skeleton className="mr-3 h-5 w-5 rounded" />
            <Skeleton className="h-5 flex-1" />
          </div>

          {/* Sort and Submit Row */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Category Pills Row */}
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Problem Cards Skeleton - Matching ProblemsList structure */}
      <div className="flex flex-col space-y-3">
        {[...Array(5)].map((_, i) => (
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
