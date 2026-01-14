import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <div className="mx-auto mt-4 text-center md:mt-0">
      {/* Badge */}
      <div className="mb-6 flex justify-center">
        <Badge variant="secondary" className="text-xs font-semibold">
          Community Driven
        </Badge>
      </div>

      {/* Main Headline */}
      <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        Find <span className="text-red-600 dark:text-red-400">Real Problems</span> to Solve
      </h1>

      {/* Subheadline */}
      <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg leading-relaxed sm:text-xl">
        Problem Dock connects people with real problems and developers seeking
        validated problems to solve. Post problems you&apos;re facing, or
        discover real problems before building products that won&apos;t sell.
      </p>
    </div>
  );
}
