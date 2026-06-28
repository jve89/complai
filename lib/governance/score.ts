import type {
  AiSystem,
  ComplianceItem,
  Document,
  Employee,
} from "@prisma/client";

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

const REQUIRED_DOCS: { type: string; label: string }[] = [
  { type: "ai_policy", label: "AI-beleid" },
  { type: "risk_assessment", label: "Risicobeoordeling" },
  { type: "transparency", label: "Transparantieverklaring" },
];

export function currentQuarter(now: Date): string {
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `Q${q} ${now.getFullYear()}`;
}

function isFresh(date: Date, now: Date): boolean {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - DOC_VALID_MONTHS);
  return date >= cutoff;
}

export function computeGovernance(
  data: {
    aiSystems: AiSystem[];
    documents: Document[];
    employees: Employee[];
    complianceItems: ComplianceItem[];
  },
  now: Date
): GovernanceReport {
  const { aiSystems, documents, employees, complianceItems } = data;

  const highRisk = aiSystems.filter(
    (s) => s.riskLevel === "high" || s.riskLevel === "unacceptable"
  );
  // FRIA is only required when there are high-risk systems.
  const requiredDocs = highRisk.length
    ? [...REQUIRED_DOCS, { type: "fria", label: "FRIA" }]
    : REQUIRED_DOCS;

  // Latest version per document type, and whether it is still fresh.
  const latestByType = new Map<string, Document>();
  for (const doc of documents) {
    const prev = latestByType.get(doc.type);
    if (!prev || doc.createdAt > prev.createdAt) latestByType.set(doc.type, doc);
  }
  const freshDocTypes = requiredDocs.filter((d) => {
    const doc = latestByType.get(d.type);
    return doc && isFresh(doc.createdAt, now);
  });

  const trained = employees.filter((e) => e.trainingCompleted);
  const openItems = complianceItems.filter((i) => i.status !== "compliant");
  const art5 = complianceItems.find((i) => i.article === "Art. 5");
  const highRiskInReview = highRisk.filter((s) => s.status === "review");

  // ── Quarterly checks ────────────────────────────────────────────────────────
  const checks: GovernanceCheck[] = [
    {
      id: "register",
      label: "AI-register actueel",
      detail: aiSystems.length
        ? `${aiSystems.length} systemen geregistreerd en geclassificeerd.`
        : "Er zijn nog geen AI-systemen geregistreerd.",
      done: aiSystems.length > 0,
      progress: aiSystems.length > 0 ? 1 : 0,
    },
    {
      id: "documents",
      label: "Documenten up-to-date",
      detail: `${freshDocTypes.length}/${requiredDocs.length} vereiste documenten actueel (< ${DOC_VALID_MONTHS} mnd).`,
      done: freshDocTypes.length === requiredDocs.length,
      progress: requiredDocs.length
        ? freshDocTypes.length / requiredDocs.length
        : 1,
    },
    {
      id: "training",
      label: "AI-geletterdheid geborgd",
      detail: employees.length
        ? `${trained.length}/${employees.length} medewerkers hebben de training afgerond.`
        : "Er zijn nog geen medewerkers toegevoegd.",
      done: employees.length > 0 && trained.length === employees.length,
      progress: employees.length ? trained.length / employees.length : 0,
    },
    {
      id: "prohibited",
      label: "Verboden praktijken getoetst (Art. 5)",
      detail:
        art5?.status === "compliant"
          ? "Getoetst en in orde."
          : "Toets op verboden AI-praktijken is nog niet afgerond.",
      done: art5?.status === "compliant",
      progress: art5?.status === "compliant" ? 1 : 0,
    },
    {
      id: "highrisk",
      label: "Hoog-risico systemen beoordeeld",
      detail: highRisk.length
        ? highRiskInReview.length
          ? `${highRiskInReview.length} hoog-risico systeem(en) nog in beoordeling.`
          : "Alle hoog-risico systemen zijn beoordeeld."
        : "Geen hoog-risico systemen in gebruik.",
      done: highRiskInReview.length === 0,
      progress: highRisk.length
        ? (highRisk.length - highRiskInReview.length) / highRisk.length
        : 1,
    },
  ];

  const score = Math.round(
    (checks.reduce((sum, c) => sum + c.progress, 0) / checks.length) * 100
  );

  // ── Alerts ──────────────────────────────────────────────────────────────────
  const alerts: GovernanceAlert[] = [];

  for (const d of requiredDocs) {
    const doc = latestByType.get(d.type);
    if (!doc) {
      alerts.push({
        severity: "warning",
        message: `Document ontbreekt: ${d.label} is nog niet gegenereerd.`,
      });
    } else if (!isFresh(doc.createdAt, now)) {
      alerts.push({
        severity: "danger",
        message: `Document verlopen: ${d.label} is ouder dan ${DOC_VALID_MONTHS} maanden.`,
      });
    }
  }

  const untrained = employees.filter((e) => !e.trainingCompleted);
  if (untrained.length) {
    alerts.push({
      severity: "warning",
      message: `Certificaat ontbreekt voor ${untrained.length} medewerker(s): ${untrained
        .map((e) => e.name)
        .join(", ")}.`,
    });
  }

  for (const item of openItems) {
    alerts.push({
      severity: item.status === "open" ? "danger" : "warning",
      message: `Openstaand compliance-punt (${item.article}): ${item.title}.`,
    });
  }

  for (const s of highRiskInReview) {
    alerts.push({
      severity: "danger",
      message: `Hoog-risico systeem nog niet beoordeeld: ${s.name}.`,
    });
  }

  return { score, quarter: currentQuarter(now), checks, alerts };
}
