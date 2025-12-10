CREATE TABLE "sponsor_slot" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"month" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"ctaText" text NOT NULL,
	"ctaUrl" text NOT NULL,
	"imageUrl" text,
	"status" text NOT NULL,
	"stripePaymentIntentId" text,
	"amount" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sponsor_slot" ADD CONSTRAINT "sponsor_slot_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;