import { env } from "@/env.mjs";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function getMagicLinkEmail(params: {
  url: string;
  host: string;
}): EmailTemplate {
  const { url, host } = params;
  const escapedHost = host.replace(/\./g, "&#8203;.");

  return {
    subject: `Sign in to ${host}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to ${escapedHost}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f6f9fc; padding: 40px 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
    <div style="padding: 40px 40px 0 40px;">
      <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Sign in to ${escapedHost}</h1>
      <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
        Click the button below to sign in to your account. This link will expire in 24 hours.
      </p>
      <a href="${url}" target="_blank" style="display: inline-block; background-color: #0070f3; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-bottom: 24px;">
        Sign in
      </a>
      <p style="color: #718096; font-size: 14px; line-height: 20px; margin: 0;">
        If you didn't request this email, you can safely ignore it.
      </p>
    </div>
    <div style="padding: 24px 40px; border-top: 1px solid #e2e8f0; margin-top: 32px;">
      <p style="color: #a0aec0; font-size: 12px; line-height: 16px; margin: 0;">
        Or copy and paste this URL into your browser:<br>
        <span style="color: #718096; word-break: break-all;">${url}</span>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `Sign in to ${host}\n\n${url}\n\nIf you didn't request this email, you can safely ignore it.`,
  };
}

export function getPasswordResetEmail(params: {
  url: string;
  host: string;
  name?: string;
}): EmailTemplate {
  const { url, host, name } = params;
  const escapedHost = host.replace(/\./g, "&#8203;.");
  const greeting = name ? `Hi ${name}` : "Hello";

  return {
    subject: `Reset your password for ${host}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f6f9fc; padding: 40px 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
    <div style="padding: 40px 40px 0 40px;">
      <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Reset your password</h1>
      <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 8px 0;">
        ${greeting},
      </p>
      <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
        We received a request to reset your password for ${escapedHost}. Click the button below to create a new password. This link will expire in 1 hour.
      </p>
      <a href="${url}" target="_blank" style="display: inline-block; background-color: #0070f3; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-bottom: 24px;">
        Reset Password
      </a>
      <p style="color: #718096; font-size: 14px; line-height: 20px; margin: 0;">
        If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
      </p>
    </div>
    <div style="padding: 24px 40px; border-top: 1px solid #e2e8f0; margin-top: 32px;">
      <p style="color: #a0aec0; font-size: 12px; line-height: 16px; margin: 0;">
        Or copy and paste this URL into your browser:<br>
        <span style="color: #718096; word-break: break-all;">${url}</span>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `Reset your password\n\n${greeting},\n\nWe received a request to reset your password for ${host}. Click the link below to create a new password:\n\n${url}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, you can safely ignore this email.`,
  };
}

export function getWelcomeEmail(params: {
  name: string;
  host: string;
}): EmailTemplate {
  const { name, host } = params;
  const escapedHost = host.replace(/\./g, "&#8203;.");

  return {
    subject: `Welcome to ${host}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${escapedHost}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f6f9fc; padding: 40px 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
    <div style="padding: 40px;">
      <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Welcome to ${escapedHost}!</h1>
      <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 8px 0;">
        Hi ${name},
      </p>
      <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
        Thanks for signing up! We're excited to have you on board.
      </p>
      <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
        Your account has been created successfully and you can now access all features.
      </p>
      <a href="${env.APP_URL}" target="_blank" style="display: inline-block; background-color: #0070f3; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-bottom: 24px;">
        Get Started
      </a>
      <p style="color: #718096; font-size: 14px; line-height: 20px; margin: 0;">
        If you have any questions, feel free to reach out to our support team.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `Welcome to ${host}!\n\nHi ${name},\n\nThanks for signing up! We're excited to have you on board.\n\nYour account has been created successfully and you can now access all features.\n\nVisit: ${env.APP_URL}\n\nIf you have any questions, feel free to reach out to our support team.`,
  };
}

export function getSolutionNotificationEmail(params: {
  problemTitle: string;
  problemUrl: string;
  solutionUrl: string;
  developerName: string;
  followerName?: string;
}): EmailTemplate {
  const {
    problemTitle,
    problemUrl,
    solutionUrl,
    developerName,
    followerName,
  } = params;
  const greeting = followerName ? `Hi ${followerName}` : "Hello";

  return {
    subject: `A solution has been posted for "${problemTitle}"`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solution Posted</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f6f9fc; padding: 40px 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
    <div style="padding: 40px 40px 0 40px;">
      <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">🎉 A Solution Has Been Posted!</h1>
      <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 8px 0;">
        ${greeting},
      </p>
      <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
        Great news! ${developerName} has posted a solution to a problem you're following:
      </p>
      <div style="background-color: #f7fafc; border-left: 4px solid #0070f3; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
        <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0;">
          ${problemTitle}
        </p>
      </div>
      <a href="${problemUrl}" target="_blank" style="display: inline-block; background-color: #0070f3; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-bottom: 16px;">
        View Problem Details
      </a>
      <p style="color: #4a5568; font-size: 14px; line-height: 20px; margin: 0 0 16px 0;">
        Check out the solution directly:
      </p>
      <a href="${solutionUrl}" target="_blank" style="color: #0070f3; font-size: 14px; text-decoration: underline; word-break: break-all;">
        ${solutionUrl}
      </a>
    </div>
    <div style="padding: 24px 40px; border-top: 1px solid #e2e8f0; margin-top: 32px;">
      <p style="color: #718096; font-size: 14px; line-height: 20px; margin: 0;">
        You're receiving this email because you're following this problem. Visit the problem page to unfollow if you no longer wish to receive updates.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `A Solution Has Been Posted!\n\n${greeting},\n\nGreat news! ${developerName} has posted a solution to a problem you're following:\n\n"${problemTitle}"\n\nView the problem: ${problemUrl}\n\nSolution URL: ${solutionUrl}\n\nYou're receiving this email because you're following this problem.`,
  };
}
