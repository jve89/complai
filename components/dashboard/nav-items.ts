import {
  BookOpen,
  Database,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
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
    href: "/dashboard/team",
    label: "Medewerkers",
    description: "Nodig collega's uit en beheer rollen",
    icon: Users,
  },
  {
    href: "/dashboard/settings",
    label: "Instellingen",
    description: "Bedrijfsprofiel en abonnement",
    icon: Settings,
  },
];

/** Same nav, remapped to /demo/* (minus Instellingen) for the public demo. */
export const DEMO_NAV: NavItem[] = DASHBOARD_NAV.filter(
  (n) => n.href !== "/dashboard/settings"
).map((n) => ({
  ...n,
  href:
    n.href === "/dashboard"
      ? "/demo"
      : n.href.replace("/dashboard/", "/demo/"),
}));
