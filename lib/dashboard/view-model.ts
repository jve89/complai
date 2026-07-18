// Pure derivation for the dashboard home page — everything the page computes from
// the already-fetched rows, lifted out of app/dashboard/page.tsx so the page is
// mostly JSX and this logic is testable in isolation. No DB, no async: the page
// still does the fetching (and the async "updates" feed) and passes rows in.
import type { AiSystem, ComplianceItem, Document, Employee } from "@prisma/client";

import { evidenceFromData } from "@/lib/compliance/evidence";
import { resolveStatus } from "@/lib/compliance/resolve";
import {
  surfaceRelevance,
  surfaceState,
  HREF_TO_SURFACE,
  type SurfaceKey,
  type SurfaceRelevance,
  type SurfaceState,
} from "@/lib/compliance/relevance";
import type { ComplianceProfile } from "@/lib/compliance/types";
import { computeGovernance, type GovernanceReport } from "@/lib/governance/score";
import { tierRank } from "@/lib/plan";
import { DASHBOARD_NAV, type NavItem } from "@/components/dashboard/nav-items";

interface Obligation {
  code: string;
  title: string;
  article: string;
  status: string;
  required: boolean;
}

export interface DashboardView {
  required: Obligation[];
  openCount: number;
  outOfReach: boolean;
  gereedheidScore: number;
  systemsCount: number;
  trainedCount: number;
  employeesTotal: number;
  deadlines: ComplianceItem[];
  governance: GovernanceReport;
  voortgang: { score: number; variant: "success" | "warning" | "danger"; label: string };
  rel: Record<SurfaceKey, SurfaceRelevance>;
  notApplicableDuties: string[];
  liveExceedsScan: boolean;
  relevantLinks: NavItem[];
  irrelevantLinks: NavItem[];
  quickState: (href: string) => SurfaceState;
}

// Activity can only ADD progress — never downgrade what the scan established
// (protects self-reported readiness and manual/process obligations).
const RANK: Record<string, number> = { compliant: 2, done: 2, in_progress: 1, open: 0 };

const DUTY_SURFACES: SurfaceKey[] = [
  "meldingen",
  "kennisgevingen",
  "logbewaring",
  "klachten",
  "conformiteit",
  "corrigerend",
];

export function buildDashboardView(input: {
  company: { plan: string | null };
  profile: ComplianceProfile | null;
  isAdmin: boolean;
  aiSystems: AiSystem[];
  documents: Document[];
  employees: Employee[];
  items: ComplianceItem[];
  incidents: { status: string }[];
  complaints: { status: string }[];
  now: Date;
}): DashboardView {
  const { company, profile, isAdmin, aiSystems, documents, employees, items, incidents, complaints, now } = input;

  // Live evidence from the CURRENT state via the shared shape (can't drift from buildEvidence).
  const evidence = evidenceFromData({ documents, systemsRegistered: aiSystems.length, employees });
  const liveStatus = (code: string, frozen: string): string => {
    const resolved = resolveStatus(code, evidence);
    return (RANK[resolved] ?? 0) >= (RANK[frozen] ?? 0) ? resolved : frozen;
  };

  const obligationsFrozen: Obligation[] =
    profile?.obligations ??
    items.map((i) => ({
      code: i.code ?? i.id,
      title: i.title,
      article: i.article,
      status: i.status as string,
      required: i.required ?? true,
    }));
  const obligations = obligationsFrozen.map((o) => ({ ...o, status: liveStatus(o.code, o.status) }));
  const required = obligations.filter((o) => o.required);
  const openCount = required.filter((o) => o.status !== "done" && o.status !== "compliant").length;

  // Out-of-scope / excluded: the AI Act doesn't apply → a gereedheidsscore is meaningless.
  const outOfReach = profile?.headline === "out_of_scope" || profile?.headline === "excluded";

  // Gereedheid = the frozen scan snapshot (only a re-scan moves it); Voortgang is the live one.
  const gereedheidScore =
    profile?.score ??
    (() => {
      const req = obligationsFrozen.filter((o) => o.required);
      return req.length
        ? Math.round(
            (req.filter((o) => o.status === "compliant" || o.status === "done").length / req.length) * 100
          )
        : 0;
    })();

  // Live-status the compliance items too, so deadlines drop off once done.
  const liveItemStatus = (code: string, frozen: string): "compliant" | "open" | "in_progress" => {
    const resolved = resolveStatus(code, evidence);
    const norm: "compliant" | "open" | "in_progress" =
      resolved === "done" ? "compliant" : resolved === "in_progress" ? "in_progress" : "open";
    return (RANK[norm] ?? 0) >= (RANK[frozen] ?? 0) ? norm : (frozen as "compliant" | "open" | "in_progress");
  };
  const liveItems: ComplianceItem[] = items.map((i) => ({
    ...i,
    status: liveItemStatus(i.code ?? i.id, i.status),
  }));
  const deadlines = liveItems.filter((i) => i.deadline && i.status !== "compliant").slice(0, 4);

  const governance = computeGovernance(
    { aiSystems, documents, employees, complianceItems: liveItems, profile, incidents, complaints },
    now
  );
  const v = governance.score;
  const voortgang = {
    score: v,
    variant: (v >= 75 ? "success" : v >= 45 ? "warning" : "danger") as "success" | "warning" | "danger",
    label: v >= 75 ? "Goed op weg" : v >= 45 ? "Halverwege" : "Net begonnen",
  };

  const rel = surfaceRelevance(profile, aiSystems);
  const notApplicableDuties = DUTY_SURFACES.filter((k) => !rel[k].applies).map((k) => rel[k].reason);
  // A relevant duty whose tier sits ABOVE the scan's recommendation can only come from
  // the AI-register — nudge a re-scan rather than silently bumping the advice.
  const liveExceedsScan =
    Boolean(profile) &&
    DUTY_SURFACES.some(
      (k) => rel[k].applies && tierRank(rel[k].requiredTier) > tierRank(profile?.recommendedTier ?? "gratis")
    );

  const quickState = (href: string): SurfaceState => {
    const key = HREF_TO_SURFACE[href];
    return key ? surfaceState(rel[key], company.plan) : "shown";
  };
  const quickLinks = DASHBOARD_NAV.filter((n) => n.href !== "/dashboard" && (!n.adminOnly || isAdmin));
  const relevantLinks = quickLinks.filter((n) => quickState(n.href) !== "irrelevant");
  const irrelevantLinks = quickLinks.filter((n) => quickState(n.href) === "irrelevant");

  return {
    required,
    openCount,
    outOfReach,
    gereedheidScore,
    systemsCount: aiSystems.length,
    trainedCount: employees.filter((e) => e.trainingCompleted).length,
    employeesTotal: employees.length,
    deadlines,
    governance,
    voortgang,
    rel,
    notApplicableDuties,
    liveExceedsScan,
    relevantLinks,
    irrelevantLinks,
    quickState,
  };
}
