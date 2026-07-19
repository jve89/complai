"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Lock, Menu, ShieldCheck, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SurfaceState } from "@/lib/compliance/relevance";
import { UPDATES_SEEN_KEY } from "@/lib/updates-seen";
import { SiteLogo } from "@/components/site-logo";
import {
  DASHBOARD_NAV,
  DEMO_NAV,
  navTree,
  type NavItem,
} from "@/components/dashboard/nav-items";

const ADMIN_ITEM = {
  href: "/dashboard/admin",
  label: "ComplAI-beheer",
  icon: ShieldCheck,
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/demo") return pathname === href;
  return pathname.startsWith(href);
}

/** Count of relevant updates newer than the last time this device opened the
 *  feed. Client-only (reads localStorage in an effect) so SSR stays stable. */
function UpdatesBadge({ dates }: { dates: string[] }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let seenTime = 0;
    try {
      const s = window.localStorage.getItem(UPDATES_SEEN_KEY);
      if (s) seenTime = Date.parse(s);
    } catch {
      /* ignore */
    }
    setCount(dates.filter((d) => Date.parse(`${d}T12:00:00Z`) > seenTime).length);
  }, [dates]);
  if (count <= 0) return null;
  return (
    <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white">
      {count}
    </span>
  );
}

// Nav is chosen by a serializable string (icons are functions and can't be passed
// from a Server Component across the client boundary).
const navFor = (nav: "dashboard" | "demo") =>
  nav === "demo" ? DEMO_NAV : DASHBOARD_NAV;

const idleCls = (dark: boolean) =>
  dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-foreground hover:bg-secondary";
const activeCls = (dark: boolean) => (dark ? "bg-brand-500 text-white" : "bg-navy-900 text-white");

/** A single nav link. Relevance drives only a small lock glyph (relevant but the
 *  pakket is too low) — items are never dimmed or hidden. */
function NavLink({
  item,
  dark,
  active,
  locked,
  indent,
  updateDates,
  onNavigate,
}: {
  item: NavItem;
  dark: boolean;
  active: boolean;
  locked: boolean;
  indent?: boolean;
  updateDates: string[];
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg py-2.5 pr-3 text-sm font-medium transition-colors",
        indent ? "pl-4" : "px-3",
        active ? activeCls(dark) : idleCls(dark)
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {item.label}
      {locked && (
        <>
          <Lock className={cn("ml-auto h-3.5 w-3.5 shrink-0", dark ? "text-white/50" : "text-muted-foreground")} />
          <span className="sr-only">(vergrendeld — hoger pakket vereist)</span>
        </>
      )}
      {slugIsUpdates(item.href) && <UpdatesBadge dates={updateDates} />}
    </Link>
  );
}

const slugIsUpdates = (href: string) => href === "/dashboard/updates" || href === "/demo/updates";

/** The collapsible "Hoog-risico" duty-modules section. Collapsed by default for a
 *  cleaner menu; auto-expands only when the current route is inside it (so the active
 *  item is never hidden). When no module is relevant it also shows a short
 *  "geldt bij hoog-risico AI" note. */
function NavGroupSection({
  label,
  icon: Icon,
  items,
  dark,
  relevance,
  pathname,
  updateDates,
  onNavigate,
}: {
  label: string;
  icon: NavItem["icon"];
  items: NavItem[];
  dark: boolean;
  relevance: Record<string, SurfaceState>;
  pathname: string;
  updateDates: string[];
  onNavigate?: () => void;
}) {
  const anyRelevant = items.some((i) => relevance[i.href] !== "irrelevant");
  const containsActive = items.some((i) => isActive(pathname, i.href));
  const [open, setOpen] = useState(false);
  const isOpen = open || containsActive;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          idleCls(dark)
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {label}
        <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className={cn("mt-1 space-y-1 border-l pl-2", dark ? "ml-5 border-white/10" : "ml-5 border-border")}>
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              dark={dark}
              active={isActive(pathname, item.href)}
              locked={relevance[item.href] === "locked"}
              indent
              updateDates={updateDates}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
      {isOpen && !anyRelevant && (
        <p className={cn("px-3 pb-1 pt-1 text-[11px]", dark ? "text-white/70" : "text-muted-foreground")}>
          Van toepassing zodra u hoog-risico AI inzet.
        </p>
      )}
    </div>
  );
}

/** Shared renderer for the nav entries (top-level items + the collapsible group). */
function NavEntries({
  nav,
  isAdmin,
  dark,
  relevance,
  pathname,
  updateDates,
  onNavigate,
}: {
  nav: "dashboard" | "demo";
  isAdmin: boolean;
  dark: boolean;
  relevance: Record<string, SurfaceState>;
  pathname: string;
  updateDates: string[];
  onNavigate?: () => void;
}) {
  const entries = navTree(navFor(nav).filter((i) => !i.adminOnly || isAdmin));
  return (
    <>
      {entries.map((entry) =>
        entry.kind === "item" ? (
          <NavLink
            key={entry.item.href}
            item={entry.item}
            dark={dark}
            active={isActive(pathname, entry.item.href)}
            locked={relevance[entry.item.href] === "locked"}
            updateDates={updateDates}
            onNavigate={onNavigate}
          />
        ) : (
          <NavGroupSection
            key={entry.label}
            label={entry.label}
            icon={entry.icon}
            items={entry.items}
            dark={dark}
            relevance={relevance}
            pathname={pathname}
            updateDates={updateDates}
            onNavigate={onNavigate}
          />
        )
      )}
    </>
  );
}

/** Desktop sidebar (fixed, hidden on mobile — see Topbar for mobile nav). */
export function Sidebar({
  nav = "dashboard",
  logoHref = "/dashboard",
  showAdmin = false,
  isAdmin = true,
  updateDates = [],
  relevance = {},
}: {
  nav?: "dashboard" | "demo";
  logoHref?: string;
  showAdmin?: boolean;
  /** Company beheerder — false hides adminOnly items (e.g. Medewerkers). */
  isAdmin?: boolean;
  /** ISO dates of updates relevant to this company — drives the "new" badge. */
  updateDates?: string[];
  /** Scan-driven visibility state per nav href (absent = always shown). */
  relevance?: Record<string, SurfaceState>;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-navy-900 text-white md:flex">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <SiteLogo className="text-white" href={logoHref} />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <NavEntries
          nav={nav}
          isAdmin={isAdmin}
          dark
          relevance={relevance}
          pathname={pathname}
          updateDates={updateDates}
        />
        {showAdmin && (
          <Link
            href={ADMIN_ITEM.href}
            className={cn(
              "mt-1 flex items-center gap-3 rounded-lg border-t border-white/10 px-3 py-2.5 pt-4 text-sm font-medium transition-colors",
              isActive(pathname, ADMIN_ITEM.href) ? "text-brand-300" : idleCls(true)
            )}
          >
            <ADMIN_ITEM.icon className="h-5 w-5 shrink-0" />
            {ADMIN_ITEM.label}
          </Link>
        )}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-white/70">
        EU AI Act compliance
      </div>
    </aside>
  );
}

/** Hamburger menu shown on mobile only (the fixed sidebar is desktop-only).
 * `actions` render at the bottom of the panel (e.g. Website / Uitloggen). */
export function MobileNav({
  nav = "dashboard",
  actions,
  showAdmin = false,
  isAdmin = true,
  updateDates = [],
  relevance = {},
}: {
  nav?: "dashboard" | "demo";
  actions?: ReactNode;
  showAdmin?: boolean;
  /** Company beheerder — false hides adminOnly items (e.g. Medewerkers). */
  isAdmin?: boolean;
  /** ISO dates of updates relevant to this company — drives the "new" badge. */
  updateDates?: string[];
  /** Scan-driven visibility state per nav href (absent = always shown). */
  relevance?: Record<string, SurfaceState>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

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
            onClick={close}
            className="fixed inset-x-0 bottom-0 top-16 z-30 bg-black/20"
          />
          <div className="absolute inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b bg-background shadow-lg">
            <nav className="flex flex-col gap-1 p-3">
              <NavEntries
                nav={nav}
                isAdmin={isAdmin}
                dark={false}
                relevance={relevance}
                pathname={pathname}
                updateDates={updateDates}
                onNavigate={close}
              />
              {showAdmin && (
                <Link
                  href={ADMIN_ITEM.href}
                  onClick={close}
                  className={cn(
                    "mt-1 flex items-center gap-3 rounded-lg border-t px-3 py-2.5 pt-4 text-sm font-medium",
                    isActive(pathname, ADMIN_ITEM.href) ? "bg-navy-900 text-white" : "text-foreground hover:bg-secondary"
                  )}
                >
                  <ADMIN_ITEM.icon className="h-5 w-5" />
                  {ADMIN_ITEM.label}
                </Link>
              )}
            </nav>
            {actions && (
              <div className="flex flex-col gap-2 border-t p-3" onClick={close}>
                {actions}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
