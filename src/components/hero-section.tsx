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
      <h1 className="hero-gradient-text from-primary via-secondary to-accent mb-6 bg-gradient-to-r bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
        Find Real Problems to Solve
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
