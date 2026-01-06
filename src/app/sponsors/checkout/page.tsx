"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
  createSponsorCheckout,
  getSponsorAvailability,
} from "@/actions/sponsor-actions";
import { SponsorCard } from "@/components/sponsors/sponsor-card";
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
      <div className="container py-12">
        <div className="mx-auto max-w-4xl">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!availability.nextMonthAvailable) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <h1 className="text-3xl font-bold">All Spots Filled</h1>
          <p className="text-muted-foreground">
            All sponsor slots for {formatMonth(availability.nextMonth)} are
            currently filled. Please check back later.
          </p>
          <Button onClick={() => router.push("/sponsors")}>
            Back to Sponsors Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sponsor Checkout</h1>
          <p className="text-muted-foreground">
            Lock your spot for {formatMonth(availability.nextMonth)}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Sponsor Details</CardTitle>
                <CardDescription>
                  Fill in your information below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Hidden month field */}
                  <input
                    type="hidden"
                    {...register("month")}
                    value={availability.nextMonth}
                  />

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Company/Startup Name *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Acme Corp"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-destructive text-sm">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description * (max 100 chars)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="e.g., Build apps faster with our developer tools"
                      maxLength={100}
                      {...register("description")}
                    />
                    <p className="text-muted-foreground text-xs">
                      {formValues.description?.length || 0}/100 characters
                    </p>
                    {errors.description && (
                      <p className="text-destructive text-sm">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* CTA Text */}
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">
                      Call-to-Action Text * (max 20 chars)
                    </Label>
                    <Input
                      id="ctaText"
                      placeholder="e.g., Learn More"
                      maxLength={20}
                      {...register("ctaText")}
                    />
                    <p className="text-muted-foreground text-xs">
                      {formValues.ctaText?.length || 0}/20 characters
                    </p>
                    {errors.ctaText && (
                      <p className="text-destructive text-sm">
                        {errors.ctaText.message}
                      </p>
                    )}
                  </div>

                  {/* CTA URL */}
                  <div className="space-y-2">
                    <Label htmlFor="ctaUrl">Website URL *</Label>
                    <Input
                      id="ctaUrl"
                      type="url"
                      placeholder="https://example.com"
                      {...register("ctaUrl")}
                    />
                    {errors.ctaUrl && (
                      <p className="text-destructive text-sm">
                        {errors.ctaUrl.message}
                      </p>
                    )}
                  </div>

                  {/* Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Logo URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      {...register("imageUrl")}
                    />
                    {errors.imageUrl && (
                      <p className="text-destructive text-sm">
                        {errors.imageUrl.message}
                      </p>
                    )}
                  </div>

                  {/* Background Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="backgroundImageUrl">
                      Background Image URL (optional - Premium Card)
                    </Label>
                    <Input
                      id="backgroundImageUrl"
                      type="url"
                      placeholder="https://example.com/background.jpg"
                      {...register("backgroundImageUrl")}
                    />
                    <p className="text-muted-foreground text-xs">
                      Add a background image for a premium card design
                    </p>
                    {errors.backgroundImageUrl && (
                      <p className="text-destructive text-sm">
                        {errors.backgroundImageUrl.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Proceed to Payment ($99)"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>How your ad will appear</CardDescription>
              </CardHeader>
              <CardContent>
                <SponsorCard
                  sponsor={
                    {
                      id: "preview",
                      name: formValues.title || "Your Company Name",
                      tagline:
                        formValues.description ||
                        "Your description will appear here",
                      href: formValues.ctaUrl || "#",
                      logo: formValues.imageUrl ? "📸" : undefined,
                      backgroundImageUrl:
                        formValues.backgroundImageUrl || undefined,
                      variant: "blue",
                      placement: ["RAIL_LEFT"],
                      priority: 0,
                      active: true,
                    } as Sponsor
                  }
                />

                <div className="text-muted-foreground mt-4 space-y-2 text-sm">
                  <p>✓ Your ad will rotate every 10 seconds</p>
                  <p>✓ Displayed on all pages</p>
                  <p>✓ Active for {formatMonth(availability.nextMonth)}</p>
                  <p>
                    ✓ Fair visibility with {availability.nextCount + 1}/
                    {availability.maxSponsors} sponsors
                  </p>
                  {formValues.backgroundImageUrl && (
                    <p className="text-primary font-medium">
                      ✨ Premium card style activated!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
