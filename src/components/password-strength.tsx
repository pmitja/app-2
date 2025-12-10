"use client";

import { checkPasswordStrength } from "@/lib/validation";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, feedback } = checkPasswordStrength(password);

  const getStrengthColor = (score: number) => {
    if (score <= 1) return "bg-red-500";
    if (score === 2) return "bg-orange-500";
    if (score === 3) return "bg-yellow-500";
    if (score === 4) return "bg-lime-500";
    return "bg-green-500";
  };

  const getStrengthText = (score: number) => {
    if (score <= 1) return "Very Weak";
    if (score === 2) return "Weak";
    if (score === 3) return "Fair";
    if (score === 4) return "Good";
    return "Strong";
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= score ? getStrengthColor(score) : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span
          className={`font-medium ${
            score <= 2 ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {getStrengthText(score)}
        </span>
        {feedback.length > 0 && (
          <span className="text-muted-foreground">
            Missing: {feedback.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
