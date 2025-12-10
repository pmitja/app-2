import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SponsorSuccessPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900">
            <svg
              className="h-12 w-12 text-green-600 dark:text-green-400"
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
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for becoming a sponsor. Your slot has been secured.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
            <CardDescription>
              Your sponsorship will be activated shortly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Payment Processing</h3>
                <p className="text-muted-foreground text-sm">
                  Your payment is being processed and verified.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Activation</h3>
                <p className="text-muted-foreground text-sm">
                  Your sponsor slot will be activated and start appearing in
                  rotation on the 1st day of your selected month.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Live Display</h3>
                <p className="text-muted-foreground text-sm">
                  Your ad will rotate with other sponsors every 10 seconds on
                  all pages throughout the month.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild variant="default">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sponsors">View Sponsors Page</Link>
          </Button>
        </div>

        <p className="text-muted-foreground text-sm">
          If you have any questions or need to update your ad content, please
          contact our support team.
        </p>
      </div>
    </div>
  );
}
