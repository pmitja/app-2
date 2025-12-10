import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        {/* Success icon skeleton */}
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />

        {/* Title skeleton */}
        <div className="space-y-3">
          <Skeleton className="mx-auto h-9 w-64" />
          <Skeleton className="mx-auto h-5 w-96" />
          <Skeleton className="mx-auto h-5 w-80" />
        </div>

        {/* Details card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="mx-auto h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </CardContent>
        </Card>

        {/* Action buttons skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Skeleton className="h-10 w-full sm:w-40" />
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>
      </div>
    </div>
  );
}
