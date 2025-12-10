import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  passwordResetToken: text("passwordResetToken"),
  passwordResetExpires: timestamp("passwordResetExpires", { mode: "date" }),
  stripeCustomerId: text("stripeCustomerId").unique(),
  isActive: boolean("isActive").default(false).notNull(),
  role: text("role").default("user").notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ],
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ],
);

export const problems = pgTable("problem", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  painLevel: integer("painLevel").notNull(),
  frequency: text("frequency").notNull(),
  wouldPay: boolean("wouldPay").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const problemVotes = pgTable(
  "problem_vote",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    problemId: text("problemId")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => [
    {
      uniqueVote: unique().on(t.problemId, t.userId),
    },
  ]
);

export const problemFollows = pgTable(
  "problem_follow",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    problemId: text("problemId")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => [
    {
      uniqueFollow: unique().on(t.problemId, t.userId),
    },
  ]
);

export const problemComments = pgTable("problem_comment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  problemId: text("problemId")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "discussion" | "solution"
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const developerStatuses = pgTable(
  "developer_status",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    problemId: text("problemId")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull(), // "exploring" | "building"
    solutionUrl: text("solutionUrl"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => [
    {
      uniqueStatus: unique().on(t.problemId, t.userId),
    },
  ]
);

export const sponsorSlots = pgTable("sponsor_slot", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  month: text("month").notNull(), // "2025-01" format
  title: text("title").notNull(),
  description: text("description").notNull(),
  ctaText: text("ctaText").notNull(),
  ctaUrl: text("ctaUrl").notNull(),
  imageUrl: text("imageUrl"), // optional logo/image
  logo: text("logo"), // optional emoji/short text logo
  variant: text("variant").notNull().default("blue"),
  placements: text("placements").notNull().default("RAIL_LEFT"),
  priority: integer("priority").notNull().default(0),
  status: text("status").notNull(), // "pending" | "active" | "expired"
  stripePaymentIntentId: text("stripePaymentIntentId"),
  amount: integer("amount").notNull(), // 9900 cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Initialize drizzle with schema for query mode
export const db = drizzle({ 
  client: sql, 
  schema: {
    users,
    accounts,
    sessions,
    verificationTokens,
    authenticators,
    problems,
    problemVotes,
    problemFollows,
    problemComments,
    developerStatuses,
    sponsorSlots,
  }
});
