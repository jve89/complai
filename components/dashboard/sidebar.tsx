"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { SiteLogo } from "@/components/site-logo";
import { DASHBOARD_NAV, DEMO_NAV } from "@/components/dashboard/nav-items";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/demo") return pathname === href;
  return pathname.startsWith(href);
}

// Nav is chosen by a serializable string (icons are functions and can't be passed
// from a Server Component across the client boundary).
const navFor = (nav: "dashboard" | "demo") =>
  nav === "demo" ? DEMO_NAV : DASHBOARD_NAV;

/** Desktop sidebar (fixed, hidden on mobile — see Topbar for mobile nav). */
export function Sidebar({
  nav = "dashboard",
  logoHref = "/dashboard",
}: {
  nav?: "dashboard" | "demo";
  logoHref?: string;
}) {
  const pathname = usePathname();
  const items = navFor(nav);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-navy-900 text-white md:flex">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <SiteLogo className="text-white" href={logoHref} />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-500 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-white/40">
        EU AI Act compliance
      </div>
    </aside>
  );
}

/** Hamburger menu shown on mobile only (the fixed sidebar is desktop-only). */
export function MobileNav({ nav = "dashboard" }: { nav?: "dashboard" | "demo" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navFor(nav);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-secondary"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Menu sluiten"
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-16 z-30 bg-black/20"
          />
          <div className="absolute inset-x-0 top-16 z-40 border-b bg-background shadow-lg">
            <nav className="flex flex-col gap-1 p-3">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-navy-900 text-white"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
