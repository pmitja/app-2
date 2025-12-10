import { redirect } from "next/navigation";

import { ProblemForm } from "@/components/problem-form";
import { auth } from "@/lib/auth";

export default async function NewProblemPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Submit a Problem</h1>
        <p className="text-muted-foreground">
          Share a problem you&apos;re facing so the community can help find
          solutions.
        </p>
      </div>

      <ProblemForm />
    </div>
  );
}
