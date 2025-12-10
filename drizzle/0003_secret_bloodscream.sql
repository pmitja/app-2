CREATE TABLE "developer_status" (
	"id" text PRIMARY KEY NOT NULL,
	"problemId" text NOT NULL,
	"userId" text NOT NULL,
	"status" text NOT NULL,
	"solutionUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"problemId" text NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_follow" (
	"id" text PRIMARY KEY NOT NULL,
	"problemId" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_vote" (
	"id" text PRIMARY KEY NOT NULL,
	"problemId" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"painLevel" integer NOT NULL,
	"frequency" text NOT NULL,
	"wouldPay" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "developer_status" ADD CONSTRAINT "developer_status_problemId_problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "developer_status" ADD CONSTRAINT "developer_status_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_comment" ADD CONSTRAINT "problem_comment_problemId_problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_comment" ADD CONSTRAINT "problem_comment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_follow" ADD CONSTRAINT "problem_follow_problemId_problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_follow" ADD CONSTRAINT "problem_follow_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_vote" ADD CONSTRAINT "problem_vote_problemId_problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_vote" ADD CONSTRAINT "problem_vote_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem" ADD CONSTRAINT "problem_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;