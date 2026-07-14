import {
  Archive,
  BellRing,
  BookOpen,
  ClipboardCheck,
  Database,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Settings,
  ShieldAlert,
  Siren,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Hidden from managers/medewerkers (only the beheerder sees it). */
  adminOnly?: boolean;
}

export const DASHBOARD_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overzicht",
    description: "Uw compliance-score en openstaande acties",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/register",
    label: "AI-register",
    description: "Beheer al uw AI-systemen en risicoclassificatie",
    icon: Database,
  },
  {
    href: "/dashboard/meldingen",
    label: "Meldingen",
    description: "Ernstige incidenten melden",
    icon: Siren,
  },
  {
    href: "/dashboard/kennisgevingen",
    label: "Kennisgevingen",
    description: "Informeren & uitleg bij AI-besluiten",
    icon: Megaphone,
  },
  {
    href: "/dashboard/logbewaring",
    label: "Logbewaring",
    description: "Bewaartermijn van AI-logs vastleggen",
    icon: Archive,
  },
  {
    href: "/dashboard/klachten",
    label: "Klachten",
    description: "Klachten over AI-besluiten registreren",
    icon: MessageSquareWarning,
  },
  {
    href: "/dashboard/conformiteit",
    label: "Conformiteit",
    description: "Conformiteitsbeoordeling per hoog-risico systeem",
    icon: ClipboardCheck,
  },
  {
    href: "/dashboard/corrigerend",
    label: "Corrigerende maatregelen",
    description: "Maatregelen bij non-conformiteit",
    icon: Wrench,
  },
  {
    href: "/dashboard/documents",
    label: "Documenten",
    description: "Genereer beleid, FRIA en beoordelingen",
    icon: FileText,
  },
  {
    href: "/dashboard/training",
    label: "E-learning",
    description: "Leerpaden, quizzen en certificaten",
    icon: GraduationCap,
  },
  {
    href: "/dashboard/kennisbank",
    label: "Kennisbank",
    description: "De AI Act helder uitgelegd",
    icon: BookOpen,
  },
  {
    href: "/dashboard/updates",
    label: "Updates",
    description: "Wijzigingen in de AI Act — en wat wij bijwerkten",
    icon: BellRing,
  },
  {
    href: "/dashboard/team",
    label: "Medewerkers",
    description: "Nodig collega's uit en beheer rollen",
    icon: Users,
    adminOnly: true,
  },
  {
    href: "/dashboard/settings",
    label: "Instellingen",
    description: "Bedrijfsprofiel en abonnement",
    icon: Settings,
  },
];

/** Same nav, remapped to /demo/* for the public demo. Only Instellingen is left
 *  out (account/billing config that has no meaning without a real account); every
 *  other surface — including the Wave modules and Updates — has a /demo/* re-export
 *  so the demo IS the full Audit-tier dashboard. */
export const DEMO_NAV: NavItem[] = DASHBOARD_NAV.filter(
  (n) => n.href !== "/dashboard/settings"
).map((n) => ({
  ...n,
  href:
    n.href === "/dashboard"
      ? "/demo"
      : n.href.replace("/dashboard/", "/demo/"),
}));

// ── Collapsible grouping for the sidebar ────────────────────────────────────
// The six high-risk duty modules fold into ONE collapsible section so the nav
// stays short. The group carries relevance (expanded when high-risk, collapsed
// otherwise) — the module PAGE explains per-module applicability, so nav items
// themselves are never dimmed.
export const HIGH_RISK_SLUGS = [
  "meldingen",
  "kennisgevingen",
  "logbewaring",
  "klachten",
  "conformiteit",
  "corrigerend",
] as const;

export type NavEntry =
  | { kind: "item"; item: NavItem }
  | { kind: "group"; label: string; icon: LucideIcon; items: NavItem[] };

const slugOf = (href: string) => href.split("/").pop() ?? "";

/** Fold the contiguous high-risk module items into one group, keeping every other
 *  item top-level and in order. Works for both /dashboard and /demo hrefs. */
export function navTree(items: NavItem[]): NavEntry[] {
  const entries: NavEntry[] = [];
  const groupItems: NavItem[] = [];
  for (const item of items) {
    if ((HIGH_RISK_SLUGS as readonly string[]).includes(slugOf(item.href))) {
      if (groupItems.length === 0) {
        entries.push({ kind: "group", label: "Hoog-risico verplichtingen", icon: ShieldAlert, items: groupItems });
      }
      groupItems.push(item);
    } else {
      entries.push({ kind: "item", item });
    }
  }
  return entries;
}
