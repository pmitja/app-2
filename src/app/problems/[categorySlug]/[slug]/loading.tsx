import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Back Button Skeleton */}
      <Skeleton className="mb-4 h-9 w-32" />

      {/* Hero Section */}
      <div className="space-y-4 pb-6">
        <div className="flex flex-wrap items-start gap-4">
          <Skeleton className="h-12 flex-1 lg:h-14" />
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Author info with Avatar */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <Skeleton className="h-full w-full rounded-full" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-3 w-32" />
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Content Column */}
        <div className="space-y-6 lg:col-span-8">
          {/* Problem Description */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>

          {/* Solutions section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
                <Skeleton className="h-9 w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Featured Solution Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <div className="flex flex-row items-center gap-3 rounded-lg border-2 p-3">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>

              {/* Other Solutions Grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2 rounded-lg border p-3">
                    <Skeleton className="mx-auto h-12 w-12 rounded-lg" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="mx-auto h-3 w-2/3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Discussion section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Comment form skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-24 w-full rounded-md" />
                  <Skeleton className="h-10 w-32" />
                </div>

                {/* Comment items skeleton */}
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6 lg:col-span-4">
          <div className="sticky top-4 space-y-6">
            {/* Action Buttons Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            {/* Problem Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Problem Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pain Level */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>

                <Separator />

                {/* Frequency */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>

                {/* Would Pay */}
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              </CardContent>
            </Card>

            {/* Developer Status Accordion */}
            <details className="group bg-card rounded-lg border shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 text-sm font-semibold marker:content-none">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-4" />
              </summary>
              <div className="border-t px-4 py-4">
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
