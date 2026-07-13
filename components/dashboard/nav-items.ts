import {
  BellRing,
  BookOpen,
  Database,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Siren,
  Users,
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
    description: "Ernstige incidenten melden (Art. 73)",
    icon: Siren,
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

/** Same nav, remapped to /demo/* for the public demo. Instellingen, Updates and
 *  Meldingen have no /demo/* counterpart, so they're excluded. */
export const DEMO_NAV: NavItem[] = DASHBOARD_NAV.filter(
  (n) =>
    n.href !== "/dashboard/settings" &&
    n.href !== "/dashboard/updates" &&
    n.href !== "/dashboard/meldingen"
).map((n) => ({
  ...n,
  href:
    n.href === "/dashboard"
      ? "/demo"
      : n.href.replace("/dashboard/", "/demo/"),
}));
