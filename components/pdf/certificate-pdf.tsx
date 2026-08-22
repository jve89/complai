import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const NAVY = "#0f172a";
const EMERALD = "#1257E0"; // brand indigo
const MUTED = "#64748b";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontFamily: "Helvetica",
    color: NAVY,
  },
  frame: {
    flex: 1,
    borderWidth: 2,
    borderColor: EMERALD,
    borderStyle: "solid",
    paddingVertical: 44,
    paddingHorizontal: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 18 },
  brandAi: { color: EMERALD },
  kicker: {
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    marginBottom: 22,
    textAlign: "center",
  },
  awarded: { fontSize: 11, color: MUTED, marginBottom: 6 },
  name: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: EMERALD,
    marginBottom: 4,
  },
  rule: {
    width: 280,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginBottom: 18,
  },
  body: {
    fontSize: 11,
    color: "#334155",
    textAlign: "center",
    marginBottom: 16,
    maxWidth: 460,
    lineHeight: 1.5,
  },
  modulesTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: MUTED,
    marginBottom: 6,
  },
  module: { fontSize: 10, marginBottom: 2, textAlign: "center" },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 28,
    paddingHorizontal: 20,
  },
  footerLabel: { fontSize: 9, color: MUTED },
  footerValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  disclaimer: {
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
    marginTop: 18,
    maxWidth: 520,
    lineHeight: 1.4,
  },
});

export function CertificatePdf({
  name,
  pathLabel,
  modules,
  date,
  complete,
}: {
  name: string;
  pathLabel: string;
  modules: string[];
  date: string;
  complete: boolean;
}) {
  return (
    <Document title={`Certificaat — ${name}`} author="ComplAI">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <Text style={styles.brand}>
            Compl<Text style={styles.brandAi}>AI</Text>
          </Text>
          <Text style={styles.kicker}>Certificaat van deelname</Text>
          <Text style={styles.title}>AI-geletterdheid (EU AI Act)</Text>

          <Text style={styles.awarded}>Toegekend aan</Text>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.rule} />

          <Text style={styles.body}>
            {complete
              ? `heeft het volledige leerpad "${pathLabel}" (${modules.length} modules) met goed gevolg afgerond — elke module met een score van minimaal 80% — en voldoet daarmee aan de basisvereisten voor AI-geletterdheid onder Artikel 4 van de EU AI Act (Verordening (EU) 2024/1689).`
              : `heeft de volgende modules van het leerpad "${pathLabel}" met goed gevolg afgerond (minimaal 80% per module):`}
          </Text>

          <Text style={styles.modulesTitle}>Afgeronde modules</Text>
          {modules.map((m, i) => (
            <Text key={i} style={styles.module}>
              ✓ {m}
            </Text>
          ))}

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerLabel}>Datum</Text>
              <Text style={styles.footerValue}>{date}</Text>
            </View>
            <View>
              <Text style={styles.footerLabel}>Uitgegeven door</Text>
              <Text style={styles.footerValue}>ComplAI</Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            Bewijs van gevolgde training ter ondersteuning van de
            AI-geletterdheidsverplichting (Art. 4). Of AI-geletterdheid in een
            specifieke rol voldoende is, hangt af van de context — dit certificaat
            is geen juridisch advies en geen garantie op naleving.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
