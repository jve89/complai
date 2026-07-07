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
  previewBanner: {
    marginTop: 4,
    marginBottom: 16,
    padding: 9,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderRadius: 4,
    fontSize: 8.5,
    lineHeight: 1.45,
    color: "#3730a3",
  },
  watermark: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  watermarkText: {
    fontSize: 56,
    fontFamily: "Helvetica-Bold",
    color: EMERALD,
    opacity: 0.08,
    transform: "rotate(-32deg)",
  },
  fieldLabel: { fontSize: 9.5, color: MUTED, marginTop: 8, marginBottom: 6 },
  fillLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    height: 22,
    marginBottom: 4,
  },
  redactRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  redactBar: {
    height: 7,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginRight: 6,
    marginBottom: 5,
  },
});

const REDACT_WIDTHS = [140, 96, 172, 60, 120, 150, 84, 110];

/** Blanked-out lines standing in for the withheld body content. */
function Redacted({ lines = 4, seed = 0 }: { lines?: number; seed?: number }) {
  return (
    <View style={{ marginBottom: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <View
          key={i}
          style={[styles.redactBar, { width: REDACT_WIDTHS[(i + seed) % REDACT_WIDTHS.length] }]}
        />
      ))}
    </View>
  );
}

export function DocumentPdf({
  content,
  companyName,
  version,
  date,
  preview = false,
  versionLabel,
}: {
  content: DocumentContent;
  companyName: string;
  version: number;
  date: string;
  /** Demo preview: watermark + only a teaser, the rest redacted. */
  preview?: boolean;
  /** Overrides "Versie N" in the header (e.g. an unsaved, live copy). */
  versionLabel?: string;
}) {
  return (
    <Document title={preview ? `${content.title} (voorbeeld)` : content.title} author="ComplAI">
      <Page size="A4" style={styles.page}>
        {preview && (
          <View style={styles.watermark} fixed>
            <Text style={[styles.watermarkText, { marginBottom: 230 }]}>VOORBEELD</Text>
            <Text style={styles.watermarkText}>VOORBEELD</Text>
            <Text style={[styles.watermarkText, { marginTop: 230 }]}>VOORBEELD</Text>
          </View>
        )}

        <View style={styles.header} fixed>
          <Text style={styles.brand}>
            Compl<Text style={styles.brandAi}>AI</Text>
          </Text>
          <View>
            <Text style={styles.meta}>{companyName}</Text>
            <Text style={styles.meta}>
              {preview ? "Voorbeeld" : versionLabel ?? `Versie ${version}`} · {date}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{content.title}</Text>
        {content.subtitle && (
          <Text style={styles.subtitle}>{content.subtitle}</Text>
        )}

        {preview ? (
          <Text style={styles.previewBanner}>
            <Text style={styles.conceptLabel}>VOORBEELD. </Text>
            Dit is een ingekort voorbeeld van het document. Het volledige
            document — automatisch ingevuld met uw eigen gegevens en klaar om te
            bewerken — ontvangt u zodra u een betaald pakket kiest.
          </Text>
        ) : (
          <Text style={styles.concept}>
            <Text style={styles.conceptLabel}>CONCEPT — zelfverklaard sjabloon. </Text>
            Dit is een bewerkbaar startdocument op basis van uw eigen opgaven, geen
            juridisch advies en geen garantie op naleving. Vul aan met uw situatie,
            laat juridisch toetsen en stel definitief vast voordat u het gebruikt of deelt.
          </Text>
        )}

        {content.intro && <Text style={styles.intro}>{content.intro}</Text>}

        {content.sections.map((section, i) => {
          // Preview: show the first section's first paragraph as a teaser; the
          // rest of every section is redacted so the value is visible but withheld.
          const teaser = preview && i === 0 ? section.paragraphs?.[0] : undefined;
          return (
            <View key={i} wrap={false}>
              <Text style={styles.sectionHeading}>{section.heading}</Text>

              {preview ? (
                <>
                  {teaser && <Text style={styles.paragraph}>{teaser}</Text>}
                  <Redacted lines={section.table ? 6 : 4} seed={i} />
                </>
              ) : (
                <>
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
                        <View style={styles.tableRow} key={r}>
                          {row.map((cell, c) => (
                            <Text key={c} style={styles.td}>
                              {cell}
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}

                  {section.fields?.map((f, k) => (
                    <View key={k}>
                      <Text style={styles.fieldLabel}>{f.label}</Text>
                      {Array.from({ length: f.lines }).map((_, li) => (
                        <View key={li} style={styles.fillLine} />
                      ))}
                    </View>
                  ))}
                </>
              )}
            </View>
          );
        })}

        <Text style={styles.footer} fixed>
          {preview
            ? "Voorbeeld · ComplAI · niet voor gebruik · kies een pakket voor het volledige document · complai-eu.nl"
            : "Gegenereerd door ComplAI · Concept · zelfverklaard · geen juridisch advies · complai-eu.nl"}
        </Text>
      </Page>
    </Document>
  );
}
