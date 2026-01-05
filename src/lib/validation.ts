import { z } from "zod";

// Password validation schema with strength requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

// Email validation schema
export const emailSchema = z.string().email("Please enter a valid email");

// Sign in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Sign up schema
export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don&apos;t match",
    path: ["confirmPassword"],
  });

// Magic link schema
export const magicLinkSchema = z.object({
  email: emailSchema,
});

// Password reset request schema
export const resetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset confirmation schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don&apos;t match",
    path: ["confirmPassword"],
  });

// Password strength checker utility
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push("At least 8 characters");
  }

  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push("One lowercase letter");
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push("One uppercase letter");
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("One number");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("One special character");
  }

  return { score, feedback };
}

// Problem validation schemas
export const frequencySchema = z.enum(["Daily", "Weekly", "Monthly", "Rarely"]);

// Category must be an existing category ID
export const categoryInputSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
});

export const createProblemSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: categoryInputSchema,
  painLevel: z.number().int().min(1).max(5),
  frequency: frequencySchema,
  wouldPay: z.boolean(),
});

// Comment validation schemas
export const commentTypeSchema = z.enum(["discussion", "solution"]);

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(2, "Comment must be at least 2 characters")
    .max(2000, "Comment must be less than 2000 characters"),
  type: commentTypeSchema,
});

// Developer status validation schemas
export const developerStatusSchema = z.enum(["exploring", "building"]);

export const setDeveloperStatusSchema = z.object({
  status: developerStatusSchema,
  solutionUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

// Sponsor slot validation schema
export const sponsorSlotSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be less than 50 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(100, "Description must be less than 100 characters"),
  ctaText: z
    .string()
    .min(2, "CTA text must be at least 2 characters")
    .max(20, "CTA text must be less than 20 characters"),
  ctaUrl: z.string().url("Please enter a valid URL"),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  backgroundImageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
});

// Solution validation schema
export const createSolutionSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  summary: z
    .string()
    .min(20, "Summary must be at least 20 characters")
    .max(300, "Summary must be less than 300 characters"),
  imageUrl: z.string().url("Please enter a valid logo URL"),
  targetUrl: z.string().url("Please enter a valid target URL"),
  promoteNow: z.boolean().default(false),
});

// Update name schema
export const updateNameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

// Type exports
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type MagicLinkFormData = z.infer<typeof magicLinkSchema>;
export type ResetRequestFormData = z.infer<typeof resetRequestSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type CreateProblemFormData = z.infer<typeof createProblemSchema>;
export type CreateCommentFormData = z.infer<typeof createCommentSchema>;
export type SetDeveloperStatusFormData = z.infer<
  typeof setDeveloperStatusSchema
>;
export type SponsorSlotFormData = z.infer<typeof sponsorSlotSchema>;
export type CreateSolutionFormData = z.infer<typeof createSolutionSchema>;
export type UpdateNameFormData = z.infer<typeof updateNameSchema>;
