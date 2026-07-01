import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import type { DocumentContent } from "@/lib/documents/templates";

const NAVY = "#0f172a";
const EMERALD = "#6366f1"; // brand indigo
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontSize: 10.5,
    lineHeight: 1.5,
    color: NAVY,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: EMERALD,
    paddingBottom: 10,
    marginBottom: 24,
  },
  brand: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  brandAi: { color: EMERALD },
  meta: { fontSize: 8.5, color: MUTED, textAlign: "right" },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", lineHeight: 1.2 },
  subtitle: { fontSize: 12, color: MUTED, marginTop: 6, marginBottom: 12 },
  concept: {
    marginTop: 4,
    marginBottom: 16,
    padding: 9,
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 4,
    fontSize: 8.5,
    lineHeight: 1.45,
    color: "#92400e",
  },
  conceptLabel: { fontFamily: "Helvetica-Bold" },
  intro: { marginBottom: 18, color: "#334155" },
  sectionHeading: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 5,
  },
  paragraph: { marginBottom: 6 },
  bulletRow: { flexDirection: "row", marginBottom: 3, paddingRight: 8 },
  bulletDot: { width: 12, color: EMERALD },
  bulletText: { flex: 1 },
  table: { marginTop: 6, marginBottom: 6, borderWidth: 1, borderColor: BORDER },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#f1f5f9" },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  th: {
    flex: 1,
    padding: 5,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  td: { flex: 1, padding: 5, fontSize: 9, color: "#334155" },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
});

export function DocumentPdf({
  content,
  companyName,
  version,
  date,
}: {
  content: DocumentContent;
  companyName: string;
  version: number;
  date: string;
}) {
  return (
    <Document title={content.title} author="ComplAI">
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.brand}>
            Compl<Text style={styles.brandAi}>AI</Text>
          </Text>
          <View>
            <Text style={styles.meta}>{companyName}</Text>
            <Text style={styles.meta}>
              Versie {version} · {date}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{content.title}</Text>
        {content.subtitle && (
          <Text style={styles.subtitle}>{content.subtitle}</Text>
        )}

        <Text style={styles.concept}>
          <Text style={styles.conceptLabel}>CONCEPT — zelfverklaard sjabloon. </Text>
          Dit is een bewerkbaar startdocument op basis van uw eigen opgaven, geen
          juridisch advies en geen garantie op naleving. Vul aan met uw situatie,
          laat juridisch toetsen en stel definitief vast voordat u het gebruikt of deelt.
        </Text>

        {content.intro && <Text style={styles.intro}>{content.intro}</Text>}

        {content.sections.map((section, i) => (
          <View key={i} wrap={false}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>

            {section.paragraphs?.map((p, j) => (
              <Text key={j} style={styles.paragraph}>
                {p}
              </Text>
            ))}

            {section.bullets?.map((b, j) => (
              <View key={j} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}

            {section.table && (
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  {section.table.headers.map((h, k) => (
                    <Text key={k} style={styles.th}>
                      {h}
                    </Text>
                  ))}
                </View>
                {section.table.rows.map((row, r) => (
                  <View key={r} style={styles.tableRow}>
                    {row.map((cell, c) => (
                      <Text key={c} style={styles.td}>
                        {cell}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          Gegenereerd door ComplAI · Concept · zelfverklaard · geen juridisch
          advies · complai.nl
        </Text>
      </Page>
    </Document>
  );
}
