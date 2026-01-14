"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { registerUser, requestPasswordReset } from "@/actions/auth-actions";
import { Icons } from "@/components/icons";
import { PasswordStrength } from "@/components/password-strength";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type MagicLinkFormData,
  magicLinkSchema,
  type ResetRequestFormData,
  resetRequestSchema,
  type SignInFormData,
  signInSchema,
  type SignUpFormData,
  signUpSchema,
} from "@/lib/validation";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<string>("signin");
  const [showResetPassword, setShowResetPassword] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-8 sm:max-w-[480px]">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-6">
            <Image
              src="/problem-dock_logo.svg"
              alt="Problem Dock"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {showResetPassword ? "Reset Password" : "Welcome"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground max-w-sm text-sm">
              {showResetPassword
                ? "Enter your email to receive a password reset link"
                : "Sign in to your account or create a new one"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {showResetPassword ? (
          <ResetPasswordRequestForm
            onBack={() => setShowResetPassword(false)}
            onSuccess={() => {
              setShowResetPassword(false);
              setActiveTab("signin");
            }}
          />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0 space-y-5">
              <SignInForm
                onClose={() => onOpenChange(false)}
                onResetPassword={() => setShowResetPassword(true)}
              />
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="border-border/50 w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background text-muted-foreground px-3 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="hover:bg-muted/50 h-11 w-full border-2 font-medium transition-colors"
                onClick={() => signIn("github", { callbackUrl: "/" })}
              >
                <Icons.github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="mt-0 space-y-5">
              <SignUpForm onClose={() => onOpenChange(false)} />
            </TabsContent>

            <TabsContent value="magic" className="mt-0 space-y-5">
              <MagicLinkForm onClose={() => onOpenChange(false)} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SignInForm({
  onClose,
  onResetPassword,
}: {
  onClose: () => void;
  onResetPassword: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        onClose();
        window.location.reload();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="bg-destructive/15 text-destructive border-destructive/20 rounded-md border p-3.5 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs font-medium"
            onClick={onResetPassword}
          >
            Forgot password?
          </Button>
        </div>

        <Button
          type="submit"
          className="h-11 w-full font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}

function SignUpForm({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignUpFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerUser(data);

      if (result.success) {
        setSuccess(true);
        form.reset();
        // Auto sign in after registration
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        setError(result.error || "Failed to create account");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
        Account created successfully! Signing you in...
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="bg-destructive/15 text-destructive border-destructive/20 rounded-md border p-3.5 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {field.value && <PasswordStrength password={field.value} />}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
}

function MagicLinkForm({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: MagicLinkFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("resend", {
        email: data.email,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError("Failed to send magic link");
      } else {
        setSuccess(true);
        form.reset();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          Check your email! We&apos;ve sent you a magic link to sign in.
        </div>
        <Button
          variant="outline"
          className="h-11 w-full font-medium"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="bg-destructive/15 text-destructive border-destructive/20 rounded-md border p-3.5 text-sm">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="h-11 w-full font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Magic Link"}
        </Button>

        <p className="text-muted-foreground text-center text-xs leading-relaxed">
          We&apos;ll email you a magic link for a password-free sign in.
        </p>
      </form>
    </Form>
  );
}

function ResetPasswordRequestForm({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetRequestFormData>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ResetRequestFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestPasswordReset(data);

      if (result.success) {
        setSuccess(true);
        form.reset();
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        setError(result.error || "Failed to send reset email");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          If an account with that email exists, we&apos;ve sent a password reset
          link.
        </div>
        <Button
          variant="outline"
          className="h-11 w-full font-medium"
          onClick={onBack}
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="bg-destructive/15 text-destructive border-destructive/20 rounded-md border p-3.5 text-sm">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 font-medium"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="h-11 flex-1 font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
