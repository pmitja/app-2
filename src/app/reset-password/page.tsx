import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { verifyResetToken } from "@/actions/auth-actions";
import { PasswordResetForm } from "@/components/password-reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter your new password below
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent token={params.token} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function ResetPasswordContent({ token }: { token?: string }) {
  if (!token) {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/15 text-destructive rounded-md p-4 text-sm">
          Invalid reset link. Please request a new password reset.
        </div>
        <Link
          href="/"
          className="text-primary block text-center text-sm hover:underline"
        >
          Return to home
        </Link>
      </div>
    );
  }

  const result = await verifyResetToken(token);

  if (!result.valid) {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/15 text-destructive rounded-md p-4 text-sm">
          {result.error || "Invalid or expired reset link"}
        </div>
        <Link
          href="/"
          className="text-primary block text-center text-sm hover:underline"
        >
          Return to home
        </Link>
      </div>
    );
  }

  return <ResetPasswordFormWrapper token={token} email={result.email || ""} />;
}

function ResetPasswordFormWrapper({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">
        Resetting password for: <strong>{email}</strong>
      </div>
      <PasswordResetForm
        token={token}
        onSuccess={() => {
          redirect("/?reset=success");
        }}
      />
      <Link
        href="/"
        className="text-muted-foreground hover:text-primary block text-center text-sm"
      >
        Back to home
      </Link>
    </div>
  );
}
