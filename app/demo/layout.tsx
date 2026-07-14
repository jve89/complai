import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";

import { Sidebar, MobileNav } from "@/components/dashboard/sidebar";
import { SiteLogo } from "@/components/site-logo";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const websiteBtn = (
    <Button asChild variant="outline" size="sm" className="w-full justify-start md:w-auto md:justify-center">
      <Link href="/">
        <Globe className="h-4 w-4" /> Website
      </Link>
    </Button>
  );
  const scanBtn = (
    <Button asChild size="sm" className="w-full justify-start md:w-auto md:justify-center">
      <Link href="/scan">
        Start uw eigen scan <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      <Sidebar nav="demo" logoHref="/demo" />

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="md:hidden">
                <SiteLogo href="/demo" />
              </span>
              <span className="hidden font-semibold sm:inline">Demo-omgeving</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 md:flex">
                {websiteBtn}
                {scanBtn}
              </div>
              <MobileNav
                nav="demo"
                actions={
                  <>
                    {websiteBtn}
                    {scanBtn}
                  </>
                }
              />
            </div>
          </div>
        </header>

        <div className="border-b border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900 sm:px-6">
          U bekijkt een <strong>demo</strong> met de fictieve organisatie{" "}
          <strong>Demo Recruitment B.V.</strong> Dit is een selectie van de
          modules — doe de gratis scan om uw eigen, volledige omgeving te vullen.
        </div>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
