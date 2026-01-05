"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { getPasswordResetEmail, getWelcomeEmail } from "@/lib/email-templates";
import { db, users } from "@/lib/schema";
import { stripeServer } from "@/lib/stripe";
import {
    resetPasswordSchema,
    resetRequestSchema,
    signUpSchema,
    updateNameSchema,
} from "@/lib/validation";

const resend = new Resend(env.RESEND_API_KEY);

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    // Validate input
    const validatedData = signUpSchema.parse(data);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        emailVerified: new Date(), // Auto-verify for password signups
      })
      .returning();

    // Create Stripe customer
    if (newUser[0]) {
      try {
        const customer = await stripeServer.customers.create({
          email: newUser[0].email!,
          name: newUser[0].name!,
        });

        await db
          .update(users)
          .set({ stripeCustomerId: customer.id })
          .where(eq(users.id, newUser[0].id));

        // Send welcome email
        const emailTemplate = getWelcomeEmail({
          name: validatedData.name,
          host: new URL(env.APP_URL).host,
        });

        await resend.emails.send({
          from: env.EMAIL_FROM,
          to: validatedData.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });
      } catch (error) {
        console.error("Error creating Stripe customer or sending email:", error);
        // Don't fail the registration if Stripe/email fails
      }
    }

    return { success: true, message: "Account created successfully" };
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create account" };
  }
}

export async function requestPasswordReset(data: { email: string }) {
  try {
    // Validate input
    const validatedData = resetRequestSchema.parse(data);

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    // Always return success to avoid email enumeration
    if (user.length === 0) {
      return {
        success: true,
        message: "If an account exists, a reset link has been sent",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await db
      .update(users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      })
      .where(eq(users.id, user[0].id));

    // Generate reset URL
    const resetUrl = `${env.APP_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    const emailTemplate = getPasswordResetEmail({
      url: resetUrl,
      host: new URL(env.APP_URL).host,
      name: user[0].name || undefined,
    });

    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: validatedData.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    return {
      success: true,
      message: "If an account exists, a reset link has been sent",
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      error: "Failed to process password reset request",
    };
  }
}

export async function resetPassword(data: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    // Validate input
    const validatedData = resetPasswordSchema.parse({
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    // Find user with valid token
    const user = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, data.token))
      .limit(1);

    if (user.length === 0) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    // Check if token is expired
    if (
      !user[0].passwordResetExpires ||
      user[0].passwordResetExpires < new Date()
    ) {
      return { success: false, error: "Reset token has expired" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Update password and clear reset token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .where(eq(users.id, user[0].id));

    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    console.error("Password reset error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to reset password" };
  }
}

export async function verifyResetToken(token: string) {
  try {
    const user = await db
      .select({ id: users.id, email: users.email, expires: users.passwordResetExpires })
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1);

    if (user.length === 0) {
      return { valid: false, error: "Invalid reset token" };
    }

    if (!user[0].expires || user[0].expires < new Date()) {
      return { valid: false, error: "Reset token has expired" };
    }

    return { valid: true, email: user[0].email };
  } catch (error) {
    console.error("Token verification error:", error);
    return { valid: false, error: "Failed to verify token" };
  }
}

export async function toggleDeveloperRole() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to change your role" };
    }

    // Get current user
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Toggle role
    const newRole = user.role === "developer" ? "user" : "developer";

    // Update user role
    await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.id, session.user.id));

    return { success: true, newRole };
  } catch (error) {
    console.error("Error toggling developer role:", error);
    return { error: "Failed to update role" };
  }
}

export async function updateUserName(data: { name: string }) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to update your name" };
    }

    // Validate input
    const validatedData = updateNameSchema.parse(data);

    // Update user name
    await db
      .update(users)
      .set({ name: validatedData.name })
      .where(eq(users.id, session.user.id));

    return { success: true, name: validatedData.name };
  } catch (error) {
    console.error("Error updating user name:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to update name" };
  }
}
