import {
  ArrowRight,
  Calendar,
  Check,
  HelpCircle,
  MousePointerClick,
  RotateCw,
  Target,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sponsor Problem Dock",
  description:
    "Get your startup in front of developers actively seeking validated problems to solve.",
  alternates: {
    canonical: `${siteConfig.url}/sponsors`,
  },
  openGraph: {
    title: "Sponsor Problem Dock",
    description:
      "Get your startup in front of developers actively seeking validated problems to solve.",
    url: `${siteConfig.url}/sponsors`,
    siteName: siteConfig.title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsor Problem Dock",
    description:
      "Get your startup in front of developers actively seeking validated problems to solve.",
  },
};

export default async function SponsorsPage() {
  const [availabilityResult, sponsorsResult] = await Promise.all([
    getSponsorAvailability(),
    getActiveSponsors(),
  ]);

  if (!availabilityResult.success || !availabilityResult.data) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">
          Error loading sponsor information. Please try again later.
        </p>
      </div>
    );
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

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const benefits = [
    {
      icon: Target,
      title: "Targeted Audience",
      description:
        "Reach developers and founders who are actively researching problems to build solutions for.",
    },
    {
      icon: RotateCw,
      title: "Fair Visibility",
      description:
        "Sponsors rotate every 10 seconds on desktop sidebars and mobile banners, ensuring equal exposure.",
    },
    {
      icon: Calendar,
      title: "Monthly Duration",
      description:
        "Your sponsorship runs from the 1st to the last day of the month, giving you consistent presence.",
    },
  ];

  const faqs = [
    {
      q: "How does the rotation work?",
      a: "Your ad rotates with other sponsors every 10 seconds. This ensures every sponsor gets equal visibility on every page view, regardless of when a user visits.",
    },
    {
      q: "When does my sponsorship start?",
      a: "Sponsorships are monthly. If you book for next month, your ad will start appearing automatically on the 1st.",
    },
    {
      q: "What can I include in my ad?",
      a: "You get a title, a short description (up to 100 characters), a call-to-action button, and your logo. Simple and effective.",
    },
    {
      q: "Can I change my ad later?",
      a: "Yes, just reach out to support and we can update your ad copy or creative assets.",
    },
  ];

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
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Get your startup in front of{" "}
            <span className="text-primary">active builders</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-xl leading-relaxed">
            Connect with developers and founders who are researching validated
            problems and building the next generation of products.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-card flex flex-col items-center rounded-2xl border p-6 text-center shadow-sm transition-all hover:shadow-md"
            >
              <div className="bg-primary/10 text-primary mb-4 rounded-xl p-3">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing & Availability Section */}
        <div className="grid items-start gap-8 lg:grid-cols-5">
          {/* Availability Status */}
          <div className="space-y-6 lg:col-span-2">
            <h2 className="text-2xl font-bold">Availability Status</h2>
            <Card className="overflow-hidden border-2">
              <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{formatMonth(nextMonth)}</span>
                  <Badge variant={nextMonthAvailable ? "default" : "secondary"}>
                    {nextMonthAvailable ? "Open" : "Full"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Sponsorship slots for next month
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{nextCount} spots filled</span>
                    <span className="text-muted-foreground">
                      {maxSponsors} total spots
                    </span>
                  </div>
                  <div className="bg-secondary h-3 w-full overflow-hidden rounded-full">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        nextCount >= maxSponsors ? "bg-red-500" : "bg-primary",
                      )}
                      style={{ width: `${(nextCount / maxSponsors) * 100}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground pt-2 text-sm">
                    {nextMonthAvailable
                      ? "Secure your spot now before they run out."
                      : "All spots for this month have been booked. Check back later for future openings."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Pro Tip</h3>
                  <p className="text-muted-foreground text-xs">
                    High visibility for early adopters
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Problem Dock is growing fast. Locking in your price now ensures
                you keep this rate even as our traffic grows.
              </p>
            </div>
          </div>

          {/* Pricing Card */}
          <Card className="border-primary/20 relative overflow-hidden shadow-lg lg:col-span-3">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <MousePointerClick className="h-32 w-32" />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold">
                Monthly Sponsorship
              </CardTitle>
              <CardDescription className="text-lg">
                Simple, flat pricing. No hidden fees.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold tracking-tight">
                  $99
                </span>
                <span className="text-muted-foreground text-xl font-medium">
                  /month
                </span>
              </div>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  "Rotating sidebar display",
                  "Mobile banner placement",
                  "Traffic from active builders",
                  "SEO-friendly backlink",
                  "Cancel anytime",
                  "Analytics included (via own link)",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="pt-6 pb-8">
              {nextMonthAvailable ? (
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full text-lg shadow-md transition-all hover:shadow-lg"
                >
                  <Link href="/sponsors/checkout">
                    Lock Your Spot for {formatMonth(nextMonth)}{" "}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button disabled size="lg" className="h-12 w-full text-lg">
                  Sold Out for {formatMonth(nextMonth)}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Current Sponsors Section */}
        {currentSponsors.length > 0 && (
          <div className="space-y-8 pt-8">
            <div className="flex flex-col items-center space-y-2 text-center">
              <h2 className="text-3xl font-bold">Current Sponsors</h2>
              <p className="text-muted-foreground">
                Forward-thinking companies supporting our community in{" "}
                {formatMonth(currentMonth)}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {currentSponsors.map((sponsor) => (
                <SponsorShowcaseCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mx-auto max-w-3xl space-y-8 pt-8">
          <div className="text-center">
            <h2 className="flex items-center justify-center gap-2 text-2xl font-bold">
              <HelpCircle className="text-muted-foreground h-6 w-6" />
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid gap-6">
            {faqs.map((faq, i) => (
              <Card key={i} className="bg-muted/30 border-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
