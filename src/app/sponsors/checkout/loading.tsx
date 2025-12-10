import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Page header skeleton */}
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-9 w-64" />
          <Skeleton className="mx-auto h-4 w-96" />
        </div>

        <Separator />

        {/* Checkout form skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Sponsorship Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company name field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Description field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>

            {/* CTA fields */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Image URL field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Submit button */}
            <Skeleton className="h-11 w-full" />
          </CardContent>
        </Card>

        {/* Pricing summary skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Separator />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
