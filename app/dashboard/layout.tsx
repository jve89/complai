import { Globe } from "lucide-react";

import { getActiveCompany } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";
import { stopImpersonation } from "@/app/dashboard/admin/actions";
import { Sidebar, MobileNav } from "@/components/dashboard/sidebar";
import { SiteLogo } from "@/components/site-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { company, user, demo, impersonating } = await getActiveCompany();
  const showAdmin = !demo && Boolean(user?.superAdmin);

  const websiteBtn = (
    <Button asChild variant="outline" size="sm" className="w-full justify-start md:w-auto md:justify-center">
      <a href="/">
        <Globe className="h-4 w-4" /> Website
      </a>
    </Button>
  );
  const authBtn = user ? (
    <form action={logout} className="w-full md:w-auto">
      <Button variant="outline" size="sm" className="w-full justify-start md:w-auto md:justify-center">
        Uitloggen
      </Button>
    </form>
  ) : (
    <Button asChild variant="outline" size="sm" className="w-full justify-start md:w-auto md:justify-center">
      <a href="/login">Inloggen</a>
    </Button>
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      <Sidebar showAdmin={showAdmin} />

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
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
              {demo && <Badge variant="warning" className="hidden sm:inline-flex">Demo-modus</Badge>}
              <div className="hidden items-center gap-3 md:flex">
                {websiteBtn}
                {authBtn}
              </div>
              <MobileNav
                showAdmin={showAdmin}
                actions={
                  <>
                    {websiteBtn}
                    {authBtn}
                  </>
                }
              />
            </div>
          </div>
        </header>

        {impersonating && (
          <div className="flex flex-col items-start gap-2 border-b border-amber-300 bg-amber-100 px-4 py-2.5 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>
              U bekijkt <strong>{company.name}</strong> als ComplAI-beheerder.
              Wijzigingen worden opgeslagen in de omgeving van deze klant.
            </span>
            <form action={stopImpersonation}>
              <Button type="submit" size="sm" variant="outline" className="bg-white">
                Terug naar eigen omgeving
              </Button>
            </form>
          </div>
        )}

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
