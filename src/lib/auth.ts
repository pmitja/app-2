import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import ResendProvider from "next-auth/providers/resend";
import { Resend } from "resend";

import { env } from "@/env.mjs";
import { getMagicLinkEmail } from "@/lib/email-templates";
import { db, users } from "@/lib/schema";
import { stripeServer } from "@/lib/stripe";
import { signInSchema } from "@/lib/validation";

const resend = new Resend(env.RESEND_API_KEY);

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
    ResendProvider({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url);
        const { subject, html, text } = getMagicLinkEmail({ url, host });

        try {
          await resend.emails.send({
            from: provider.from || env.EMAIL_FROM,
            to: identifier,
            subject,
            html,
            text,
          });
        } catch (error) {
          throw new Error("Failed to send verification email");
        }
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const validatedData = signInSchema.parse(credentials);

          // Find user
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, validatedData.email))
            .limit(1);

          if (user.length === 0 || !user[0].password) {
            return null;
          }

          // Verify password
          const isValid = await bcrypt.compare(
            validatedData.password,
            user[0].password,
          );

          if (!isValid) {
            return null;
          }

          // Return user object
          return {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            image: user[0].image,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // Fetch fresh user data on every request to keep session updated
      if (token.email) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, token.email))
          .limit(1);

        if (dbUser.length > 0) {
          token.id = dbUser[0].id;
          token.stripeCustomerId = dbUser[0].stripeCustomerId;
          token.isActive = dbUser[0].isActive;
          token.role = dbUser[0].role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      session.user.id = token.id as string;
      session.user.stripeCustomerId = token.stripeCustomerId as string | null;
      session.user.isActive = token.isActive as boolean;
      session.user.role = token.role as string;

      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (!user.email || !user.name) return;

      await stripeServer.customers
        .create({
          email: user.email,
          name: user.name,
        })
        .then(async (customer) =>
          db
            .update(users)
            .set({ stripeCustomerId: customer.id })
            .where(eq(users.id, user.id!)),
        );
    },
  },
});
