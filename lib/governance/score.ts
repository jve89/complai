import type {
  AiSystem,
  ComplianceItem,
  Document,
  Employee,
} from "@prisma/client";

import type { ComplianceProfile } from "@/lib/compliance/types";
import { docLabel } from "@/lib/compliance/labels";

export interface GovernanceCheck {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  /** 0–1 sub-progress, shown as a small bar where it makes sense. */
  progress: number;
}

export interface GovernanceAlert {
  severity: "danger" | "warning";
  message: string;
}

export interface GovernanceReport {
  score: number; // 0–100
  quarter: string; // e.g. "Q2 2026"
  checks: GovernanceCheck[];
  alerts: GovernanceAlert[];
}

/** Documents older than this are considered out of date and must be regenerated. */
const DOC_VALID_MONTHS = 12;
const DAY = 1000 * 60 * 60 * 24;

/** Fallback required documents when the company has no profile yet (never scanned). */
const FALLBACK_DOC_SLUGS = ["ai_policy", "risk_assessment", "transparency"];

/** Minimal obligation shape governance reads, from the profile or materialised items. */
interface Obl {
  code: string;
  title: string;
  article: string;
  status: string;
  required: boolean;
  evidenceKind?: string;
  deadline?: string;
}

export function currentQuarter(now: Date): string {
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `Q${q} ${now.getFullYear()}`;
}

function isFresh(date: Date, now: Date): boolean {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - DOC_VALID_MONTHS);
  return date >= cutoff;
}

const isDoneStatus = (s: string) => s === "compliant" || s === "done";

export function computeGovernance(
  data: {
    aiSystems: AiSystem[];
    documents: Document[];
    employees: Employee[];
    complianceItems: ComplianceItem[];
    profile: ComplianceProfile | null;
    /** Outstanding-escalation signal for the Art 26(5) monitoring check. */
    incidents?: { status: string }[];
    complaints?: { status: string }[];
  },
  now: Date
): GovernanceReport {
  const { aiSystems, documents, employees, complianceItems, profile } = data;
  const incidents = data.incidents ?? [];
  const complaints = data.complaints ?? [];

  // Obligations come from the profile; fall back to the materialised items for a
  // company that scanned before profileJson existed. No hardcoded articles.
  const obligations: Obl[] =
    profile?.obligations ??
    complianceItems.map((i) => ({
      code: i.code ?? i.id,
      title: i.title,
      article: i.article,
      status: i.status as string,
      required: i.required ?? true,
      evidenceKind: undefined,
      deadline: i.deadline ? i.deadline.toISOString() : undefined,
    }));
  const requiredObs = obligations.filter((o) => o.required);

  // Live status per obligation code from the materialised items (authoritative).
  const statusByCode = new Map(complianceItems.map((i) => [i.code ?? i.id, i.status as string]));
  const obDone = (o: Obl) => isDoneStatus(statusByCode.get(o.code) ?? o.status);

  // Latest version per document type/slug, and freshness.
  const latestByType = new Map<string, Document>();
  for (const doc of documents) {
    const prev = latestByType.get(doc.type);
    if (!prev || doc.createdAt > prev.createdAt) latestByType.set(doc.type, doc);
  }

  const requiredDocSlugs = profile
    ? profile.documents.required.map((d) => d.slug)
    : FALLBACK_DOC_SLUGS;
  const freshDocSlugs = requiredDocSlugs.filter((slug) => {
    const doc = latestByType.get(slug);
    return doc && isFresh(doc.createdAt, now);
  });

  const trainingRequired = profile ? profile.training.required.length > 0 : true;
  const trained = employees.filter((e) => e.trainingCompleted);

  // ── Checks (only the ones that apply to this company's profile) ─────────────
  const checks: GovernanceCheck[] = [];

  checks.push({
    id: "register",
    label: "AI-register actueel",
    detail: aiSystems.length
      ? `${aiSystems.length} systemen geregistreerd en geclassificeerd.`
      : "Er zijn nog geen AI-systemen geregistreerd.",
    done: aiSystems.length > 0,
    progress: aiSystems.length > 0 ? 1 : 0,
  });

  if (requiredDocSlugs.length > 0) {
    checks.push({
      id: "documents",
      label: "Documenten up-to-date",
      detail: `${freshDocSlugs.length}/${requiredDocSlugs.length} vereiste documenten actueel (< ${DOC_VALID_MONTHS} mnd).`,
      done: freshDocSlugs.length === requiredDocSlugs.length,
      progress: freshDocSlugs.length / requiredDocSlugs.length,
    });
  }

  if (trainingRequired) {
    checks.push({
      id: "training",
      label: "AI-geletterdheid geborgd (Art. 4)",
      detail: employees.length
        ? `${trained.length}/${employees.length} medewerkers hebben de training afgerond.`
        : "Er zijn nog geen medewerkers toegevoegd.",
      done: employees.length > 0 && trained.length === employees.length,
      progress: employees.length ? trained.length / employees.length : 0,
    });
  }

  if (requiredObs.length > 0) {
    const doneObs = requiredObs.filter(obDone);
    checks.push({
      id: "obligations",
      label: "Verplichtingen op orde",
      detail: `${doneObs.length}/${requiredObs.length} verplichte acties uit uw scan afgerond.`,
      done: doneObs.length === requiredObs.length,
      progress: requiredObs.length ? doneObs.length / requiredObs.length : 1,
    });
  }

  // Post-market monitoring (Art 26(5)) — only for deployers of a high-risk system.
  // Art 26(5) is a DEPLOYER duty (monitor operation per the instructions for use;
  // on a risk, suspend + inform the aanbieder/markttoezichthouder) — NOT the
  // provider's Art 72 monitoring system. It becomes mandatory 2 Dec 2027, so this
  // is a get-ready quarterly review. "Done" reflects whether the monitoring loop
  // has no outstanding escalations to review: open incidents + open/in-behandeling
  // complaints. A clean company stays complete; open items nudge action.
  if (aiSystems.some((s) => s.riskLevel === "high")) {
    const incidentsOpen = incidents.filter((i) => i.status === "open").length;
    const complaintsOpen = complaints.filter(
      (c) => c.status === "open" || c.status === "in_progress"
    ).length;
    const total = incidents.length + complaints.length;
    const outstanding = incidentsOpen + complaintsOpen;
    const detail =
      total === 0
        ? "Nog geen incidenten of klachten. Volg de werking van uw hoog-risico systemen op basis van de gebruiksaanwijzing (Art. 26(5))."
        : outstanding === 0
          ? "Alle incidenten en klachten afgehandeld. Blijf de werking volgen en escaleer risico's tijdig."
          : `${outstanding} openstaand(e) incident(en)/klacht(en) om te beoordelen. Schort bij een risico op en informeer de aanbieder en de markttoezichthouder.`;
    checks.push({
      id: "postmarket_monitoring",
      label: "Werking hoog-risico AI gemonitord (Art. 26(5))",
      detail,
      done: outstanding === 0,
      progress: total === 0 ? 1 : (total - outstanding) / total,
    });
  }

  const score = checks.length
    ? Math.round((checks.reduce((sum, c) => sum + c.progress, 0) / checks.length) * 100)
    : 100;

  // ── Alerts ──────────────────────────────────────────────────────────────────
  const alerts: GovernanceAlert[] = [];

  for (const slug of requiredDocSlugs) {
    const doc = latestByType.get(slug);
    if (!doc) {
      alerts.push({
        severity: "warning",
        message: `Document ontbreekt: ${docLabel(slug)} is nog niet gegenereerd.`,
      });
    } else if (!isFresh(doc.createdAt, now)) {
      alerts.push({
        severity: "danger",
        message: `Document verlopen: ${docLabel(slug)} is ouder dan ${DOC_VALID_MONTHS} maanden.`,
      });
    }
  }

  if (trainingRequired) {
    const untrained = employees.filter((e) => !e.trainingCompleted);
    if (untrained.length) {
      alerts.push({
        severity: "warning",
        message: `Certificaat ontbreekt voor ${untrained.length} medewerker(s): ${untrained
          .map((e) => e.name)
          .join(", ")}.`,
      });
    }
  }

  // Open required obligations, deadline-aware.
  for (const o of requiredObs) {
    if (obDone(o)) continue;
    const overdue = o.deadline ? new Date(o.deadline).getTime() < now.getTime() : false;
    const soon = o.deadline
      ? !overdue && new Date(o.deadline).getTime() - now.getTime() < 90 * DAY
      : false;
    const when = o.deadline
      ? overdue
        ? " — deadline verstreken"
        : soon
          ? ` — deadline nadert (${new Date(o.deadline).toLocaleDateString("nl-NL")})`
          : ""
      : "";
    alerts.push({
      severity: overdue ? "danger" : "warning",
      message: `Openstaande verplichting (${o.article}): ${o.title}${when}.`,
    });
  }

  return { score, quarter: currentQuarter(now), checks, alerts };
}
