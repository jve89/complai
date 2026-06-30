import {
  BarChart3,
  BookOpen,
  Database,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ScanSearch,
  Settings,
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
    href: "/dashboard/schaduw-ai",
    label: "Schaduw-AI",
    description: "Spoor ongeregistreerd AI-gebruik op",
    icon: ScanSearch,
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
    href: "/dashboard/governance",
    label: "Governance",
    description: "Kwartaalchecks en signalen",
    icon: BarChart3,
  },
  {
    href: "/kennisbank",
    label: "Kennisbank",
    description: "De AI Act helder uitgelegd",
    icon: BookOpen,
  },
  {
    href: "/dashboard/settings",
    label: "Instellingen",
    description: "Bedrijfsprofiel, team en abonnement",
    icon: Settings,
  },
];
