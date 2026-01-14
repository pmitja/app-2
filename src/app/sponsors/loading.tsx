import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container pt-10 pb-20">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-6 text-center">
          <Badge
            variant="secondary"
            className="rounded-full px-4 py-1.5 text-sm font-medium"
          >
            Sponsorship Opportunities
          </Badge>
          <Skeleton className="h-14 w-full max-w-3xl sm:h-16 md:h-20" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-card flex flex-col items-center rounded-2xl border p-6 text-center shadow-sm"
            >
              <Skeleton className="mb-4 h-12 w-12 rounded-xl" />
              <Skeleton className="mb-2 h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-5/6" />
            </div>
          ))}
        </div>

        {/* Pricing & Availability Section */}
        <div className="grid items-start gap-8 lg:grid-cols-5">
          {/* Availability Status */}
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-8 w-48" />
            <Card className="overflow-hidden border-2">
              <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-48" />
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full rounded-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Pro Tip Card */}
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </div>

          {/* Pricing Card */}
          <Card className="border-primary/20 relative overflow-hidden shadow-lg lg:col-span-3">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold">
                <Skeleton className="h-9 w-64" />
              </CardTitle>
              <CardDescription className="text-lg">
                <Skeleton className="h-5 w-48" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-baseline gap-1">
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="pt-6 pb-8">
              <Skeleton className="h-12 w-full text-lg" />
            </CardFooter>
          </Card>
        </div>

        {/* Current Sponsors Section */}
        <div className="space-y-8 pt-8">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
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

        {/* FAQ Section */}
        <div className="mx-auto max-w-3xl space-y-8 pt-8">
          <div className="text-center">
            <Skeleton className="mx-auto h-8 w-64" />
          </div>

          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Skeleton className="h-6 w-full" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
