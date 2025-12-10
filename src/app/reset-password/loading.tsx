import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-9 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>

      {/* Form card skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Confirm password field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Password strength indicator */}
          <Skeleton className="h-2 w-full rounded-full" />

          {/* Submit button */}
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Help text skeleton */}
      <Skeleton className="mx-auto h-4 w-48" />
    </div>
  );
}
