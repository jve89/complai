import { Globe } from "lucide-react";

import { getActiveCompany } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";
import { Sidebar, MobileNav } from "@/components/dashboard/sidebar";
import { SiteLogo } from "@/components/site-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { company, user, demo } = await getActiveCompany();

  return (
    <div className="min-h-screen bg-secondary/30">
      <Sidebar />

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <MobileNav />
              <span className="md:hidden">
                <SiteLogo href="/dashboard" />
              </span>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight">
                  {company.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.profile?.name
                    ? `${user.profile.name} · ${user.profile.role}`
                    : "Compliance-omgeving"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {demo && <Badge variant="warning">Demo-modus</Badge>}
              <Button asChild variant="ghost" size="sm">
                <a href="/">
                  <Globe className="h-4 w-4" /> Website
                </a>
              </Button>
              {user ? (
                <form action={logout}>
                  <Button variant="outline" size="sm">
                    Uitloggen
                  </Button>
                </form>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <a href="/login">Inloggen</a>
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
