import { Badge } from "@/components/ui/badge";
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
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Hero Section Skeleton */}
        <div className="space-y-4 text-center">
          <Badge variant="secondary" className="mb-2">
            Sponsorship Opportunities
          </Badge>
          <Skeleton className="mx-auto h-10 w-3/4" />
          <Skeleton className="mx-auto h-5 w-full max-w-2xl" />
          <Skeleton className="mx-auto h-5 w-2/3" />
        </div>

        {/* Availability Card Skeleton */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Current Month */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>

              {/* Next Month */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>

            <Skeleton className="h-5 w-72" />
          </CardContent>
        </Card>

        {/* Pricing Card Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Lock in your spot</CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-3/4" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>

            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>

            <Skeleton className="h-11 w-full" />
          </CardContent>
        </Card>

        {/* Current Sponsors Grid Skeleton */}
        <div className="space-y-4">
          <div className="text-center">
            <Skeleton className="mx-auto h-8 w-48" />
            <Skeleton className="mx-auto mt-2 h-4 w-64" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">
                      Sponsored
                    </Badge>
                  </div>

                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>

                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-2 h-5 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-3/4" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
