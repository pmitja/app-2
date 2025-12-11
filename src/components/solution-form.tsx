"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createSolutionPromotionCheckoutAction } from "@/actions/create-checkout-session";
import { createSolution } from "@/actions/solution-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createSolutionSchema,
  type CreateSolutionFormData,
} from "@/lib/validation";

interface SolutionFormProps {
  problemId: string;
  categorySlug: string;
  problemSlug: string;
  isAuthenticated: boolean;
  isDeveloper: boolean;
  inModal?: boolean;
  onSuccess?: () => void;
}

export function SolutionForm({
  problemId,
  categorySlug,
  problemSlug,
  isAuthenticated,
  isDeveloper,
  inModal = false,
  onSuccess,
}: SolutionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const form = useForm<CreateSolutionFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createSolutionSchema) as any,
    defaultValues: {
      title: "",
      summary: "",
      imageUrl: "",
      targetUrl: "",
      promoteNow: false,
    },
  });

  const onSubmit = (data: CreateSolutionFormData) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to post a solution");
      return;
    }

    if (!isDeveloper) {
      toast.error("Only developers can post solutions");
      return;
    }

    startTransition(async () => {
      const result = await createSolution(problemId, data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        // Check if promotion is required
        if (result.requiresPromotion && result.solutionId) {
          setIsProcessingPayment(true);
          try {
            const checkoutResult = await createSolutionPromotionCheckoutAction(
              result.solutionId,
              problemId,
              categorySlug,
              problemSlug,
            );

            if (checkoutResult.url) {
              window.location.href = checkoutResult.url;
            }
          } catch {
            toast.error("Failed to initiate promotion checkout");
            setIsProcessingPayment(false);
          }
        } else {
          toast.success("Solution posted successfully!");
          form.reset();
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.reload(); // Refresh to show new solution
          }
        }
      }
    });
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solution Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., TaskMaster Pro - Complete Task Management"
                  {...field}
                  disabled={isPending || isProcessingPayment}
                />
              </FormControl>
              <FormDescription>
                A compelling title for your solution (5-100 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe how your solution solves this problem..."
                  className="min-h-[100px]"
                  {...field}
                  disabled={isPending || isProcessingPayment}
                />
              </FormControl>
              <FormDescription>
                Brief description of your solution (20-300 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  {...field}
                  disabled={isPending || isProcessingPayment}
                />
              </FormControl>
              <FormDescription>
                URL to your solution's logo (square format recommended)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solution URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://yoursolution.com"
                  {...field}
                  disabled={isPending || isProcessingPayment}
                />
              </FormControl>
              <FormDescription>
                Link to your product, service, or demo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="promoteNow"
          render={({ field }) => (
            <FormItem className="bg-primary/5 flex flex-row items-start space-y-0 space-x-3 rounded-lg border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isPending || isProcessingPayment}
                  className="mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-base font-semibold">
                  ⭐ Promote to Featured Spot - $9.99
                </FormLabel>
                <FormDescription>
                  Get the top placement with a larger, more prominent card
                  display. Only one featured solution per problem.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || isProcessingPayment}
        >
          {isProcessingPayment
            ? "Redirecting to checkout..."
            : isPending
              ? "Posting..."
              : form.watch("promoteNow")
                ? "Post & Promote Solution"
                : "Post Solution"}
        </Button>
      </form>
    </Form>
  );

  if (inModal) {
    if (!isAuthenticated) {
      return null; // Modal shouldn't show if not authenticated
    }

    if (!isDeveloper) {
      return null; // Modal shouldn't show if not developer
    }

    return formContent;
  }

  // Original Card-based rendering
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Post Your Solution</CardTitle>
          <CardDescription>
            Please sign in to share your solution with the community.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isDeveloper) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Post Your Solution</CardTitle>
          <CardDescription>
            Only developers can post solutions. Please update your account to
            developer role.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Your Solution</CardTitle>
        <CardDescription>
          Share your solution with an engaging card that links to your product
          or service.
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
