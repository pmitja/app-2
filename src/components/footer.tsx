import Link from "next/link";

import { getCategories } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

export async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="bg-background mt-auto border-t">
      <div className="w-full py-8 md:py-12">
        {/* Top Section - Brand, Quick Links, About */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{siteConfig.title}</h3>
            <p className="text-muted-foreground text-sm">
              Connect problems with developers building solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/problems/new"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Submit a Problem
                </Link>
              </li>
              <li>
                <Link
                  href="/sponsors"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sponsor Opportunities
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">About</h4>
            <p className="text-muted-foreground text-sm">
              Problem Dock connects people with real problems and developers
              seeking validated problems to solve. Find problems before building
              products that won&apos;t sell.
            </p>
          </div>
        </div>

        {/* Categories Section - Full Width */}
        <div className="mt-8 space-y-4 border-t pt-8">
          <h4 className="text-sm font-semibold">Categories</h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/problems/${category.slug}`}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
              >
                <span>{category.emoji}</span>
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="text-muted-foreground mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.title}. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
