import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Page header skeleton */}
        <div className="text-center">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto mt-2 h-4 w-64" />
        </div>

        {/* Form card skeleton */}
        <Card className="bg-card rounded-lg border p-6 shadow-sm">
          <div className="space-y-4">
            {/* Email display */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Confirm password field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Password strength indicator */}
            <Skeleton className="h-2 w-full rounded-full" />

            {/* Submit button */}
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Back link skeleton */}
          <Skeleton className="mx-auto mt-4 h-4 w-32" />
        </Card>
      </div>
    </div>
  );
}
