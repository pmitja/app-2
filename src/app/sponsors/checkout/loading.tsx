import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-10 pb-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          {/* Back Button Skeleton */}
          <Skeleton className="mb-4 h-9 w-32" />

          {/* Page Header */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Form Section */}
          <div className="lg:col-span-7">
            <Card className="border-muted-foreground/20 shadow-sm">
              <CardHeader>
                <CardTitle>Sponsor Details</CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-64" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-20 w-full resize-none rounded-md" />
                  </div>

                  {/* CTA Text and URL */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>

                  {/* Image URL */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>

                  {/* Background Image URL */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>

                  {/* Submit Button */}
                  <Skeleton className="h-12 w-full text-lg" />

                  {/* Security Note */}
                  <div className="flex items-center justify-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div>
                <Skeleton className="mb-2 h-6 w-32" />
                <Skeleton className="mb-4 h-4 w-64" />
                <div className="mx-auto max-w-sm lg:mx-0">
                  <Card>
                    <CardHeader className="space-y-3 pb-4">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="text-xs">
                          Sponsored
                        </Badge>
                      </div>
                      <Skeleton className="h-16 w-full rounded-lg" />
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <ul className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
