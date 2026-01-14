import Image from "next/image";
import Link from "next/link";

import { Icons } from "@/components/icons";
import { getCategories } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

export async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="mt-auto border-t">
      <div className="container w-full py-12 md:py-16">
        {/* Top Section - 4 Column Layout */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/problem-dock__logo.webp"
                alt={siteConfig.title}
                width={180}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connect problems with developers building solutions.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Icons.github className="size-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Platform</h4>
            <ul className="space-y-2.5 text-sm">
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
                  Advertise
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">About</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Problem Dock connects people with real problems and developers
              seeking validated problems to solve.
            </p>
          </div>
        </div>

        {/* Categories Section - Grid Layout */}
        <div className="mt-12 space-y-4 border-t border-border/50 pt-8">
          <h4 className="text-sm font-semibold">Explore Categories</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
        <div className="text-muted-foreground mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-sm md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.title}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
