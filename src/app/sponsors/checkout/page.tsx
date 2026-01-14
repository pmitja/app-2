"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
  createSponsorCheckout,
  getSponsorAvailability,
} from "@/actions/sponsor-actions";
import { SponsorShowcaseCard } from "@/components/sponsors/sponsor-showcase-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Sponsor } from "@/lib/sponsors";
import { sponsorSlotSchema } from "@/lib/validation";

type SponsorFormData = z.infer<typeof sponsorSlotSchema>;

export default function SponsorCheckoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState<{
    nextMonth: string;
    nextCount: number;
    maxSponsors: number;
    nextMonthAvailable: boolean;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSlotSchema),
  });

  // Fetch availability on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      const result = await getSponsorAvailability();
      if (result.success && result.data) {
        setAvailability({
          nextMonth: result.data.nextMonth,
          nextCount: result.data.nextCount,
          maxSponsors: result.data.maxSponsors,
          nextMonthAvailable: result.data.nextMonthAvailable,
        });
      }
    };
    fetchAvailability();
  }, []);

  // Watch form values for preview
  const formValues = watch();

  // Format month for display
  const formatMonth = (monthStr: string) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const onSubmit = async (data: SponsorFormData) => {
    setIsLoading(true);
    try {
      const result = await createSponsorCheckout(data);

      if (result.success && result.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(result.error || "Failed to create checkout session");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  if (!availability) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading availability...</p>
        </div>
      </div>
    );
  }

  if (!availability.nextMonthAvailable) {
    return (
      <div className="container flex h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">All Spots Filled</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            All sponsor slots for {formatMonth(availability.nextMonth)} are
            currently filled. Please check back later.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/sponsors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sponsors
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 pb-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
            <Link href="/sponsors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sponsors
            </Link>
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Secure Your Spot</h1>
            <p className="text-muted-foreground text-lg">
              Book your sponsorship for <span className="text-foreground font-medium">{formatMonth(availability.nextMonth)}</span>
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Form Section */}
          <div className="lg:col-span-7">
            <Card className="border-muted-foreground/20 shadow-sm">
              <CardHeader>
                <CardTitle>Sponsor Details</CardTitle>
                <CardDescription>
                  Tell us about your startup. This information will be used for your ad.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Hidden month field */}
                  <input
                    type="hidden"
                    {...register("month")}
                    value={availability.nextMonth}
                  />

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Company Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      placeholder="e.g., Acme Corp"
                      {...register("title")}
                      className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="description">Short Description <span className="text-red-500">*</span></Label>
                      <span className="text-xs text-muted-foreground">
                        {formValues.description?.length || 0}/100
                      </span>
                    </div>
                    <Textarea
                      id="description"
                      placeholder="What does your startup do? Keep it punchy."
                      maxLength={100}
                      {...register("description")}
                      className={errors.description ? "border-red-500 focus-visible:ring-red-500 resize-none" : "resize-none"}
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* CTA Text */}
                    <div className="space-y-2">
                      <Label htmlFor="ctaText">Button Label <span className="text-red-500">*</span></Label>
                      <Input
                        id="ctaText"
                        placeholder="e.g., Try Free"
                        maxLength={20}
                        {...register("ctaText")}
                        className={errors.ctaText ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {errors.ctaText && (
                        <p className="text-red-500 text-sm">
                          {errors.ctaText.message}
                        </p>
                      )}
                    </div>

                    {/* CTA URL */}
                    <div className="space-y-2">
                      <Label htmlFor="ctaUrl">Destination URL <span className="text-red-500">*</span></Label>
                      <Input
                        id="ctaUrl"
                        type="url"
                        placeholder="https://..."
                        {...register("ctaUrl")}
                        className={errors.ctaUrl ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {errors.ctaUrl && (
                        <p className="text-red-500 text-sm">
                          {errors.ctaUrl.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Logo URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      {...register("imageUrl")}
                      className={errors.imageUrl ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      Square images work best. If left empty, we'll use your company name.
                    </p>
                    {errors.imageUrl && (
                      <p className="text-red-500 text-sm">
                        {errors.imageUrl.message}
                      </p>
                    )}
                  </div>

                  {/* Background Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="backgroundImageUrl">
                      Background Image URL <span className="text-muted-foreground font-normal">(optional - Premium)</span>
                    </Label>
                    <Input
                      id="backgroundImageUrl"
                      type="url"
                      placeholder="https://example.com/background.jpg"
                      {...register("backgroundImageUrl")}
                      className={errors.backgroundImageUrl ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add a background image for a premium card design. Your text will appear over the image with a gradient overlay.
                    </p>
                    {errors.backgroundImageUrl && (
                      <p className="text-red-500 text-sm">
                        {errors.backgroundImageUrl.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full text-lg h-12" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        Pay $99 & Lock Spot <CreditCard className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" />
                    Secure payment via Stripe
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Ad Preview</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This is how your ad will appear in the sponsor showcase.
                </p>
                <div className="max-w-sm mx-auto lg:mx-0">
                  <SponsorShowcaseCard
                    sponsor={{
                      id: "preview",
                      title: formValues.title || "Your Company",
                      description: formValues.description || "Your description will appear here. Make it catchy and relevant to developers.",
                      ctaText: formValues.ctaText || "Learn More",
                      ctaUrl: formValues.ctaUrl || "#",
                      imageUrl: formValues.imageUrl || null,
                      logo: "🚀", // Fallback for preview
                      backgroundImageUrl: formValues.backgroundImageUrl || null,
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What's included</h3>
                <ul className="space-y-3">
                  {[
                    "Full month of visibility",
                    "Desktop sidebar rotation",
                    "Mobile banner rotation",
                    "Sponsor showcase listing",
                    "Analytics & clicks",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {item}
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
