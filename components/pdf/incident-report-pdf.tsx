import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Incident } from "@prisma/client";

import {
  CATEGORY_LABEL,
  CATEGORY_ARTICLE,
  STATUS_LABEL,
  reportDeadline,
  reportDeadlineDays,
  POST_REPORT_DUTIES,
  type IncidentCategory,
  type IncidentStatus,
} from "@/lib/meldingen/labels";

const NAVY = "#0f172a";
const BRAND = "#6366f1";
const MUTED = "#64748b";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: NAVY, fontFamily: "Helvetica", lineHeight: 1.5 },
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
  h1: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  intro: { color: MUTED, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 6 },
  row: { flexDirection: "row", marginBottom: 3 },
  key: { width: 150, color: MUTED },
  val: { flex: 1 },
  deadlineBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
    color: "#92400e",
  },
  duty: { flexDirection: "row", marginBottom: 3 },
  bullet: { width: 12 },
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

function fmt(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d);
}

export function IncidentReportPdf({
  incident,
  companyName,
}: {
  incident: Incident;
  companyName: string;
}) {
  const facts = {
    category: incident.category,
    involvesDeath: incident.involvesDeath,
    widespread: incident.widespread,
  };
  const cap = reportDeadlineDays(facts);
  const deadline = reportDeadline(incident.awareAt, facts);
  const cat = incident.category as IncidentCategory;

  return (
    <Document title="ComplAI meldrapport" author="ComplAI">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>
            Compl<Text style={styles.brandAi}>AI</Text>
          </Text>
          <View>
            <Text style={styles.metaLabel}>Meldrapport ernstig incident · Art. 73</Text>
            <Text style={styles.metaLabel}>{companyName}</Text>
          </View>
        </View>

        <Text style={styles.h1}>{incident.title}</Text>
        <Text style={styles.intro}>
          Concept-meldrapport voor de markttoezichthouder op grond van artikel 73 van
          de EU AI-verordening. Controleer en vul aan vóór indiening.
        </Text>

        <Text style={styles.sectionTitle}>1. Incident</Text>
        <View style={styles.row}>
          <Text style={styles.key}>Categorie</Text>
          <Text style={styles.val}>
            {CATEGORY_LABEL[cat] ?? incident.category} ({CATEGORY_ARTICLE[cat] ?? "Art. 3(49)"})
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Overlijden betrokken</Text>
          <Text style={styles.val}>{incident.involvesDeath ? "Ja" : "Nee"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Wijdverspreide inbreuk</Text>
          <Text style={styles.val}>{incident.widespread ? "Ja" : "Nee"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Voorval op</Text>
          <Text style={styles.val}>{fmt(incident.occurredAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Bekend geworden op</Text>
          <Text style={styles.val}>{fmt(incident.awareAt)}</Text>
        </View>
        {incident.description ? (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.key}>Beschrijving</Text>
            <Text>{incident.description}</Text>
          </View>
        ) : null}

        <View style={styles.deadlineBox}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            Uiterste meldtermijn: {cap.days} dagen — {fmt(deadline)} ({cap.basis})
          </Text>
          <Text style={{ marginTop: 3 }}>
            Melden moet onmiddellijk na het vaststellen van een oorzakelijk verband (of
            de redelijke waarschijnlijkheid daarvan); de datum hierboven is de uiterste
            grens, geen streefdatum (Art. 73(2)).
          </Text>
        </View>

        <Text style={styles.sectionTitle}>2. Status</Text>
        <View style={styles.row}>
          <Text style={styles.key}>Status</Text>
          <Text style={styles.val}>{STATUS_LABEL[incident.status as IncidentStatus] ?? incident.status}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Gemeld op</Text>
          <Text style={styles.val}>{fmt(incident.reportedAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Kenmerk toezichthouder</Text>
          <Text style={styles.val}>{incident.reference || "—"}</Text>
        </View>

        <Text style={styles.sectionTitle}>3. Vervolgplichten na melding (Art. 73(6))</Text>
        {POST_REPORT_DUTIES.map((d, i) => (
          <View key={i} style={styles.duty}>
            <Text style={styles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{d}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          Gegenereerd door ComplAI · Beslissingsondersteuning, geen juridisch advies · complai-eu.nl
        </Text>
      </Page>
    </Document>
  );
}
