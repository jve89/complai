import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";

import { Sidebar, MobileNav } from "@/components/dashboard/sidebar";
import { SiteLogo } from "@/components/site-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Sidebar nav="demo" logoHref="/demo" />

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <MobileNav nav="demo" />
              <span className="md:hidden">
                <SiteLogo href="/demo" />
              </span>
              <Badge variant="warning">Demo — voorbeelddata</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <Globe className="h-4 w-4" /> Website
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/scan">
                  Start uw eigen scan <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="border-b border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900 sm:px-6">
          U bekijkt een <strong>demo</strong> met de fictieve organisatie{" "}
          <strong>Demo Recruitment B.V.</strong> Alle tabbladen werken — doe de
          gratis scan om uw eigen omgeving te vullen.
        </div>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
