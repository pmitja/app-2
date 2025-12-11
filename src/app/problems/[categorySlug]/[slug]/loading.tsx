import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <Skeleton className="h-9 min-w-[200px] flex-1" />
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <Separator />

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Problem details card */}
      <Card>
        <CardHeader>
          <CardTitle>Problem Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
        </CardContent>
      </Card>

      {/* Developer status form skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Solutions section skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Solution form skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Solution cards skeleton */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discussion section skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comment form skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Comment items skeleton */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
