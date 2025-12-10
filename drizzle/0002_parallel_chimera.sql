ALTER TABLE "user" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "passwordResetToken" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "passwordResetExpires" timestamp;