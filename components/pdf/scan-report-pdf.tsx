import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import type { ComplianceProfile } from "@/lib/compliance/types";

const NAVY = "#0f172a";
const BRAND = "#6366f1"; // indigo
const MUTED = "#64748b";

const HEADLINE_LABEL: Record<ComplianceProfile["headline"], string> = {
  prohibited: "Verboden praktijk",
  high_risk: "Hoog risico",
  high_notify: "Geen hoog risico (Art. 6(3)-uitzondering)",
  limited_risk: "Beperkt risico",
  out_of_scope: "Buiten de reikwijdte",
  excluded: "Uitgesloten",
  minimal: "Minimaal risico",
};

const TIER_LABEL: Record<string, string> = {
  gratis: "Scan",
  starter: "Basis",
  groei: "Compliance",
  schaal: "Audit",
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: NAVY, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
    paddingBottom: 12,
    marginBottom: 20,
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  brandAi: { color: BRAND },
  metaLabel: { fontSize: 9, color: MUTED, textAlign: "right" },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  intro: { color: MUTED, marginBottom: 18, lineHeight: 1.5 },
  scoreBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 18,
    marginBottom: 22,
  },
  scoreNumber: { fontSize: 40, fontFamily: "Helvetica-Bold", color: BRAND },
  scoreSummary: { flex: 1, marginLeft: 18, lineHeight: 1.5 },
  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 8, marginTop: 8 },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 7,
    flexDirection: "row",
  },
  rowMain: { flex: 1, paddingRight: 8 },
  rowTitle: { fontFamily: "Helvetica-Bold" },
  rowDesc: { color: MUTED, fontSize: 9, marginTop: 1 },
  status: { width: 60, textAlign: "right", fontSize: 9, fontFamily: "Helvetica-Bold" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
});

function statusLabel(status: string) {
  if (status === "compliant" || status === "done") return "Op orde";
  if (status === "in_progress") return "Bezig";
  return "Te doen";
}

export function ScanReportPdf({
  profile,
  date,
}: {
  profile: ComplianceProfile;
  date: string;
}) {
  const required = profile.obligations.filter((o) => o.required);
  const advisory = profile.obligations.filter((o) => !o.required);

  return (
    <Document title="ComplAI compliance-rapport" author="ComplAI">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>
            Compl<Text style={styles.brandAi}>AI</Text>
          </Text>
          <View>
            <Text style={styles.metaLabel}>EU AI Act compliance-rapport</Text>
            <Text style={styles.metaLabel}>{date}</Text>
          </View>
        </View>

        <Text style={styles.h1}>Uw compliance-rapport</Text>
        <Text style={styles.intro}>
          Op basis van uw antwoorden. Dit is beslissingsondersteuning, geen juridisch advies en
          geen garantie op naleving.
        </Text>

        <View style={styles.scoreBox}>
          <View style={{ alignItems: "center", width: 110 }}>
            <Text style={styles.scoreNumber}>{profile.score}</Text>
            <Text style={{ fontSize: 10, color: MUTED }}>gereedheid /100</Text>
          </View>
          <View style={styles.scoreSummary}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
              {HEADLINE_LABEL[profile.headline]}
            </Text>
            <Text>
              Aanbevolen plan: {TIER_LABEL[profile.recommendedTier] ?? profile.recommendedTier}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Wat u moet doen ({required.length})</Text>
        {required.length === 0 ? (
          <Text style={{ color: MUTED }}>Geen verplichte acties gevonden.</Text>
        ) : (
          required.map((o) => (
            <View key={o.code} style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>
                  {o.title} ({o.article})
                </Text>
                <Text style={styles.rowDesc}>{o.description}</Text>
              </View>
              <Text style={styles.status}>{statusLabel(o.status)}</Text>
            </View>
          ))
        )}

        {advisory.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
              Aanbevolen ({advisory.length})
            </Text>
            {advisory.map((o) => (
              <View key={o.code} style={styles.row}>
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle}>
                    {o.title} ({o.article})
                  </Text>
                  <Text style={styles.rowDesc}>{o.description}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={styles.footer}>
          Gegenereerd door ComplAI · Beslissingsondersteuning, geen juridisch advies · complai-eu.nl
        </Text>
      </Page>
    </Document>
  );
}
