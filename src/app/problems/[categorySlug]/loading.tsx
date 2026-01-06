import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <div className="space-y-8">
      {/* Main Heading Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-6 w-full max-w-3xl" />
        <Skeleton className="h-6 w-3/4 max-w-3xl" />
      </div>

      {/* Search Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
      </div>

      {/* Problems List Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}

