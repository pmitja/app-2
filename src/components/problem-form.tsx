"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createProblem } from "@/actions/problem-actions";
import { CategoryInput } from "@/components/category-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/lib/queries";
import {
  type CreateProblemFormData,
  createProblemSchema,
} from "@/lib/validation";

const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Rarely"];

interface ProblemFormProps {
  categories: Category[];
}

export function ProblemForm({ categories }: ProblemFormProps) {
  const form = useForm<CreateProblemFormData>({
    resolver: zodResolver(createProblemSchema),
    defaultValues: {
      title: "",
      description: "",
      category: {
        type: "existing",
        categoryId: categories[0]?.id || "",
      },
      painLevel: 3,
      frequency: "Daily",
      wouldPay: false,
    },
  });

  async function onSubmit(data: CreateProblemFormData) {
    try {
      const result = await createProblem(data);

      if (result?.error) {
        toast.error(result.error);
      }
      // If successful, createProblem will redirect
    } catch (error) {
      // Don't show error for redirects (which are actually successful)
      const isRedirectError =
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof (error as any).digest === "string" &&
        (error as any).digest.includes("NEXT_REDIRECT");

      if (!isRedirectError) {
        console.error(error);
        toast.error("Failed to create problem");
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a Problem</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the problem"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A clear, concise title (5-200 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the problem in detail..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Explain the problem, its impact, and why it matters (min 20
                    characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <CategoryInput
                      value={field.value}
                      onChange={field.onChange}
                      existingCategories={categories}
                      error={form.formState.errors.category?.message}
                    />
                  </FormControl>
                  <FormDescription>
                    Select an existing category or create a new one
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How often?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FREQUENCIES.map((frequency) => (
                          <SelectItem key={frequency} value={frequency}>
                            {frequency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often does this occur?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="painLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pain Level: {field.value}/5</FormLabel>
                  <FormControl>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      className="w-full"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How painful is this problem? (1 = minor annoyance, 5 =
                    critical blocker)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wouldPay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I would pay for a solution</FormLabel>
                    <FormDescription>
                      Check this if you&apos;d be willing to pay for a solution
                      to this problem
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Submitting..." : "Submit Problem"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
