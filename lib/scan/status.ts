import type { ArticleStatus } from "@/lib/scan/scoring";

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  compliant: "Op orde",
  in_progress: "Aandacht nodig",
  open: "Actie vereist",
};

/** Hex colors used by both the web UI and the PDF report. */
export const STATUS_COLOR: Record<ArticleStatus, string> = {
  compliant: "#10b981",
  in_progress: "#f59e0b",
  open: "#ef4444",
};

export const STATUS_BADGE: Record<
  ArticleStatus,
  "success" | "warning" | "danger"
> = {
  compliant: "success",
  in_progress: "warning",
  open: "danger",
};
