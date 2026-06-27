import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import type { ScanReport } from "@/lib/scan/scoring";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/scan/status";

const NAVY = "#0f172a";
const EMERALD = "#10b981";
const MUTED = "#64748b";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: NAVY, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: EMERALD,
    paddingBottom: 12,
    marginBottom: 20,
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  brandAi: { color: EMERALD },
  metaLabel: { fontSize: 9, color: MUTED, textAlign: "right" },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  intro: { color: MUTED, marginBottom: 20, lineHeight: 1.5 },
  scoreBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
  },
  scoreNumber: { fontSize: 44, fontFamily: "Helvetica-Bold", color: EMERALD },
  scoreOutOf: { fontSize: 16, color: MUTED },
  scoreSummary: { flex: 1, marginLeft: 20, lineHeight: 1.5 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    marginTop: 8,
  },
  articleRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  articleName: { width: 150, fontFamily: "Helvetica-Bold" },
  articleSummary: { flex: 1, color: MUTED, paddingRight: 8 },
  statusTag: { width: 90, textAlign: "right", fontFamily: "Helvetica-Bold" },
  action: {
    flexDirection: "row",
    marginBottom: 12,
  },
  actionNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: NAVY,
    color: "#ffffff",
    textAlign: "center",
    paddingTop: 5,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginRight: 10,
  },
  actionTitle: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  actionDesc: { color: MUTED, lineHeight: 1.4 },
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

export function ScanReportPdf({
  report,
  date,
}: {
  report: ScanReport;
  date: string;
}) {
  return (
    <Document title="ComplAI risicoscan-rapport" author="ComplAI">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>
            Compl<Text style={styles.brandAi}>AI</Text>
          </Text>
          <View>
            <Text style={styles.metaLabel}>EU AI Act risicoscan</Text>
            <Text style={styles.metaLabel}>{date}</Text>
          </View>
        </View>

        <Text style={styles.h1}>Uw compliance-rapport</Text>
        <Text style={styles.intro}>
          Dit rapport geeft op basis van uw antwoorden een indicatie van uw
          status ten opzichte van de EU AI Act. Het is bedoeld als startpunt en
          niet als juridisch advies.
        </Text>

        <View style={styles.scoreBox}>
          <View style={{ alignItems: "center", width: 120 }}>
            <Text style={styles.scoreNumber}>{report.score}</Text>
            <Text style={styles.scoreOutOf}>van de 100</Text>
          </View>
          <Text style={styles.scoreSummary}>{report.summary}</Text>
        </View>

        <Text style={styles.sectionTitle}>Status per AI Act-artikel</Text>
        {report.articles.map((a) => (
          <View key={a.article} style={styles.articleRow}>
            <View
              style={[styles.dot, { backgroundColor: STATUS_COLOR[a.status] }]}
            />
            <Text style={styles.articleName}>
              {a.article} · {a.title}
            </Text>
            <Text style={styles.articleSummary}>{a.summary}</Text>
            <Text style={[styles.statusTag, { color: STATUS_COLOR[a.status] }]}>
              {STATUS_LABEL[a.status]}
            </Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Uw belangrijkste vervolgstappen
        </Text>
        {report.priorityActions.length === 0 ? (
          <Text style={{ color: MUTED }}>
            U heeft de belangrijkste verplichtingen op orde. Houd uw compliance
            actueel.
          </Text>
        ) : (
          report.priorityActions.map((action, i) => (
            <View key={i} style={styles.action}>
              <Text style={styles.actionNum}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>
                  {action.title} ({action.article})
                </Text>
                <Text style={styles.actionDesc}>{action.description}</Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.footer}>
          Gegenereerd door ComplAI · Dit rapport is een indicatie en geen
          juridisch advies · complai.nl
        </Text>
      </Page>
    </Document>
  );
}
