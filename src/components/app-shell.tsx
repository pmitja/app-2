import { Footer } from "@/components/footer";
import { HeaderBar } from "@/components/header-bar";
import { SponsorBar } from "@/components/sponsors/sponsor-bar";
import { SponsorCarousel } from "@/components/sponsors/sponsor-carousel";
import { SponsorRail } from "@/components/sponsors/sponsor-rail";
import { SponsorsProvider } from "@/components/sponsors/sponsors-provider";
import { auth } from "@/lib/auth";

interface AppShellProps {
  children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderBar session={session} />

      <SponsorsProvider>
        {/* Top carousel - mobile/tablet only, in document flow */}
        <div className="sticky top-0 z-20 lg:hidden">
          <SponsorCarousel placement="MOBILE_CAROUSEL_TOP" direction="ltr" />
        </div>

        <div className="flex flex-1 gap-6 py-0 pb-28 lg:py-6">
          {/* Left Sponsor Rail - Desktop only, outside container */}
          <aside className="hidden lg:block lg:min-w-[200px] lg:flex-1 lg:pl-4">
            <div className="sticky top-0 h-screen">
              <SponsorRail placement="RAIL_LEFT" />
            </div>
          </aside>

          {/* Main Content - centered with container */}
          <main className="container flex flex-col pt-0 md:pt-5">
            {/* Optional top sponsor bar (desktop + mobile, behind feature flag) */}
            <SponsorBar placement="TOP_BAR" />

            <div className="flex-1">{children}</div>

            {/* Optional bottom sponsor bar (desktop + mobile, behind feature flag) */}
            <SponsorBar placement="BOTTOM_BAR" />

            {/* Footer - only in main content area */}
            <Footer />
          </main>

          {/* Right Sponsor Rail - Desktop only, outside container */}
          <aside className="hidden lg:block lg:min-w-[200px] lg:flex-1 lg:pr-4">
            <div className="sticky top-0 h-screen">
              <SponsorRail placement="RAIL_RIGHT" />
            </div>
          </aside>
        </div>

        {/* Bottom carousel - mobile/tablet only, fixed at bottom */}
        <div className="fixed right-0 bottom-0 left-0 z-40 lg:hidden">
          <SponsorCarousel placement="MOBILE_CAROUSEL_BOTTOM" direction="rtl" />
        </div>
      </SponsorsProvider>
    </div>
  );
}
