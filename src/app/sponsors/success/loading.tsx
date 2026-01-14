import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        {/* Success icon skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton className="mx-auto h-9 w-64" />
          <Skeleton className="mx-auto h-5 w-96" />
        </div>

        {/* Details card skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
            <CardDescription>
              <Skeleton className="mx-auto h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 shrink-0">
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="flex-1">
                  <Skeleton className="mb-1 h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-5/6" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action buttons skeleton */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Skeleton className="h-10 w-full sm:w-40" />
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>

        {/* Help text skeleton */}
        <Skeleton className="mx-auto h-4 w-96" />
      </div>
    </div>
  );
}
