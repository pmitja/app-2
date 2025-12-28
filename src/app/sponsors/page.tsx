import Link from "next/link";

import {
  getActiveSponsors,
  getSponsorAvailability,
} from "@/actions/sponsor-actions";
import { SponsorShowcaseCard } from "@/components/sponsors/sponsor-showcase-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SponsorsPage() {
  const [availabilityResult, sponsorsResult] = await Promise.all([
    getSponsorAvailability(),
    getActiveSponsors(),
  ]);

  if (!availabilityResult.success || !availabilityResult.data) {
    return <div>Error loading sponsor information</div>;
  }

  const {
    currentMonth,
    currentCount,
    nextMonth,
    nextCount,
    maxSponsors,
    nextMonthAvailable,
  } = availabilityResult.data;

  const currentSponsors = sponsorsResult.success ? sponsorsResult.data : [];

  // Format month for display (e.g., "2025-01" -> "January 2025")
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4 text-center">
          <Badge variant="secondary" className="mb-2">
            Sponsorship Opportunities
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">
            Get Your Startup in Front of Developers
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Your startup appears in rotating sponsor slots on desktop sidebars
            and mobile banners across all pages. Sponsors rotate every 10
            seconds to ensure fair visibility.
          </p>
        </div>

        {/* Availability Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>
              Maximum spots: {maxSponsors} sponsors per month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Current Month */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {formatMonth(currentMonth)}
                  </span>
                  <Badge
                    variant={
                      currentCount >= maxSponsors ? "destructive" : "default"
                    }
                  >
                    {currentCount}/{maxSponsors} filled
                  </Badge>
                </div>
                <div className="bg-secondary h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${(currentCount / maxSponsors) * 100}%` }}
                  />
                </div>
              </div>

              {/* Next Month */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {formatMonth(nextMonth)}
                  </span>
                  <Badge
                    variant={
                      nextCount >= maxSponsors ? "destructive" : "default"
                    }
                  >
                    {nextCount}/{maxSponsors} filled
                  </Badge>
                </div>
                <div className="bg-secondary h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${(nextCount / maxSponsors) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {nextMonthAvailable ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Spots available for {formatMonth(nextMonth)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>All spots filled for {formatMonth(nextMonth)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card>
          <CardHeader>
            <CardTitle>Lock in your spot</CardTitle>
            <CardDescription>
              Pay a $99 one-time advance to lock your spot for{" "}
              {formatMonth(nextMonth)}. This advance is applied toward your
              monthly payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  Rotating display on all pages (desktop sidebars & mobile)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  10-second rotation for fair visibility across all sponsors
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Exposure to developers actively seeking solutions</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Monthly duration (1st to last day of month)</span>
              </li>
            </ul>

            {nextMonthAvailable ? (
              <Button asChild size="lg" className="w-full">
                <Link href="/sponsors/checkout">
                  Lock Your Spot for {formatMonth(nextMonth)}
                </Link>
              </Button>
            ) : (
              <Button disabled size="lg" className="w-full">
                All Spots Filled - Check Back Soon
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Current Sponsors Section */}
        {currentSponsors.length > 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Current Sponsors</h2>
              <p className="text-muted-foreground text-sm">
                {formatMonth(currentMonth)} - Supporting our community
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentSponsors.map((sponsor) => (
                <SponsorShowcaseCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">
                How does the rotation work?
              </h3>
              <p className="text-muted-foreground text-sm">
                Your ad will rotate with other sponsors every 10 seconds,
                ensuring equal visibility for all sponsors throughout the month.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">
                When does my sponsorship start?
              </h3>
              <p className="text-muted-foreground text-sm">
                Your sponsorship will be active from the 1st to the last day of
                the selected month.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">
                What content can I include?
              </h3>
              <p className="text-muted-foreground text-sm">
                You can include your startup name, a short description (up to
                100 characters), a call-to-action button, and an optional logo.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">
                Can I update my ad after payment?
              </h3>
              <p className="text-muted-foreground text-sm">
                Please contact support if you need to make changes to your ad
                content after payment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Advertise CTA at bottom */}
        <div className="text-muted-foreground flex items-center justify-center gap-2 pt-8 text-sm">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          </svg>
          <span>Advertise</span>
        </div>
      </div>
    </div>
  );
}
